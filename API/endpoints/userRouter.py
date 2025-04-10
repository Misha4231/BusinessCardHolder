import fastapi as _fastapi
import sqlalchemy.orm as _orm
import sqlalchemy as _sql
import passlib.hash as _hash
import models as _models
from typing import List

import services as _services
import schemas as _schemas

router = _fastapi.APIRouter()

@router.post("/")
async def create_user(user: _schemas.UserCreate, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    if user.googleId:
       
        googleIdUser = await _services.getUserByGoogleId(user.googleId, db)
       
        if (googleIdUser):
            return await _services.createToken(googleIdUser)
    
    # check if user already exists 
    emailUser = await _services.getUserByEmail(user.email, db)
    if emailUser:
        raise _fastapi.HTTPException(status_code=400, detail="User with that email already exists")
    
    usernameUser = await _services.getUserByUsername(user.username, db)
    if usernameUser and usernameUser.username != None:
        raise _fastapi.HTTPException(status_code=400, detail="User with that username already exists")
    
    # return new user 
    newUser = await _services.createUser(user, db)
    if (newUser.isActive):
        return await _services.createToken(newUser)
    else:
        # send email with confirmation code
        return await _services.sendConfirmMail(newUser.email)

@router.post('/activate_profile')
async def activate_profile(userToActivate: _schemas.UserEmail, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    email = userToActivate.email
    user = await _services.getUserByEmail(email, db)
 
    if not user:
        return _fastapi.HTTPException(status_code=404, detail="User not exists")
    
    user.isActive = True
    
    db.commit()
    db.refresh(user)
    
    return await _services.createToken(user)

@router.post('/send_confirmation_code')
async def send_confirmation_code(userEmail: _schemas.UserEmail, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    email = userEmail.email
    user = await _services.getUserByEmail(email, db)

    if not user:
        raise _fastapi.HTTPException(status_code=404, detail="User not exists")

    return await _services.sendConfirmMail(email)

@router.post("/token")
async def generate_token(userData: _schemas.UserLogin, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    user = await _services.authenticateUser(userData.email, userData.password, db)
    
    if not user:
        raise _fastapi.HTTPException(status_code=401, detail="Invalid credentials")

    if not user.isActive:
        raise _fastapi.HTTPException(status_code=402, detail="User email is not confirmed")
    
    return await _services.createToken(user)

@router.get("/me", response_model=_schemas.User)
async def get_user(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    if ('Authorization' not in request.headers):
        raise _fastapi.HTTPException(status_code=401, detail="Authorization token not provided")
        
    token = request.headers['Authorization']
    if token.startswith("Bearer"):
        token = token.split(' ')[1]
    
    if not token:
        raise _fastapi.HTTPException(status_code=401, detail="Authorization token not provided")

    user = await _services.getCurrentUser(token, db)

    return user

@router.post('/update')
async def update_user(newUserData: _schemas.UpdateUser, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    updatedUser = await _services.updateUser(newUserData, db)
    
    newToken = await _services.createToken(updatedUser['userObj'])
    return dict(access_token=newToken['access_token'], confirmation_code=updatedUser['confirmationCode'])
    
@router.post('/update_password')
async def update_password(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    json_data = await request.json()
    newPassword = json_data['password']
    user = await _services.getUserFromHeader(request.headers, db)

    user.password = _hash.bcrypt.hash(newPassword)
    db.commit()
    db.refresh(user)
    
    return await _services.createToken(user)

@router.post('/forgot_password')
async def forgot_password(userEmail: _schemas.UserEmail, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    emailUser = await _services.getUserByEmail(userEmail.email, db)
    
    if (emailUser):
        if emailUser.googleId:
            raise _fastapi.HTTPException(status_code=404, detail='User has signed with google')
        
        return await _services.sendConfirmMail(userEmail.email)
    
    usernameUser = await _services.getUserByUsername(userEmail.email, db)
    if (usernameUser):
        if usernameUser.googleId:
            raise _fastapi.HTTPException(status_code=404, detail='User has signed with google')
        
        return await _services.sendConfirmMail(usernameUser.email)
    
    raise _fastapi.HTTPException(status_code=404, detail='User not exists')

@router.post('/update_forgotten_password')
async def update_forgotten_password(userObj: _schemas.UserLogin, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    newPassword = userObj.password
    
    user = await _services.getUserByEmail(userObj.email, db)
    
    if (not user):
        user = await _services.getUserByUsername(userObj.email, db)
    
    if (not user):
        raise _fastapi.HTTPException(status_code=404, detail='User not exists')
    
    user.password = _hash.bcrypt.hash(newPassword)
    db.commit()
    db.refresh(user)
    
    return await _services.createToken(user)

@router.get('/search', response_model=List[_schemas.SafeUser])
async def search_users(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    searchInput = request.query_params.get('search_input')
    requestUser = await _services.getUserFromHeader(request.headers, db)
    
    if (searchInput):
        return db.query(_models.User).filter(_sql.and_(
            _sql.or_(
                _models.User.username.like(f"%{searchInput}%"),
                _models.User.fullName.like(f"%{searchInput}%"),
                ), 
            _models.User.id != requestUser.id, _models.User.isBanned == False)).limit(25).all()
    return []

@router.post('/delete_curr_profile')
async def delete_curr_profile(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    user = await _services.getUserFromHeader(request.headers, db)
    
    if not user:
        raise _fastapi.HTTPException(status_code=404, detail='user not found')

    _services.deleteUser(user, db)

    return {'status': 'ok'}

