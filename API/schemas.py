import pydantic as _pydantic
from typing import List, Optional, Dict
import json as _json

class _UserBase(_pydantic.BaseModel):
    email: str
    fullName: str | None
    username: str | None
    googleId: str | None
    
class UserCreate(_UserBase):
    password: str | None
    bytesAvatar: str | None
    
    class Config:
        from_attributes = True
        
class User(_UserBase):
    id: int
    avatar: str | None
    isActive: bool
    isAdmin: bool
    isBanned: bool
    
    class Config:
        from_attributes = True

class SafeUser(_pydantic.BaseModel):
    fullName: str | None
    username: str | None
    avatar: str | None
    id: int
    isBanned: bool

class UpdateUser(User):
    forceEmail: bool
    

class UserEmail(_pydantic.BaseModel):
    email: str

class UserLogin(UserEmail):
    password: str

class BuisnessCarFullInfo:
    card_id: int
    category_id: int
    category_title: str
    owner_id: int
    username: str
    fullName: str
    avatar: str
    image: str
    city_id: int
    cityTitle: str
    
class Category(_pydantic.BaseModel):
    id: int
    title: str

class City(_pydantic.BaseModel):
    id: int
    title: str
    Name: str
    CountryCode: str

class ContactLinks(_pydantic.BaseModel):
    id: int
    title: str | None
    link: str | None

class GlobalCategory(_pydantic.BaseModel):
    id: int
    title: str
    translation: _pydantic.Json

class BuisnessCardInfo(_pydantic.BaseModel):
    id: int
    category_id: int | None
    global_category_id: int | None
    owner_id: int
    image: str
    city_id: int | None
    contact_number: str | None
    contact_email: str | None
    description: str | None
    visibility: int
    templateJson: Optional[Dict] | str | None
    
    categotyRelation: Category | None
    globalCategotyRelation: GlobalCategory | None
    ownerRelation: SafeUser
    cityRelation: City | None
    contactLinksRelation: List[ContactLinks] | None
    
class CardsPaginationResponse(_pydantic.BaseModel):
    cards: List[BuisnessCardInfo] | None
    nextPage: int | None
    
class CardTemplate(_pydantic.BaseModel):
    id: int
    title: str | None
    background: str
    templateData: _pydantic.Json
