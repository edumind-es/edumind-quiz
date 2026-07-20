from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    access_pin = Column(String, unique=True, index=True) # Unique PIN for login
    players = Column(String, nullable=True) # Player names
    proposal_id = Column(Integer, ForeignKey("proposals.id"))

    proposal = relationship("Proposal", back_populates="teams")
    proposals_submitted = relationship("QuestionProposal", back_populates="team")
