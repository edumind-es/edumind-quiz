import React from 'react';
import { useCodeStream } from '../context/CodeContext';
import { Terminal, Database, Server, Globe } from 'lucide-react';

const TypeIcon = ({ type }) => {
    switch (type) {
        case 'db': return <Database size={14} className="text-green-400" />;
        case 'backend': return <Server size={14} className="text-orange-400" />;
        default: return <Globe size={14} className="text-blue-400" />;
    }
};

export default function CodeHud() {
    const { logs } = useCodeStream();

    return (
        <div className="fixed bottom-4 right-4 w-96 max-h-[400px] overflow-hidden rounded-lg bg-black/80 backdrop-blur-sm border border-green-500/30 text-xs font-mono shadow-2xl z-50 pointer-events-none">
            <div className="bg-black/90 p-2 border-b border-green-500/30 flex items-center gap-2 text-green-500 font-bold uppercase tracking-wider">
                <Terminal size={14} />
                System Logic Stream
            </div>
            <div className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[350px]">
                {logs.map((log) => (
                    <div key={log.id} className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1">
                            <span>{log.timestamp}</span>
                            <TypeIcon type={log.type} />
                            <span className="uppercase">{log.type}</span>
                        </div>
                        <div className={`p-2 rounded-sm border-l-2 ${log.type === 'db' ? 'border-green-500 bg-green-900/10' : 'border-blue-500 bg-blue-900/10'}`}>
                            <div className="text-gray-300 mb-1">{log.message}</div>
                            {log.codeSnippet && (
                                <pre className="text-green-400 overflow-x-auto whitespace-pre-wrap">
                                    {log.codeSnippet}
                                </pre>
                            )}
                        </div>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="text-gray-600 italic text-center">Waiting for system events...</div>
                )}
            </div>
        </div>
    );
}
