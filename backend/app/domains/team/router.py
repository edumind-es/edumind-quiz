from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token
from .models import Team
import random

router = APIRouter(tags=["team"]) 

@router.post("/teacher/teams", response_model=dict)
def create_team(name: str, proposal_id: int, db: Session = Depends(get_db)):
    pin = str(random.randint(1000, 9999))
    
    team = Team(name=name, access_pin=pin, proposal_id=proposal_id)
    db.add(team)
    db.commit()
    db.refresh(team)
    return {"id": team.id, "name": team.name, "pin": team.access_pin}

@router.post("/auth/team/login")
def team_login(pin: str, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.access_pin == pin).first()
    if not team:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    
    access_token = create_access_token(
        data={"sub": f"team:{team.id}", "role": "team", "team_id": team.id}
    )
    return {"access_token": access_token, "token_type": "bearer", "team_id": team.id, "team_name": team.name, "proposal_id": team.proposal_id}
