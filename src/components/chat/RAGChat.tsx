'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  citations?: Array<{
    content: string;
    metadata?: Record<string, any>;
  }>;
};

type RAGChatProps = {
  countryCode?: string;
  apiUrl?: string;
};

export default function RAGChat({ countryCode, apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' }: RAGChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session ID
  useEffect(() => {
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/insights/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          session_id: sessionId,
          country_code: countryCode
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date().toISOString(),
          citations: data.data.citations || []
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">🤖 AI Insights Chat</h3>
          {countryCode && (
            <p className="text-xs text-slate-400">Context: {countryCode}</p>
          )}
        </div>
        <button
          onClick={clearChat}
          className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-8">
            <p className="text-lg mb-2">👋 Ask me anything!</p>
            <div className="text-sm space-y-1">
              <p>• "What's the current mood in Japan?"</p>
              <p>• "Why did experts vote neutral?"</p>
              <p>• "Compare France and Germany"</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Sources:</p>
                  {msg.citations.slice(0, 2).map((citation, cidx) => (
                    <div key={cidx} className="text-xs text-slate-300 bg-slate-900 p-2 rounded mt-1">
                      {citation.content.substring(0, 100)}...
                      {citation.metadata && (
                        <span className="text-slate-500 ml-2">
                          ({citation.metadata.country || 'N/A'})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {msg.timestamp && (
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-200">
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about country insights..."
            className="flex-1 bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
