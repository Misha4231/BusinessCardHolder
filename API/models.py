import sqlalchemy as _sql
import sqlalchemy.orm as _orm
import passlib.hash as _hash
import datetime as _dt

import database as _database


userSavedCardsAssociation = _sql.Table(
    'savedCards',
    _database.Base.metadata,
    _sql.Column('user_id', _sql.Integer, _sql.ForeignKey('users.id')),
    _sql.Column('card_id', _sql.Integer, _sql.ForeignKey('BuisnessCard.id'))
)

class User(_database.Base):
    __tablename__ = "users"
    
    id = _sql.Column(_sql.Integer, primary_key=True, index=True, autoincrement=True)
    email = _sql.Column(_sql.String(250), nullable=False, unique=True, index=True)
    username = _sql.Column(_sql.String(100), nullable=True, unique=True, index=True)
    fullName = _sql.Column(_sql.String(250), nullable=True)
    avatar = _sql.Column(_sql.String(2000), nullable=True)
    password = _sql.Column(_sql.String(250), nullable=True)
    googleId = _sql.Column(_sql.String(255), nullable=True, unique=True)
    isActive = _sql.Column(_sql.BOOLEAN)
    isAdmin = _sql.Column(_sql.BOOLEAN)
    isBanned = _sql.Column(_sql.BOOLEAN)
    
    buisnessCardOwnerRelation = _orm.relationship("BuisnessCard", back_populates="ownerRelation")
    savedCardsRelation = _orm.relationship("BuisnessCard", secondary=userSavedCardsAssociation, back_populates='saveUsersRelation')
    
    def verify_password(self, password: str) -> bool:
        return _hash.bcrypt.verify(password, self.password)

class CardCategories(_database.Base):
    __tablename__ = "CardCategories"
    
    id = _sql.Column(_sql.Integer, primary_key=True, index=True, autoincrement=True)
    title = _sql.Column(_sql.String(255), nullable=False)
    
    buisnessCardRelation = _orm.relationship("BuisnessCard", back_populates='categotyRelation')

cardLinksAssociation = _sql.Table(
    'cardLinks',
    _database.Base.metadata,
    _sql.Column('contactLink_id', _sql.Integer, _sql.ForeignKey('ContactLinks.id')),
    _sql.Column('buisnessCard_id', _sql.Integer, _sql.ForeignKey('BuisnessCard.id'))
)

class ContactLinks(_database.Base):
    __tablename__ = "ContactLinks"
    
    id = _sql.Column(_sql.Integer, primary_key=True, index=True, autoincrement=True)
    title = _sql.Column(_sql.String(255), nullable=True)
    link = _sql.Column(_sql.String(500), nullable=False)

    buisnessCardRelation = _orm.relationship('BuisnessCard', secondary=cardLinksAssociation, back_populates='contactLinksRelation')

class City(_database.Base):
    __tablename__ = 'City'
    
    id = _sql.Column(_sql.Integer, primary_key=True, index=True, autoincrement=True)
    Name = _sql.Column(_sql.String(35), nullable=True)
    CountryCode = _sql.Column(_sql.String(35), nullable=True)
    title = _sql.Column(_sql.String(80))
    
    cityCardRelation = _orm.relationship("BuisnessCard", back_populates="cityRelation")

class GlobalCategories(_database.Base):
    __tablename__ = "GlobalCategories"

    id = _sql.Column(_sql.Integer, primary_key=True, autoincrement=True)
    title = _sql.Column(_sql.String(255), nullable=False)
    translation = _sql.Column(_sql.JSON)

    buisnessCardRelation = _orm.relationship("BuisnessCard", back_populates='globalCategotyRelation')
#ALTER TABLE GlobalCategories ADD COLUMN translation JSON;

class BuisnessCard(_database.Base):
    __tablename__ = "BuisnessCard"
    
    id = _sql.Column(_sql.Integer, primary_key=True, index=True, autoincrement=True)
    category_id = _sql.Column(_sql.Integer, _sql.ForeignKey("CardCategories.id"), nullable=True)
    owner_id = _sql.Column(_sql.Integer, _sql.ForeignKey("users.id"))
    image = _sql.Column(_sql.String(2000), nullable=True)
    global_category_id = _sql.Column(_sql.Integer, _sql.ForeignKey('GlobalCategories.id'), nullable=True)
    city_id = _sql.Column(_sql.Integer, _sql.ForeignKey('City.id'), nullable=True)
    contact_number = _sql.Column(_sql.String(255), nullable=True)
    contact_email = _sql.Column(_sql.String(255), nullable=True)
    description = _sql.Column(_sql.String(2000), nullable=True)
    visibility = _sql.Column(_sql.Integer, nullable=False, default=0) # -2 - banned, -1 - private, 0 - only with QR, 1 - public
    createdDate = _sql.Column(_sql.DateTime(timezone=True), default=_dt.datetime.utcnow)
    templateJson = _sql.Column(_sql.JSON, nullable=True)
    
    categotyRelation = _orm.relationship("CardCategories", back_populates='buisnessCardRelation')
    globalCategotyRelation = _orm.relationship("GlobalCategories", back_populates="buisnessCardRelation")
    ownerRelation = _orm.relationship("User", back_populates="buisnessCardOwnerRelation")
    cityRelation = _orm.relationship("City", back_populates="cityCardRelation")
    contactLinksRelation = _orm.relationship('ContactLinks', secondary=cardLinksAssociation, back_populates='buisnessCardRelation', cascade="all, delete")
    saveUsersRelation = _orm.relationship('User', secondary=userSavedCardsAssociation, back_populates='savedCardsRelation')


class CardTemplates(_database.Base):
    __tablename__ = "CardTemplates"

    id = _sql.Column(_sql.Integer, primary_key=True, index=True, autoincrement=True)
    title = _sql.Column(_sql.String(255), nullable=True)
    background = _sql.Column(_sql.String(2000), nullable=False)
    templateData = _sql.Column(_sql.JSON)
    