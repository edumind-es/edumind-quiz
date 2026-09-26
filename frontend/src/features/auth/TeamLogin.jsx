import React, { useState } from 'react';
import { useTeam } from '../../context/TeamContext';
import { useNavigate } from 'react-router-dom';

export default function TeamLogin() {
    const [pin, setPin] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const { loginTeam } = useTeam();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            await loginTeam(pin.trim());
            navigate('/student/dashboard');
        } catch {
            setErrorMsg('Ese PIN no es correcto. Pedídselo a vuestro maestro o maestra.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-(--color-background) px-4">
            <form onSubmit={handleSubmit} className="card p-8 w-full max-w-96 border-t-4 border-(--color-secondary)">
                <h1 className="text-2xl font-bold mb-2 text-(--color-secondary)">Entrada de equipos</h1>
                <p className="text-slate-400 text-sm mb-6">Escribid el PIN de 4 cifras de vuestro equipo.</p>
                <label htmlFor="team-pin" className="block text-sm font-medium text-slate-300 mb-2">PIN del equipo</label>
                <input
                    id="team-pin"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={4}
                    placeholder="1234"
                    value={pin} onChange={e => setPin(e.target.value)}
                    aria-describedby={errorMsg ? 'team-pin-error' : undefined}
                    aria-invalid={errorMsg ? true : undefined}
                    className="w-full p-3 rounded-sm bg-white/10 border border-white/20 mb-4 text-center text-2xl tracking-widest text-white"
                    required
                />
                {errorMsg && (
                    <p id="team-pin-error" role="alert" className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm">
                        {errorMsg}
                    </p>
                )}
                <button type="submit" className="w-full btn-primary bg-linear-to-r from-blue-400 to-blue-600">Entrar</button>
            </form>
        </div>
    );
}
