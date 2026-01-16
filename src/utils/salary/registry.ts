import { CountryCalculator, BaseSalaryInput } from "./types";
import { sloveniaCalculator } from "./slovenia";
import { austriaCalculator } from "./austria";
import { germanyCalculator } from "./germany";

export const CALCULATORS = {
  SI: sloveniaCalculator,
  AT: austriaCalculator,
  DE: germanyCalculator,
} as const;

export type SupportedCountryCode = keyof typeof CALCULATORS;

/**
 * Returns a calculator typed to at least BaseSalaryInput.
 * Country-specific extra fields are handled by the UI dynamically.
 */
export function getCalculator(
  code: SupportedCountryCode
): CountryCalculator<BaseSalaryInput> {
  return CALCULATORS[code] as unknown as CountryCalculator<BaseSalaryInput>;
}
