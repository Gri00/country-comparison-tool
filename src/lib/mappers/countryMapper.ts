import { CountryMeta } from "@/data/types";
import { RestCountry } from "../api/countries";
import { EMPTY_COUNTRY_META } from "@/data/emptyCountryMeta";

export function mapApiCountryToMeta(
  apiCountry: RestCountry,
): Partial<CountryMeta> {
  return {
    name: apiCountry.name?.common ?? EMPTY_COUNTRY_META.name,
    capital: apiCountry.capital?.[0] ?? "—",
    population: apiCountry.population
      ? apiCountry.population.toLocaleString()
      : "—",
    currency: apiCountry.currencies
      ? (Object.values(apiCountry.currencies)[0]?.name ?? "—")
      : "—",
    languages: apiCountry.languages
      ? Object.values(apiCountry.languages).join(", ")
      : "—",
    timezone: apiCountry.timezones?.[0] ?? "—",
  };
}
