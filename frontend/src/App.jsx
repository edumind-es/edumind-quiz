import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TeamProvider, useTeam } from './context/TeamContext';

import Welcome from './features/auth/Welcome';
import TeacherLogin from './features/auth/TeacherLogin';
import TeacherRegister from './features/auth/TeacherRegister';
import TeacherDashboard from './features/teacher-dashboard/TeacherDashboard';
import TeamLogin from './features/auth/TeamLogin';
import StudentDashboard from './features/student-lobby/StudentDashboard';
import ExpressMode from './features/game-session/ExpressMode';
import GameEngine from './features/game-session/GameEngine';
import Navbar from './components/Navbar';
import EDUmindFooter from './components/EDUmindFooter';

const PrivateTeacherRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'teacher') return <Navigate to="/" />;
  return children;
};

const PrivateTeamRoute = ({ children }) => {
  const { team, loading } = useTeam();
  if (loading) return <div>Loading...</div>;
  if (!team) return <Navigate to="/" />;
  return children;
};

// Identidad Sistema Lámina (nivel 1): barra de mundos EDUmind.
// Oculta en pantallas de alumnado (variante Alumno pendiente).
const LaminaBar = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/team') || pathname.startsWith('/student')) return null;
  return (
    <div className="lm-plate-top lm-plate-top--compact" aria-hidden="true">
      <i /><i /><i /><i /><i />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <Router>
          <LaminaBar />
          <Navbar />
          <Routes>
            <Route path="/" element={<Welcome />} />

            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route path="/teacher/register" element={<TeacherRegister />} />
            <Route
              path="/teacher/dashboard"
              element={
                <PrivateTeacherRoute>
                  <TeacherDashboard />
                </PrivateTeacherRoute>
              }
            />

            <Route path="/team/login" element={<TeamLogin />} />
            <Route
              path="/student/dashboard"
              element={
                <PrivateTeamRoute>
                  <StudentDashboard />
                </PrivateTeamRoute>
              }
            />

            <Route
              path="/team/game"
              element={
                <PrivateTeamRoute>
                  <GameEngine />
                </PrivateTeamRoute>
              }
            />

            <Route path="/express" element={<ExpressMode />} />
          </Routes>
          <EDUmindFooter appName="EDUmind Quiz" version="1.0.0" />
        </Router>
      </TeamProvider>
    </AuthProvider>
  );
}
