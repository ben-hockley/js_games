from passlib.context import CryptContext

from models.models_user import User

# BCrypt for password encryption.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from database import SessionLocal

# Password encryption; Hash a password.
def hash_password(password: str) -> str:
	return pwd_context.hash(password)

# Verify a password
def verify_password(plain_password: str, hashed_password: str) -> bool:
	return pwd_context.verify(plain_password, hashed_password)

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
		
# Method to get a user by username
def get_user_by_username(username: str):
	session = SessionLocal()
	try:
		user = session.query(User).filter(User.username == username).first()
		return user
	finally:
		session.close()