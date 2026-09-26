import os
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
import bcrypt

SECRET_KEY = os.environ.get("SECRET_KEY", "SUPER_SECRET_KEY_CHANGE_ME")
if not SECRET_KEY or SECRET_KEY == "SUPER_SECRET_KEY_CHANGE_ME":
    # Solo un aviso para desarrollo
    print("AVISO: se está usando la clave secreta por defecto (define SECRET_KEY en .env).")
    
ALGORITHM = os.environ.get("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))

# Se usa bcrypt directamente (passlib no funciona con bcrypt >= 4.1).
# Los hashes son los mismos $2b$ que generaba passlib, así que las cuentas existentes siguen valiendo.

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
