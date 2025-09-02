from passlib.context import CryptContext

from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

from config.config import DB_USER, DB_PASSWORD

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Update these values with your actual database credentials
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@localhost:8080/js_games_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()