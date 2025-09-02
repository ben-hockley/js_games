from database import SessionLocal
from models.models_wordle import WordleScore

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