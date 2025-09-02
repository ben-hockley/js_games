from models.models_2048 import Score2048
from models.models_user import User
from database import SessionLocal

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