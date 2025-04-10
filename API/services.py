import database as _database
import passlib.hash as _hash
import sqlalchemy.orm as _orm
import jwt as _jwt
import os as _os
import dotenv as _dotenv
import fastapi as _fastapi
import base64 as _bs64
import uuid as _uuid
import time as _time
from PIL import Image as _PImage
import io as _io
import random as _random
from email.message import EmailMessage as _EmailMessage
import ssl as _ssl
import smtplib as _smtplib
from fastapi.responses import RedirectResponse
from functools import wraps
import json as _json
import starlette.datastructures as _sdt
import os as _os

import models as _models
import schemas as _schemas

_dotenv.load_dotenv()

STATIC_PATH = 'static/'
MEDIA_PATH = 'media/'

SMTP_HOST=_os.environ['SMTP_HOST']
SMTP_PORT=_os.environ['SMTP_PORT']

ANDROID_UNIT_ID = _os.environ['ANDROID_UNIT_ID']
IOS_UNIT_ID = _os.environ['IOS_UNIT_ID']


def createDatabase():
    return _database.Base.metadata.create_all(bind=_database.engine)

def getDatabase():
    db = _database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
 
async def getUserByEmail(email: str, db: _orm.Session) -> _models.User | None:
    return db.query(_models.User).filter(_models.User.email == email).first()

async def getUserByUsername(username: str, db: _orm.Session) -> _models.User | None:
    return db.query(_models.User).filter(_models.User.username == username).first()

async def getUserByGoogleId(googleId: str, db: _orm.Session) -> _models.User | None:
    return db.query(_models.User).filter(_models.User.googleId == googleId).first()

async def getUserById(id: int, db: _orm.Session) -> _models.User | None:
    return db.query(_models.User).filter(_models.User.id == id).first()

async def loadImage(bytesImage: str | _fastapi.UploadFile, folder: str = "") -> str:
    if (len(folder) > 0):
        folderPath = _os.path.join(MEDIA_PATH, folder)
        if not _os.path.exists(folderPath):
            _os.mkdir(folderPath)

    if (isinstance(bytesImage, str) and bytesImage.startswith("data:image")):
        imageExtention = ".png" if bytesImage.startswith("data:image/png") else ".jpg"

        #base64 image from normal form
        b64Image = bytesImage.split(',')[1]
        
        imageUrl = MEDIA_PATH + folder + '/' + str(_uuid.uuid1()) + str(round(_time.time() * 1000)) + imageExtention
        imageBytes = _bs64.b64decode(b64Image)
        
        saveImage = _PImage.open(_io.BytesIO(imageBytes))
        saveImage.save(imageUrl)
        
        return imageUrl
    elif isinstance(bytesImage, _sdt.UploadFile):
        imageExtention = bytesImage.filename.split('.')[1]
        imageUrl = MEDIA_PATH + folder + '/' + str(_uuid.uuid1()) + str(round(_time.time() * 1000)) + '.' + imageExtention

        with open(imageUrl, 'wb') as f:
            f.write(bytesImage.file.read())

        return imageUrl
    else:
        #link to image from google auth
        return bytesImage

async def createUser(user: _schemas.UserCreate, db: _orm.Session) -> _models.User:
    hashedPassword = _hash.bcrypt.hash(user.password) if user.password else ""
    avatar = await loadImage(user.bytesAvatar, 'avatars')

    isActiveUser = True if user.googleId else False
    
    userObj = _models.User(email=user.email,username=user.username, fullName=user.fullName, password=hashedPassword, googleId=user.googleId, avatar=avatar, isActive=isActiveUser, isAdmin=False, isBanned=False)
    db.add(userObj)
    db.commit()
    db.refresh(userObj)
    
    return userObj

async def authenticateUser(email: str, password: str | None, db: _orm.Session):
    user = await getUserByEmail(email, db)
    
    if not user:
        user = await getUserByUsername(email, db)
    
    if not user:
        return False
    
    if not user.googleId and not user.verify_password(password):
        return False
    
    return user
    
async def createToken(user: _models.User):
    userObj = _schemas.User.from_orm(user)
    
    token = _jwt.encode(userObj.dict(), _os.environ['JWT_SECRET'])
    return dict(access_token=token, token_type="bearer")
    
