from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.domains.auth.models import User
from .models import Classroom, Area, Proposal
from .schemas import AreaCreate, Area as AreaSchema, ProposalCreate, Proposal as ProposalSchema

router = APIRouter(prefix="/teacher", tags=["classroom"])

def get_current_teacher(db: Session = Depends(get_db)):
    # Mocking for now: get first teacher
    return db.query(User).filter(User.role == "teacher").first() 

@router.post("/classroom", response_model=dict)
def create_classroom(name: str, db: Session = Depends(get_db)):
    teacher = get_current_teacher(db)
    if not teacher:
        raise HTTPException(status_code=400, detail="No teacher found")
    
    room = Classroom(name=name, teacher_id=teacher.id)
    db.add(room)
    db.commit()
    db.refresh(room)
    return {"id": room.id, "name": room.name}

@router.post("/proposals", response_model=ProposalSchema)
def create_proposal(prop: ProposalCreate, db: Session = Depends(get_db)):
    db_prop = Proposal(name=prop.name, min_questions=prop.min_questions, num_options=prop.num_options, classroom_id=prop.classroom_id)
    db.add(db_prop)
    db.commit()
    db.refresh(db_prop)
    return db_prop

@router.post("/areas", response_model=AreaSchema)
def create_area(area: AreaCreate, db: Session = Depends(get_db)):
    db_area = Area(name=area.name, proposal_id=area.proposal_id)
    db.add(db_area)
    db.commit()
    db.refresh(db_area)
    return db_area
