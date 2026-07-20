import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function TeacherLogin() {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const { loginTeacher } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            await loginTeacher(usernameOrEmail, password);
            navigate('/teacher/dashboard');
        } catch (error) {
            setErrorMsg('Credenciales inválidas');
        }
    };

    return (
        <div className="lm-page" data-lm-theme="noche" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <div className="lm-wrap">
                <div className="lm-plate-meta">
                    <span className="lm-fig">EDUmind · Quiz</span>
                    <span>Fig. 02 — Acceso docente</span>
                </div>
                <form onSubmit={handleSubmit} style={{ maxWidth: '420px', padding: '2.2rem 0 3rem' }}>
                    <p className="lm-kicker">Acceso · docente</p>
                    <h2 className="lm-display" style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}>Iniciar sesión</h2>
                    {errorMsg && (
                        <div className="lm-auto" role="alert" style={{ marginTop: '1rem' }}>
                            <span className="lm-flag">error</span>{errorMsg}
                        </div>
                    )}
                    <div style={{ marginTop: '1.6rem' }}>
                        <label className="lm-label" htmlFor="tl-user">Usuario o email</label>
                        <input
                            id="tl-user"
                            type="text"
                            className="lm-input"
                            value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <label className="lm-label" htmlFor="tl-pass">Contraseña</label>
                        <input
                            id="tl-pass"
                            type="password"
                            className="lm-input"
                            value={password} onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="lm-btn" style={{ width: '100%', marginTop: '1.6rem' }}>Iniciar sesión →</button>
                    <p style={{ marginTop: '1.2rem', fontSize: '.9rem', color: 'var(--lm-ink-2)' }}>
                        ¿No tienes cuenta? <Link to="/teacher/register" style={{ color: 'var(--lm-mental-text)' }}>Regístrate (Privacy First)</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
