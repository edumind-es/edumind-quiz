import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ShieldAlert } from 'lucide-react';

export default function TeacherRegister() {
    const [privacyMode, setPrivacyMode] = useState('max'); // 'max' or 'recovery'
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [registroAbierto, setRegistroAbierto] = useState(null); // null = consultando
    const { registerTeacher } = useAuth();

    // El servidor decide si admite altas (ALLOW_TEACHER_REGISTRATION); por defecto está cerrado
    useEffect(() => {
        api.get('/auth/register/status')
            .then(r => setRegistroAbierto(Boolean(r.data?.open)))
            .catch(() => setRegistroAbierto(false));
    }, []);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            const emailPayload = privacyMode === 'recovery' ? email : null;
            await registerTeacher(username, password, emailPayload);
            navigate('/teacher/dashboard');
        } catch (error) {
            setErrorMsg(error.response?.data?.detail || 'No se pudo completar el registro');
        }
    };

    return (
        <div className="lm-page" data-lm-theme="noche" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <div className="lm-wrap">
                <div className="lm-plate-meta">
                    <span className="lm-fig">EDUmind · Quiz</span>
                    <span>Fig. 03 — Registro docente</span>
                </div>
                <div style={{ maxWidth: '480px', padding: '2.2rem 0 3rem' }}>
                    <p className="lm-kicker">Acceso · docente</p>
                    <h1 className="lm-display" style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}>Registro</h1>
                    <p className="lm-tagline">Cuenta de docente. Solo se guarda tu nombre de usuario y la contraseña cifrada; el correo es opcional.</p>

                    {registroAbierto === false && (
                        <div className="lm-auto" role="status" style={{ marginBottom: '1.2rem' }}>
                            <span className="lm-flag">cerrado</span>
                            <span>El registro está cerrado en este servidor. Pide el alta a quien lo administra (en quiz.edumind.es, a <a href="mailto:contacto@edumind.es" style={{ color: 'var(--lm-mental-text)', textDecoration: 'underline' }}>contacto@edumind.es</a>).</span>
                        </div>
                    )}

                    <p className="lm-sub">Nivel de privacidad</p>
                    <div style={{ display: 'flex', gap: '.6rem' }}>
                        <button
                            type="button"
                            className={privacyMode === 'max' ? 'lm-btn' : 'lm-btn-ghost'}
                            style={{ flex: 1 }}
                            onClick={() => setPrivacyMode('max')}
                        >
                            <Shield size={16} /> Máxima
                        </button>
                        <button
                            type="button"
                            className={privacyMode === 'recovery' ? 'lm-btn' : 'lm-btn-ghost'}
                            style={{ flex: 1 }}
                            onClick={() => setPrivacyMode('recovery')}
                        >
                            <ShieldAlert size={16} /> Con recuperación
                        </button>
                    </div>

                    <div className="lm-auto" style={{ marginTop: '1.2rem' }}>
                        <span className="lm-flag">{privacyMode === 'max' ? 'anonimato' : 'email'}</span>
                        {privacyMode === 'max' ? (
                            <span>Solo nombre de usuario y contraseña; no se pide ningún dato personal. <strong>Si olvidas la contraseña, la cuenta no se puede recuperar.</strong></span>
                        ) : (
                            <span>Se guarda tu correo solo para restablecer la contraseña. No se envía nada más.</span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} style={{ marginTop: '1.4rem' }}>
                        {errorMsg && (
                            <div className="lm-auto" role="alert" style={{ marginBottom: '1rem' }}>
                                <span className="lm-flag">error</span>{errorMsg}
                            </div>
                        )}

                        <label className="lm-label" htmlFor="tr-user">Nombre de usuario (público)</label>
                        <input
                            id="tr-user"
                            type="text"
                            className="lm-input"
                            value={username} onChange={e => setUsername(e.target.value)}
                            required
                        />

                        {privacyMode === 'recovery' && (
                            <div style={{ marginTop: '1rem' }}>
                                <label className="lm-label" htmlFor="tr-email">Correo electrónico</label>
                                <input
                                    id="tr-email"
                                    type="email"
                                    className="lm-input"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div style={{ marginTop: '1rem' }}>
                            <label className="lm-label" htmlFor="tr-pass">Contraseña maestra</label>
                            <input
                                id="tr-pass"
                                type="password"
                                className="lm-input"
                                value={password} onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="lm-btn" style={{ width: '100%', marginTop: '1.6rem' }} disabled={registroAbierto !== true}>
                            Crear cuenta →
                        </button>

                        <p style={{ marginTop: '1.2rem', fontSize: '.9rem', color: 'var(--lm-ink-2)' }}>
                            ¿Ya tienes aula? <Link to="/teacher/login" style={{ color: 'var(--lm-mental-text)', textDecoration: 'underline' }}>Inicia sesión</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
