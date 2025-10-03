'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchPanelByCountry } from '@/services/panelService';
import type { PanelDiscussion } from '@/types/panel';

export default function PanelDiscussionPage() {
  const params = useParams();
  const router = useRouter();
  const countryCode = params.code as string;

  const [panel, setPanel] = useState<PanelDiscussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPanel() {
      try {
        setLoading(true);
        const data = await fetchPanelByCountry(countryCode);
        setPanel(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load panel discussion');
      } finally {
        setLoading(false);
      }
    }

    loadPanel();
  }, [countryCode]);

  const getMoodEmoji = (mood: 'happy' | 'neutral' | 'sad') => {
    switch (mood) {
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'sad': return '😢';
    }
  };

  const getMoodColor = (mood: 'happy' | 'neutral' | 'sad') => {
    switch (mood) {
      case 'happy': return 'text-green-400';
      case 'neutral': return 'text-yellow-400';
      case 'sad': return 'text-red-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading panel discussion...</div>
      </div>
    );
  }

  if (error || !panel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error || 'Panel discussion not found'}</div>
          <Link
            href={`/country/${countryCode}`}
            className="inline-flex items-center gap-2 rounded-full border border-sky-200/60 bg-sky-100/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-sky-100 transition hover:border-sky-100 hover:bg-sky-100/30"
          >
            ← Back to Country
          </Link>
        </div>
      </div>
    );
  }

  // Group analyses by round
  const analysesByRound = panel.analyses.reduce((acc, analysis) => {
    if (!acc[analysis.round_number]) {
      acc[analysis.round_number] = [];
    }
    acc[analysis.round_number].push(analysis);
    return acc;
  }, {} as Record<number, typeof panel.analyses>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/country/${countryCode}`}
            className="inline-flex items-center gap-2 rounded-full border border-sky-200/60 bg-sky-100/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-sky-100 transition hover:border-sky-100 hover:bg-sky-100/30 mb-6"
          >
            ← Back to Country
          </Link>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {countryCode} Panel Discussion
                </h1>
                <p className="text-purple-300 text-sm">
                  {new Date(panel.discussion_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-6xl ${getMoodColor(panel.final_mood)}`}>
                  {getMoodEmoji(panel.final_mood)}
                </div>
                <div className="text-white text-2xl font-bold mt-2">
                  {Number(panel.final_score).toFixed(1)}
                </div>
              </div>
            </div>

            <h2 className="text-xl text-purple-200 font-semibold mb-4">Topic</h2>
            <p className="text-white text-lg">{panel.topic}</p>
          </div>
        </div>

        {/* Introduction */}
        {panel.introduction && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-8">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">Introduction</h3>
            <p className="text-white/90 leading-relaxed">{panel.introduction}</p>
          </div>
        )}

        {/* Expert Analyses by Round */}
        {Object.keys(analysesByRound).length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Expert Analyses</h3>
            {Object.entries(analysesByRound)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([round, analyses]) => (
                <div key={round} className="mb-6">
                  <h4 className="text-lg font-semibold text-purple-300 mb-3">Round {round}</h4>
                  <div className="grid gap-4">
                    {analyses.map((analysis, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-5"
                      >
                        <div className="text-sm font-semibold text-purple-400 mb-2">
                          {analysis.expert_role}
                        </div>
                        <p className="text-white/90 leading-relaxed">{analysis.analysis_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Votes */}
        {panel.votes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Expert Votes</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {panel.votes.map((vote, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-purple-400">
                      {vote.expert_role}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl ${getMoodColor(vote.vote_mood)}`}>
                        {getMoodEmoji(vote.vote_mood)}
                      </span>
                      <span className="text-white/70 text-sm">
                        {(Number(vote.confidence) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">{vote.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript */}
        {panel.transcripts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Discussion Transcript</h3>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-4">
              {panel.transcripts
                .sort((a, b) => a.turn_order - b.turn_order)
                .map((transcript, idx) => (
                  <div key={idx} className="border-l-2 border-purple-500/30 pl-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-purple-400 font-semibold text-sm">
                        {transcript.speaker}
                      </span>
                      {transcript.round_number && (
                        <span className="text-white/50 text-xs">Round {transcript.round_number}</span>
                      )}
                      <span className="text-white/50 text-xs">Turn {transcript.turn_order}</span>
                    </div>
                    <p className="text-white/90 leading-relaxed">{transcript.content}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Conclusion */}
        {panel.conclusion && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">Conclusion</h3>
            <p className="text-white/90 leading-relaxed">{panel.conclusion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
