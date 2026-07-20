from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(_env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine

# Import all models to ensure they are registered with SQLAlchemy
from app.domains.auth.models import User
from app.domains.classroom.models import Classroom, Area, Proposal
from app.domains.team.models import Team
from app.domains.quiz.models import QuestionProposal, Question, QuestionHistory

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EDUmind Quiz API",
    description="Backend for the new Trivial App (Professional Vertical Slice Architecture)",
    version="2.0.0"
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://trivial.edumind.es",
    "https://quiz.edumind.es",
    "https://auth.edumind.es",
    "https://panel.edumind.es",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to EDUmind Quiz API", "status": "active", "architecture": "vertical-slice"}

from app.domains.auth.router import router as auth_router
from app.domains.classroom.router import router as classroom_router
from app.domains.team.router import router as team_router
from app.domains.quiz.router import router as quiz_router

app.include_router(auth_router, prefix="/api")
app.include_router(classroom_router, prefix="/api")
app.include_router(team_router, prefix="/api")
app.include_router(quiz_router, prefix="/api")

@app.get("/api/metrics/prometheus", tags=["monitoring"])
def prometheus_metrics():
    return {"status": "Metrics disabled in Vertical Slice refactor"}