async def sendConfirmMail(receiverEmail: str):
    # get random 6-digit code
    confirmationCode = str(_random.randrange(100000, 999999))
    
    # actually send mail
    sender = _os.environ['SMTP_ACCOUNT']
    smtpPassword = _os.environ['SMTP_PASSWORD']
    
    mailSubject = 'Email confirmation'
    mailBody = f"Confirmation code: {confirmationCode}"
    
    msg = _EmailMessage()
    msg['From'] = sender
    msg['To'] = receiverEmail
    msg['Subject'] = mailSubject
    msg.set_content(mailBody)
    
    context = _ssl.create_default_context()
    with _smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context) as smtp:
        smtp.login(sender, smtpPassword)
        smtp.sendmail(sender, receiverEmail, msg.as_string())
    
    return dict(confirmation_code=confirmationCode)

async def getCurrentUser(token: str, db: _orm.Session) -> _schemas.User:
    try:
        payload = _jwt.decode(token, _os.environ['JWT_SECRET'], algorithms=["HS256"])
        user = db.query(_models.User).get(payload["id"])
        
        return _schemas.User.from_orm(user)
    except:
        raise _fastapi.HTTPException(status_code=401, detail="Invalid credentials")

async def getUserFromHeader(headers, db: _orm.Session) -> _models.User:
    token = headers['Authorization']
    if token.startswith("Bearer"):
        token = token.split(' ')[1]
    
    if not token:
        raise _fastapi.HTTPException(status_code=401, detail="Authorization token not provided")

    userScheme = await getCurrentUser(token, db)
    return await getUserById(userScheme.id, db)

async def updateUser(newData: _schemas.UpdateUser, db: _orm.Session):    
    user = await getUserById(newData.id, db)
    
    if not user:
        raise _fastapi.HTTPException(status_code=404, detail="User not exists")
    
    if user.avatar != newData.avatar:
        if _os.path.exists(user.avatar):
            _os.remove(user.avatar)
        user.avatar = await loadImage(newData.avatar, 'avatars')
    
    if user.fullName != newData.fullName:
        user.fullName = newData.fullName
        
    if user.username != newData.username:
        alreadyExistsUser = await getUserByUsername(newData.username, db)
        
        if alreadyExistsUser and alreadyExistsUser.username != None:
            raise _fastapi.HTTPException(status_code=400, detail="User with that username aready exists")
        
        user.username = newData.username
    
    confiemationCode = None
    if user.email != newData.email:
        ExistEmailUser = await getUserByEmail(newData.email, db)
        
        if ExistEmailUser:
            raise _fastapi.HTTPException(status_code=400, detail="User with that email aready exists")
        else:
            if newData.forceEmail:
                user.email = newData.email
            else:
                confiemationCode = await sendConfirmMail(newData.email)
    
    db.commit()
    db.refresh(user)
    
    return {'userObj': user, 'confirmationCode': confiemationCode}

def createCategory(title: str, db: _orm.Session):
    newCategory = _models.CardCategories(title = title)
    db.add(newCategory)
    db.commit()
    db.refresh(newCategory)
    
    return newCategory

def createLocalozation(title: str, db: _orm.Session, Name: str = "", CountryCode: str = "",):
    newLocalization = _models.City(title = title, Name = Name, CountryCode = CountryCode)
    db.add(newLocalization)
    db.commit()
    db.refresh(newLocalization)
        
    return newLocalization

def createContactLinks(buisnessCard: _models.BuisnessCard, contactLinks, db: _orm.Session):
    for linkData in contactLinks:
        newContactLink = _models.ContactLinks(title=linkData['title'], link=linkData['link'])
        db.add(newContactLink)
        db.commit()
        db.refresh(newContactLink)
            
        buisnessCard.contactLinksRelation.append(newContactLink)
    
    db.commit()
    db.refresh(buisnessCard)

