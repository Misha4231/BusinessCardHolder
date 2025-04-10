import fastapi as _fastapi
import fastapi.security as _security
import sqlalchemy.orm as _orm
import sqlalchemy as _sql
import typing as _typing
import passlib.hash as _hash
import models as _models
from typing import List
from deep_translator import GoogleTranslator as _translator

import services as _services
import schemas as _schemas

router = _fastapi.APIRouter()


@router.get('/get_categories')
async def get_categories(db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    return db.query(_models.CardCategories).all()

@router.get('/get_cities')
async def get_cities(db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    return db.query(_models.City).all()

@router.post('/create', response_model=_schemas.BuisnessCardInfo)
async def create_buisness_card(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    cardJson = await request.json()
    user = await _services.getUserFromHeader(request.headers, db)
    
    newBuisnessCard = await _services.createBuisnessCard(cardJson, user, db)
    return newBuisnessCard

@router.post('/update', response_model=_schemas.BuisnessCardInfo)
async def update_buisness_card(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    newCardJson = await request.json()
    currentUser = await _services.getUserFromHeader(request.headers, db)
    
    if (currentUser.id != int(newCardJson['owner_id'])):
        raise _fastapi.HTTPException(status_code=401, detail='not valid user')
    
    newCard = await _services.updateBuisnessCard(newCardData=newCardJson, db=db)
    return newCard

@router.post('/delete')
async def delete_buisness_card(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    requestBody = await request.json()
    cardId = requestBody['card_id']
    card = db.query(_models.BuisnessCard).filter(cardId == _models.BuisnessCard.id)
    
    requestUser = await _services.getUserFromHeader(request.headers, db)
    user_id = requestUser.id
    
    if not db.query(card.exists()).scalar():
        raise _fastapi.HTTPException(status_code=404, detail='Buisness card not exists')
    
    if user_id != card.first().owner_id:
        raise _fastapi.HTTPException(status_code=401, detail="User don't owns that buisness card")
    

    _services.deleteBuisnessCard(card.first(), db)
    
    return {'status: ok'}

@router.get('/current_user_cards', response_model=_schemas.CardsPaginationResponse)
async def current_user_cards(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    requestUser = await _services.getUserFromHeader(request.headers, db)
    userId = int(request.query_params.get('user_id'))

    page = 1
    if 'page' in request.query_params.keys():
        page = int(request.query_params.get('page'))

    cardsPerPage = 20
    pageOffset = (page - 1) * cardsPerPage
    
    
    query = _services.filterCardsByDefaultArgs(db.query(_models.BuisnessCard), request.query_params)
    query = query.filter(
        _models.BuisnessCard.owner_id == userId).order_by(
        _sql.desc(_models.BuisnessCard.createdDate)).limit(
        cardsPerPage).offset(pageOffset) if requestUser.id == userId else query.filter(
        _models.BuisnessCard.owner_id == userId, _models.BuisnessCard.visibility == 1).order_by(
        _sql.desc(_models.BuisnessCard.createdDate)).limit(
        cardsPerPage).offset(pageOffset)
        
    nextPage = page + 1 if db.query(query.exists()).scalar() and len(query.all()) == cardsPerPage else None
   
    return {
        'nextPage': nextPage,
        'cards': query.all()
    }
    
@router.get('/search', response_model=_schemas.CardsPaginationResponse)
async def search_cards(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    page = 1 if 'page' not in request.query_params.keys() else int(request.query_params.get('page'))
    perPage = 20
    
    query = _services.filterCardsByDefaultArgs(db.query(_models.BuisnessCard), request.query_params)
    
    query = query.filter(_models.BuisnessCard.visibility == 1).order_by(_sql.desc(_models.BuisnessCard.createdDate)).limit(perPage).offset((page - 1) * perPage)
    nextPage = page + 1 if db.query(query.exists()).scalar() and len(query.all()) == perPage else None
    
    return {
        'nextPage': nextPage,
        'cards': query.all()
    }
    
@router.get('/saved_cards', response_model=_schemas.CardsPaginationResponse)
async def saved_cards(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    page = 1 if 'page' not in request.query_params.keys() else int(request.query_params.get('page'))
    perPage = 3
    user = await _services.getUserFromHeader(request.headers, db)
    
    query = _services.filterCardsByDefaultArgs(db.query(_models.BuisnessCard), request.query_params)
    
    query = query.filter(_models.BuisnessCard.saveUsersRelation.any(id=user.id)).order_by(_sql.desc(_models.BuisnessCard.createdDate)).limit(perPage).offset((page - 1) * perPage)
    nextPage = page + 1 if db.query(query.exists()).scalar() and len(query.all()) == perPage else None
    
    return {
        'nextPage': nextPage,
        'cards': query.all()
    }

@router.post('/save_card')
async def save_card(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    user = await _services.getUserFromHeader(request.headers, db)
    requestBody = await request.json()
    
    if 'cardId' not in requestBody:
        raise _fastapi.HTTPException(status_code=401, detail="Card id is not provided")
    
    card = db.query(_models.BuisnessCard).filter(_models.BuisnessCard.id == int(requestBody['cardId'])).first()
    if not card:
        raise _fastapi.HTTPException(status_code=404, detail="Card not founded")
    
    if user in card.saveUsersRelation:
        raise _fastapi.HTTPException(status_code=400, detail="User is already saved that card")
    
    card.saveUsersRelation.append(user)
    db.commit()
    db.refresh(card)
    
    return {'status': 'ok'}

@router.get('/is_user_save_card')
async def is_user_save_card(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    user = await _services.getUserFromHeader(request.headers, db)
    card = db.query(_models.BuisnessCard).filter(_models.BuisnessCard.id == int(request.query_params.get('cardId'))).first()
    
    if not card:
        raise _fastapi.HTTPException(status_code=404, detail="Card not founded")
    
    return {'isSaved': (user in card.saveUsersRelation)}

@router.post('/remove_card_save')
async def remove_card_save(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    user = await _services.getUserFromHeader(request.headers, db)
    requestBody = await request.json()
    card = db.query(_models.BuisnessCard).filter(_models.BuisnessCard.id == int(requestBody['cardId'])).first()
    
    if not card:
        raise _fastapi.HTTPException(status_code=404, detail="Card not founded")
    
    card.saveUsersRelation.remove(user)
    db.commit()
    db.refresh(card)
    
    return {'status': 'ok'}

@router.get('/get_card_data', response_model=_schemas.BuisnessCardInfo)
async def get_card_data(card_id: int, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    cardData = db.query(_models.BuisnessCard).filter(_models.BuisnessCard.id == card_id).first()

    return cardData

@router.get('/get_templates', response_model=List[_schemas.CardTemplate])
async def get_templates(db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    return db.query(_models.CardTemplates).all()

@router.get('/get_global_categories', response_model=List[_schemas.GlobalCategory])
async def get_global_categories(db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    return db.query(_models.GlobalCategories).all()


@router.get('/get_unit_ids')
async def get_unit_ids(request: _fastapi.Request):
    return {'android': _services.ANDROID_UNIT_ID, 'ios': _services.IOS_UNIT_ID}