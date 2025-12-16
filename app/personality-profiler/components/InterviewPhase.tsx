import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { continueInterview } from '../actions';

interface InterviewPhaseProps {
  apiKey: string;
  characterName: string;
  roughProfile: string;
  initialMessages: Message[];
  onMessagesUpdate: (messages: Message[]) => void;
  onFnish: () => void;
}

export default function InterviewPhase({
  apiKey,
  characterName,
  roughProfile,
  initialMessages,
  onMessagesUpdate,
  onFnish
}: InterviewPhaseProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasStarted = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial trigger if history is empty (start the conversation)
  useEffect(() => {
    if (messages.length === 0 && !hasStarted.current) {
      hasStarted.current = true;
      handleSendMessage(`こんにちは、キャラクター名は${characterName}です。${roughProfile ? `キャラクターの今きまっている概要は ${roughProfile}です。` : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = { role: 'user', content };
    // Optimistic update for user message
    // If it's the very first automated message, we might not want to show it as "User said..." visually if it feels like a system init, 
    // but for simplicity we'll treat it as part of the flow or hidden?
    // Let's hide the very first setup prompt from the UI to make it feel like the AI starts.

    let newMessages = [...messages];
    if (messages.length > 0 || content !== `こんにちは。キャラクター名は${characterName}です。${roughProfile ? `キャラクターの今きまっている概要は ${roughProfile}です。` : ''}`) {
      newMessages.push(userMsg);
    }

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the *previous* history + the new message to the server
      // If this is the first message, we are sending the hidden prompt.
      const historyToSend = messages;

      const response = await continueInterview(apiKey, historyToSend, content);

      const aiMsg: Message = {
        role: 'model',
        content: response.reply,
        analysis: response.analysis
      };
      const updatedMessages = [...newMessages, aiMsg];

      setMessages(updatedMessages);
      onMessagesUpdate(updatedMessages);
    } catch (error) {
      console.error(error);
      alert('Failed to get response. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl mx-auto bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
        <div>
          <h2 className="text-lg font-light text-white tracking-wide">Profiling: <span className="font-semibold">{characterName}</span></h2>
          <span className="text-xs text-green-400 font-mono">● LIVE CONNECTION</span>
        </div>
        <button
          onClick={onFnish}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-md transition-colors shadow-lg shadow-indigo-500/20"
        >
          Generate Profile
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, i) => (
          // Hide the very first system-init message if it matches our template
          (i === 0 && msg.content.includes('こんにちは、キャラクターのプロフィールを作りたいです。')) ? null : (
            <div
              key={i}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-lg'
                  : 'bg-white/10 text-white/90 rounded-bl-none border border-white/5'
                  }`}
              >
                {msg.analysis && (
                  <details className="mb-3 text-xs text-white/40 border-b border-white/5 pb-2">
                    <summary className="cursor-pointer hover:text-white/60 transition-colors uppercase tracking-wider font-mono select-none">
                      Analytic Thought Process
                    </summary>
                    <div className="mt-2 p-3 bg-black/20 rounded-lg font-mono leading-relaxed whitespace-pre-wrap">
                      {msg.analysis}
                    </div>
                  </details>
                )}
                {msg.content}
              </div>
            </div>
          )
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 rounded-2xl px-6 py-4 rounded-bl-none flex items-center space-x-2">
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/5">
        <div className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none min-h-[50px] max-h-[150px]"
            placeholder="Type your response..."
            rows={1}
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
