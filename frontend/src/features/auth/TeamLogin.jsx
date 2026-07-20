import React, { useState } from 'react';
import { useTeam } from '../../context/TeamContext';
import { useNavigate } from 'react-router-dom';

export default function TeamLogin() {
    const [pin, setPin] = useState('');
    const { loginTeam } = useTeam();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await loginTeam(pin);
            navigate('/student/dashboard');
        } catch (error) {
            alert('Invalid PIN');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
            <form onSubmit={handleSubmit} className="card p-8 w-96 border-t-4 border-[var(--color-secondary)]">
                <h2 className="text-2xl font-bold mb-6 text-[var(--color-secondary)]">Team Access</h2>
                <input
                    type="text"
                    placeholder="Enter Team PIN"
                    value={pin} onChange={e => setPin(e.target.value)}
                    className="w-full p-3 rounded bg-white/10 border border-white/20 mb-6 text-center text-2xl tracking-widest text-white"
                />
                <button type="submit" className="w-full btn-primary bg-gradient-to-r from-blue-400 to-blue-600">Enter Game</button>
            </form>
        </div>
    );
}
