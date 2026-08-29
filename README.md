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

## Colaborar

Se puede colaborar **sin programar**: contar cómo te ha ido en clase, reportar un fallo, revisar los textos o traducir. Todo el proyecto está en español. Empieza por [CONTRIBUTING.md](CONTRIBUTING.md) y el [código de conducta](CODE_OF_CONDUCT.md).

¿Un fallo de seguridad? No abras un issue público: ver [SECURITY.md](SECURITY.md).

Este repositorio es una *release saneada* para revisión y auditoría: no incluye secretos, configuración de despliegue ni datos de aula. Ver [OPEN_SOURCE_RELEASE.md](OPEN_SOURCE_RELEASE.md).

## Licencia

Licencia doble **AGPL-3.0-or-later** *o* **EUPL-1.2**, a elección de quien la reutilice. Ver [LICENSE](LICENSE) y [NOTICE](NOTICE).

EDUmind® es marca registrada en España (OEPM). El código es libre; la marca y los logotipos no se ceden con él — ver [TRADEMARKS.md](TRADEMARKS.md).

Por **Luis Vilela Acuña** — maestro de Educación Física, CEIP Campolongo (Pontevedra).
