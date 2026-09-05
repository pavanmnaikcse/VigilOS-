from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

from app.database import get_mongo_db

router = APIRouter()

SECRET_KEY = os.environ.get("JWT_SECRET", "super-secret-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    username: str
    password: str
    phone: str
    email: EmailStr

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    db = get_mongo_db()
    
    # Check if user exists
    if db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
        
    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user_dict["password"])
    user_dict["balance"] = 1000.00 # Starting balance for demo
    user_dict["created_at"] = datetime.utcnow()
    
    # Insert user
    result = db.users.insert_one(user_dict)
    
    # Create token
    user_id_str = str(result.inserted_id)
    access_token = create_access_token(data={"sub": user.username, "user_id": user_id_str})
    
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_id_str}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db = get_mongo_db()
    
    db_user = db.users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    user_id_str = str(db_user["_id"])
    access_token = create_access_token(data={"sub": db_user["username"], "user_id": user_id_str})
    
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_id_str}

from fastapi import Header
from bson import ObjectId
from jose import JWTError

def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)):
    db = get_mongo_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "username": user.get("username"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "created_at": user.get("created_at")
    }
