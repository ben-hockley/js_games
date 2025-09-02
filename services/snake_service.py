from models.models_snake import SnakeScore
from models.models_user import User
from database import SessionLocal

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
		
# Snake
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