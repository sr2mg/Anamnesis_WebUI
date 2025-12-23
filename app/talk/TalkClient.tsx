'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message, SessionMetadata, SavedState } from '../personality-profiler/types';
import { chatWithCharacter } from './actions';
import ReactMarkdown from 'react-markdown';

// Reuse keys
const INDEX_KEY = 'anamnesis_index';
const SESSION_PREFIX = 'anamnesis_session_';

interface TalkClientProps {
    envApiKey?: string;
}

export default function TalkClient({ envApiKey }: TalkClientProps) {
    const [sessions, setSessions] = useState<SessionMetadata[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState(envApiKey || ''); // Initialize with env key

    // Chat State
    const [history, setHistory] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [characterProfile, setCharacterProfile] = useState<string>('');
    const [characterName, setCharacterName] = useState<string>('');

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load sessions that have a final profile
        const raw = localStorage.getItem(INDEX_KEY);
        if (raw) {
            const all: SessionMetadata[] = JSON.parse(raw);
            setSessions(all);
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleSelect = (id: string) => {
        const raw = localStorage.getItem(SESSION_PREFIX + id);
        if (!raw) return;
        const data: SavedState = JSON.parse(raw);

        if (!data.finalProfile) {
            alert("This character doesn't have a final profile yet. Please complete the Profiler analysis first.");
            return;
        }

        setSelectedId(id);
        setCharacterName(data.name);
        setCharacterProfile(data.finalProfile);

        // Attempt to rescue API key from session if it exists.
        // If session has key, use it. If not, fallback to envApiKey.
        if (data.apiKey) {
            setApiKey(data.apiKey);
        } else if (envApiKey) {
            setApiKey(envApiKey);
        }

        // Clear history on new selection
        setHistory([]);
    };

    const handleSend = async () => {
        if (!input.trim() || !apiKey || loading) return;

        const userMsg = input;
        setInput('');
        setLoading(true);

        const newHistory = [...history, { role: 'user' as const, content: userMsg }];
        setHistory(newHistory);

        try {
            const reply = await chatWithCharacter(apiKey, history, characterProfile, userMsg);
            setHistory([...newHistory, { role: 'model' as const, content: reply }]);
        } catch (e) {
            console.error(e);
            alert('Failed to send message. Check API Key.');
        } finally {
            setLoading(false);
        }
    };

    if (sessions.length === 0) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono">
                <div className="text-center">
                    <h1 className="text-xl mb-4">NO ARCHIVES FOUND</h1>
                    <p className="text-gray-500">Create a personality profile first.</p>
                    <a href="/" className="mt-8 block text-sm underline decoration-gray-500 underline-offset-4 hover:text-red-500">RETURN TO ROOT</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 font-mono flex">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-black/50 backdrop-blur-md">
                <div className="p-4 border-b border-white/10">
                    <h1 className="text-sm font-bold tracking-widest text-white">ARCHIVES // TALK</h1>
                    <div className="flex gap-4 mt-2">
                        <a href="/" className="text-[10px] text-gray-500 hover:text-white transition-colors">← ROOT</a>
                        <a href="/talk/multi" className="text-[10px] text-red-500 hover:text-red-400 transition-colors uppercase">→ MULTI-CHANNEL</a>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sessions.map(s => (
                        <button
                            key={s.id}
                            onClick={() => handleSelect(s.id)}
                            className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${selectedId === s.id ? 'bg-white/10 text-white' : ''}`}
                        >
                            <div className="text-xs text-gray-500 mb-1">{new Date(s.updatedAt).toLocaleDateString()}</div>
                            <div className="font-bold truncate">{s.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col relative">
                <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />

                {selectedId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-[#050505]/80 backdrop-blur z-10 flex justify-between items-center">
                            <div>
                                <div className="text-[10px] text-green-500 uppercase tracking-widest mb-1">CONNECTED TO</div>
                                <div className="text-xl text-white font-light">{characterName}</div>
                            </div>
                            {!apiKey && (
                                <input
                                    type="password"
                                    placeholder="ENTER API KEY"
                                    className="bg-transparent border border-white/20 px-2 py-1 text-xs focus:border-white outline-none w-48"
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                            )}
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10" ref={scrollRef}>
                            {history.length === 0 && (
                                <div className="text-center text-gray-600 mt-20">
                                    <p className="text-sm tracking-widest">CONNECTION ESTABLISHED</p>
                                    <p className="text-xs mt-2">Begin transmission...</p>
                                </div>
                            )}
                            {history.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-2xl p-4 ${msg.role === 'user' ? 'bg-white/5 border border-white/10' : 'text-white'}`}>
                                        <div className="text-[9px] uppercase tracking-widest opacity-50 mb-2">
                                            {msg.role === 'user' ? 'USER' : characterName.toUpperCase()}
                                        </div>
                                        <div className="prose prose-invert prose-sm">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="text-xs text-green-500 animate-pulse">TYPING...</div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 z-10 bg-[#050505]">
                            <div className="max-w-4xl mx-auto flex gap-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-transparent border-b border-white/20 py-2 focus:border-white outline-none transition-colors"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="px-6 py-2 border border-white/20 hover:bg-white hover:text-black transition-all disabled:opacity-50 text-xs tracking-widest"
                                >
                                    SEND
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-gray-600 z-10">
                        <div className="w-16 h-16 border border-current rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <div className="w-2 h-2 bg-current rounded-full" />
                        </div>
                        <p className="tracking-widest text-xs">SELECT A TARGET FROM ARCHIVES</p>
                    </div>
                )}
            </div>
        </div>
    );
}
