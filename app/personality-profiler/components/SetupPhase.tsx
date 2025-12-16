import React, { useState, useEffect } from 'react';

interface SetupPhaseProps {
  onComplete: (apiKey: string, name: string, roughProfile: string) => void;
  initialApiKey?: string;
  initialName?: string;
  initialRoughProfile?: string;
}

export default function SetupPhase({ onComplete, initialApiKey = '', initialName = '', initialRoughProfile = '' }: SetupPhaseProps) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [name, setName] = useState(initialName);
  const [roughProfile, setRoughProfile] = useState(initialRoughProfile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey && name) {
      onComplete(apiKey.trim(), name.trim(), roughProfile.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-light tracking-tight text-white mb-2">Deep Personality Profiler</h1>
      <p className="text-white/60 mb-8 font-light">Initialize the Anamnesis protocol. Enter the subject's details below.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-2">Gemini API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="AIza..."
            required
          />
          <p className="mt-2 text-xs text-white/30">Key is stored locally in your browser. Never sent to our servers permanently.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-2">Character Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="e.g. Neo, Ellen Ripley..."
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-2">Rough Profile / Initial Context (Optional)</label>
          <textarea
            value={roughProfile}
            onChange={(e) => setRoughProfile(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all h-32 resize-none"
            placeholder="Briefly describe the character's background, role, or any specific traits you want to explore..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/20"
        >
          Begin Initialization
        </button>
      </form>
    </div>
  );
}
