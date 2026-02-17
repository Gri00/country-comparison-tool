export type RestCountry = {
  name: { common: string };
  capital?: string[];
  population?: number;
  currencies?: Record<string, { name: string }>;
  languages?: Record<string, string>;
  timezones?: string[];
};

export async function fetchCountryByCode(code: string): Promise<RestCountry> {
  const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`, {
    next: { revalidate: 86400 }, // 24h cache
  });

  if (!res.ok) {
    throw new Error("Failed to fetch country");
  }

  const data = await res.json();
  return data[0] as RestCountry;
}
