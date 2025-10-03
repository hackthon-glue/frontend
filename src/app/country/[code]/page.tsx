'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import CountryDashboard from '@/components/country/CountryDashboard';
import { fetchCountryByCode } from '@/services/countryService';
import type { Country } from '@/types/country';

export default function CountryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;
  const dateParam = searchParams.get('date');

  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchCountryByCode(code)
      .then((data) => {
        if (!active) return;
        setCountry(data);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError('Unable to load country data.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [code]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p>Loading country data...</p>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-rose-300">{error ?? 'Country not found.'}</p>
      </div>
    );
  }

  const asOf = dateParam ? new Date(dateParam) : undefined;

  return <CountryDashboard country={country} asOf={asOf} />;
}
