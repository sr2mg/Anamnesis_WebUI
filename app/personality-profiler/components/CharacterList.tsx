import React from 'react';
import { SessionMetadata } from '../types';

interface CharacterListProps {
    sessions: SessionMetadata[];
    onSelect: (id: string) => void;
    onCreate: () => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

export default function CharacterList({ sessions, onSelect, onCreate, onDelete }: CharacterListProps) {
    return (
        <div className="w-full max-w-6xl mx-auto py-12 px-4 font-mono">
            <header className="mb-12 border-b border-white/20 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-light text-white tracking-tighter mb-1">
                        ANAMNESIS
                    </h1>
                    <div className="flex items-center gap-4 text-xs text-gray-500 uppercase tracking-widest">
                        <span>/// MEMORY_INDEX</span>
                        <span>[ STATUS: ONLINE ]</span>
                    </div>
                </div>
                <button
                    onClick={onCreate}
                    className="group flex items-center gap-3 px-6 py-3 border border-white/20 hover:bg-white hover:text-black transition-colors duration-200"
                >
                    <span className="text-xs tracking-widest">[ INITIALIZE_NEW_PROTOCOL ]</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">_</span>
                </button>
            </header>

            {/* Grid Layout - simulating a table/grid with borders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
                {sessions.length === 0 ? (
                    <div className="col-span-full py-32 text-center border-b border-r border-white/10">
                        <p className="text-gray-600 text-sm tracking-widest">NO_ARCHIVES_FOUND</p>
                        <p className="text-gray-700 text-xs mt-2">// Execute initialization to begin</p>
                    </div>
                ) : (
                    sessions.map((session, idx) => (
                        <div
                            key={session.id}
                            onClick={() => onSelect(session.id)}
                            className="group relative h-64 border-b border-r border-white/10 p-6 cursor-pointer hover:bg-[#0A0A0A] transition-colors overflow-hidden"
                        >
                            {/* Hover Effect: Simple Glow from corner */}
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-blue-400 font-light tracking-widest">ACTIVE_NODE</span>
                            </div>

                            {/* Header: ID & Initial */}
                            <div className="flex justify-between items-start mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                                <div className="text-2xl font-light text-gray-300 group-hover:text-white">
                                    {session.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-[10px] text-gray-600 tracking-widest">
                                    ID: {session.id.slice(0, 4).toUpperCase()}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <h3 className="text-lg text-gray-200 font-light mb-2 truncate">
                                    {session.name}
                                </h3>
                                <div className="h-12 overflow-hidden relative">
                                    <p className="text-xs text-gray-500 leading-relaxed font-light">
                                        {session.roughProfile || "NO_DATA_AVAILABLE"}
                                    </p>
                                    {/* Gradient fade for text truncation */}
                                    <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-[#050505] to-transparent" />
                                </div>
                            </div>

                            {/* Footer: Date & Delete */}
                            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end border-t border-dashed border-gray-800 pt-4 mt-4">
                                <span className="text-[10px] text-gray-600">
                                    UPDATED: {new Date(session.updatedAt).toLocaleDateString().replace(/\//g, '.')}
                                </span>
                                <button
                                    onClick={(e) => onDelete(session.id, e)}
                                    className="text-[10px] text-red-900 hover:text-red-500 hover:bg-red-950/30 px-2 py-1 transition-colors uppercase tracking-wider"
                                >
                                    [ PURGE ]
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
