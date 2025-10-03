export type SentimentPoint = {
  date: string;
  score: number;
};

export type NewsTone = 'optimistic' | 'cautious' | 'urgent' | 'celebratory';

export type NewsItem = {
  title: string;
  summary: string;
  url: string;
  category: string;
  tone: NewsTone;
};

export type WeatherDetail = {
  condition: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  wind: string;
  precipitationChance: number;
};

export type CountrySummary = {
  headline: string;
  weather: string;
  persona: string;
};

export type CountryInsights = {
  sentiment: SentimentPoint[];
  news: NewsItem[];
  weatherNow: WeatherDetail;
  moodNarrative: string;
  todaySummary: string;
};

export type Country = {
  code: string;
  name: string;
  lat: number;
  lng: number;
  summary: CountrySummary;
  insights: CountryInsights;
};
