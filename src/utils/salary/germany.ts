import { BaseSalaryInput, CountryCalculator, MoneyBreakdown } from "./types";

export type GermanyTaxClass = "I" | "II" | "III" | "IV" | "V" | "VI";

export interface GermanyInput extends BaseSalaryInput {
  taxClass: GermanyTaxClass;

  // kids affect care insurance (under 25 is what matters in the TK table logic)
  childrenUnder25: number;

  // church tax is 8% or 9% of income tax depending on state; user selects
  churchTax: "none" | "8" | "9";

  // if true, compute solidarity surcharge (Soli) estimate
  includeSoli: boolean;

  // statutory or private health insurance
  healthInsurance: "statutory" | "private";
  privateHealthPremiumMonthly: number; // used only if private
}

// Rates / ceilings (2025, commonly referenced)
const pensionEmployee = 0.093; // 9.3%
const unemploymentEmployee = 0.013; // 1.3%
const healthEmployeeBase = 0.073; // 7.3%
const healthAdditionalAvgTotal2025 = 0.025; // 2.5% total avg
const healthAdditionalEmployee = healthAdditionalAvgTotal2025 / 2;

const ceilingPensionUnemp = 96600;
const ceilingHealthCare = 66150;

function careEmployeeRate(childrenUnder25: number) {
  const baseTotal = 0.036;
  const childlessTotal = 0.042;

  if (childrenUnder25 <= 0) {
    return childlessTotal - 0.017;
  }

  const reduction = Math.min(Math.max(childrenUnder25 - 1, 0), 4) * 0.0025;
  const total = baseTotal - reduction;

  return Math.max(0, total - 0.017);
}

function calcEmployeeContribAnnual(grossAnnual: number, input: GermanyInput) {
  const basePU = Math.min(grossAnnual, ceilingPensionUnemp);
  const baseHC = Math.min(grossAnnual, ceilingHealthCare);

  const pension = basePU * pensionEmployee;
  const unemp = basePU * unemploymentEmployee;

  let health = 0;
  let care = 0;

  if (input.healthInsurance === "statutory") {
    health = baseHC * (healthEmployeeBase + healthAdditionalEmployee);
    care = baseHC * careEmployeeRate(input.childrenUnder25);
  } else {
    health = input.privateHealthPremiumMonthly * 12;
    care = 0;
  }

  return pension + unemp + health + care;
}

function calcIncomeTaxAnnual2025(x: number) {
  const income = Math.floor(x);

  if (income <= 12096) return 0;
  if (income <= 17443) {
    const y = (income - 12096) / 10000;
    return Math.floor((932.3 * y + 1400) * y);
  }
  if (income <= 68480) {
    const z = (income - 17443) / 10000;
    return Math.floor((176.64 * z + 2397) * z + 1015.13);
  }
  if (income <= 277825) return Math.floor(0.42 * income - 10911.92);
  return Math.floor(0.45 * income - 19246.67);
}

function adjustForTaxClass(taxableAnnual: number, taxClass: GermanyTaxClass) {
  if (taxClass === "III") return taxableAnnual * 0.85;
  if (taxClass === "V") return taxableAnnual * 1.12;
  if (taxClass === "VI") return taxableAnnual * 1.18;
  if (taxClass === "II") return taxableAnnual * 0.95;
  return taxableAnnual;
}
function calcSoli(incomeTaxAnnual: number, taxClass: GermanyTaxClass) {
  const threshold = taxClass === "III" || taxClass === "IV" ? 39900 : 19950;
  if (incomeTaxAnnual <= threshold) return 0;
  return incomeTaxAnnual * 0.055;
}

export function grossToNetGermany(input: GermanyInput): MoneyBreakdown {
  const grossMonthly = input.amount;
  const grossAnnual = grossMonthly * 12;

  const contributionsAnnual = calcEmployeeContribAnnual(grossAnnual, input);

  let taxableAnnual = Math.max(0, grossAnnual - contributionsAnnual);
  taxableAnnual = adjustForTaxClass(taxableAnnual, input.taxClass);

  const incomeTaxAnnual = calcIncomeTaxAnnual2025(taxableAnnual);

  const churchRate =
    input.churchTax === "none" ? 0 : input.churchTax === "8" ? 0.08 : 0.09;
  const churchTaxAnnual = incomeTaxAnnual * churchRate;

  const soliAnnual = input.includeSoli
    ? calcSoli(incomeTaxAnnual, input.taxClass)
    : 0;

  const totalTaxAnnual = incomeTaxAnnual + churchTaxAnnual + soliAnnual;
  const netAnnual = grossAnnual - contributionsAnnual - totalTaxAnnual;

  return {
    gross: grossMonthly,
    net: netAnnual / 12,
    contributions: contributionsAnnual / 12,
    tax: totalTaxAnnual / 12,
  };
}

export function netToGrossGermany(input: GermanyInput): MoneyBreakdown {
  const targetNet = input.amount;
  let guessGross = targetNet / 0.7;

  for (let i = 0; i < 40; i++) {
    const r = grossToNetGermany({ ...input, amount: guessGross });
    const diff = targetNet - r.net;
    if (Math.abs(diff) < 0.01) break;
    guessGross += diff;
  }

  return grossToNetGermany({ ...input, amount: guessGross });
}

export const germanyCalculator: CountryCalculator<GermanyInput> = {
  countryCode: "DE",
  countryName: "Germany",
  currency: "EUR",
  fields: [
    { key: "amount", label: "Amount (monthly)", placeholder: "e.g. 3500" },
    {
      key: "taxClass",
      label: "Tax class",
      type: "select",
      options: [
        { value: "I", label: "I" },
        { value: "II", label: "II (single parent)" },
        { value: "III", label: "III" },
        { value: "IV", label: "IV" },
        { value: "V", label: "V" },
        { value: "VI", label: "VI" },
      ],
    },
    {
      key: "churchTax",
      label: "Church tax",
      type: "select",
      options: [
        { value: "none", label: "None" },
        { value: "8", label: "8%" },
        { value: "9", label: "9%" },
      ],
    },
    {
      key: "healthInsurance",
      label: "Health insurance",
      type: "select",
      options: [
        { value: "statutory", label: "Statutory (GKV)" },
        { value: "private", label: "Private (PKV)" },
      ],
    },
    {
      key: "childrenUnder25",
      label: "Children under 25 (for care insurance)",
      step: 1,
      min: 0,
    },
    {
      key: "privateHealthPremiumMonthly",
      label: "Private health premium (monthly €)",
      step: 1,
      min: 0,
    },
    {
      key: "includeSoli",
      label: "Include solidarity surcharge (Soli)",
      type: "checkbox",
    },
  ],

  grossToNet: grossToNetGermany,
  netToGross: netToGrossGermany,
};
