import uvicorn
import fastapi as _fastapi
import fastapi.security as _security
import sqlalchemy.orm as _orm
import sqlalchemy as _sql
import typing as _typing
from fastapi.middleware import cors as _cors
from fastapi.staticfiles import StaticFiles as _StaticFiles
import os as _os
import dotenv as _dotenv

import services as _services

from endpoints.adminRouter import router as _adminRouter
from endpoints.webRouter import router as _webRouter
from endpoints.userRouter import router as _userRouter
from endpoints.cardsRouter import router  as _cardsRouter

_dotenv.load_dotenv()


app = _fastapi.FastAPI(docs_url=None, redoc_url=None, openapi_url = None)
_services.createDatabase()


origins = ["*"]
app.add_middleware(
    _cors.CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(f"/{_services.STATIC_PATH}", _StaticFiles(directory=f"{_services.STATIC_PATH}"), name="static")
app.mount(f"/{_services.MEDIA_PATH}", _StaticFiles(directory=f"{_services.MEDIA_PATH}"), name="media")


app.include_router(_webRouter, prefix='')
app.include_router(_adminRouter, prefix='/admin')
app.include_router(_userRouter, prefix='/api/users')
app.include_router(_cardsRouter, prefix='/api/cards')


if __name__ == '__main__':
    uvicorn.run('main:app', host=_os.environ['API_HOST'], port=int(_os.environ['API_PORT']), reload=True)