# Frontend de EDUmind Quiz

React 19 + Vite 8 + Tailwind 4. Se compila a estáticos (`dist/`) y habla con el backend
por `/api` (misma raíz; en desarrollo hace falta un proxy o servir ambos tras nginx).

```bash
npm ci
npm run dev      # desarrollo en :5173
npm run build    # produce dist/
npm run lint     # informativo (deuda conocida)
```

## Estructura

```
src/
  api.js                      cliente axios con el token en Authorization
  App.jsx                     rutas, <main> único, barra Lámina y pie
  context/AuthContext.jsx     sesión del docente (localStorage)
  context/TeamContext.jsx     sesión del equipo (PIN → token)
  components/Navbar.jsx       barra superior
  components/EDUmindFooter.jsx pie con autoría, licencias y créditos
  features/auth/              Welcome, TeacherLogin, TeacherRegister, TeamLogin
  features/teacher-dashboard/ revisión de propuestas
  features/student-lobby/     StudentDashboard + QuestionBuilder
  features/game-session/      GameEngine (partida, corrección en servidor)
public/
  logo.png                    logotipo y favicon
  fonts/                      Poppins (OFL) servida en local
  vendor/lamina-v1.css        sistema visual Lámina (no editar)
```

Textos de pantalla en español. Los que ve el alumnado están en `TeamLogin`,
`StudentDashboard`, `QuestionBuilder` y `GameEngine`.
