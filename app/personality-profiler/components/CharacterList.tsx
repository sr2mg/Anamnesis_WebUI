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
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Memory Archives
                    </h1>
                    <p className="text-gray-400 mt-2">stored_personality_profiles</p>
                </div>
                <button
                    onClick={onCreate}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                >
                    <span className="text-xl">+</span>
                    New Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                        <p className="text-gray-500">No profiles found in archive.</p>
                        <p className="text-gray-600 text-sm mt-2">Create a new one to get started.</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => onSelect(session.id)}
                            className="group relative bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-blue-500/50 hover:bg-[#0f0f15] transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                            {/* Card Decoration */}
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
                                    {session.name.charAt(0)}
                                </div>
                                <button
                                    onClick={(e) => onDelete(session.id, e)}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors z-10"
                                    title="Delete Profile"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors line-clamp-1">
                                {session.name}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-2 h-10 mb-4">
                                {session.roughProfile || "No description provided."}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-600 pt-4 border-t border-white/5">
                                <span>Last Updated</span>
                                <span className="font-mono">{new Date(session.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
