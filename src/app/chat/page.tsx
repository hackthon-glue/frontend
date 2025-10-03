'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RAGChat from '@/components/chat/RAGChat';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const countryCode = searchParams.get('country');

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            💬 AI Insights Chat
          </h1>
          <p className="text-slate-400">
            Ask questions about country moods, panel discussions, and expert analyses
          </p>
        </header>

        <div className="h-[calc(100vh-200px)]">
          <RAGChat countryCode={countryCode || undefined} />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
