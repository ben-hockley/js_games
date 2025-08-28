from passlib.context import CryptContext

from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

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

# SnakeScore model
class SnakeScore(Base):
	__tablename__ = "snake_scores"
	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
	score = Column(Integer, nullable=False)
	played_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

	user = relationship("User", backref="snake_scores")

# 2048Score model
class Score2048(Base):
	__tablename__ = "2048_scores"
	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
	score = Column(Integer, nullable=False)
	played_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

	user = relationship("User", backref="2048_scores")

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

# Method to insert a SnakeScore
def insert_snake_score(user_id: int, score: int, played_at=None):
	session = SessionLocal()
	try:
		new_score = SnakeScore(user_id=user_id, score=score)
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

# Method to insert a 2048 Score.
def insert_2048_score(user_id: int, score: int, played_at=None):
	session = SessionLocal()
	try:
		new_score = Score2048(user_id=user_id, score=score)
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


# get the top scores in 2048 for all users.
def get_top_2048_scores(limit=5):
    session = SessionLocal()
    try:
        results = (
            session.query(Score2048.score, User.username)
            .join(User, Score2048.user_id == User.id)
            .order_by(Score2048.score.desc(), Score2048.played_at.asc())
            .limit(limit)
            .all()
        )
        return [{"score": score, "username": username} for score, username in results]
    finally:
        session.close()

# get the user's high scores on 2048
def get_user_top_2048_scores(user_id, limit=5):
	session = SessionLocal()
	try:
		results = (
			session.query(Score2048.score, Score2048.played_at)
			.filter(Score2048.user_id == user_id)
			.order_by(Score2048.score.desc(), Score2048.played_at.asc())
			.limit(limit)
			.all()
		)
		return [{"score": score, "played_at": played_at} for score, played_at in results]
	finally:
		session.close()

def get_user_wordle_score_distribution(user_id):
	session = SessionLocal()
	try:
		score_freq = {str(i): 0 for i in range(1, 7)}
		score_freq["0"] = 0  # 0 for losses
		scores = session.query(WordleScore.score).filter(WordleScore.user_id == user_id).all()
		for (score,) in scores:
			score_freq[str(score)] = score_freq.get(str(score), 0) + 1
		return score_freq
	finally:
		session.close()

def get_top_snake_scores(limit=5):
	session = SessionLocal()
	try:
		results = (
			session.query(SnakeScore.score, User.username)
			.join(User, SnakeScore.user_id == User.id)
			.order_by(SnakeScore.score.desc(), SnakeScore.played_at.asc())
			.limit(limit)
			.all()
		)
		return [{"score": score, "username": username} for score, username in results]
	finally:
		session.close()

def get_user_top_snake_scores(user_id, limit=5):
	session = SessionLocal()
	try:
		results = (
			session.query(SnakeScore.score, SnakeScore.played_at)
			.filter(SnakeScore.user_id == user_id)
			.order_by(SnakeScore.score.desc(), SnakeScore.played_at.asc())
			.limit(limit)
			.all()
		)
		return [{"score": score, "played_at": played_at} for score, played_at in results]
	finally:
		session.close()