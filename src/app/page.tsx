'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Globe } from '@/components/globe/Globe';
import { countries as mockCountries, type CountryMock } from '@/data/mockCountryData';

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<CountryMock | null>(null);

  const countries = useMemo(() => mockCountries, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0">
        <Globe countries={countries} onSelect={setSelectedCountry} />
      </div>

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col justify-between bg-gradient-to-b from-sky-900/30 via-slate-800/10 to-slate-950/60">
        <header className="px-6 pt-10 sm:px-12">
          <div className="pointer-events-auto max-w-xl rounded-2xl border border-white/30 bg-white/10 p-6 shadow-[0_25px_80px_-40px_rgba(56,189,248,0.85)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-300/80">Earth Insight Hub</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl">
              Navigate the planet, surface signals, and drop into local dashboards instantly.
            </h1>
            <p className="mt-4 text-sm text-slate-200">
              Drag to orbit, scroll to zoom, and tap a glowing beacon to reveal live sentiment, weather stories, and an AI-generated persona for that region.
            </p>
          </div>
        </header>

        <aside className="px-6 pb-10 sm:px-12">
          <div className="pointer-events-auto max-w-sm rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-200/90">Active regions</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {countries.map((country) => (
                <li key={country.code} className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-50">{country.name}</span>
                  <button
                    type="button"
                    className="rounded-full border border-sky-200/60 bg-sky-100/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-100 transition hover:border-sky-200 hover:bg-sky-100/20"
                    onClick={() => setSelectedCountry(country)}
                  >
                    Focus
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {selectedCountry && (
        <div className="pointer-events-auto fixed inset-x-4 bottom-10 z-20 mx-auto max-w-2xl rounded-3xl border border-white/40 bg-white/15 p-6 shadow-[0_30px_90px_-45px_rgba(56,189,248,1)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-200/90">{selectedCountry.name}</p>
              <div className="mt-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-200/90">News signal</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-50">
                  {selectedCountry.insights.news[0]?.title ?? selectedCountry.summary.headline}
                </h2>
                <p className="mt-2 text-sm text-slate-200">
                  {selectedCountry.insights.news[0]?.summary ?? selectedCountry.summary.headline}
                </p>
              </div>
              <div className="mt-3 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-300">Weather</p>
                  <p className="mt-1 leading-relaxed text-slate-100">{selectedCountry.summary.weather}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-300">Persona</p>
                  <p className="mt-1 leading-relaxed text-slate-100">{selectedCountry.summary.persona}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-300">Deep dive</p>
                  <Link
                    href={`/country/${selectedCountry.code}`}
                    className="mt-1 inline-flex items-center gap-2 rounded-full border border-sky-200/60 bg-sky-100/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-100 transition hover:border-sky-100 hover:bg-sky-100/30"
                  >
                    Open dashboard
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-100 transition hover:border-white/60 hover:bg-white/20"
              onClick={() => setSelectedCountry(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
