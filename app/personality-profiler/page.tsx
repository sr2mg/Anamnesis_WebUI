'use client';

import React, { useState, useEffect } from 'react';
import SetupPhase from './components/SetupPhase';
import InterviewPhase from './components/InterviewPhase';
import ResultPhase from './components/ResultPhase';
import { Message } from './types';

// Constants for LocalStorage
const STORAGE_KEY = 'anamnesis_profiler_state';

interface SavedState {
  step: 'SETUP' | 'INTERVIEW' | 'RESULT';
  apiKey: string;
  characterName: string;
  roughProfile: string;
  messages: Message[];
}

export default function DeepProfilerPage() {
  const [step, setStep] = useState<'SETUP' | 'INTERVIEW' | 'RESULT'>('SETUP');
  const [apiKey, setApiKey] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [roughProfile, setRoughProfile] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: SavedState = JSON.parse(saved);
        setApiKey(parsed.apiKey);
        setCharacterName(parsed.characterName);
        setRoughProfile(parsed.roughProfile);
        setMessages(parsed.messages);
        setStep(parsed.step);
      } catch (e) {
        console.error('Failed to load saved state', e);
      }
    }
  }, []);

  // Save state on change
  useEffect(() => {
    const state: SavedState = {
      step,
      apiKey,
      characterName,
      roughProfile,
      messages
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [step, apiKey, characterName, roughProfile, messages]);

  const handleSetupComplete = (key: string, name: string, rough: string) => {
    setApiKey(key);
    setCharacterName(name);
    setRoughProfile(rough);
    setStep('INTERVIEW');
  };

  const handleInterviewFinish = () => {
    setStep('RESULT');
  };

  const handleReset = () => {
    if (confirm('Are you sure? This will clear the current session.')) {
        localStorage.removeItem(STORAGE_KEY);
        setStep('SETUP');
        setApiKey(''); // Optionally keep API key? For now, clear for safety/reset.
        setCharacterName('');
        setRoughProfile('');
        setMessages([]);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-blue-500/30">
        
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full">
        {step === 'SETUP' && (
          <SetupPhase 
            onComplete={handleSetupComplete} 
            initialApiKey={apiKey}
            initialName={characterName}
            initialRoughProfile={roughProfile}
          />
        )}
        {step === 'INTERVIEW' && (
          <InterviewPhase
            apiKey={apiKey}
            characterName={characterName}
            roughProfile={roughProfile}
            initialMessages={messages}
            onMessagesUpdate={setMessages}
            onFnish={handleInterviewFinish}
          />
        )}
        {step === 'RESULT' && (
          <ResultPhase
            apiKey={apiKey}
            history={messages}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  );
}
