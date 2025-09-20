'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type {
  NameType,
  ValueType,
  TooltipPayload
} from 'recharts/types/component/DefaultTooltipContent';
import type { CountryMock } from '@/data/mockCountryData';

const tooltipClasses =
  'rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-slate-100 shadow-xl backdrop-blur-2xl';

type SentimentTooltipPayload = CountryMock['insights']['sentiment'][number];

type WeatherTooltipPayload = CountryMock['insights']['weatherTrend'][number];

type ExtendedTooltipProps<T> = TooltipProps<ValueType, NameType> & {
  payload?: Array<
    TooltipPayload<ValueType, NameType> & {
      payload?: T;
    }
  >;
};

const SentimentTooltip = ({
  active,
  payload,
  label
}: ExtendedTooltipProps<SentimentTooltipPayload>) => {
  if (!active || !payload?.length) {
    return null;
  }

  const dataPoint = payload[0]?.payload as SentimentTooltipPayload | undefined;
  if (!dataPoint) {
    return null;
  }

  return (
    <div className={tooltipClasses}>
      <p className="font-semibold">{label ?? dataPoint.date}</p>
      <p className="mt-1 text-sky-100">Sentiment: {dataPoint.score}</p>
    </div>
  );
};

const WeatherTooltip = ({
  active,
  payload,
  label
}: ExtendedTooltipProps<WeatherTooltipPayload>) => {
  if (!active || !payload?.length) {
    return null;
  }

  const dataPoint = payload[0]?.payload as WeatherTooltipPayload | undefined;
  if (!dataPoint) {
    return null;
  }

  return (
    <div className={tooltipClasses}>
      <p className="font-semibold">{label ?? dataPoint.date}</p>
      <p className="mt-1 text-sky-100">Temperature: {dataPoint.temperature}°C</p>
    </div>
  );
};

const sentimentToneStyles: Record<CountryMock['insights']['stats'][number]['sentiment'], string> = {
  positive: 'border-emerald-200/40 bg-emerald-300/10 text-emerald-100',
  neutral: 'border-slate-200/40 bg-slate-200/10 text-slate-100',
  negative: 'border-rose-200/40 bg-rose-400/10 text-rose-100'
};

const alertLevelStyles: Record<CountryMock['insights']['alerts'][number]['level'], string> = {
  info: 'border-sky-200/40 bg-sky-100/10 text-sky-100',
  watch: 'border-amber-200/40 bg-amber-100/10 text-amber-100',
  warning: 'border-rose-300/40 bg-rose-100/10 text-rose-100'
};

const tonePills: Record<CountryMock['insights']['news'][number]['tone'], string> = {
  celebratory: 'bg-orange-300/15 text-orange-100 border border-orange-200/40',
  optimistic: 'bg-emerald-300/15 text-emerald-100 border border-emerald-200/40',
  cautious: 'bg-amber-200/15 text-amber-100 border border-amber-200/40',
  urgent: 'bg-rose-300/20 text-rose-100 border border-rose-200/50'
};

