# Créditos — material ajeno en EDUmind Quiz

Todo lo que no es obra propia de Luis Vilela Acuña, con su autoría, origen y licencia.

## Tipografía

- **Poppins** (Regular 400, SemiBold 600, ExtraBold 800). Autores: Indian Type Foundry
  y Jonny Pinhorn (The Poppins Project Authors). Origen:
  <https://github.com/itfoundry/Poppins> (copia tomada de Google Fonts). Licencia: SIL
  Open Font License 1.1 — texto en [`frontend/public/fonts/OFL.txt`](frontend/public/fonts/OFL.txt).
  Se sirve desde el propio sitio (`/fonts/*.woff2`), sin peticiones a Google.
- El sistema Lámina declara como preferentes «Bricolage Grotesque», «Outfit» e «IBM Plex
  Mono», pero no se incluyen: si no están instaladas en el dispositivo se usa Poppins o la
  fuente del sistema.

## Iconos

- **Lucide** (`lucide-react`). Autores: Lucide Contributors. Origen:
  <https://lucide.dev>. Licencia: ISC.

## Librerías principales

| Paquete | Uso | Licencia |
|---|---|---|
| React, React DOM | interfaz | MIT |
| React Router | navegación | MIT |
| Axios | llamadas a la API | MIT |
| Tailwind CSS 4 | utilidades CSS | MIT |
| Vite | compilación | MIT |
| framer-motion, clsx | dependencias declaradas | MIT |
| FastAPI, Uvicorn, Starlette | API | MIT / BSD-3 |
| SQLAlchemy | base de datos | MIT |
| Pydantic | validación | MIT |
| python-jose | JWT | MIT |
| bcrypt | contraseñas | Apache-2.0 |
| python-dotenv, python-multipart | configuración y formularios | BSD-3 / Apache-2.0 |

Las versiones exactas están en `frontend/package-lock.json` y `backend/requirements.txt`.

## Obra propia

- Logotipo (`frontend/public/logo.png`, también favicon) y sistema visual Lámina
  (`frontend/public/vendor/lamina-v1.css`, vendorizado de edumind.es): Luis Vilela Acuña ·
  EDUmind®. La marca y los logotipos no se ceden con el código (ver [TRADEMARKS.md](TRADEMARKS.md)).
- No hay audio, vídeo ni pictogramas de terceros.
