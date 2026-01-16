import { BaseSalaryInput, CountryCalculator, MoneyBreakdown } from "./types";

export interface SloveniaInput extends BaseSalaryInput {
  bonusWorkYearsPercent?: number;
  children?: number;
  childrenSpecial?: number;
  otherDependents?: number;
  materialCosts?: number; // monthly
}

// (tvoje vrednosti allowance-a ostavljam, ali računam annual->monthly konzistentno)
const personalAllowance = 4500; // annual
const childAllowance = 2750; // annual per child
const childSpecialAllowance = 5500; // annual
const dependentAllowance = 3000; // annual

// employee contributions ~22.2% (tvoja postojeća)
const employeeContributionsRate = 0.222;

// Slovenia PIT annual brackets for 2025 (PwC)
const taxBracketsAnnual = [
  { upTo: 9210.26, rate: 0.16, baseTax: 0, over: 0 },
  { upTo: 27089.0, rate: 0.26, baseTax: 1473.64, over: 9210.26 },
  { upTo: 54178.0, rate: 0.33, baseTax: 6122.11, over: 27089.0 },
  { upTo: 78016.32, rate: 0.39, baseTax: 15061.48, over: 54178.0 },
  { upTo: Infinity, rate: 0.5, baseTax: 24358.43, over: 78016.32 },
];

function calcAnnualTax(taxableAnnual: number) {
  const b = taxBracketsAnnual.find((x) => taxableAnnual <= x.upTo)!;
  return b.baseTax + (taxableAnnual - b.over) * b.rate;
}

export function grossToNetSlovenia(input: SloveniaInput): MoneyBreakdown {
  const {
    amount,
    bonusWorkYearsPercent = 0,
    children = 0,
    childrenSpecial = 0,
    otherDependents = 0,
    materialCosts = 0,
  } = input;

  // treat amount as monthly gross
  let grossMonthly = amount;
  grossMonthly += grossMonthly * (bonusWorkYearsPercent / 100);

  const grossAnnual = grossMonthly * 12;

  const contributionsAnnual = grossAnnual * employeeContributionsRate;

  // annual allowances
  const allowanceAnnual =
    personalAllowance +
    childAllowance * children +
    childSpecialAllowance * childrenSpecial +
    dependentAllowance * otherDependents;

  let taxableAnnual = grossAnnual - contributionsAnnual - allowanceAnnual;
  if (taxableAnnual < 0) taxableAnnual = 0;

  const taxAnnual = calcAnnualTax(taxableAnnual);

  const netAnnual =
    grossAnnual - contributionsAnnual - taxAnnual + materialCosts * 12;

  return {
    gross: grossMonthly,
    net: netAnnual / 12,
    contributions: contributionsAnnual / 12,
    tax: taxAnnual / 12,
  };
}

export function netToGrossSlovenia(input: SloveniaInput): MoneyBreakdown {
  // iterative solve for monthly gross that yields target monthly net
  const targetNet = input.amount;

  let guessGross = targetNet / (1 - employeeContributionsRate); // rough start

  for (let i = 0; i < 30; i++) {
    const r = grossToNetSlovenia({ ...input, amount: guessGross });
    const diff = targetNet - r.net;
    if (Math.abs(diff) < 0.01) break;
    guessGross += diff;
  }

  const r = grossToNetSlovenia({ ...input, amount: guessGross });
  return r;
}

export const sloveniaCalculator: CountryCalculator<SloveniaInput> = {
  countryCode: "SI",
  countryName: "Slovenia",
  currency: "EUR",
  fields: [
    {
      key: "amount",
      label: "Amount (monthly)",
      step: 1,
      min: 0,
      placeholder: "e.g. 2500",
    },
    {
      key: "bonusWorkYearsPercent",
      label: "Work years bonus (%)",
      step: 0.1,
      min: 0,
    },
    { key: "children", label: "Number of children", step: 1, min: 0 },
    {
      key: "childrenSpecial",
      label: "Children with special needs",
      step: 1,
      min: 0,
    },
    { key: "otherDependents", label: "Other dependents", step: 1, min: 0 },
    {
      key: "materialCosts",
      label: "Material costs (monthly €)",
      step: 1,
      min: 0,
    },
  ],
  grossToNet: grossToNetSlovenia,
  netToGross: netToGrossSlovenia,
};
