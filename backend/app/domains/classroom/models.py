from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    
    teacher = relationship("User", back_populates="classrooms")
    proposals = relationship("Proposal", back_populates="classroom")

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    min_questions = Column(Integer, default=5)
    num_options = Column(Integer, default=4)

    classroom = relationship("Classroom", back_populates="proposals")
    areas = relationship("Area", back_populates="proposal")
    teams = relationship("Team", back_populates="proposal")
    questions = relationship("Question", back_populates="proposal")

class Area(Base):
    __tablename__ = "areas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    proposal_id = Column(Integer, ForeignKey("proposals.id"))

    proposal = relationship("Proposal", back_populates="areas")
