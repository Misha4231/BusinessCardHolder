import fastapi as _fastapi
import sqlalchemy.orm as _orm
import sqlalchemy as _sql
import models as _models
from fastapi.templating import Jinja2Templates as _JinjaTemplates
from fastapi.encoders import jsonable_encoder as _json_encode
from fastapi.responses import RedirectResponse
import services as _services

router = _fastapi.APIRouter()

template = _JinjaTemplates(directory='templates')


@router.get('/')
async def index(request: _fastapi.Request):
    return template.TemplateResponse(
        name='index.html',
        context={"request": request}
    )

@router.get('/privacy_policy')
async def privacy_policy(request: _fastapi.Request):
    return template.TemplateResponse(
        name='privacy_policy.html',
        context={"request": request}
    )

@router.get('/card')
async def card_page(request: _fastapi.Request, cardId: int, db: _orm.Session = _fastapi.Depends(_services.getDatabase)):
    cardData = db.query(_models.BuisnessCard)\
                 .options(_orm.joinedload(_models.BuisnessCard.categotyRelation),
                          _orm.joinedload(_models.BuisnessCard.ownerRelation),
                          _orm.joinedload(_models.BuisnessCard.cityRelation),
                          _orm.joinedload(_models.BuisnessCard.contactLinksRelation))\
                 .filter(_models.BuisnessCard.id == cardId)\
                 .first()

    if not cardData:
        return template.TemplateResponse("error.html", {
            'request': request,
            "msg": "Card is not found"
        })

    if cardData.visibility != 1 and cardData.visibility != 0:
        return template.TemplateResponse("error.html", {
            'request': request,
            "msg": "Card is not public"
        })

    return template.TemplateResponse("card_detail.html", {
        'request': request,
        "cardData": _json_encode(cardData)
    })

@router.get('/how_to_delete_user')
async def how_to_delete_user(request: _fastapi.Request):
    return template.TemplateResponse(
        name='how_to_delete_user.html',
        context={"request": request}
    )

@router.get("/sitemap.xml")
async def sitemap():
    with open('templates/sitemap.xml', 'r') as f:
        sitemap_content = f.read()
        
        return _fastapi.Response(content=sitemap_content, media_type='application/xml')

@router.get('/robots.txt')
async def robots_txt():
    with open('templates/robots.txt', 'r') as f:
        content = f.read()
        
        return _fastapi.Response(content=content, media_type='text/plain')

@router.get('/favicon.ico', include_in_schema=False)
async def favicon():
    return _fastapi.responses.FileResponse('static/images/favicon.ico')