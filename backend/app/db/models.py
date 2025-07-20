from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(128), unique=True, nullable=False)   # Firebase UID
    email = Column(String(128), unique=True, nullable=False)
    name = Column(String(128))
    role = Column(String(32), default="user")
    credits = Column(Integer, default=0)
