import { notFound } from 'next/navigation';
import { CountryDashboard } from '@/components/country/CountryDashboard';
import { countries, getCountryByCode } from '@/data/mockCountryData';

type CountryPageProps = {
  params: Promise<{ code: string }>;
};

export function generateStaticParams() {
  return countries.map((country) => ({ code: country.code }));
}

export async function generateMetadata({ params }: CountryPageProps) {
  const { code } = await params;
  const country = getCountryByCode(code);
  const name = country?.name ?? 'Country insights';
  return {
    title: `${name} | Earth Insight Hub`
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { code } = await params;
  const country = getCountryByCode(code);

  if (!country) {
    notFound();
  }

  return <CountryDashboard country={country} />;
}