export const CountryDashboard = ({ country }: CountryDashboardProps) => {
  const sentimentPoints = country.insights.sentiment;
  const firstScore = sentimentPoints[0]?.score ?? 0;
  const lastScore = sentimentPoints[sentimentPoints.length - 1]?.score ?? 0;
  const sentimentDelta = lastScore - firstScore;
  const averageSentiment = sentimentPoints.length
    ? Math.round(sentimentPoints.reduce((acc, point) => acc + point.score, 0) / sentimentPoints.length)
    : 0;

  const deltaLabel = sentimentDelta === 0 ? 'steady' : sentimentDelta > 0 ? `+${sentimentDelta}` : `${sentimentDelta}`;

  const moodNarrative = country.insights.moodNarrative;
  const weather = country.insights.weatherNow;
  const alerts = country.insights.alerts;
  const stats = country.insights.stats;

  const weatherFacts = useMemo(
    () => [
      { label: 'Feels like', value: `${weather.feelsLike}°C` },
      { label: 'Humidity', value: `${weather.humidity}%` },
      { label: 'Wind', value: weather.wind },
      { label: 'Rain chance', value: `${weather.precipitationChance}%` }
    ],
    [weather]
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_30%_-10%,rgba(56,189,248,0.25)_0%,rgba(56,189,248,0.08)_35%,transparent_65%),radial-gradient(circle_at_85%_-5%,rgba(190,242,255,0.18)_0%,rgba(14,165,233,0.1)_45%,transparent_75%),#061324] text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-16">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-300/80">Country dashboard</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-50">{country.name}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-200">
              Granular signals curated for Earth Hackathon explorations. Track localized sentiment, headline summaries, and how the week&apos;s weather is evolving.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-sky-200/60 bg-sky-100/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-sky-100 transition hover:border-sky-100 hover:bg-sky-100/30"
          >
            ← Back to globe
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="rounded-3xl border border-white/25 bg-white/10 p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-xl space-y-4">
                <p className="text-xs uppercase tracking-[0.25em] text-sky-200/90">Mood narrative</p>
                <h2 className="text-2xl font-semibold text-slate-50">{country.summary.headline}</h2>
                <p className="text-sm text-slate-200">{moodNarrative}</p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-200">
                  <div className="rounded-2xl border border-sky-200/40 bg-sky-100/10 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300">Persona</p>
                    <p className="mt-1 text-slate-100">{country.summary.persona}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200/30 bg-emerald-100/10 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300">Current weather</p>
                    <p className="mt-1 text-slate-100">{country.summary.weather}</p>
                  </div>
                </div>
              </div>
              <div className="shrink-0 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-center backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Mood score</p>
                <p className="mt-3 text-4xl font-semibold text-slate-50">{averageSentiment}</p>
                <p className="mt-2 text-sm text-emerald-200">{deltaLabel} vs last week</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-3xl border px-4 py-5 backdrop-blur-xl ${sentimentToneStyles[stat.sentiment]}`}
              >
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">{stat.label}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-semibold">{stat.value}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-white/70">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-200/80">Today&apos;s summary</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-50">地球感情ダイジェスト</h2>
            </div>
            <span className="rounded-full border border-sky-200/40 bg-sky-100/10 px-3 py-1 text-xs font-semibold text-sky-100">
              300-500字ハイライト
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-100">
            {country.insights.todaySummary}
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/25 bg-white/10 p-6 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-200/80">Sentiment (7 day)</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-50">Emotional pulse</h2>
                </div>
                <div className="rounded-full border border-emerald-200/40 bg-emerald-100/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  Net change: {deltaLabel}
                </div>
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={country.insights.sentiment}>
                    <CartesianGrid stroke="#1f2a4a" strokeDasharray="3 6" />
                    <XAxis dataKey="date" stroke="#dbeafe" tickLine={false} />
                    <YAxis stroke="#dbeafe" tickLine={false} domain={[0, 100]} />
                    <Tooltip content={<SentimentTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, stroke: '#f8fafc', fill: '#38bdf8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-3xl border border-white/25 bg-white/10 p-6 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-200/80">Weather trend</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-50">Temperature swing</h2>
                </div>
                <div className="rounded-full border border-sky-200/40 bg-sky-100/10 px-3 py-1 text-xs font-semibold text-sky-100">
                  Avg: {Math.round(country.insights.weatherTrend.reduce((acc, item) => acc + item.temperature, 0) / country.insights.weatherTrend.length)}°C
                </div>
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={country.insights.weatherTrend}>
                    <CartesianGrid stroke="#1f2a4a" strokeDasharray="3 6" />
                    <XAxis dataKey="date" stroke="#dbeafe" tickLine={false} />
                    <YAxis stroke="#dbeafe" tickLine={false} />
                    <Tooltip content={<WeatherTooltip />} />
                    <Bar dataKey="temperature" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-white/25 bg-white/10 p-6 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-200/80">Weather radar</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-50">Current conditions</h2>
                </div>
                <span className="rounded-full border border-emerald-200/40 bg-emerald-100/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  {weather.condition}
                </span>
              </div>
              <div className="mt-5 grid gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Temperature</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-50">{weather.temperature}°C</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Feels like</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-50">{weather.feelsLike}°C</p>
                </div>
                {weatherFacts.map((fact) => (
                  <div key={fact.label}>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{fact.label}</p>
                    <p className="mt-1 text-base text-slate-100">{fact.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/25 bg-white/10 p-6 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-200/80">Disaster watch</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-50">Alerts & actions</h2>
                </div>
                <span className="rounded-full border border-amber-200/40 bg-amber-100/10 px-3 py-1 text-xs font-semibold text-amber-100">
                  {alerts.length} active
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={`${alert.type}-${alert.message}`}
                    className={`rounded-2xl border px-4 py-4 text-sm backdrop-blur ${alertLevelStyles[alert.level]}`}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">{alert.type}</p>
                      <span className="rounded-full border border-white/40 bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.25em] text-white/80">
                        {alert.level}
                      </span>
                    </div>
                    <p className="mt-2 text-base text-white/90">{alert.message}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/70">Action</p>
                    <p className="mt-1 text-sm text-white/90">{alert.recommendedAction}</p>
                  </div>
                ))}
                {!alerts.length && (
                  <p className="rounded-2xl border border-emerald-200/30 bg-emerald-100/10 px-4 py-4 text-sm text-emerald-100">
                    No active alerts. Systems operating within normal parameters.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        <section className="rounded-3xl border border-white/25 bg-white/10 p-6 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-200/80">News pulse</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-50">Stories shaping sentiment</h2>
            </div>
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
              {country.insights.news.length} curated sources
            </span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {country.insights.news.map((article) => (
              <article
                key={article.title}
                className="flex h-full flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:border-sky-200/60 hover:bg-sky-100/10"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.25em] ${tonePills[article.tone]}`}>
                      {article.tone}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.25em] text-white/60">{article.category}</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-50">{article.title}</h3>
                  <p className="text-sm text-slate-200">{article.summary}</p>
                </div>
                <Link
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 hover:text-sky-100"
                >
                  View source
                  <span aria-hidden>↗</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export type CountryDashboardProps = {
  country: CountryMock;
};

export default CountryDashboard;
