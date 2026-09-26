# Decisiones de diseño — EDUmind Quiz

*Registro redactado a posteriori el 2026-09-26, al corregir la app tras la evaluación VCER
del 2026-09-25. A partir de aquí se añade una entrada por cada decisión nueva.*

## Cómo funciona ahora y por qué

**El alumnado escribe las preguntas.** La idea pedagógica es que formular una buena
pregunta (con distractores y explicación) exige más comprensión que contestarla. El
docente no es quien redacta el banco: revisa, devuelve con comentario o aprueba. Por eso
no hay banco de preguntas en el repositorio ni se verifica la veracidad de las preguntas:
esa revisión es del docente.

**Equipos con PIN y sin nombres.** Los equipos entran con un PIN de 4 cifras que reparte
el docente. No se pide ningún dato del alumnado: ni nombres, ni curso, ni correo. El
nombre del equipo lo elige el docente. La columna `players` del modelo existe desde la
primera versión pero la interfaz no la usa y no se prevé usarla.

**Cliente-servidor con SQLite, no local-first.** A diferencia de otras apps EDUmind, aquí
hace falta un servidor porque varios equipos y el docente trabajan sobre los mismos datos
a lo largo de días. Se mantiene lo más simple posible: un SQLite en el servidor, sin
servicios externos.

**Corrección en el servidor (0.2.0).** Hasta la 0.1 la partida daba «¡Correcto!» si se
elegía la opción A («Mock evaluation»), un resto del prototipo. Ahora
`POST /api/game/answer/{id}` compara con `correct_option_index` y devuelve acierto,
opción correcta y explicación; la pregunta que recibe el navegador no lleva la respuesta.
Así no se puede hacer trampa leyendo el JSON y la explicación escrita por el alumnado se
muestra por fin a quien falla.

**Token obligatorio y papeles separados (0.2.0).** Antes ningún endpoint comprobaba el
token y el «docente actual» era el primero de la tabla. Ahora todas las rutas de datos
exigen JWT: el docente solo toca sus aulas y partidas; el equipo solo sus propuestas y su
partida. El PIN va en el cuerpo de la petición (no en la URL, para que no quede en
historiales ni registros) y el formulario de acceso se codifica con `URLSearchParams`.

**Registro de docentes cerrado por defecto (0.2.0).** Como el servidor es del autor y
la app está pensada para menores, no tiene sentido que cualquiera abra cuentas por
Internet. `ALLOW_TEACHER_REGISTRATION=false` salvo que quien administre lo abra de forma
temporal. La pantalla de registro lo indica y desactiva el formulario.

**Sin analítica ni recursos externos (0.2.0).** Se retiró Matomo (aunque era sin cookies
y en servidor propio, se cargaba también en pantallas de alumnado) y la fuente Poppins se
sirve en local con su licencia OFL. Al abrir la app no sale ninguna petición fuera del
dominio.

**Contraseñas con bcrypt directo (0.2.0).** `passlib` no funciona con `bcrypt >= 4.1`
(que Dependabot había subido a 5.0) y rompía registro e inicio de sesión. Se usa la
librería `bcrypt` directamente; los hashes `$2b$` son los mismos, así que las cuentas
existentes siguen valiendo.

**Modo «Express» retirado (0.2.0).** La portada anunciaba «carga tu fichero de preguntas
y juega», pero era un stub de diez líneas. Se retira hasta que exista; si se implementa,
se hará con las preguntas en el navegador, sin subir ficheros al servidor.

**Licencia doble AGPL-3.0-or-later / EUPL-1.2.** Como el resto de apps EDUmind: AGPL
obliga a publicar el código de quien lo despliegue modificado como servicio; EUPL es
compatible con la administración pública española. La marca EDUmind® no se cede.

**Todo en español.** Código, comentarios, commits, documentación y textos de pantalla:
quien enseña en España debe poder leer lo que usa en clase.

## Pendiente conocido

- Interfaz del docente para crear aula, partida, áreas y equipos (hoy se hace contra la
  API); el panel lee la partida con id 1.
- Exportar y borrar datos desde la interfaz; purga automática de partidas antiguas.
- Recuperación de contraseña por correo (el correo se guarda pero no se usa aún).
- Lint del frontend con errores conocidos de `setState` en efectos.
