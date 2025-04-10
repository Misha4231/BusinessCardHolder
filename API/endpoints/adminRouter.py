import fastapi as _fastapi
import sqlalchemy.orm as _orm
import sqlalchemy as _sql
import passlib.hash as _hash
import models as _models
from typing import List, Annotated
from fastapi.templating import Jinja2Templates as _JinjaTemplates
from fastapi.encoders import jsonable_encoder as _json_encode
from fastapi.responses import RedirectResponse
import passlib.hash as _hash
import uuid as _uuid
import time as _time
import os as _os
import dotenv as _dotenv
import services as _services
import schemas as _schemas
import json as _json
from deep_translator import GoogleTranslator as _translator

router = _fastapi.APIRouter()

_dotenv.load_dotenv()

template = _JinjaTemplates(directory='templates')

languages = ['uk','ru','pl',"cs","da","fr","de"]

@router.get('/')
async def admin_page(request: _fastapi.Request, token: str = _fastapi.Cookie(None), db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    if not token:
        return template.TemplateResponse('admin/admin_login.html', {
            'request': request
        })
    
    try:
        userObj = await _services.getCurrentUser(token, db)

        return template.TemplateResponse('admin/admin.html', {
            'request': request,
            "user": userObj
        })
    except:
        return template.TemplateResponse('admin/admin_login.html', {
            'request': request
        })
    

@router.post('/admin_login')
async def admin_login(
 request: _fastapi.Request,
 email: str=_fastapi.Form(...),
 password: str=_fastapi.Form(...),
 db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    userObj = await _services.getUserByEmail(email, db)
    if not userObj:
        userObj = await _services.getUserByUsername(email, db)
    
    if not userObj:
        return template.TemplateResponse('admin/admin_login.html', {'request': request, 'error_message': 'Email or username is not correct'})

    if not userObj.verify_password(password):
        return template.TemplateResponse('admin/admin_login.html', {'request': request, 'error_message': 'Incorrect password'})

    if not userObj.isAdmin:
        return template.TemplateResponse('admin/admin_login.html', {'request': request, 'error_message': 'You are not admin'})
    
    userToken = await _services.createToken(userObj)

    response = RedirectResponse(url='/admin', status_code=303)
    response.set_cookie('token', value=userToken['access_token'])
    return response

@router.get('/logout')
async def logout(request: _fastapi.Request, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    response = RedirectResponse(url='/admin', status_code=303)
    response.delete_cookie('token')
    return response

@router.post('/interact_card')
@_services.adminAuthRequired
async def interact_card(
 request: _fastapi.Request, 
 cardId: str=_fastapi.Form(...), 
 interactType: str=_fastapi.Form(...), 
 token: str = _fastapi.Cookie(None), 
 db: _orm.Session = _fastapi.Depends(_services.getDatabase)):

    card = db.query(_models.BuisnessCard).filter(_models.BuisnessCard.id == int(cardId)).first()
    if not card:
        return template.TemplateResponse('admin/admin.html', {
            'request': request,
            "user": userObj,
            'card_error_message': 'Card with that id not exists'
        })

    if interactType == 'block':
        card.visibility = -2
    elif interactType == 'unblock':
        card.visibility = -1

    db.commit()
    db.refresh(card)
    return RedirectResponse(url='/admin', status_code=303)

@router.post('/interact_user')
@_services.adminAuthRequired
async def interact_card(
 request: _fastapi.Request, 
 email: str=_fastapi.Form(...), 
 interactType: str=_fastapi.Form(...), 
 token: str = _fastapi.Cookie(None), 
 db: _orm.Session = _fastapi.Depends(_services.getDatabase)):

    user = db.query(_models.User).filter(_sql.or_(_models.User.email == email, _models.User.username == email)).first()
    
    if not user:
        return template.TemplateResponse('admin/admin.html', {
            'request': request,
            "user": userObj,
            'user_error_message': 'User with that email or username not exists'
        })
    
    if interactType == 'block':
        user.isBanned = True
    elif interactType == 'unblock':
        user.isBanned = False

    db.commit()
    db.refresh(user)
    return RedirectResponse(url='/admin', status_code=303)

@router.post('/new_admin')
@_services.adminAuthRequired
async def new_admin(
 request: _fastapi.Request, 
 email: str=_fastapi.Form(...), 
 username: str=_fastapi.Form(...), 
 fullName: str=_fastapi.Form(None), 
 password: str=_fastapi.Form(...), 
 avatar: _fastapi.UploadFile = _fastapi.Form(None), 
 token: str = _fastapi.Cookie(None), db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    
    existingUser = db.query(_models.User).filter(_sql.or_(_models.User.email == email, _models.User.username == username)).first()
    
    if existingUser:
        return template.TemplateResponse('admin/admin.html', {
            'request': request,
            "user": userObj,
            'newuser_error_message': 'User with that email or username not exists'
        })

    hashedPassword = _hash.bcrypt.hash(password)
    avatarPath = await _services.loadImage(avatar, 'avatars') if avatar else None

    newAdmin = _models.User(email=email,username=username, fullName=fullName, password=hashedPassword, avatar=avatarPath, isActive=True, isAdmin=True, isBanned=False)
    db.add(newAdmin)
    db.commit()
    db.refresh(newAdmin)

    return RedirectResponse('/admin', status_code=303)

@router.get('/add_template')
@_services.adminAuthRequired
async def add_template_get(request: _fastapi.Request, token: str = _fastapi.Cookie(None), db: _orm.Session = _fastapi.Depends(_services.getDatabase)):

    return template.TemplateResponse('admin/templates/add_template.html', {
        'request': request
    })

@router.post('/add_template')
@_services.adminAuthRequired
async def add_template_post(
 request: _fastapi.Request,
 title: str =_fastapi.Form(None),
 templateData: str = _fastapi.Form(...), 
 background: _fastapi.UploadFile = _fastapi.Form(...),
 token: str = _fastapi.Cookie(None),
 db: _orm.Session = _fastapi.Depends(_services.getDatabase)):

    backgroundPath = await _services.loadImage(background, 'templateBackgrounds') if background.size else None

    newTemplate = _models.CardTemplates(title=title, background=backgroundPath, templateData=templateData)
    db.add(newTemplate)
    db.commit()

    return RedirectResponse('/admin/add_template', status_code=303)

@router.get('/template_list')
@_services.adminAuthRequired
async def template_list(request: _fastapi.Request, token: str = _fastapi.Cookie(None), db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    templates = db.query(_models.CardTemplates).all()
    
    return template.TemplateResponse('admin/templates/templates_list.html', {
        'request': request,
        'templates': templates
    })

@router.post('/delete_template')
@_services.adminAuthRequired
async def delete_template(request: _fastapi.Request, token: str = _fastapi.Cookie(None), db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    data = await request.json()
    
    if 'templateId' not in data:
        return _fastapi.HTTPException(status_code=400, detail="template Id is not provided")

    _services.deleteCardTemplate(int(data['templateId']), db)
    
    return RedirectResponse('/admin/template_list', status_code=303)

@router.get('/edit_template/{template_id}')
@_services.adminAuthRequired
async def edit_template_page(request: _fastapi.Request, template_id: Annotated[int, _fastapi.Path(title="Id of template to edit")], token: str = _fastapi.Cookie(None), db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    existingTemplate = db.query(_models.CardTemplates).filter(_models.CardTemplates.id == template_id).first()

    return template.TemplateResponse('admin/templates/add_template.html', {
        'request': request,
        'existingTemplate': existingTemplate,
    })

@router.post('/edit_template/{template_id}')
@_services.adminAuthRequired
async def edit_template(request: _fastapi.Request, template_id: Annotated[int, _fastapi.Path(title="Id of template to edit")], title: str =_fastapi.Form(None), templateData: str = _fastapi.Form(...),  background: _fastapi.UploadFile = _fastapi.Form(None), token: str = _fastapi.Cookie(None), db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    cardTemplate = db.query(_models.CardTemplates).filter(_models.CardTemplates.id == template_id).first()
    cardTemplate.title = title

    backgroundPath = cardTemplate.background
    if (background.size):
        if _os.path.exists(backgroundPath):
            _os.remove(backgroundPath)
        
        backgroundPath = await _services.loadImage(background, 'templateBackgrounds')

    cardTemplate.background = backgroundPath
    cardTemplate.templateData = templateData

    db.commit()
    db.refresh(cardTemplate)

    return RedirectResponse(f'/admin/edit_template/{template_id}', status_code=303)

@router.get('/global_categories_list')
@_services.adminAuthRequired
async def global_categories_list_page(request: _fastapi.Request, token: str = _fastapi.Cookie(None), db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    categories = db.query(_models.GlobalCategories, _sql.func.count(_models.BuisnessCard.id)).outerjoin(_models.BuisnessCard, _models.BuisnessCard.global_category_id == _models.GlobalCategories.id).group_by(_models.GlobalCategories.id).all()

    return template.TemplateResponse('admin/global_categories/list.html', {
        'request': request,
        'categories': categories
    })

@router.post('/create_global_category')
@_services.adminAuthRequired
async def create_global_category(request: _fastapi.Request, title: str = _fastapi.Form(...), token: str = _fastapi.Cookie(None), db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    translation = {}
    for lang in languages:
        result = _translator(source='en', target=lang).translate(title)
        translation[lang] = result
    
    newGlobalCategory = _models.GlobalCategories(title = title, translation=_json.dumps(translation))

    db.add(newGlobalCategory)
    db.commit()

    return RedirectResponse('/admin/global_categories_list', status_code=303)

@router.post('/update_global_category/{category_id}')
@_services.adminAuthRequired
async def create_global_category(request: _fastapi.Request, category_id: Annotated[int, _fastapi.Path(title="Global category id")], title: str = _fastapi.Form(...), token: str = _fastapi.Cookie(None), db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    globalCategory = db.query(_models.GlobalCategories).filter(_models.GlobalCategories.id == category_id).first()
    globalCategory.title = title
    
    db.commit()
    db.refresh(globalCategory)

    return RedirectResponse('/admin/global_categories_list', status_code=303)

@router.get('/delete_global_category/{category_id}')
@_services.adminAuthRequired
async def delete_global_category(request: _fastapi.Request, category_id: Annotated[int, _fastapi.Path(title="Global category id")], token: str = _fastapi.Cookie(None), db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    globalCategory = db.query(_models.GlobalCategories).filter(_models.GlobalCategories.id == category_id).first()

    db.delete(globalCategory)
    db.commit()

    return RedirectResponse('/admin/global_categories_list', status_code=303)
