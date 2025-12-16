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

  // Split states
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [summary, setSummary] = useState('');

  // Parse initial profile on mount
  useEffect(() => {
    if (initialRoughProfile) {
      // Try to parse standard format
      const genderMatch = initialRoughProfile.match(/性別:\s*([^\n]*)/);
      const ageMatch = initialRoughProfile.match(/年齢:\s*([^\n]*)/);
      // Summary is tricky if it's at the end or mixed. 
      // We'll assume "概要:" starts the summary, or if not found, put it all in summary if standard keys aren't found?
      // Or just put the remainder. 
      const summaryMatch = initialRoughProfile.match(/概要:\s*([\s\S]*)/);

      if (genderMatch) setGender(genderMatch[1].trim());
      if (ageMatch) setAge(ageMatch[1].trim());
      if (summaryMatch) {
        setSummary(summaryMatch[1].trim());
      } else if (!genderMatch && !ageMatch) {
        // If no format detected, dump everything into summary
        setSummary(initialRoughProfile);
      }
    }
  }, [initialRoughProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey && name) {
      // Merge logic
      let compiledProfile = '';
      if (gender) compiledProfile += `性別: ${gender.trim()}\n`;
      if (age) compiledProfile += `年齢: ${age.trim()}\n`;
      if (summary) compiledProfile += `概要: ${summary.trim()}`;

      onComplete(apiKey.trim(), name.trim(), compiledProfile.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full pt-12 pb-20 fade-in animate-in duration-700">
      <div className="mb-12 border-b border-white/10 pb-4">
        <p className="text-xs text-gray-500 font-mono tracking-widest mb-2">SYSTEM_STATUS: WAITING_FOR_INPUT</p>
        <h1 className="text-3xl text-white font-light tracking-tight uppercase">Protocol Initialization</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 font-mono">
        {/* API KEY INPUT */}
        <div className="group relative">
          <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1 group-focus-within:text-white transition-colors">
            01 // Gemini API Authorization
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-gray-800 focus:outline-none focus:border-white transition-colors text-lg"
            placeholder="ENTER_KEY_SEQUENCE..."
            required
            autoComplete="off"
          />
          <div className="absolute right-0 top-6 w-2 h-4 bg-white/50 animate-pulse hidden group-focus-within:block" />
          <p className="mt-2 text-[10px] text-gray-700">
            * KEY_STORAGE: LOCAL_SESSION_ONLY
          </p>
        </div>

        {/* CHARACTER NAME INPUT */}
        <div className="group relative">
          <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1 group-focus-within:text-white transition-colors">
            02 // Subject Identifier
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-gray-800 focus:outline-none focus:border-white transition-colors text-lg"
            placeholder="ENTER_SUBJECT_NAME..."
            required
            autoComplete="off"
          />
          <div className="absolute right-0 top-6 w-2 h-4 bg-white/50 animate-pulse hidden group-focus-within:block" />
        </div>

        {/* SPLIT INPUTS ROW */}
        <div className="flex gap-8">
          {/* GENDER INPUT */}
          <div className="group relative flex-1">
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1 group-focus-within:text-white transition-colors">
              03 // Gender
            </label>
            <input
              type="text"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-gray-800 focus:outline-none focus:border-white transition-colors text-lg"
              placeholder="MALE / FEMALE / OTHER..."
              autoComplete="off"
            />
            <div className="absolute right-0 top-6 w-2 h-4 bg-white/50 animate-pulse hidden group-focus-within:block" />
          </div>

          {/* AGE INPUT */}
          <div className="group relative w-32">
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1 group-focus-within:text-white transition-colors">
              04 // Age
            </label>
            <input
              type="text"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-gray-800 focus:outline-none focus:border-white transition-colors text-lg"
              placeholder="Unknown..."
              autoComplete="off"
            />
            <div className="absolute right-0 top-6 w-2 h-4 bg-white/50 animate-pulse hidden group-focus-within:block" />
          </div>
        </div>

        {/* SUMMARY INPUT */}
        <div className="group relative">
          <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1 group-focus-within:text-white transition-colors">
            05 // Preliminary Context [Rough Summary]
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-gray-800 focus:outline-none focus:border-white transition-colors resize-none h-24 align-top"
            placeholder="DESCRIBE_BACKGROUND_PARAMETERS..."
          />
          <div className="absolute right-0 top-6 w-2 h-4 bg-white/50 animate-pulse hidden group-focus-within:block" />
        </div>

        {/* EXECUTE BUTTON */}
        <div className="pt-8">
          <button
            type="submit"
            className="w-full group relative border border-white/20 py-4 hover:bg-white transition-colors duration-200"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-sm tracking-[0.3em] text-white group-hover:text-black font-bold transition-colors">
                [ EXECUTE ]
              </span>
            </div>
            {/* Decoration corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </form>
    </div>
  );
}
