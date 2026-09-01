import React, { useState, useEffect } from 'react';
import { useCodeStream } from '../context/CodeContext';
import { useAuth } from '../context/AuthContext';
import CodeHud from './CodeHud';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameCanvas({ classroomId }) {
    const { addLog } = useCodeStream();
    const { user } = useAuth();
    const [question, setQuestion] = useState(null);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('waiting'); // waiting, question, result

    useEffect(() => {
        // Mock websocket connection
        addLog({ type: 'backend', message: 'Connecting to Game Session', codeSnippet: 'ws.connect(gameId)' });
        setTimeout(() => {
            setGameState('question');
            loadMockQuestion();
        }, 2000);
    }, []);

    const loadMockQuestion = () => {
        addLog({ type: 'db', message: 'Fetching Question', codeSnippet: 'SELECT * FROM questions ORDER BY RAND() LIMIT 1' });
        setQuestion({
            id: 1,
            text: 'What is the powerhouse of the cell?',
            options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi'],
            correct: 0,
            area: 'Biology'
        });
    };

    const handleAnswer = (index) => {
        addLog({ type: 'frontend', message: `User selected option ${index}`, codeSnippet: `handleAnswer(${index})` });

        const isCorrect = index === question.correct;
        if (isCorrect) {
            addLog({ type: 'backend', message: 'Verifying Answer: Correct', codeSnippet: 'if (ans == correct) score += 10' });
            setScore(s => s + 10);
        } else {
            addLog({ type: 'backend', message: 'Verifying Answer: Incorrect', codeSnippet: 'else score -= 0' });
        }

        // Next question mock
        setTimeout(loadMockQuestion, 1500);
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
            <CodeHud />

            {/* Score */}
            <div className="absolute top-4 right-4 text-2xl font-bold text-(--color-primary)">
                Score: {score}
            </div>

            <AnimatePresence mode='wait'>
                {question && (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-3xl"
                    >
                        <div className="text-center mb-8">
                            <span className="bg-white/10 px-3 py-1 rounded-full text-sm mb-4 inline-block">{question.area}</span>
                            <h2 className="text-4xl font-bold drop-shadow-lg">{question.text}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(i)}
                                    className="bg-white/10 hover:bg-(--color-secondary) hover:text-black p-6 rounded-xl text-xl font-bold transition-all transform hover:scale-105 border-2 border-white/20"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
