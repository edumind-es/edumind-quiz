"""Pruebas del backend con una BD SQLite temporal y una clave de pruebas."""
import os
import sys
import tempfile
from pathlib import Path

import pytest

# Las variables deben estar antes de importar la app (se leen al cargar el módulo)
_tmpdir = tempfile.mkdtemp(prefix="quiz-test-")
os.environ["DATABASE_URL"] = f"sqlite:///{_tmpdir}/pruebas.db"
os.environ["SECRET_KEY"] = "clave-solo-para-pruebas"
os.environ["ALLOW_TEACHER_REGISTRATION"] = "true"

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def docente(client):
    """Registra un docente y devuelve las cabeceras con su token."""
    r = client.post("/api/auth/register", json={"username": "maestra", "password": "secreta123"})
    assert r.status_code == 200, r.text
    r = client.post("/api/auth/token", data={"username": "maestra", "password": "secreta123"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture(scope="session")
def partida(client, docente):
    """Aula + partida (mínimo 1 pregunta por área) + un área + un equipo con PIN."""
    aula = client.post("/api/teacher/classroom", params={"name": "6.º A"}, headers=docente).json()
    prop = client.post("/api/teacher/proposals", json={"name": "Trimestre 1", "min_questions": 1, "classroom_id": aula["id"]}, headers=docente).json()
    area = client.post("/api/teacher/areas", json={"name": "Deportes", "proposal_id": prop["id"]}, headers=docente).json()
    equipo = client.post("/api/teacher/teams", params={"name": "Los Rayos", "proposal_id": prop["id"]}, headers=docente).json()
    return {"aula": aula, "proposal": prop, "area": area, "equipo": equipo}


@pytest.fixture(scope="session")
def equipo(client, partida):
    """Entra con el PIN (en el cuerpo) y devuelve cabeceras y datos del equipo."""
    r = client.post("/api/auth/team/login", json={"pin": partida["equipo"]["pin"]})
    assert r.status_code == 200, r.text
    datos = r.json()
    return {"headers": {"Authorization": f"Bearer {datos['access_token']}"}, **datos}
