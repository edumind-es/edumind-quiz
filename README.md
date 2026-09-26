# EDUmind Quiz

Quiz educativo del ecosistema EDUmind en el que **el alumnado escribe las preguntas**:
por equipos, proponen preguntas de opción múltiple por áreas; el docente las aprueba,
devuelve o rechaza; y cuando cada área alcanza el mínimo, el equipo juega respondiendo
preguntas al azar con corrección en el servidor. Backend FastAPI (Python) + frontend
React (Vite).

App en producción: <https://quiz.edumind.es> · Versión: 0.2.0 (ver [CHANGELOG.md](CHANGELOG.md))

Este repositorio es una release pública saneada para revisión de código,
reutilización educativa y auditoría. No incluye secretos, base de datos ni
configuración de despliegue (ver `OPEN_SOURCE_RELEASE.md`).

## Qué hace, qué guarda y con qué se comunica

**Tres papeles.**
- *Docente*: entra con usuario y contraseña, crea un aula, una «partida» (con sus áreas
  y el mínimo de preguntas por área) y los equipos, cada uno con un PIN de 4 cifras.
- *Equipo*: entra con el PIN. Escribe preguntas de 4 opciones marcando la correcta y
  una explicación opcional, y ve el estado de cada propuesta (pendiente, aprobada,
  devuelta con comentario, rechazada).
- *Partida*: cuando todas las áreas tienen el mínimo de preguntas aprobadas, el equipo
  juega. El navegador nunca recibe la respuesta correcta antes de contestar: el servidor
  la comprueba (`POST /api/game/answer/{id}`) y devuelve acierto, opción correcta y
  explicación.

**Qué guarda el servidor (SQLite, en el servidor de quien despliega la app):** usuarios
docentes (nombre de usuario, contraseña cifrada con bcrypt y correo opcional), aulas,
partidas, áreas, equipos (nombre y PIN), preguntas propuestas con su historial de
revisión y las preguntas aprobadas. No se piden nombres de alumnado.

**Qué guarda el navegador (`localStorage`):** el token de sesión y el nombre de usuario
o de equipo, hasta pulsar «Salir».

**Con qué se comunica:** solo con su propia API (`/api/...`) en el mismo dominio. No hay
analítica, no se cargan fuentes ni scripts de terceros; los enlaces legales y de licencia
del pie abren páginas externas solo al pulsarlos. Detalle en [PRIVACY.md](PRIVACY.md).

**Acceso a la API:** todas las rutas de datos exigen un token JWT y distinguen docente
(solo sus aulas y partidas) de equipo (solo sus propuestas y su partida). El PIN viaja en
el cuerpo de la petición, no en la URL. El registro de docentes está **cerrado por
defecto** (`ALLOW_TEACHER_REGISTRATION=false`).

## Desarrollo

```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # y rellenar SECRET_KEY; ALLOW_TEACHER_REGISTRATION=true para crear la primera cuenta
uvicorn main:app --reload --port 8003   # crea las tablas al arrancar
python -m pytest -q                     # pruebas de la API

# Frontend (en otra terminal)
cd frontend
npm ci
npm run dev      # sirve en :5173; el proxy a /api se configura en vite.config.js si hace falta
npm run build    # genera frontend/dist
```

En producción el frontend compilado se sirve como estático y `/api` se redirige al
backend (puerto 8003 en quiz.edumind.es).

## Cómo modificarlo

- **Número de opciones por pregunta**: `frontend/src/features/student-lobby/QuestionBuilder.jsx`
  (`useState(['', '', '', ''])`) y el campo `num_options` de la partida
  (`backend/app/domains/classroom/models.py`). Ahora mismo la interfaz fija cuatro.
- **Mínimo de preguntas por área**: campo `min_questions` al crear la partida
  (`POST /api/teacher/proposals`); por defecto 5.
- **Áreas**: se crean por partida con `POST /api/teacher/areas`; no hay lista fija.
- **Puntos por acierto**: `GameEngine.jsx` (`setScore(s => s + 10)`).
- **Textos que ve el alumnado**: `TeamLogin.jsx`, `StudentDashboard.jsx`,
  `QuestionBuilder.jsx` y `GameEngine.jsx`. Todo en español.
- **Abrir o cerrar el registro de docentes**: `ALLOW_TEACHER_REGISTRATION` en `backend/.env`.
- **Cambiar la base de datos**: `DATABASE_URL` en `backend/.env` (cualquier URL de SQLAlchemy).
- **Aspecto**: `frontend/src/index.css` (variables) y `frontend/public/vendor/lamina-v1.css`
  (sistema Lámina, no editar: se personaliza en la hoja propia).
- **Tipografía**: `frontend/public/fonts/` + `@font-face` en `index.css`. Si no la quieres,
  borra ambos y la app usará la fuente del sistema.
- **Servicios opcionales**: no hay ninguno; la app no usa analítica ni servicios externos.

Aún no existe interfaz para crear aula, partida, áreas y equipos: se hace contra la API
(por ejemplo desde `http://localhost:8003/docs`). El panel del docente lee la partida
con id 1 (`activeProposalId` en `TeacherDashboard.jsx`).

## Hecho con IA

Este recurso se ha desarrollado con vibe coding con asistencia de IA (Claude Code y
ChatGPT). Lo que ha comprobado el autor:

- Las 6 pruebas automáticas del backend (`backend/tests/`) pasan en local y en la CI de
  GitHub en cada PR: rutas bajo `/api` sin doble prefijo, token obligatorio, separación
  docente/equipo, PIN en el cuerpo, registro cerrado por defecto y flujo completo
  proponer → aprobar → jugar con corrección en el servidor.
- El frontend compila (`npm run build`) en la CI; el lint sigue siendo informativo por
  deuda conocida (patrones `setState` en efectos).
- Revisión de las licencias del material ajeno ([CREDITS.md](CREDITS.md)).
- Revisión de todos los textos que ve el alumnado (en español, sin `alert()`).
- Pasada de accesibilidad automática (axe-core con Playwright) sobre las pantallas
  públicas compiladas.
- No consta uso en aula con alumnado real: la base de datos de producción estaba vacía
  en la evaluación de 2026-09-25.

Política de IA de EDUmind: <https://edumind.es/es/legal/ia>.

## Colaborar

Se puede colaborar **sin programar**: contar cómo te ha ido en clase, reportar un fallo, revisar los textos o traducir. Todo el proyecto está en español. Empieza por [CONTRIBUTING.md](CONTRIBUTING.md) y el [código de conducta](CODE_OF_CONDUCT.md).

¿Un fallo de seguridad? No abras un issue público: ver [SECURITY.md](SECURITY.md).

Decisiones de diseño y su porqué: [DECISIONES.md](DECISIONES.md). Créditos del material ajeno: [CREDITS.md](CREDITS.md).

## Licencia

Licencia doble **AGPL-3.0-or-later** *o* **EUPL-1.2**, a elección de quien la reutilice. Ver [LICENSE](LICENSE) y [NOTICE](NOTICE).

EDUmind® es marca registrada en España (OEPM). El código es libre; la marca y los logotipos no se ceden con él — ver [TRADEMARKS.md](TRADEMARKS.md).

Por **Luis Vilela Acuña** — maestro de Educación Física.
