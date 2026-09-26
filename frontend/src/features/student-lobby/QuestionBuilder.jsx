import React, { useState } from 'react';
import api from '../../api';

const QuestionBuilder = ({ areas, teamId, onProposalSubmitted }) => {
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [selectedArea, setSelectedArea] = useState(areas.length > 0 ? areas[0].area_id : '');
    const [explanation, setExplanation] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Esto es exactamente lo que se envía al servidor (se muestra a la derecha)
    const payload = {
        team_id: teamId,
        area_id: parseInt(selectedArea) || null,
        question_text: questionText,
        options_json: JSON.stringify(options.map((opt, idx) => ({ texto: opt, correcta: idx === correctIndex }))),
        correct_option_index: correctIndex,
        explanation: explanation || null,
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Comprobaciones antes de enviar
        if (!questionText.trim()) return setError('Escribe el enunciado de la pregunta');
        if (options.some(opt => !opt.trim())) return setError('Rellena las cuatro opciones de respuesta');
        if (!selectedArea) return setError('Elige el área');

        setIsSubmitting(true);

        try {
            await api.post('/student/proposals', payload);
            setQuestionText('');
            setOptions(['', '', '', '']);
            setExplanation('');
            onProposalSubmitted();
        } catch (err) {
            setError(err.response?.data?.detail || 'No se pudo enviar la pregunta. Comprueba la conexión.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Izquierda: formulario */}
            <div className="card p-6 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl">
                <div className="mb-6 pb-4 border-b border-slate-700/50">
                    <h2 className="text-2xl font-bold bg-gradient-mental text-transparent bg-clip-text">Constructor de preguntas</h2>
                    <p className="text-slate-400 text-sm mt-1">Pensad una pregunta para el juego y rellenad los campos.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <div role="alert" className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm">{error}</div>}

                    <div>
                        <label htmlFor="qb-area" className="block text-sm font-medium text-slate-300 mb-1">Área</label>
                        <select
                            id="qb-area"
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-hidden focus:border-indigo-500 transition-colors"
                        >
                            <option value="">-- Elige un área --</option>
                            {areas.map(area => (
                                <option key={area.area_id} value={area.area_id}>{area.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="qb-text" className="block text-sm font-medium text-slate-300 mb-1">Enunciado de la pregunta</label>
                        <textarea
                            id="qb-text"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 outline-hidden focus:border-indigo-500 transition-colors min-h-[80px]"
                            placeholder="Ej.: ¿Cuál es el océano más grande del mundo?"
                        />
                    </div>

                    <fieldset className="space-y-3">
                        <legend className="block text-sm font-medium text-slate-300 mb-1">Opciones de respuesta (marca la correcta con ✓)</legend>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCorrectIndex(idx)}
                                    aria-pressed={correctIndex === idx}
                                    aria-label={`Marcar la opción ${idx + 1} como correcta`}
                                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${correctIndex === idx
                                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                            : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                                        }`}
                                    title="Marcar como correcta"
                                >
                                    ✓
                                </button>
                                <input
                                    id={`qb-opt-${idx}`}
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    placeholder={`Opción ${idx + 1}`}
                                    aria-label={`Opción ${idx + 1}`}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 outline-hidden focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        ))}
                    </fieldset>

                    <div>
                        <label htmlFor="qb-explanation" className="block text-sm font-medium text-slate-300 mb-1">Explicación (opcional)</label>
                        <textarea
                            id="qb-explanation"
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 outline-hidden focus:border-indigo-500 transition-colors"
                            placeholder="Se mostrará a quien falle la pregunta en la partida"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-gradient-mental text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity flex justify-center items-center disabled:opacity-50"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar la pregunta al docente'}
                    </button>
                </form>
            </div>

            {/* Derecha: lo que se envía, en JSON, tal cual */}
            <div className="card p-0 bg-slate-900 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700/80 flex items-center gap-2">
                    <div className="flex gap-1.5" aria-hidden="true">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <span className="text-slate-400 text-xs font-mono ml-2">Así viaja vuestra pregunta (JSON)</span>
                </div>

                <div className="p-6 flex-1 overflow-auto">
                    <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap wrap-break-word" aria-label="Datos que se enviarán">
                        <code>
                            {JSON.stringify(payload, null, 2)}
                        </code>
                    </pre>
                </div>

                <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400">
                        <strong>Didáctica 101:</strong> esto es lo que recibe el servidor cuando pulsáis «Enviar», escrito en formato JSON (JavaScript Object Notation). Fijaos en que <code>options_json</code> lleva las cuatro opciones con su texto y cuál es la correcta, y <code>correct_option_index</code> repite ese número empezando a contar en 0. Al cambiar el formulario cambia el JSON. La pregunta se guarda como «pendiente» hasta que vuestro docente la revise.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default QuestionBuilder;
