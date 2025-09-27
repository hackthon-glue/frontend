import { notFound } from 'next/navigation';
import CountryDashboard from '@/components/country/CountryDashboard';
import { countries, getCountryByCode } from '@/data/mockCountryData';

type CountryPageProps = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ date?: string }>;
};

export function generateStaticParams() {
  return countries.map((country) => ({ code: country.code }));
}

export async function generateMetadata({ params, searchParams }: CountryPageProps) {
  const { code } = await params;
  const { date } = await searchParams;
  const country = getCountryByCode(code);
  const name = country?.name ?? 'Country insights';
  const suffix = date ? ` (as of ${date})` : '';
  return {
    title: `${name}${suffix} | Earth Insight Hub`
  };
}

export default async function CountryPage({ params, searchParams }: CountryPageProps) {
  const { code } = await params;
  const { date } = await searchParams;
  const country = getCountryByCode(code);

  if (!country) {
    notFound();
  }

  const asOf = date ? new Date(date) : undefined;

  return <CountryDashboard country={country} asOf={asOf} />;
}
