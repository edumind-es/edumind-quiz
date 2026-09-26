import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from .models import User
from .schemas import UserCreate
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["auth"])


def registration_open() -> bool:
    """El registro de docentes está cerrado salvo que ALLOW_TEACHER_REGISTRATION=true (ver .env.example)."""
    return os.environ.get("ALLOW_TEACHER_REGISTRATION", "false").strip().lower() in ("1", "true", "yes", "si", "sí")


@router.get("/register/status", response_model=dict)
def register_status():
    """Indica al frontend si este servidor admite altas de docentes."""
    return {"open": registration_open()}


@router.post("/register", response_model=dict)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if not registration_open():
        raise HTTPException(
            status_code=403,
            detail="El registro de docentes está cerrado en este servidor. Pide el alta a quien lo administra.",
        )
    # Comprobar nombre de usuario
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Ese nombre de usuario ya existe")

    # Comprobar el correo solo si se ha indicado
    if user.email and db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Ese correo ya está registrado")

    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    return {"message": "Usuario creado"}


@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Se acepta nombre de usuario o correo
    user = db.query(User).filter(
        or_(User.username == form_data.username, User.email == form_data.username)
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=60 * 24)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "user_id": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "username": user.username}