async def createBuisnessCard(cardData, user: _models.User, db: _orm.Session):
    if 'image' not in cardData.keys():
        raise _fastapi.HTTPException(status_code=400, detail="Image is required")
    
    image = await loadImage(cardData['image'], 'buisness_cards')
    
    categoryId = cardData['category_id']
    if not categoryId and cardData['ownCategory']:
        categoryId = createCategory(cardData['ownCategory'], db).id
        
    cityId = cardData['city_id']
    if not cityId and cardData['new_localization']:
        cityId = createLocalozation(title=cardData['new_localization'], db=db).id
    
    newBuisnessCard = _models.BuisnessCard(category_id=categoryId,
                                            global_category_id=cardData['global_category_id'],
                                            owner_id=user.id,
                                            image=image,
                                            city_id=cityId,
                                            contact_number=cardData['contact_number'],
                                            contact_email=cardData['contact_email'],
                                            description=cardData['description'],
                                            visibility=cardData['visibility'],
                                            templateJson=cardData['templateJson'])

    db.add(newBuisnessCard)
    db.commit()
    db.refresh(newBuisnessCard)
    
    if cardData['contactLinksRelation']:
        createContactLinks(newBuisnessCard, cardData['contactLinksRelation'], db)
    
    return newBuisnessCard
    
async def updateBuisnessCard(newCardData, db: _orm.Session):
    card = db.query(_models.BuisnessCard).filter(_models.BuisnessCard.id == newCardData['id']).first()
    
    if not card:
        raise _fastapi.HTTPException(status_code=404, detail='Buisness card is not exists')
    
    
    categoryId = newCardData['category_id']
    if not categoryId and newCardData['ownCategory']:
        categoryId = createCategory(newCardData['ownCategory'], db).id
        
    cityId = newCardData['city_id']
    if not cityId and newCardData['new_localization']:
        cityId = createLocalozation(title=newCardData['new_localization'], db=db).id
        
    
    card.category_id = categoryId
    card.city_id = cityId
    card.global_category_id = newCardData['global_category_id']
    card.contact_email = newCardData['contact_email']
    card.contact_number = newCardData['contact_number']
    card.description = newCardData['description']
    card.visibility = newCardData['visibility']
    card.templateJson = newCardData['templateJson']
    card.contactLinksRelation = []
    
    db.commit()
    db.refresh(card)
    
    createContactLinks(card, newCardData['contactLinksRelation'], db)

    db.commit()
    db.refresh(card)
    
    return card

def filterCardsByDefaultArgs(query: _orm.Query, requestParams):
    localizationId = -1 if 'localization_id' not in requestParams.keys() else int(requestParams.get('localization_id'))
    categoryId = -1 if 'category_id' not in requestParams.keys() else int(requestParams.get('category_id'))
    globalCategoryId = -1 if 'global_category_id' not in requestParams.keys() else int(requestParams.get('global_category_id'))
    
    if (localizationId != -1):
        query = query.filter(_models.BuisnessCard.city_id == localizationId)
    
    if (categoryId != -1):
        query = query.filter(_models.BuisnessCard.category_id == categoryId)

    if (globalCategoryId != -1):
        query = query.filter(_models.BuisnessCard.global_category_id == globalCategoryId)

    return query

def deleteBuisnessCard(card: _models.BuisnessCard, db: _orm.Session):
    if _os.path.exists(card.image):
        _os.remove(card.image)

    card.saveUsersRelation = []
    db.commit()
    db.refresh(card)

    # Clear contactLinksRelation before deletion (if necessary)
    card.contactLinksRelation = []
    db.commit()
    db.refresh(card)

    # Now delete the card
    db.delete(card)
    db.commit()

def deleteUser(user: _models.User, db: _orm.Session):
    if _os.path.exists(user.avatar):
        _os.remove(user.avatar)

    cards = db.query(_models.BuisnessCard).filter(_models.BuisnessCard.owner_id == user.id).all()
    for card in cards:
        deleteBuisnessCard(card, db)

    user.savedCardsRelation = []
    db.delete(user)
    db.commit()

def adminAuthRequired(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        if not kwargs['token']:
            return RedirectResponse('/admin', status_code=303)
    
        userObj = await getCurrentUser(kwargs['token'], kwargs['db'])
        if not userObj or not userObj.isAdmin:
            return RedirectResponse('/admin', status_code=303)

        return await func(*args, **kwargs)

    return wrapper

def deleteCardTemplate(templateId: int, db: _orm.Session):
    template = db.query(_models.CardTemplates).filter(_models.CardTemplates.id == templateId).first()

    db.delete(template)
    db.commit()
