import React, { useEffect, useState } from 'react';
import { generateFinalProfile } from '../actions'; // Server action
import { Message } from '../types';

interface ResultPhaseProps {
  apiKey: string;
  history: Message[];
  onReset: () => void;
  onProfileGenerated?: (markdown: string) => void;
}

export default function ResultPhase({ apiKey, history, onReset, onProfileGenerated }: ResultPhaseProps) {
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const hasFetched = React.useRef(false);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      // 1. Check cache first
      const cached = localStorage.getItem('anamnesis_last_profile');
      if (cached) {
        if (mounted) {
          setMarkdown(cached);
          setLoading(false);
          onProfileGenerated?.(cached);
        }
        return;
      }

      // 2. Prevent double fetching in Strict Mode
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const result = await generateFinalProfile(apiKey, history);
        if (mounted) {
          setMarkdown(result);
          localStorage.setItem('anamnesis_last_profile', result); // Save to cache
          setLoading(false);
          onProfileGenerated?.(result);
        }
      } catch (error) {
        console.error(error);
        if (mounted) {
          setMarkdown('Error generating profile. Please check console.');
          setLoading(false);
        }
      }
    }

    fetchProfile();
    return () => { mounted = false; };
  }, [apiKey, history]);

  const handleReset = () => {
    localStorage.removeItem('anamnesis_last_profile');
    onReset();
  };

  return (
    <div className="max-w-5xl mx-auto w-full h-[90vh] flex flex-col pt-12 font-mono">
      <div className="mb-6 flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl text-white font-light tracking-tight mb-2">Architecture Output</h2>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">
            SESSION_COMPLETE // GENERATING_FINAL_REPORT
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#050505] border border-white/10 relative overflow-hidden flex flex-col">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-black z-50">
            <div className="text-sm text-gray-500 animate-pulse font-mono tracking-widest">
              SYNTHESIZING...
            </div>
            {/* Glitch-like loader */}
            <div className="w-64 h-1 bg-gray-900 overflow-hidden">
              <div className="w-full h-full bg-white animate-progress origin-left" />
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-8 custom-scrollbar">
            {/* Simulated line numbers and code view */}
            <div className="flex">
              <div className="flex flex-col text-[10px] text-gray-800 select-none text-right pr-4 border-r border-white/5 pt-1">
                {markdown.split('\n').map((_, i) => (
                  <span key={i} className="leading-relaxed">{i + 1}</span>
                ))}
              </div>
              <pre className="flex-1 pl-6 whitespace-pre-wrap font-mono text-sm text-gray-300 leading-relaxed selection:bg-white selection:text-black">
                {markdown}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions - F-Key Style */}
      <div className="mt-6 flex justify-between border-t border-white/10 pt-4 text-xs">
        <div className="flex gap-8">
          <button
            onClick={() => navigator.clipboard.writeText(markdown)}
            className="text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2"
            disabled={loading}
          >
            <span className="bg-white/10 px-1 text-white/50">F1</span>
            COPY_TO_CLIPBOARD
          </button>
        </div>

        <button
          onClick={handleReset}
          className="text-gray-500 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2"
        >
          <span className="bg-white/10 px-1 text-white/50">F2</span>
          RESET_SESSION
        </button>
      </div>
    </div>
  );
}
