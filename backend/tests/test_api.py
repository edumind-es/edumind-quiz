"""Flujo completo: rutas bajo /api (sin doble prefijo), token obligatorio,
docente y equipo separados, PIN en el cuerpo y corrección en el servidor."""
import json


def test_rutas_sin_doble_prefijo(client):
    assert client.get("/api/api/game/status/1").status_code == 404
    # Con prefijo correcto la ruta existe (responde 401 por falta de token, no 404)
    assert client.get("/api/game/status/1").status_code == 401


def test_rutas_de_datos_exigen_token(client):
    assert client.get("/api/teacher/proposals/pending/1").status_code == 401
    assert client.get("/api/student/my-proposals/1").status_code == 401
    assert client.get("/api/game/question/1").status_code == 401
    assert client.post("/api/game/answer/1", json={"selected_index": 0}).status_code == 401
    assert client.post("/api/teacher/classroom", params={"name": "x"}).status_code == 401


def test_registro_cerrado_por_defecto(client, monkeypatch):
    monkeypatch.delenv("ALLOW_TEACHER_REGISTRATION", raising=False)
    assert client.get("/api/auth/register/status").json() == {"open": False}
    r = client.post("/api/auth/register", json={"username": "intruso", "password": "x"})
    assert r.status_code == 403


def test_pin_en_el_cuerpo_y_no_en_la_url(client, partida):
    pin = partida["equipo"]["pin"]
    assert len(pin) == 4 and pin.isdigit()
    # En query string ya no vale
    assert client.post(f"/api/auth/team/login?pin={pin}").status_code == 422
    assert client.post("/api/auth/team/login", json={"pin": "0000"}).status_code == 401
    assert client.post("/api/auth/team/login", json={"pin": pin}).status_code == 200


def test_docente_y_equipo_no_se_confunden(client, docente, equipo, partida):
    pid = partida["proposal"]["id"]
    # Un equipo no puede usar rutas de docente ni al revés
    assert client.get(f"/api/teacher/proposals/pending/{pid}", headers=equipo["headers"]).status_code == 403
    assert client.get(f"/api/game/status/{pid}", headers=docente).status_code == 403
    # Un equipo no ve las propuestas de otro equipo
    assert client.get(f"/api/student/my-proposals/{equipo['team_id'] + 99}", headers=equipo["headers"]).status_code == 403


def test_flujo_proponer_validar_jugar(client, docente, equipo, partida):
    pid = partida["proposal"]["id"]
    opciones = [{"texto": "Pontevedra", "correcta": False}, {"texto": "Vigo", "correcta": True},
                {"texto": "Lugo", "correcta": False}, {"texto": "Ourense", "correcta": False}]
    r = client.post("/api/student/proposals", json={
        "team_id": equipo["team_id"], "area_id": partida["area"]["id"],
        "question_text": "¿Cuál es la ciudad más poblada de Galicia?",
        "options_json": json.dumps(opciones), "correct_option_index": 1,
        "explanation": "Vigo supera los 290 000 habitantes.",
    }, headers=equipo["headers"])
    assert r.status_code == 200, r.text
    propuesta = r.json()
    assert propuesta["status"] == "pending"

    # Índice correcto fuera de rango: rechazada
    r = client.post("/api/student/proposals", json={
        "team_id": equipo["team_id"], "area_id": partida["area"]["id"],
        "question_text": "x", "options_json": json.dumps(opciones), "correct_option_index": 7,
    }, headers=equipo["headers"])
    assert r.status_code == 422

    # Antes de validar no hay preguntas
    assert client.get(f"/api/game/status/{pid}", headers=equipo["headers"]).json()["ready"] is False

    # El docente la valida
    pendientes = client.get(f"/api/teacher/proposals/pending/{pid}", headers=docente).json()
    assert [p["id"] for p in pendientes] == [propuesta["id"]]
    r = client.put(f"/api/teacher/proposals/{propuesta['id']}/review", json={"status": "validated"}, headers=docente)
    assert r.status_code == 200, r.text
    assert client.get(f"/api/game/status/{pid}", headers=equipo["headers"]).json()["ready"] is True

    # La pregunta no revela la respuesta correcta ni la explicación
    q = client.get(f"/api/game/question/{pid}", headers=equipo["headers"]).json()
    assert set(q) == {"id", "text", "options", "area"}
    assert q["area"] == "Deportes"

    # Corrección en el servidor: fallo → explicación; acierto → correct=True
    r = client.post(f"/api/game/answer/{q['id']}", json={"selected_index": 0}, headers=equipo["headers"]).json()
    assert r == {"correct": False, "correct_option_index": 1, "explanation": "Vigo supera los 290 000 habitantes."}
    r = client.post(f"/api/game/answer/{q['id']}", json={"selected_index": 1}, headers=equipo["headers"]).json()
    assert r["correct"] is True
