// lib/queries/getCountryMeta.ts
import { COUNTRY_META } from "@/data/countries";
import { RestCountry } from "../api/countries";
import { EMPTY_COUNTRY_META } from "@/data/emptyCountryMeta";
import { mapApiCountryToMeta } from "../mappers/countryMapper";
import { CountryMeta } from "@/data/types";

export async function getCountryMeta(code: string): Promise<CountryMeta> {
  const baseMeta = COUNTRY_META[code] ?? EMPTY_COUNTRY_META;

  try {
    const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    if (!res.ok) throw new Error("API failed");

    const data: RestCountry[] = await res.json();
    const apiMeta = mapApiCountryToMeta(data[0]);

    return { ...baseMeta, ...apiMeta };
  } catch {
    return baseMeta;
  }
}
