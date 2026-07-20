from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from .models import ProposalStatus

class ProposalBase(BaseModel):
    question_text: str
    options_json: str
    correct_option_index: int
    explanation: Optional[str] = None

class ProposalCreate(ProposalBase):
    team_id: int
    area_id: int

class ProposalUpdate(BaseModel):
    status: Optional[ProposalStatus] = None
    teacher_feedback: Optional[str] = None
    question_text: Optional[str] = None 
    options_json: Optional[str] = None
    correct_option_index: Optional[int] = None

class QuestionHistory(BaseModel):
    id: int
    status_changed_to: str
    comment: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class Proposal(ProposalBase):
    id: int
    status: ProposalStatus
    teacher_feedback: Optional[str] = None
    team_id: int
    area_id: int
    history: List[QuestionHistory] = []

    class Config:
        from_attributes = True

class Question(BaseModel):
    id: int
    text: str
    options_json: str
    
    class Config:
        from_attributes = True
