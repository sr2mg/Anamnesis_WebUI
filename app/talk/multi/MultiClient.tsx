'use client';

import React, { useState, useEffect } from 'react';
import { SessionMetadata, SavedState } from '../../personality-profiler/types';
import { generateGroupConversation } from '../actions';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

const INDEX_KEY = 'anamnesis_index';
const SESSION_PREFIX = 'anamnesis_session_';

interface MultiClientProps {
    envApiKey?: string;
}

export default function MultiClient({ envApiKey }: MultiClientProps) {
    const [sessions, setSessions] = useState<SessionMetadata[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [apiKey, setApiKey] = useState(envApiKey || '');
    const [situation, setSituation] = useState('');
    const [theme, setTheme] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem(INDEX_KEY);
        if (raw) {
            setSessions(JSON.parse(raw));
        }
    }, []);

    const toggleSelection = (id: string, name: string) => {
        // We need to load the full profile to ensure it's valid
        const raw = localStorage.getItem(SESSION_PREFIX + id);
        if (!raw) return;
        const data: SavedState = JSON.parse(raw);

        if (!data.finalProfile) {
            alert(`Character ${name} does not have a final profile yet.`);
            return;
        }

        // If we found an API key in a saved session, we can grab it for convenience
        // Prioritize session key if set, otherwise keep using envApiKey if available
        if (data.apiKey && !apiKey) {
            setApiKey(data.apiKey);
        }

        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            alert("Please enter API Key");
            return;
        }
        if (selectedIds.length < 2) {
            alert("Select at least 2 characters.");
            return;
        }
        if (!situation || !theme) {
            alert("Please fill in Situation and Theme.");
            return;
        }

        setLoading(true);
        setResult('');

        // Prepare character data
        const characters = selectedIds.map(id => {
            const raw = localStorage.getItem(SESSION_PREFIX + id);
            if (!raw) return null;
            const data: SavedState = JSON.parse(raw);
            return {
                name: data.name,
                profile: data.finalProfile || ''
            };
        }).filter(Boolean) as { name: string, profile: string }[];

        try {
            const text = await generateGroupConversation(apiKey, characters, situation, theme);
            setResult(text);
        } catch (e) {
            console.error(e);
            alert("Generation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 font-mono flex">
            {/* Sidebar / Config */}
            <div className="w-[400px] border-r border-white/10 flex flex-col bg-black/50 backdrop-blur-md overflow-y-auto">
                <div className="p-4 border-b border-white/10">
                    <h1 className="text-sm font-bold tracking-widest text-white">MULTI-CHANNEL // SYNC</h1>
                    <Link href="/talk" className="text-[10px] text-gray-500 block mt-2 hover:text-white">← RETURN TO SINGLE TALK</Link>
                </div>

                <div className="p-6 space-y-8">
                    {/* API Key */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500">API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="GEMINI API KEY"
                            className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:border-white outline-none"
                        />
                    </div>

                    {/* Character Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500">
                            Select Characters ({selectedIds.length})
                        </label>
                        <div className="border border-white/10 bg-white/5 max-h-60 overflow-y-auto">
                            {sessions.map(s => (
                                <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(s.id)}
                                        onChange={() => toggleSelection(s.id, s.name)}
                                        className="accent-white"
                                    />
                                    <div className="flex-1 overflow-hidden">
                                        <div className="text-xs font-bold text-white truncate">{s.name}</div>
                                        <div className="text-[9px] text-gray-500">{new Date(s.updatedAt).toLocaleDateString()}</div>
                                    </div>
                                </label>
                            ))}
                            {sessions.length === 0 && (
                                <div className="p-4 text-[10px] text-center text-gray-500">No Archives Found</div>
                            )}
                        </div>
                    </div>

                    {/* Situation */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500">Situation</label>
                        <textarea
                            value={situation}
                            onChange={(e) => setSituation(e.target.value)}
                            placeholder="e.g. Trapped in a malfunctioning elevator..."
                            className="w-full h-20 bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:border-white outline-none resize-none"
                        />
                    </div>

                    {/* Theme */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500">Talk Theme</label>
                        <input
                            type="text"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            placeholder="e.g. The ethics of AI..."
                            className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:border-white outline-none"
                        />
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-3 bg-white text-black font-bold text-xs tracking-widest hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'GENERATING PROTOCOL...' : 'INITIATE SEQUENCE'}
                    </button>
                </div>
            </div>

            {/* Main Area / Result */}
            <div className="flex-1 flex flex-col relative">
                <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />

                <div className="flex-1 overflow-y-auto p-12 relative z-10">
                    {result ? (
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="text-center mb-12">
                                <h2 className="text-2xl font-light text-white mb-2">{theme || 'UNTITLED SEQUENCE'}</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">{situation || 'UNKNOWN CONTEXT'}</p>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none border-l border-white/10 pl-8">
                                <ReactMarkdown>{result}</ReactMarkdown>
                            </div>
                            <div className="text-center mt-20">
                                <span className="text-[10px] text-red-500 tracking-[0.2em]">/// END OF RECORD</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center flex-col text-gray-600">
                            {loading ? (
                                <>
                                    <div className="w-12 h-12 border-2 border-l-transparent border-white rounded-full animate-spin mb-4" />
                                    <p className="text-xs tracking-widest animate-pulse">SYNCHRONIZING PERSONALITIES...</p>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="text-4xl font-thin mb-4 opacity-20">WAITING</div>
                                    <p className="text-xs tracking-widest">CONFIGURE PARAMETERS AND INITIATE</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
