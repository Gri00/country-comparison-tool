import { BaseSalaryInput, CountryCalculator, MoneyBreakdown } from "./types";

export type SwissCanton = "ZH" | "BE" | "LU" | "BS" | "GE";
export type SwissMaritalStatus = "single" | "married";

export interface SwitzerlandInput extends BaseSalaryInput {
  canton: SwissCanton;
  maritalStatus: SwissMaritalStatus;
  children: number;

  churchTax: boolean;

  pensionEmployeeRate: number; // e.g. 0.07 (7%), varies by age/company
  healthInsuranceMonthly: number; // flat premium, not salary-based
}

const ahvIvEo = 0.053; // AHV/IV/EO 5.3%
const alv = 0.011; // Unemployment 1.1% (up to ceiling)
const alvCeiling = 148200;

const cantonBaseTaxRate: Record<SwissCanton, number> = {
  ZH: 0.11,
  BE: 0.13,
  LU: 0.1,
  BS: 0.14,
  GE: 0.15,
};

function calcSocialContribAnnual(grossAnnual: number, input: SwitzerlandInput) {
  const ahv = grossAnnual * ahvIvEo;

  const alvBase = Math.min(grossAnnual, alvCeiling);
  const unemployment = alvBase * alv;

  const pension = grossAnnual * input.pensionEmployeeRate;

  return ahv + unemployment + pension;
}

function calcEffectiveTaxRate(input: SwitzerlandInput) {
  let rate = cantonBaseTaxRate[input.canton];

  if (input.maritalStatus === "married") {
    rate *= 0.85;
  }

  if (input.children > 0) {
    rate *= 1 - Math.min(input.children * 0.05, 0.2);
  }

  if (input.churchTax) {
    rate += 0.01;
  }

  return rate;
}

function calcIncomeTaxAnnual(taxableAnnual: number, input: SwitzerlandInput) {
  const rate = calcEffectiveTaxRate(input);

  // Add mild progression simulation
  if (taxableAnnual > 150000) return taxableAnnual * (rate + 0.03);
  if (taxableAnnual > 100000) return taxableAnnual * (rate + 0.015);

  return taxableAnnual * rate;
}

export function grossToNetSwitzerland(input: SwitzerlandInput): MoneyBreakdown {
  const grossMonthly = input.amount;
  const grossAnnual = grossMonthly * 12;

  const contributionsAnnual = calcSocialContribAnnual(grossAnnual, input);

  const taxableAnnual = Math.max(0, grossAnnual - contributionsAnnual);

  const incomeTaxAnnual = calcIncomeTaxAnnual(taxableAnnual, input);

  const healthAnnual = input.healthInsuranceMonthly * 12;

  const totalDeductions = contributionsAnnual + incomeTaxAnnual + healthAnnual;

  const netAnnual = grossAnnual - totalDeductions;

  return {
    gross: grossMonthly,
    net: netAnnual / 12,
    contributions: contributionsAnnual / 12,
    tax: incomeTaxAnnual / 12 + healthAnnual / 12,
  };
}

export function netToGrossSwitzerland(input: SwitzerlandInput): MoneyBreakdown {
  const targetNet = input.amount;
  let guessGross = targetNet / 0.75;

  for (let i = 0; i < 40; i++) {
    const r = grossToNetSwitzerland({
      ...input,
      amount: guessGross,
    });

    const diff = targetNet - r.net;

    if (Math.abs(diff) < 0.01) break;

    guessGross += diff;
  }

  return grossToNetSwitzerland({
    ...input,
    amount: guessGross,
  });
}

export const switzerlandCalculator: CountryCalculator<SwitzerlandInput> = {
  countryCode: "CH",
  countryName: "Switzerland",
  currency: "CHF",

  fields: [
    { key: "amount", label: "Amount (monthly)", placeholder: "e.g. 6000" },

    {
      key: "canton",
      label: "Canton",
      type: "select",
      options: [
        { value: "ZH", label: "Zurich (ZH)" },
        { value: "BE", label: "Bern (BE)" },
        { value: "LU", label: "Lucerne (LU)" },
        { value: "BS", label: "Basel-Stadt (BS)" },
        { value: "GE", label: "Geneva (GE)" },
      ],
    },

    {
      key: "maritalStatus",
      label: "Marital status",
      type: "select",
      options: [
        { value: "single", label: "Single" },
        { value: "married", label: "Married" },
      ],
    },

    {
      key: "children",
      label: "Number of children",
      step: 1,
      min: 0,
    },

    {
      key: "pensionEmployeeRate",
      label: "Pension employee rate (e.g. 0.07 = 7%)",
      step: 0.01,
      min: 0,
    },

    {
      key: "healthInsuranceMonthly",
      label: "Health insurance premium (monthly CHF)",
      step: 10,
      min: 0,
    },

    {
      key: "churchTax",
      label: "Church tax",
      type: "checkbox",
    },
  ],

  grossToNet: grossToNetSwitzerland,
  netToGross: netToGrossSwitzerland,
};
