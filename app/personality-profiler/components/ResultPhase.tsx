import React, { useEffect, useState } from 'react';
import { generateFinalProfile } from '../actions'; // Server action
import { Message } from '../types';

interface ResultPhaseProps {
  apiKey: string;
  history: Message[];
  onReset: () => void;
}

export default function ResultPhase({ apiKey, history, onReset }: ResultPhaseProps) {
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchProfile() {
      try {
        const result = await generateFinalProfile(apiKey, history);
        if (mounted) {
            setMarkdown(result);
            setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto w-full h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-white font-light tracking-wide">Analysis Complete</h2>
        <div className="space-x-4">
             <button
                onClick={() => navigator.clipboard.writeText(markdown)}
                className="text-sm text-white/60 hover:text-white transition-colors"
                disabled={loading}
            >
                Copy Markdown
            </button>
            <button
                onClick={onReset}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
            >
                Start New Session
            </button>
        </div>
      </div>

      <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
        {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-white/40 tracking-widest text-sm animate-pulse">SYNTHESIZING PSYCHOLOGICAL ARCHITECTURE...</p>
            </div>
        ) : (
            <div className="h-full overflow-y-auto p-8 prose prose-invert prose-blue max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-white/80 leading-relaxed">
                    {/* Minimal markdown rendering for now, can be improved with remark if needed later */}
                    {markdown}
                </pre>
            </div>
        )}
      </div>
    </div>
  );
}
