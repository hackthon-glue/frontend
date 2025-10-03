import type { Country } from '@/types/country';

export type CompositeMood = {
  score: number;
  band: 'sad' | 'neutral' | 'happy';
};

const dayKeyFromDate = (d: Date): string => {
  const keys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return keys[d.getDay()];
};

const clampDays = (n: number): number => Math.max(0, Math.min(30, n));

export const computeCompositeMood = (country: Country): CompositeMood => {
  const sentiments = country.insights.sentiment;
  const avgSent = sentiments.length
    ? sentiments.reduce((a, b) => a + b.score, 0) / sentiments.length
    : 50;

  const t = country.insights.weatherNow.temperature;
  const distance = t < 12 ? 12 - t : t > 26 ? t - 26 : 0;
  const comfort = Math.max(0, 100 - distance * 6);

  const raw = 0.8 * avgSent + 0.2 * comfort;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  let band: CompositeMood['band'];
  if (score <= 30) band = 'sad';
  else if (score <= 70) band = 'neutral';
  else band = 'happy';

  return { score, band };
};

export const computeCompositeMoodAt = (country: Country, at: Date): CompositeMood => {
  const sentiments = country.insights.sentiment;
  const avgSent = sentiments.length
    ? sentiments.reduce((a, b) => a + b.score, 0) / sentiments.length
    : 50;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const atDate = new Date(at);
  atDate.setHours(0, 0, 0, 0);
  const diffDays = clampDays(Math.round((today.getTime() - atDate.getTime()) / (24 * 60 * 60 * 1000)));
  const idx = sentiments.length
    ? (sentiments.length - 1 - (diffDays % sentiments.length) + sentiments.length) % sentiments.length
    : 0;
  const currentSent = sentiments[idx]?.score ?? avgSent;
  const weightedSent = 0.7 * currentSent + 0.3 * avgSent;

  const temp = country.insights.weatherNow.temperature;
  const distance = temp < 12 ? 12 - temp : temp > 26 ? temp - 26 : 0;
  const comfort = Math.max(0, 100 - distance * 6);

  const raw = 0.8 * weightedSent + 0.2 * comfort;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  let band: CompositeMood['band'];
  if (score <= 30) band = 'sad';
  else if (score <= 70) band = 'neutral';
  else band = 'happy';

  return { score, band };
};
