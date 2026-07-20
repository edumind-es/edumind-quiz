import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTeam } from '../context/TeamContext';
import { LogOut, Home } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { team, logoutTeam } = useTeam();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (user) logout();
        if (team) logoutTeam();
        navigate('/');
    };

    return (
        <nav className="w-full h-16 bg-gradient-to-r from-[var(--edufis-mental-end)] to-[var(--edufis-fisico-end)] shadow-lg flex items-center justify-between px-6 z-50 relative">
            <Link to="/" className="flex items-center gap-3 decoration-none group">
                <img src="/logo.png" alt="Logo" className="h-10 w-auto bg-white/10 rounded-full p-1 group-hover:bg-white/20 transition-all" />
                <span className="text-white font-bold text-xl tracking-wide hidden md:block">EDUmind Quiz</span>
            </Link>

            <div className="flex items-center gap-4">
                {(user || team) ? (
                    <>
                        <span className="text-blue-100 text-sm hidden sm:block">
                            Hola, <span className="font-semibold text-white">{user?.name || team?.name}</span>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors flex items-center gap-2 px-4"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </>
                ) : (
                    <Link to="/" className="text-blue-100 hover:text-white transition-colors">
                        <Home size={24} />
                    </Link>
                )}
            </div>
        </nav>
    );
}
