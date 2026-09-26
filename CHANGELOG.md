# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

## [0.2.0] — 2026-09-26

Corrección tras la evaluación VCER del 2026-09-25 (35 %, «No recomendable»).

### Corregido
- Doble prefijo `/api/api`: `quiz/router.py` ya no lleva `prefix="/api"`; proponer,
  revisar y jugar vuelven a funcionar en producción.
- La partida corregía como acierto cualquier respuesta «A»: ahora la comprueba el
  servidor (`POST /api/game/answer/{id}`) y muestra la explicación al fallar.
- `Question` no tenía relación con `Area` y `/game/question` fallaba.
- `passlib` incompatible con `bcrypt 5`: se usa `bcrypt` directamente (mismos hashes).
- `options_json` guardaba todas las opciones con `correcta: false`.
- «Didáctica 101» describe ahora exactamente el JSON que se envía.
- Errata `test-sm`; textos en inglés de pantallas de alumnado pasados al español; sin `alert()`.

### Seguridad
- Todas las rutas de datos exigen token JWT y separan docente (solo sus aulas) de equipo
  (solo sus propuestas y su partida).
- PIN de equipo en el cuerpo de la petición; formulario de acceso codificado con
  `URLSearchParams`.
- Registro de docentes cerrado por defecto (`ALLOW_TEACHER_REGISTRATION`).

### Privacidad
- Retirado Matomo. Poppins servida en local con `OFL.txt`; ninguna petición externa al abrir.
- `PRIVACY.md` en español con qué guarda el navegador, qué guarda el servidor y cuánto tiempo.

### Accesibilidad
- `<main>` único y `h1` en cada pantalla; `aria-label` en el icono Inicio y en los
  botones de icono; etiquetas asociadas en el PIN y en el constructor de preguntas;
  enlaces de texto subrayados; errores con `role="alert"`.

### Añadido
- Pruebas del backend (`backend/tests`, pytest) ejecutadas en la CI.
- `CREDITS.md`, `DECISIONES.md`, `CHANGELOG.md`, `frontend/README.md` real y sección
  «Hecho con IA» y «Cómo modificarlo» en el README.
- `DATABASE_URL` configurable.

### Eliminado
- Modo «Express» (stub sin implementar), `GameCanvas.jsx`, `CodeHud.jsx`, `App.css`,
  `init_db.py`, `app/database.py` duplicado, `vite.svg`, `react.svg` y el endpoint
  `/api/metrics/prometheus` vacío.
- Rutas absolutas del servidor del autor en `migrate_auth.py` y `migrate_phase3.py`.

## [0.1.0] — 2026-09-06

Primera release pública saneada (commit `24c2c2b`), sin etiqueta.
