import React, { useState, useEffect } from 'react';

const QuestionBuilder = ({ areas, teamId, onProposalSubmitted }) => {
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [selectedArea, setSelectedArea] = useState(areas.length > 0 ? areas[0].area_id : '');
    const [explanation, setExplanation] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const jsonPreview = {
        team_id: teamId,
        area_id: parseInt(selectedArea) || null,
        question_text: questionText,
        options_json: JSON.stringify(options),
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

        // Validation
        if (!questionText.trim()) return setError('Completa el enunciado de la pregunta');
        if (options.some(opt => !opt.trim())) return setError('Completa todas las opciones de respuesta');
        if (!selectedArea) return setError('Selecciona el área');

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/student/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...jsonPreview,
                    options_json: JSON.stringify(options.map(opt => ({ texto: opt, correcta: false }))), // Format map if needed
                }),
            });

            if (response.ok) {
                setQuestionText('');
                setOptions(['', '', '', '']);
                setExplanation('');
                onProposalSubmitted();
            } else {
                const err = await response.json();
                setError(err.detail || 'Error al enviar la propuesta');
            }
        } catch (err) {
            setError('Fallo de conexión al enviar la pregunta');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT: Didactic Form */}
            <div className="card p-6 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl">
                <div className="mb-6 pb-4 border-b border-slate-700/50">
                    <h2 className="text-2xl font-bold bg-gradient-mental text-transparent bg-clip-text">Constructor de Preguntas</h2>
                    <p className="text-slate-400 text-sm mt-1">Idea una pregunta para el juego. Rellena los campos para compilar tu propuesta.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Área de Conocimiento</label>
                        <select
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-hidden focus:border-indigo-500 transition-colors"
                        >
                            <option value="">-- Selecciona un Área --</option>
                            {areas.map(area => (
                                <option key={area.area_id} value={area.area_id}>{area.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Enunciado de la Pregunta</label>
                        <textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 outline-hidden focus:border-indigo-500 transition-colors min-h-[80px]"
                            placeholder="Ej: ¿Cuál es el océano más grande del mundo?"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-300">Opciones de Respuesta</label>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCorrectIndex(idx)}
                                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${correctIndex === idx
                                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                            : 'border-slate-600 bg-slate-800 text-slate-500 hover:border-slate-500'
                                        }`}
                                    title="Marcar como correcta"
                                >
                                    ✓
                                </button>
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    placeholder={`Opción ${idx + 1}`}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 outline-hidden focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Explicación (Opcional)</label>
                        <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 test-sm text-slate-400 outline-hidden focus:border-indigo-500 transition-colors"
                            placeholder="Se mostrará si alguien falla..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-gradient-mental text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity flex justify-center items-center disabled:opacity-50"
                    >
                        {isSubmitting ? 'Enviando...' : 'Compilar y Enviar Propuesta'}
                    </button>
                </form>
            </div>

            {/* RIGHT: JSON Real-time Code Visualizer */}
            <div className="card p-0 bg-slate-900 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700/80 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <span className="text-slate-400 text-xs font-mono ml-2">JSON Payload Compiler [Live View]</span>
                </div>

                <div className="p-6 flex-1 overflow-auto">
                    <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap wrap-break-word">
                        <code className="prettyprint lang-json">
                            {JSON.stringify(jsonPreview, null, 2)}
                        </code>
                    </pre>
                </div>

                <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500">
                        <strong>Didáctica 101:</strong> El servidor de <code>quiz.edumind.es</code> recibe exactamente este bloque de código cuando pulsas enviar. Se llama formato JSON (JavaScript Object Notation). ¡Cambiando los datos del formulario de la izquierda estás programando en tiempo real este objeto, el cual será auditado por el Docente!
                    </p>
                </div>
            </div>

        </div>
    );
};

export default QuestionBuilder;
