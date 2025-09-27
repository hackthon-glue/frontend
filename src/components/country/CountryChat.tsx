'use client';

import { useEffect, useRef, useState } from 'react';
import type { CountryMock } from '@/data/mockCountryData';
import { computeCompositeMood } from '@/data/mockCountryData';

export type CountryChatProps = {
  country: CountryMock;
  asOf?: Date;
};

type ChatMessage = {
  id: string;
  role: 'agent' | 'user';
  text: string;
  ts: number;
};

const ChatIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M7 17.5c-.9 0-1.35 0-1.71-.15a2 2 0 0 1-1.14-1.14C4 15.85 4 15.4 4 14.5V9a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5h-4.38a2 2 0 0 0-1.1.33L6.9 18.9c-.36.24-.8-.1-.73-.55l.27-1.85c.05-.37.08-.55.08-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CountryChat = ({ country }: CountryChatProps) => {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const mood = computeCompositeMood(country);
    const label = mood.band === 'happy' ? 'Happy' : mood.band === 'neutral' ? 'Neutral' : 'Sad';
    const hello: ChatMessage = {
      id: 'm0',
      role: 'agent',
      ts: Date.now(),
      text: `Hi! I’m the ${country.name} agent. Our mood reads ${label} (${mood.score}/100). Ask me about news, weather, or context.`
    };
    return [hello];
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // On mobile, start collapsed; on desktop, start open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.matchMedia('(max-width: 639px)').matches; // < sm
      if (isMobile) setOpen(false);
    }
  }, []);

  const agentReply = (userText: string): string => {
    const mood = computeCompositeMood(country);
    const label = mood.band === 'happy' ? 'upbeat' : mood.band === 'neutral' ? 'balanced' : 'careful';
    const hint = country.summary.persona;
    if (/weather|temp|気温|天気/i.test(userText)) {
      return `In ${country.name}, capital weather is: ${country.summary.weather}. Overall comfort feels ${label}.`;
    }
    if (/news|headline|ニュース|トピック/i.test(userText)) {
      const top = country.insights.news[0];
      return top
        ? `Top headline: “${top.title}”. Summary: ${top.summary}`
        : `I’m tracking a ${label} flow of headlines today.`;
    }
    return `I hear you. From a ${label} standpoint, I’d say: ${hint}`;
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const id = `u-${Date.now()}`;
    setMessages((m) => [...m, { id, role: 'user', text, ts: Date.now() }]);
    // mock agent response
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'agent',
        text: agentReply(text),
        ts: Date.now()
      };
      setMessages((m) => [...m, reply]);
    }, 650);
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40">
      {!open && (
        <button
          type="button"
          className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-slate-100 shadow-xl backdrop-blur hover:border-white/50 hover:bg-white/20 sm:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <ChatIcon />
        </button>
      )}

      {open && (
        <div className="pointer-events-auto flex w-[340px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-white/25 bg-slate-900/80 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-300">Country agent</p>
              <p className="text-sm font-semibold text-slate-100">{country.name}</p>
            </div>
            {/* Minimize only on mobile */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-100 hover:border-white/40 hover:bg-white/20 sm:hidden"
            >
              Minimize
            </button>
          </div>
          <div ref={scrollRef} className="max-h-[300px] min-h-[220px] space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[80%] rounded-2xl border border-sky-300/40 bg-sky-100/10 px-3 py-2 text-sm text-sky-100'
                      : 'max-w-[80%] rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-slate-100'
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 px-3 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Ask ${country.name} agent…`}
              className="flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={send}
              className="inline-flex items-center gap-2 rounded-md border border-sky-300/50 bg-sky-100/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100 hover:border-sky-200 hover:bg-sky-100/20"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryChat;
