import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Check, X, RotateCcw } from 'lucide-react';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    const activeProposalId = 1; // Mapped dynamically in a real app

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const res = await api.get(`/teacher/proposals/pending/${activeProposalId}`);
            setProposals(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, status, feedback = null) => {
        try {
            await api.put(`/teacher/proposals/${id}/review`, { status, teacher_feedback: feedback });
            fetchProposals();
        } catch (err) {
            alert("Error al auditar");
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-8 text-white pb-32">
            <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                <h1 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-mental drop-shadow-lg">
                    Centro de Mando Docente
                </h1>
                <div className="bg-slate-800/80 px-6 py-2.5 rounded-full border border-slate-700 shadow-xl flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                    <span className="font-medium text-slate-200">Docente: {user?.username}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                <div className="card p-6 bg-slate-800/40 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-2xl">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-100">
                        <span className="flex items-center justify-center w-8 h-8 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 font-mono text-sm">
                            {proposals.length}
                        </span>
                        Propuestas Pendientes de Auditoría
                    </h2>

                    {loading ? (
                        <div className="text-center py-12 text-slate-400 animate-pulse">Obteniendo propuestas de la red...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {proposals.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-500 border-2 border-dashed border-slate-700/50 rounded-2xl">
                                    No hay propuestas pendientes para auditar. ¡El alumnado aún está trabajando!
                                </div>
                            )}

                            {proposals.map(p => {
                                let opts = [];
                                try {
                                    opts = JSON.parse(p.options_json);
                                } catch (e) {
                                    opts = [p.options_json];
                                }

                                return (
                                    <div key={p.id} className="bg-slate-900/80 text-left border border-slate-700 p-6 rounded-2xl relative hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all flex flex-col">

                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20">
                                                ID: {p.id}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-lg mb-4 text-slate-100 leading-snug">{p.question_text}</h3>

                                        <div className="space-y-2 mb-6">
                                            {opts.map((opt, i) => {
                                                const isCorrect = i === p.correct_option_index;
                                                const text = typeof opt === 'object' ? opt.texto : opt;
                                                return (
                                                    <div key={i} className={`p-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${isCorrect
                                                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                                            : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                                                        }`}>
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isCorrect ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-600'
                                                            }`}>
                                                            {isCorrect && <Check size={12} strokeWidth={3} />}
                                                        </div>
                                                        {text}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {p.explanation && (
                                            <div className="text-sm text-slate-400 mb-6 bg-slate-800/50 p-3 rounded-lg border-l-2 border-indigo-500">
                                                <span className="block text-xs font-bold text-indigo-400 mb-1">Dato Didáctico:</span>
                                                "{p.explanation}"
                                            </div>
                                        )}

                                        <div className="flex gap-3 mt-auto pt-4 border-t border-slate-700/50">
                                            <button
                                                onClick={() => handleReview(p.id, 'validated')}
                                                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-2.5 rounded-xl flex justify-center items-center transition-colors"
                                                title="Aprobar"
                                            >
                                                <Check size={20} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const feedback = prompt("Escribe tu feedback formativo para que el equipo lo corrija:");
                                                    if (feedback) handleReview(p.id, 'returned', feedback);
                                                }}
                                                className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 p-2.5 rounded-xl flex justify-center items-center transition-colors"
                                                title="Devolver para corregir"
                                            >
                                                <RotateCcw size={20} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm("¿Estás seguro de rechazar y borrar esta propuesta?")) {
                                                        handleReview(p.id, 'rejected'); // Reject logic implemented via status, or DELETE call if needed
                                                    }
                                                }}
                                                className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 p-2.5 rounded-xl flex justify-center items-center transition-colors"
                                                title="Rechazar y Eliminar"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
