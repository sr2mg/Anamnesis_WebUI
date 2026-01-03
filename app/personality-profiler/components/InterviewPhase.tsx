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
  const isComposingRef = useRef(false);

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
      handleSendMessage(`今から始めます。\nキャラクター名：${characterName}\n${roughProfile ? `キャラクターについての現状の概要は下記です。\n${roughProfile}` : ''}`);
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
    if (messages.length > 0 || content !== `今から始めます。\nキャラクター名：${characterName}\n${roughProfile ? `キャラクターについての現状の概要は下記です。\n${roughProfile}` : ''}`) {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (isComposingRef.current || e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] w-full max-w-5xl mx-auto border-l border-r border-white/10 relative">

      {/* Header telemetry */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050505] z-10 sticky top-0">
        <div className="flex gap-4 items-center">
          <div className="w-2 h-2 bg-green-900 rounded-full animate-pulse shadow-[0_0_10px_#00ff00]" />
          <div className="text-[10px] text-gray-500 font-mono tracking-widest">
            CONNECTION: STABLE // LATENCY: 24ms
          </div>
        </div>
        <button
          onClick={onFnish}
          className="group relative px-4 py-2 border border-red-900/50 hover:bg-red-900/10 transition-colors"
        >
          <span className="text-[10px] text-red-500 font-bold tracking-widest group-hover:text-red-400 animate-pulse">
            [ TERMINATE & GENERATE ]
          </span>
        </button>
      </div>

      {/* Chat Area - Script Style */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent font-mono">
        {messages.map((msg, i) => (
          (i === 0 && msg.content.includes('こんにちは、キャラクターのプロフィールを作りたいです。')) ? null : (
            <div
              key={i}
              className="flex flex-col gap-2 animate-in fade-in slide-in-from-left-2 duration-500"
            >
              <span className="text-[10px] text-gray-600 tracking-widest uppercase">
                {msg.role === 'user' ? `> SUBJECT: ${characterName.toUpperCase()}` : `> SYSTEM: ANALYST_AI`}
              </span>

              <div className={`pl-4 border-l-2 ${msg.role === 'user' ? 'border-gray-700' : 'border-white/20'}`}>
                <p className={`text-sm leading-loose whitespace-pre-wrap ${msg.role === 'user' ? 'text-gray-400' : 'text-gray-200'}`}>
                  {msg.content}
                </p>

                {msg.analysis && (
                  <details className="mt-4 group">
                    <summary className="text-[10px] text-gray-700 cursor-pointer hover:text-gray-500 uppercase tracking-widest list-none flex items-center gap-2 select-none">
                      <span className="opacity-50">::</span>
                      INTERNAL_PROCESS
                      <span className="opacity-0 group-open:opacity-100 transition-opacity text-blue-900">[EXPANDED]</span>
                    </summary>
                    <div className="mt-2 p-4 bg-[#0A0A0A] border border-white/5 text-[10px] text-gray-500 leading-relaxed font-mono whitespace-pre-wrap">
                      {msg.analysis}
                    </div>
                  </details>
                )}
              </div>
            </div>
          )
        ))}
        {isLoading && (
          <div className="flex flex-col gap-2 opacity-50">
            <span className="text-[10px] text-gray-600 tracking-widest uppercase mb-1">&gt; SYSTEM</span>
            <div className="pl-4 border-l-2 border-white/10">
              <p className="text-xs text-gray-600 animate-pulse">PROCESSING_INPUT_STREAM...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - CLI Style */}
      <div className="p-0 border-t border-white/10 bg-[#050505]">
        <div className="relative flex items-center">
          <div className="px-4 text-gray-600 font-mono text-lg select-none">{'>'}</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => { isComposingRef.current = true; }}
            onCompositionEnd={() => { isComposingRef.current = false; }}
            className="w-full bg-transparent border-none py-6 text-white placeholder-gray-800 focus:ring-0 resize-none font-mono text-sm leading-relaxed h-20"
            placeholder="ENTER_RESPONSE..."
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="absolute right-6 p-2 text-gray-600 hover:text-white transition-colors disabled:opacity-20"
          >
            <span className="text-xs tracking-widest">[ SUBMIT ]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
