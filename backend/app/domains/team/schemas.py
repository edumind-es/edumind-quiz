from pydantic import BaseModel
from typing import Optional

class TeamBase(BaseModel):
    name: str
    players: Optional[str] = None

class TeamCreate(TeamBase):
    proposal_id: int

class Team(TeamBase):
    id: int
    access_pin: str
    proposal_id: int

    class Config:
        from_attributes = True

class TeamLogin(BaseModel):
    """El PIN viaja en el cuerpo de la petición, nunca en la URL."""
    pin: str
