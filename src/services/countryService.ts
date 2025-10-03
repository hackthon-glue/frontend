import type { Country } from '@/types/country';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

const buildUrl = (path: string): string => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

const defaultFetchOptions: RequestInit = {
  cache: 'no-store',
  headers: {
    Accept: 'application/json'
  }
};

export const fetchCountries = async (): Promise<Country[]> => {
  const res = await fetch(buildUrl('/countries/'), defaultFetchOptions);
  if (!res.ok) {
    throw new Error(`Failed to load countries: ${res.status}`);
  }
  return (await res.json()) as Country[];
};

export const fetchCountryByCode = async (code: string): Promise<Country | null> => {
  const res = await fetch(buildUrl(`/countries/${code}/`), defaultFetchOptions);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to load country ${code}: ${res.status}`);
  }
  return (await res.json()) as Country;
};
