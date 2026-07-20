import React from 'react';
import { useNavigate } from 'react-router-dom';

// Portada en Sistema Lámina EDUmind (nivel 2, tema nocturno).
// Canon: edumind.es/design/lamina.html
const ENTRADAS = [
    {
        num: '01',
        titulo: 'Docente',
        desc: 'Gestión de aulas, validación de preguntas y configuración de partidas.',
        ruta: '/teacher/login',
        color: 'var(--lm-mental-text)',
    },
    {
        num: '02',
        titulo: 'Equipos',
        desc: 'Acceso para estudiantes. Crea preguntas y participa en la liga.',
        ruta: '/team/login',
        color: 'var(--lm-social-text)',
    },
    {
        num: '03',
        titulo: 'Express',
        desc: 'Juego rápido sin registro. Carga tu fichero de preguntas y juega.',
        ruta: '/express',
        color: 'var(--lm-fisico-text)',
    },
];

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="lm-page" data-lm-theme="noche" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <div className="lm-wrap">
                <div className="lm-plate-meta">
                    <span className="lm-fig">EDUmind · Quiz</span>
                    <span>Fig. 01 — Portada</span>
                </div>

                <header style={{ padding: '2.4rem 0 1.8rem', borderBottom: '1px solid var(--lm-rule)', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <div>
                        <p className="lm-kicker">Aplicación · gamificación</p>
                        <h1 className="lm-display">Quiz<br />EDUmind</h1>
                        <p className="lm-tagline">Evaluaciones interactivas con dinámica de juego, de Los Mundos Edufis.</p>
                    </div>
                    <img src="/logo.png" alt="" aria-hidden="true" style={{ width: '110px', height: '110px', objectFit: 'contain', opacity: 0.9 }} />
                </header>

                <main style={{ padding: '1.2rem 0 2rem', maxWidth: '760px' }}>
                    <p className="lm-sub">Elige tu entrada</p>
                    <div style={{ borderTop: '2px solid var(--lm-rule-strong)' }}>
                        {ENTRADAS.map((entrada) => (
                            <button
                                key={entrada.ruta}
                                type="button"
                                onClick={() => navigate(entrada.ruta)}
                                className="lm-focusable"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'auto 1fr auto',
                                    gap: '1.2rem',
                                    alignItems: 'baseline',
                                    width: '100%',
                                    textAlign: 'left',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid var(--lm-rule)',
                                    padding: '1.1rem 0',
                                    cursor: 'pointer',
                                    color: 'var(--lm-ink)',
                                }}
                            >
                                <span className="lm-num" style={{ color: entrada.color }}>{entrada.num}</span>
                                <span>
                                    <span style={{ display: 'block', fontFamily: 'var(--lm-display)', fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-.01em' }}>
                                        {entrada.titulo}
                                    </span>
                                    <span style={{ display: 'block', marginTop: '.25rem', fontSize: '.95rem', color: 'var(--lm-ink-2)', maxWidth: '52ch' }}>
                                        {entrada.desc}
                                    </span>
                                </span>
                                <span aria-hidden="true" style={{ fontFamily: 'var(--lm-mono)', fontSize: '.9rem', color: 'var(--lm-ink-2)' }}>→</span>
                            </button>
                        ))}
                    </div>
                </main>

                <div className="lm-foot">
                    &copy; {new Date().getFullYear()} <b>EDUmind</b> · Los Mundos Edufis
                </div>
            </div>
        </div>
    );
}
