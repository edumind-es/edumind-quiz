"""Dependencias de autenticación: validan el JWT y distinguen docente de equipo.

Todas las rutas de datos deben usar `require_teacher` o `require_team`;
ninguna debe fiarse de un id que llegue en la URL sin contrastarlo con el token.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.domains.auth.models import User
from app.domains.team.models import Team

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

_no_autorizado = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Sesión no válida o caducada",
    headers={"WWW-Authenticate": "Bearer"},
)


def decode_token(token: str = Depends(oauth2_scheme)) -> dict:
    """Devuelve el contenido del JWT o 401 si no es válido."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise _no_autorizado


def require_teacher(payload: dict = Depends(decode_token), db: Session = Depends(get_db)) -> User:
    """Exige un token de docente y devuelve su usuario."""
    if payload.get("role") != "teacher":
        raise HTTPException(status_code=403, detail="Solo el docente puede hacer esto")
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise _no_autorizado
    return user


def require_team(payload: dict = Depends(decode_token), db: Session = Depends(get_db)) -> Team:
    """Exige un token de equipo y devuelve el equipo."""
    if payload.get("role") != "team":
        raise HTTPException(status_code=403, detail="Solo un equipo puede hacer esto")
    team = db.query(Team).filter(Team.id == payload.get("team_id")).first()
    if not team:
        raise _no_autorizado
    return team
