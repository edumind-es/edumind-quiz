import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { useTeam } from '../../context/TeamContext';
import { Play, ShieldAlert, CheckCircle, RefreshCcw, Send } from 'lucide-react';

export default function GameEngine() {
    const { team } = useTeam();
    const [status, setStatus] = useState(null);
    const [gameActive, setGameActive] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    // Resultado de la corrección hecha en el servidor: { correct, correct_option_index, explanation }
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const checkStatus = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await api.get(`/game/status/${team.proposalId}`);
            setStatus(res.data);
        } catch (err) {
            console.error(err);
            setErrorMsg('No se pudo consultar el estado de la partida.');
        } finally {
            setLoading(false);
        }
    }, [team]);

    useEffect(() => {
        if (team?.proposalId) {
            checkStatus();
        }
    }, [team, checkStatus]);

    const fetchNextQuestion = async () => {
        setLoading(true);
        setSelectedOption(null);
        setResult(null);
        setErrorMsg('');
        try {
            const res = await api.get(`/game/question/${team.proposalId}`);
            const q = res.data;
            setCurrentQuestion({
                id: q.id,
                text: q.text,
                area: q.area,
                options: JSON.parse(q.options)
            });
        } catch {
            setErrorMsg('No hay más preguntas disponibles en este momento.');
        } finally {
            setLoading(false);
        }
    };

    const startGame = async () => {
        setErrorMsg('');
        try {
            await api.post(`/game/start/${team.proposalId}`);
            setGameActive(true);
            fetchNextQuestion();
        } catch {
            setErrorMsg('No se pudo iniciar la partida.');
        }
    };

    // La corrección se hace en el servidor: el navegador nunca recibe la respuesta correcta antes de contestar
    const handleAnswer = async () => {
        if (selectedOption === null || !currentQuestion) return;
        setErrorMsg('');
        try {
            const res = await api.post(`/game/answer/${currentQuestion.id}`, { selected_index: selectedOption });
            setResult(res.data);
            if (res.data.correct) setScore(s => s + 10);
        } catch {
            setErrorMsg('No se pudo comprobar la respuesta. Inténtalo de nuevo.');
        }
    };

    if (loading && !currentQuestion && !status) return <div className="text-white text-center mt-20">Preparando la partida...</div>;

    if (!gameActive) {
        return (
            <div className="min-h-screen bg-(--color-surface) p-8 flex flex-col items-center justify-center">
                <div className="card max-w-2xl w-full text-center p-12 bg-slate-800/80 border-slate-700/50 shadow-2xl">
                    <ShieldAlert size={64} className="mx-auto mb-6 text-indigo-400" aria-hidden="true" />
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-mental mb-4">Partida</h1>
                    <p className="text-slate-400 mb-8">Para jugar, cada área tiene que llegar al mínimo de preguntas aprobadas por el docente.</p>

                    {errorMsg && <div role="alert" className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm">{errorMsg}</div>}

                    {status && (
                        <div className="space-y-4 mb-8 text-left">
                            {status.areas.map((a, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                    <span className="font-bold text-slate-200">{a.area}</span>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm">
                                            <span className={a.ready ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{a.current}</span>
                                            <span className="text-slate-400"> / {a.required} aprobadas</span>
                                        </div>
                                        {a.ready ? <CheckCircle className="text-emerald-500" aria-label="Lista" /> : <RefreshCcw className="text-slate-500" aria-label="Incompleta" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-center mt-8">
                        {status?.ready ? (
                            <button onClick={startGame} className="bg-gradient-mental px-10 py-4 rounded-xl text-white font-black text-xl hover:opacity-90 shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center gap-3 transition-all">
                                <Play fill="currentColor" aria-hidden="true" />
                                INICIAR PARTIDA
                            </button>
                        ) : (
                            <button onClick={checkStatus} className="bg-slate-700/50 px-8 py-3 rounded-lg text-slate-300 font-bold hover:bg-slate-700 transition-colors flex items-center gap-2">
                                <RefreshCcw size={18} aria-hidden="true" />
                                Actualizar estado
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-(--color-surface) p-4 md:p-8 pb-32 flex flex-col items-center">
            <h1 className="sr-only">Partida del equipo {team?.name}</h1>
            <header className="w-full max-w-4xl flex justify-between items-center mb-12">
                <div className="bg-slate-800/80 px-4 py-2 rounded-xl text-slate-300 border border-slate-700 shadow-md">
                    Equipo: <span className="font-bold text-white">{team?.name}</span>
                </div>
                <div className="bg-indigo-600/20 px-6 py-2 rounded-xl border border-indigo-500/30 text-indigo-300 font-bold text-xl shadow-[0_0_15px_rgba(79,70,229,0.2)]" aria-live="polite">
                    Puntos: {score}
                </div>
            </header>

            {errorMsg && <div role="alert" className="w-full max-w-4xl mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm">{errorMsg}</div>}

            {currentQuestion && (
                <div className="w-full max-w-4xl card p-8 bg-slate-800/60 backdrop-blur-xl border-slate-700/60 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-mental"></div>

                    <div className="flex justify-between items-center mb-8">
                        <span className="text-sm font-mono font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20 uppercase tracking-widest">
                            {currentQuestion.area}
                        </span>
                        <span className="text-slate-400 font-mono text-sm">Pregunta n.º {currentQuestion.id}</span>
                    </div>

                    <h2 className="text-3xl font-bold text-white leading-tight mb-10 text-center">
                        {currentQuestion.text}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="group" aria-label="Opciones de respuesta">
                        {currentQuestion.options.map((opt, i) => {
                            const text = typeof opt === 'object' ? opt.texto : opt;
                            const isSelected = selectedOption === i;
                            const isCorrectOption = result && result.correct_option_index === i;
                            let classes = 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800';
                            if (isCorrectOption) classes = 'bg-emerald-600/30 border-emerald-500 text-white';
                            else if (isSelected && result && !result.correct) classes = 'bg-rose-600/30 border-rose-500 text-white';
                            else if (isSelected) classes = 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-[1.02]';
                            return (
                                <button
                                    key={i}
                                    onClick={() => !result && setSelectedOption(i)}
                                    disabled={result !== null}
                                    aria-pressed={isSelected}
                                    className={`p-5 rounded-2xl text-lg font-medium text-left transition-all border-2 ${classes} ${result && !isSelected && !isCorrectOption ? 'opacity-50' : ''}`}
                                >
                                    <span className="mr-3 font-bold text-slate-400 bg-black/20 px-2 py-0.5 rounded-sm">
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    {text}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1" aria-live="polite">
                            {result && (
                                <div className={`px-4 py-3 rounded-lg ${result.correct ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                                    <p className="font-bold">{result.correct ? '¡Correcto!' : `Fallo. La respuesta correcta era la ${String.fromCharCode(65 + result.correct_option_index)}.`}</p>
                                    {result.explanation && (
                                        <p className="mt-1 text-sm text-slate-200">{result.explanation}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {!result ? (
                            <button
                                onClick={handleAnswer}
                                disabled={selectedOption === null}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 px-8 py-3 rounded-xl text-white font-bold transition-colors flex items-center gap-2"
                            >
                                <Send size={18} aria-hidden="true" />
                                Enviar respuesta
                            </button>
                        ) : (
                            <button
                                onClick={fetchNextQuestion}
                                className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-xl text-white font-bold transition-colors flex items-center gap-2"
                            >
                                Siguiente pregunta
                                <Play fill="currentColor" size={14} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
