'use client';

import React, { useState, useEffect } from 'react';
import SetupPhase from './components/SetupPhase';
import InterviewPhase from './components/InterviewPhase';
import ResultPhase from './components/ResultPhase';
import CharacterList from './components/CharacterList';
import { Message, SavedState, SessionMetadata } from './types';

// Storage Keys
const INDEX_KEY = 'anamnesis_index';
const SESSION_PREFIX = 'anamnesis_session_';

export default function DeepProfilerPage() {
  const [view, setView] = useState<'LIST' | 'SESSION'>('LIST');
  const [sessions, setSessions] = useState<SessionMetadata[]>([]);

  // Session State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [step, setStep] = useState<'SETUP' | 'INTERVIEW' | 'RESULT'>('SETUP');
  const [apiKey, setApiKey] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [roughProfile, setRoughProfile] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Load Index on Mount
  useEffect(() => {
    refreshSessionList();
  }, []);

  const refreshSessionList = () => {
    try {
      const raw = localStorage.getItem(INDEX_KEY);
      if (raw) {
        setSessions(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to load session index', e);
    }
  };

  // Auto-save current session
  useEffect(() => {
    if (view === 'SESSION' && currentId) {
      const saveToStorage = () => {
        const state: SavedState = {
          id: currentId,
          name: characterName || 'Untitled Profile',
          roughProfile,
          updatedAt: Date.now(),
          step,
          apiKey,
          messages
        };

        // Save individual session
        localStorage.setItem(SESSION_PREFIX + currentId, JSON.stringify(state));

        // Update Index
        const newMetadata: SessionMetadata = {
          id: currentId,
          name: state.name,
          roughProfile: state.roughProfile,
          updatedAt: state.updatedAt
        };

        // Get fresh index to avoid race conditions (though usually sync in React effects)
        const textIndex = localStorage.getItem(INDEX_KEY);
        let currentIndex: SessionMetadata[] = textIndex ? JSON.parse(textIndex) : [];

        const existingIdx = currentIndex.findIndex(s => s.id === currentId);
        if (existingIdx >= 0) {
          currentIndex[existingIdx] = newMetadata;
        } else {
          currentIndex.push(newMetadata);
        }

        // Sort by updated recently
        currentIndex.sort((a, b) => b.updatedAt - a.updatedAt);

        localStorage.setItem(INDEX_KEY, JSON.stringify(currentIndex));
        setSessions(currentIndex);
      };

      const debounce = setTimeout(saveToStorage, 1000);
      return () => clearTimeout(debounce);
    }
  }, [view, currentId, step, apiKey, characterName, roughProfile, messages]);

  // Actions
  const handleCreateNew = () => {
    const newId = crypto.randomUUID();
    setCurrentId(newId);
    setStep('SETUP');
    // Keep API key if previously entered? Maybe for convenience. 
    // For now, let's reset sensitive data but keeping ID.
    // Actually, user might want to reuse API key. 
    // Let's check if there is a 'last_api_key' global preference or just reset.
    // Resetting for clean slate as per request logic implied.
    setApiKey('');
    setCharacterName('');
    setRoughProfile('');
    setMessages([]);
    setView('SESSION');
  };

  const handleSelectSession = (id: string) => {
    try {
      const raw = localStorage.getItem(SESSION_PREFIX + id);
      if (raw) {
        const data: SavedState = JSON.parse(raw);
        setCurrentId(data.id);
        setStep(data.step);
        setApiKey(data.apiKey);
        setCharacterName(data.name); // Mapping name back to characterName
        setRoughProfile(data.roughProfile);
        setMessages(data.messages);
        setView('SESSION');
      } else {
        alert('Session data missing!');
      }
    } catch (e) {
      console.error('Failed to load session', e);
      alert('Failed to load session.');
    }
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this profile?')) return;

    // Remove from index
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    localStorage.setItem(INDEX_KEY, JSON.stringify(newSessions));

    // Remove file
    localStorage.removeItem(SESSION_PREFIX + id);
  };

  const handleBackToList = () => {
    setView('LIST');
    setCurrentId(null);
  };

  // Phase Handlers
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
    // In new context, "Reset" might mean "Restart this session" or "Clear data".
    // Let's make it clear data for this specific session.
    if (confirm('Restart interview for this character?')) {
      setStep('SETUP');
      setMessages([]);
      // Keep name/profile/key as ease of use? Or clear all?
      // Usually reset means start over.
      setCharacterName('');
      setRoughProfile('');
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] min-w-full flex flex-col p-4 selection:bg-blue-500/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col">
        {view === 'LIST' ? (
          <CharacterList
            sessions={sessions}
            onCreate={handleCreateNew}
            onSelect={handleSelectSession}
            onDelete={handleDeleteSession}
          />
        ) : (
          <div className="w-full h-full flex flex-col">
            {/* Header / Nav */}
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <button
                onClick={handleBackToList}
                className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                title="Back to List"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>Back to Archives</span>
              </button>
              <div className="text-sm text-gray-600 font-mono">
                SESSION ID: {currentId?.slice(0, 8)}...
              </div>
            </div>

            {/* Content phases */}
            <div className="flex-1 flex items-center justify-center">
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
          </div>
        )}
      </div>
    </main>
  );
}
