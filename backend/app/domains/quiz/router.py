from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
import random
from app.core.database import get_db
from app.core.auth import require_teacher, require_team
from app.domains.auth.models import User
from app.domains.team.models import Team
from app.domains.classroom.models import Area, Proposal
from app.domains.classroom.router import get_owned_proposal
from .models import QuestionProposal, Question, ProposalStatus, QuestionHistory
from .schemas import ProposalCreate, Proposal as ProposalSchema, ProposalUpdate, AnswerIn, AnswerOut
from datetime import datetime

# Sin prefix="/api": main.py ya monta todos los routers bajo /api.
router = APIRouter(tags=["quiz"])

# -------- PROPUESTAS DEL ALUMNADO (token de equipo) -------- #

@router.post("/student/proposals", response_model=ProposalSchema)
def submit_proposal(proposal: ProposalCreate, team: Team = Depends(require_team), db: Session = Depends(get_db)):
    # El equipo solo puede proponer en su nombre y dentro de su partida
    if proposal.team_id != team.id:
        raise HTTPException(status_code=403, detail="No puedes proponer preguntas por otro equipo")
    area = db.query(Area).filter(Area.id == proposal.area_id, Area.proposal_id == team.proposal_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Área no encontrada")
    try:
        opciones = json.loads(proposal.options_json)
    except ValueError:
        raise HTTPException(status_code=422, detail="Las opciones no tienen formato JSON")
    if not isinstance(opciones, list) or not (0 <= proposal.correct_option_index < len(opciones)):
        raise HTTPException(status_code=422, detail="La opción correcta no existe entre las opciones")

    db_proposal = QuestionProposal(
        question_text=proposal.question_text,
        options_json=proposal.options_json,
        correct_option_index=proposal.correct_option_index,
        explanation=proposal.explanation,
        team_id=team.id,
        area_id=proposal.area_id,
        status=ProposalStatus.PENDING
    )
    db.add(db_proposal)
    db.flush()
    
    # Anotar en el historial
    hist = QuestionHistory(
        question_proposal_id=db_proposal.id,
        status_changed_to=ProposalStatus.PENDING,
        timestamp=datetime.utcnow()
    )
    db.add(hist)
    db.commit()
    db.refresh(db_proposal)
    return db_proposal

@router.get("/student/my-proposals/{team_id}", response_model=List[ProposalSchema])
def get_my_proposals(team_id: int, team: Team = Depends(require_team), db: Session = Depends(get_db)):
    if team_id != team.id:
        raise HTTPException(status_code=403, detail="Solo puedes ver las propuestas de tu equipo")
    return db.query(QuestionProposal).filter(QuestionProposal.team_id == team.id).all()

@router.get("/student/areas/{proposal_id}")
def get_areas_status(proposal_id: int, team: Team = Depends(require_team), db: Session = Depends(get_db)):
    if proposal_id != team.proposal_id:
        raise HTTPException(status_code=403, detail="Esa partida no es la de tu equipo")
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Partida no encontrada")
        
    areas = db.query(Area).filter(Area.proposal_id == proposal_id).all()
    result = []
    for area in areas:
        count = db.query(QuestionProposal).filter(
            QuestionProposal.team_id == team.id,
            QuestionProposal.area_id == area.id,
            QuestionProposal.status == ProposalStatus.VALIDATED
        ).count()
        result.append({
            "area_id": area.id,
            "name": area.name,
            "required": proposal.min_questions,
            "completed": count
        })
    return result

# -------- REVISIÓN DEL DOCENTE (token de docente) -------- #

@router.get("/teacher/proposals/pending/{proposal_id}", response_model=List[ProposalSchema])
def get_pending_proposals(proposal_id: int, teacher: User = Depends(require_teacher), db: Session = Depends(get_db)):
    get_owned_proposal(proposal_id, teacher, db)
    return db.query(QuestionProposal).join(Team).filter(
        Team.proposal_id == proposal_id,
        QuestionProposal.status == ProposalStatus.PENDING
    ).all()

@router.put("/teacher/proposals/{proposal_id}/review")
def review_proposal(proposal_id: int, review: ProposalUpdate, teacher: User = Depends(require_teacher), db: Session = Depends(get_db)):
    proposal = db.query(QuestionProposal).filter(QuestionProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Propuesta no encontrada")
    # Solo el docente dueño de la partida puede revisarla
    get_owned_proposal(proposal.team.proposal_id, teacher, db)
    if review.status is None:
        raise HTTPException(status_code=422, detail="Falta el estado de la revisión")
    
    proposal.status = review.status
    if review.teacher_feedback is not None:
        proposal.teacher_feedback = review.teacher_feedback
        
    hist = QuestionHistory(
        question_proposal_id=proposal.id,
        status_changed_to=review.status,
        comment=review.teacher_feedback,
        timestamp=datetime.utcnow()
    )
    db.add(hist)
    
    if review.status == ProposalStatus.VALIDATED:
        question = Question(
            text=proposal.question_text,
            options_json=proposal.options_json,
            correct_option_index=proposal.correct_option_index,
            explanation=proposal.explanation,
            area_id=proposal.area_id,
            proposal_id=proposal.team.proposal_id,
            origin_proposal_id=proposal.id
        )
        db.add(question)
        
    db.commit()
    return {"message": f"Propuesta {review.status.value}"}

# -------- PARTIDA (token de equipo) -------- #

def _partida_del_equipo(proposal_id: int, team: Team, db: Session) -> Proposal:
    if proposal_id != team.proposal_id:
        raise HTTPException(status_code=403, detail="Esa partida no es la de tu equipo")
    parent_proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not parent_proposal:
        raise HTTPException(status_code=404, detail="Partida no encontrada")
    return parent_proposal

@router.get("/game/status/{proposal_id}")
def check_game_readiness(proposal_id: int, team: Team = Depends(require_team), db: Session = Depends(get_db)):
    parent_proposal = _partida_del_equipo(proposal_id, team, db)
        
    areas = db.query(Area).filter(Area.proposal_id == proposal_id).all()
    status = []
    ready = True
    
    for area in areas:
        count = db.query(Question).filter(
            Question.area_id == area.id,
            Question.proposal_id == proposal_id
        ).count()
        area_ready = count >= parent_proposal.min_questions
        if not area_ready:
            ready = False
        status.append({
            "area": area.name,
            "current": count,
            "required": parent_proposal.min_questions,
            "ready": area_ready
        })
        
    return {"ready": ready, "areas": status}

@router.post("/game/start/{proposal_id}")
def start_game_session(proposal_id: int, team: Team = Depends(require_team), db: Session = Depends(get_db)):
    _partida_del_equipo(proposal_id, team, db)
    return {"message": "Partida iniciada", "session_id": f"game-{proposal_id}"}

@router.get("/game/question/{proposal_id}")
def get_random_question(proposal_id: int, team: Team = Depends(require_team), db: Session = Depends(get_db)):
    _partida_del_equipo(proposal_id, team, db)
    questions = db.query(Question).filter(Question.proposal_id == proposal_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No hay preguntas disponibles")
    
    # La opción correcta y la explicación NO se envían: se comprueban en /game/answer
    question = random.choice(questions)
    return {
        "id": question.id,
        "text": question.text,
        "options": question.options_json,
        "area": question.area.name
    }

@router.post("/game/answer/{question_id}", response_model=AnswerOut)
def answer_question(question_id: int, answer: AnswerIn, team: Team = Depends(require_team), db: Session = Depends(get_db)):
    """Corrige la respuesta en el servidor comparándola con correct_option_index."""
    question = db.query(Question).filter(
        Question.id == question_id,
        Question.proposal_id == team.proposal_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return AnswerOut(
        correct=(answer.selected_index == question.correct_option_index),
        correct_option_index=question.correct_option_index,
        explanation=question.explanation,
    )
