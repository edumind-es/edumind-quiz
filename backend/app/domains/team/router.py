from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token
from app.core.auth import require_teacher
from app.domains.auth.models import User
from app.domains.classroom.router import get_owned_proposal
from .models import Team
from .schemas import TeamLogin
import secrets

router = APIRouter(tags=["team"])


@router.post("/teacher/teams", response_model=dict)
def create_team(name: str, proposal_id: int, teacher: User = Depends(require_teacher), db: Session = Depends(get_db)):
    get_owned_proposal(proposal_id, teacher, db)
    # PIN de 4 cifras único (reintenta si ya existe)
    pin = str(secrets.randbelow(9000) + 1000)
    while db.query(Team).filter(Team.access_pin == pin).first():
        pin = str(secrets.randbelow(9000) + 1000)

    team = Team(name=name, access_pin=pin, proposal_id=proposal_id)
    db.add(team)
    db.commit()
    db.refresh(team)
    return {"id": team.id, "name": team.name, "pin": team.access_pin}


@router.post("/auth/team/login")
def team_login(datos: TeamLogin, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.access_pin == datos.pin.strip()).first()
    if not team:
        raise HTTPException(status_code=401, detail="PIN incorrecto")

    access_token = create_access_token(
        data={"sub": f"team:{team.id}", "role": "team", "team_id": team.id}
    )
    return {"access_token": access_token, "token_type": "bearer", "team_id": team.id, "team_name": team.name, "proposal_id": team.proposal_id}
