# EDUmind Quiz

Quiz educativo del ecosistema EDUmind: repaso activo y evaluación formativa
con dinámica de juego. Backend FastAPI (Python) + frontend React (Vite).

App en producción: <https://quiz.edumind.es>

Este repositorio es una release pública saneada para revisión de código,
reutilización educativa y auditoría. No incluye secretos, base de datos ni
configuración de despliegue (ver `OPEN_SOURCE_RELEASE.md`).

## Desarrollo

```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # y rellenar
python init_db.py
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Licencia

Software libre bajo `AGPL-3.0-or-later OR EUPL-1.2` (ver `LICENSE`).
EDUmind® es una marca registrada; ver `TRADEMARKS.md`.
