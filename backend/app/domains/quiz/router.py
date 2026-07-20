from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import json
import random
from app.core.database import get_db
from app.domains.team.models import Team
from app.domains.classroom.models import Area, Proposal
from .models import QuestionProposal, Question, ProposalStatus, QuestionHistory
from .schemas import ProposalCreate, Proposal as ProposalSchema, ProposalUpdate
from datetime import datetime

router = APIRouter(tags=["quiz"], prefix="/api")

# -------- STUDENT PROPOSALS -------- #

@router.post("/student/proposals", response_model=ProposalSchema)
def submit_proposal(proposal: ProposalCreate, db: Session = Depends(get_db)):
    db_proposal = QuestionProposal(
        question_text=proposal.question_text,
        options_json=proposal.options_json,
        correct_option_index=proposal.correct_option_index,
        explanation=proposal.explanation,
        team_id=proposal.team_id,
        area_id=proposal.area_id,
        status=ProposalStatus.PENDING
    )
    db.add(db_proposal)
    db.flush()
    
    # Create history entry
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
def get_my_proposals(team_id: int, db: Session = Depends(get_db)):
    return db.query(QuestionProposal).filter(QuestionProposal.team_id == team_id).all()

@router.get("/student/areas/{proposal_id}")
def get_areas_status(proposal_id: int, team_id: int, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    areas = db.query(Area).filter(Area.proposal_id == proposal_id).all()
    result = []
    for area in areas:
        count = db.query(QuestionProposal).filter(
            QuestionProposal.team_id == team_id,
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

# -------- TEACHER PROPOSALS -------- #

@router.get("/teacher/proposals/pending/{proposal_id}", response_model=List[ProposalSchema])
def get_pending_proposals(proposal_id: int, db: Session = Depends(get_db)):
    return db.query(QuestionProposal).join(Team).filter(
        Team.proposal_id == proposal_id,
        QuestionProposal.status == ProposalStatus.PENDING
    ).all()

@router.put("/teacher/proposals/{proposal_id}/review")
def review_proposal(proposal_id: int, review: ProposalUpdate, db: Session = Depends(get_db)):
    proposal = db.query(QuestionProposal).filter(QuestionProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
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
    return {"message": f"Proposal {review.status}"}

# -------- GAME STATUS -------- #

@router.get("/game/status/{proposal_id}")
def check_game_readiness(proposal_id: int, db: Session = Depends(get_db)):
    parent_proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not parent_proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
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
def start_game_session(proposal_id: int, db: Session = Depends(get_db)):
    return {"message": "Game Started", "session_id": f"game-{proposal_id}", "ws_url": f"/ws/game/{proposal_id}"}

@router.get("/game/question/{proposal_id}")
def get_random_question(proposal_id: int, db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.proposal_id == proposal_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions available")
    
    question = random.choice(questions)
    return {
        "id": question.id,
        "text": question.text,
        "options": question.options_json,
        "area": question.area.name
    }
