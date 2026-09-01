import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useTeam } from '../../context/TeamContext';
import { CheckCircle, Clock, AlertTriangle, MessageSquare } from 'lucide-react';
import QuestionBuilder from './QuestionBuilder';

export default function StudentDashboard() {
    const { team } = useTeam();
    const [proposals, setProposals] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (team?.id && team?.proposalId) {
            fetchData();
        }
    }, [team]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resProposals = await api.get(`/student/my-proposals/${team.id}`);
            setProposals(resProposals.data);

            const resAreas = await api.get(`/student/areas/${team.proposalId}?team_id=${team.id}`);
            setAreas(resAreas.data);
        } catch (e) {
            console.error('Error fetching dashboard data:', e);
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = () => {
        if (!areas || areas.length === 0) return 0;
        const totalRequired = areas.reduce((acc, a) => acc + a.required, 0);
        if (totalRequired === 0) return 100;
        const totalCompleted = areas.reduce((acc, a) => acc + a.completed, 0);
        return Math.min(100, Math.round((totalCompleted / totalRequired) * 100));
    };

    if (loading) return <div className="text-white text-center mt-20">Cargando base de datos del equipo...</div>;

    return (
        <div className="min-h-screen bg-(--color-surface) p-4 md:p-8 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 text-white gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-mental text-transparent bg-clip-text drop-shadow-xs">
                        Equipo: {team?.name}
                    </h1>
                    <p className="text-slate-400 mt-1">Sala de Preparación Académica</p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-lg">
                    <span className="text-slate-300 font-medium">Progreso Validación</span>
                    <div className="w-32 h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${calculateProgress()}%` }}
                        />
                    </div>
                    <span className="font-bold text-emerald-400">{calculateProgress()}%</span>
                </div>
            </header>

            <div className="mb-12">
                <QuestionBuilder
                    areas={areas}
                    teamId={team.id}
                    onProposalSubmitted={fetchData}
                />
            </div>

            {/* Revision Desk */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="text-indigo-400" size={28} />
                    <h2 className="text-2xl font-bold text-white">Escritorio de Revisión</h2>
                </div>

                {proposals.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-slate-700/50 rounded-2xl text-slate-500">
                        Aún no has propuesto ninguna pregunta.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {proposals.map(p => (
                            <div key={p.id} className="card p-5 border border-slate-700/50 flex flex-col justify-between hover:border-slate-600 transition-colors">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded-sm">
                                            {areas.find(a => a.area_id === p.area_id)?.name || 'Área'}
                                        </span>
                                        <StatusBadge status={p.status} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-200 mb-2 leading-tight line-clamp-2" title={p.question_text}>
                                        {p.question_text}
                                    </h3>

                                    {p.status === 'returned' && p.teacher_feedback && (
                                        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                                            <p className="text-xs font-bold text-rose-400 mb-1 flex items-center gap-1">
                                                <AlertTriangle size={12} /> Feedback del Docente:
                                            </p>
                                            <p className="text-sm text-rose-200 line-clamp-3">{p.teacher_feedback}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-700/50 text-right">
                                    {p.status === 'returned' ? (
                                        <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300">
                                            Corregir JSON ↗
                                        </button>
                                    ) : (
                                        <span className="text-xs text-slate-500">Auditoría en curso...</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const StatusBadge = ({ status }) => {
    const config = {
        pending: { text: 'Pendiente', classes: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: <Clock size={12} /> },
        validated: { text: 'Aprobada', classes: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle size={12} /> },
        returned: { text: 'Devuelta', classes: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: <AlertTriangle size={12} /> },
        rejected: { text: 'Rechazada', classes: 'text-red-400 bg-red-400/10 border-red-400/20', icon: <AlertTriangle size={12} /> }
    };

    const curr = config[status] || config.pending;

    return (
        <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${curr.classes}`}>
            {curr.icon} {curr.text}
        </div>
    );
};
