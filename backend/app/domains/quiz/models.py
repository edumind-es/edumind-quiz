from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum

class ProposalStatus(str, enum.Enum):
    PENDING = "pending"
    VALIDATED = "validated"
    RETURNED = "returned"
    REJECTED = "rejected"

class QuestionProposal(Base):
    __tablename__ = "question_proposals"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text)
    options_json = Column(Text) # JSON string of options
    correct_option_index = Column(Integer)
    explanation = Column(Text, nullable=True)
    
    status = Column(String, default=ProposalStatus.PENDING)
    teacher_feedback = Column(Text, nullable=True)
    
    team_id = Column(Integer, ForeignKey("teams.id"))
    area_id = Column(Integer, ForeignKey("areas.id"))

    team = relationship("Team", back_populates="proposals_submitted")
    history = relationship("QuestionHistory", back_populates="proposal", cascade="all, delete-orphan")

class QuestionHistory(Base):
    __tablename__ = "question_history"
    
    id = Column(Integer, primary_key=True, index=True)
    question_proposal_id = Column(Integer, ForeignKey("question_proposals.id"))
    status_changed_to = Column(String)
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    proposal = relationship("QuestionProposal", back_populates="history")
    
class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text)
    options_json = Column(Text)
    correct_option_index = Column(Integer)
    explanation = Column(Text, nullable=True)
    
    area_id = Column(Integer, ForeignKey("areas.id"))
    proposal_id = Column(Integer, ForeignKey("proposals.id"))
    origin_proposal_id = Column(Integer, ForeignKey("question_proposals.id"), nullable=True)

    proposal = relationship("Proposal", back_populates="questions")
