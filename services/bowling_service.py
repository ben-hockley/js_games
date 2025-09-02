from models.models_bowling import BowlingScore
from database import SessionLocal
from models.models_user import User

# Method to insert a bowling Score.
def insert_bowling_score(user_id: int, score: int, played_at=None):
	session = SessionLocal()
	try:
		new_score = BowlingScore(user_id=user_id, score=score)
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
		
def get_top_bowling_scores(limit=5):
	session = SessionLocal()
	try:
		results = (
			session.query(BowlingScore.score, User.username)
			.join(User, BowlingScore.user_id == User.id)
			.order_by(BowlingScore.score.desc(), BowlingScore.played_at.asc())
			.limit(limit)
			.all()
		)
		return [{"score": score, "username": username} for score, username in results]
	finally:
		session.close()

def get_user_top_bowling_scores(user_id, limit=5):
	session = SessionLocal()
	try:
		results = (
			session.query(BowlingScore.score, BowlingScore.played_at)
			.filter(BowlingScore.user_id == user_id)
			.order_by(BowlingScore.score.desc(), BowlingScore.played_at.asc())
			.limit(limit)
			.all()
		)
		return [{"score": score, "played_at": played_at} for score, played_at in results]
	finally:
		session.close()