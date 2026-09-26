from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_teacher
from app.domains.auth.models import User
from .models import Classroom, Area, Proposal
from .schemas import AreaCreate, Area as AreaSchema, ProposalCreate, Proposal as ProposalSchema

router = APIRouter(prefix="/teacher", tags=["classroom"])


def get_owned_proposal(proposal_id: int, teacher: User, db: Session) -> Proposal:
    """Devuelve la propuesta (partida) solo si pertenece a un aula del docente."""
    proposal = (
        db.query(Proposal)
        .join(Classroom)
        .filter(Proposal.id == proposal_id, Classroom.teacher_id == teacher.id)
        .first()
    )
    if not proposal:
        raise HTTPException(status_code=404, detail="Partida no encontrada")
    return proposal


@router.post("/classroom", response_model=dict)
def create_classroom(name: str, teacher: User = Depends(require_teacher), db: Session = Depends(get_db)):
    room = Classroom(name=name, teacher_id=teacher.id)
    db.add(room)
    db.commit()
    db.refresh(room)
    return {"id": room.id, "name": room.name}


@router.post("/proposals", response_model=ProposalSchema)
def create_proposal(prop: ProposalCreate, teacher: User = Depends(require_teacher), db: Session = Depends(get_db)):
    room = db.query(Classroom).filter(Classroom.id == prop.classroom_id, Classroom.teacher_id == teacher.id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Aula no encontrada")
    db_prop = Proposal(name=prop.name, min_questions=prop.min_questions, num_options=prop.num_options, classroom_id=prop.classroom_id)
    db.add(db_prop)
    db.commit()
    db.refresh(db_prop)
    return db_prop


@router.post("/areas", response_model=AreaSchema)
def create_area(area: AreaCreate, teacher: User = Depends(require_teacher), db: Session = Depends(get_db)):
    get_owned_proposal(area.proposal_id, teacher, db)
    db_area = Area(name=area.name, proposal_id=area.proposal_id)
    db.add(db_area)
    db.commit()
    db.refresh(db_area)
    return db_area
