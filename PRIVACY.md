# Privacidad — EDUmind Quiz

## Qué guarda el navegador

En `localStorage`, hasta pulsar «Salir» (o borrar los datos del sitio):

| Clave | Contenido |
|---|---|
| `token`, `role`, `name` | sesión del docente: token JWT (caduca a las 24 h), papel y nombre de usuario |
| `team_token`, `team_name`, `team_id`, `proposal_id` | sesión del equipo: token JWT, nombre del equipo y sus identificadores |

No se usan cookies. No se guarda nada más en el dispositivo.

## Qué guarda el servidor

Base de datos SQLite en el servidor de quien despliega la app (en quiz.edumind.es, el
servidor del autor). Tablas y contenido:

| Tabla | Contenido | Quién lo escribe |
|---|---|---|
| `users` | nombre de usuario, contraseña cifrada (bcrypt), correo (solo si el docente elige «con recuperación») | docente al registrarse |
| `classrooms`, `proposals`, `areas` | nombre del aula, de la partida y de sus áreas; mínimo de preguntas | docente |
| `teams` | nombre del equipo y PIN de 4 cifras (la columna `players` existe pero la interfaz no la rellena) | docente |
| `question_proposals`, `question_history` | enunciado, opciones, opción correcta, explicación, estado y comentarios del docente, con fecha de cada cambio de estado | equipo y docente |
| `questions` | copia de las propuestas aprobadas | se crea al aprobar |

**No se piden ni guardan nombres, apellidos, cursos ni ningún dato del alumnado.** Los
equipos son un nombre elegido por el docente y un PIN. Lo que escribe el alumnado son
preguntas y opciones de respuesta; conviene indicarles que no incluyan datos personales
en ellas.

**Cuánto tiempo:** no hay purga automática. Los datos permanecen hasta que quien
administra el servidor los borre (a petición del docente en contacto@edumind.es para
quiz.edumind.es). No existe todavía función de exportar ni de borrar desde la interfaz.

**Registros del servidor:** el servidor web anota la IP anonimizada y la ruta de cada
petición para diagnosticar fallos; el PIN y la contraseña viajan siempre en el cuerpo de la
petición, nunca en la URL, así que no aparecen en esos registros.

## Con qué se comunica

Solo con su propia API en el mismo dominio (`/api/...`). La app **no lleva analítica**
(Matomo se retiró en la versión 0.2.0), no carga fuentes ni scripts de terceros y no
envía nada a ningún otro servicio. Los enlaces del pie (aviso legal, licencias, código)
abren páginas externas únicamente al pulsarlos.

## Acceso

Todas las rutas de datos de la API exigen un token JWT firmado con la `SECRET_KEY` del
servidor. Un equipo solo puede leer y escribir sus propias propuestas y jugar su
partida; un docente solo ve y revisa las partidas de sus aulas. El registro de docentes
está cerrado por defecto.

## Sobre esta release pública

Este repositorio contiene código, documentación y pruebas con datos inventados. No
incluye bases de datos, copias de seguridad, ficheros subidos, registros de acceso ni
configuración privada. Quien despliegue su propia instancia es responsable de sus
obligaciones de protección de datos (RGPD/LOPDGDD): base jurídica, información a las
familias, plazos de conservación, derechos de las personas y borrado seguro.

Derechos ARCO sobre quiz.edumind.es: <https://edumind.es/es/legal/arco>.
