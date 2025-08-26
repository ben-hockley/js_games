# Password hashing utilities
from passlib.context import CryptContext

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.config import DB_USER, DB_PASSWORD

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash a password
def hash_password(password: str) -> str:
	return pwd_context.hash(password)

# Verify a password
def verify_password(plain_password: str, hashed_password: str) -> bool:
	return pwd_context.verify(plain_password, hashed_password)


# Update these values with your actual database credentials
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@localhost:8080/js_games_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Sample User model
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

# User model
class User(Base):
	__tablename__ = "users"
	id = Column(Integer, primary_key=True, index=True)
	username = Column(String, unique=True, nullable=False)
	password = Column(String, nullable=False)
	email = Column(String, unique=True, nullable=False)


# WordleScore model
class WordleScore(Base):
	__tablename__ = "wordle_scores"
	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
	score = Column(Integer, nullable=False)
	played_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

	user = relationship("User", backref="wordle_scores")

# Method to insert a new user
def insert_user(username: str, password: str, email: str):
	session = SessionLocal()
	try:
		hashed_pw = hash_password(password)
		new_user = User(username=username, password=hashed_pw, email=email)
		session.add(new_user)
		session.commit()
		session.refresh(new_user)
		return new_user
	except Exception as e:
		session.rollback()
		raise e
	finally:
		session.close()

# Method to insert a WordleScore
def insert_wordle_score(user_id: int, score: int, played_at=None):
	session = SessionLocal()
	try:
		new_score = WordleScore(user_id=user_id, score=score)
		if played_at is not None:
			new_score.played_at = played_at
		session.add(new_score)
		session.commit()
		session.refresh(new_score)
		return new_score
	except Exception as e:
		session.rollback()
		raise e
	finally:
		session.close()


		
# Method to get a user by username
def get_user_by_username(username: str):
	session = SessionLocal()
	try:
		user = session.query(User).filter(User.username == username).first()
		return user
	finally:
		session.close()