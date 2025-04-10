import sqlalchemy as _sql
import sqlalchemy.ext.declarative as _declarative
import sqlalchemy.orm as _orm
import os as _os
import dotenv as _dotenv

_dotenv.load_dotenv()

DATABASE_URL = f"mysql+mysqlconnector://{_os.environ['DB_USERNAME']}:{_os.environ['DB_PASSWORD']}@{_os.environ['DB_HOST']}/{_os.environ['DB_NAME']}"
engine = _sql.create_engine(DATABASE_URL)

SessionLocal = _orm.sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = _declarative.declarative_base()