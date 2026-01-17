import { BaseSalaryInput, CountryCalculator, MoneyBreakdown } from "./types";

export interface AustriaInput extends BaseSalaryInput {
  salariesPerYear: "12" | "14";
  childrenUnder18: number;
  children18Plus: number;
  includeFamilyBonusPlus: boolean;
  includeChildDeduction: boolean;
}

const employeeSocialRate = 0.1807;

// Austria 2025 brackets
const brackets2025 = [
  { upTo: 13308, rate: 0.0 },
  { upTo: 21617, rate: 0.2 },
  { upTo: 35836, rate: 0.3 },
  { upTo: 69166, rate: 0.4 },
  { upTo: 103072, rate: 0.48 },
  { upTo: 1_000_000, rate: 0.5 },
  { upTo: Infinity, rate: 0.55 },
];

function calcAnnualTax(taxable: number) {
  let tax = 0;
  let prev = 0;
  for (const b of brackets2025) {
    const slice = Math.min(taxable, b.upTo) - prev;
    if (slice > 0) tax += slice * b.rate;
    prev = b.upTo;
    if (taxable <= b.upTo) break;
  }
  return tax;
}

function familyBonusAnnual(input: AustriaInput) {
  // amounts per year
  const under18 = 2000.16;
  const over18 = 700.08;
  return input.childrenUnder18 * under18 + input.children18Plus * over18;
}

function childDeductionAnnual(input: AustriaInput) {
  // 70.90 per month per child
  const kids = input.childrenUnder18 + input.children18Plus;
  return kids * 70.9 * 12;
}

export function grossToNetAustria(input: AustriaInput): MoneyBreakdown {
  const grossMonthly = input.amount;
  const salaries = input.salariesPerYear === "14" ? 14 : 12;

  const grossAnnual = grossMonthly * salaries;

  const contributionsAnnual = grossAnnual * employeeSocialRate;
  const taxableAnnual = Math.max(0, grossAnnual - contributionsAnnual);

  let taxAnnual = calcAnnualTax(taxableAnnual);

  // Apply tax credits (cannot reduce below 0 for this simple model)
  if (input.includeFamilyBonusPlus) {
    taxAnnual = Math.max(0, taxAnnual - familyBonusAnnual(input));
  }
  if (input.includeChildDeduction) {
    taxAnnual = Math.max(0, taxAnnual - childDeductionAnnual(input));
  }

  const netAnnual = grossAnnual - contributionsAnnual - taxAnnual;

  // Return “monthly” normalized to 12 months (so net shown is comparable)
  return {
    gross: grossMonthly,
    net: netAnnual / 12,
    contributions: contributionsAnnual / 12,
    tax: taxAnnual / 12,
  };
}

export function netToGrossAustria(input: AustriaInput): MoneyBreakdown {
  const targetNetMonthly = input.amount;

  let guessGross = targetNetMonthly / (1 - employeeSocialRate);

  for (let i = 0; i < 40; i++) {
    const r = grossToNetAustria({ ...input, amount: guessGross });
    const diff = targetNetMonthly - r.net;
    if (Math.abs(diff) < 0.01) break;
    guessGross += diff;
  }

  return grossToNetAustria({ ...input, amount: guessGross });
}

export const austriaCalculator: CountryCalculator<AustriaInput> = {
  countryCode: "AT",
  countryName: "Austria",
  currency: "EUR",
  fields: [
    { key: "amount", label: "Amount (monthly)", placeholder: "e.g. 3200" },
    {
      key: "salariesPerYear",
      label: "Salaries per year",
      type: "select",
      options: [
        { value: "12", label: "12 salaries" },
        { value: "14", label: "14 salaries (incl. 13th/14th)" },
      ],
    },
    { key: "childrenUnder18", label: "Children under 18", step: 1, min: 0 },
    { key: "children18Plus", label: "Children 18+", step: 1, min: 0 },
    {
      key: "includeFamilyBonusPlus",
      label: "Apply Family Bonus Plus",
      type: "checkbox",
    },
    {
      key: "includeChildDeduction",
      label: "Apply child deduction (tax credit)",
      type: "checkbox",
    },
  ],
  grossToNet: grossToNetAustria,
  netToGross: netToGrossAustria,
};
