from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.config import DB_USER, DB_PASSWORD

# Update these values with your actual database credentials
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@localhost:8080/js_games_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Sample User model
from sqlalchemy import Column, Integer, String


class User(Base):
	__tablename__ = "users"
	id = Column(Integer, primary_key=True, index=True)
	username = Column(String, unique=True, nullable=False)
	password = Column(String, nullable=False)
	email = Column(String, unique=True, nullable=False)

# Method to insert a new user
def insert_user(username: str, password: str, email: str):
	session = SessionLocal()
	try:
		new_user = User(username=username, password=password, email=email)
		session.add(new_user)
		session.commit()
		session.refresh(new_user)
		return new_user
	except Exception as e:
		session.rollback()
		raise e
	finally:
		session.close()
	




