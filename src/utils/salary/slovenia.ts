// src/utils/salary/slovenia.ts
import { SalaryCalculator, SalaryInput } from "./index";

export interface SloveniaInput extends SalaryInput {
  bonusWorkYearsPercent?: number; // npr. 5 za 5%
  childrenSpecial?: number;
  otherDependents?: number;
  materialCosts?: number;
}

const personalAllowance = 4500; // € godišnje
const childAllowance = 2750; // € po detetu
const childSpecialAllowance = 5500; // € po posebnem otroku
const dependentAllowance = 3000; // € po ostalem družinskem članu
const employeeContributionsRate = 0.222; // 22.2% prispevki

const taxBrackets = [
  { limit: 1646.0, rate: 0.16 },
  { limit: 2464.0, rate: 0.26 },
  { limit: 3264.0, rate: 0.33 },
  { limit: 3926.0, rate: 0.39 },
  { limit: Infinity, rate: 0.50 },
];

export function grossToNetSlovenia(input: SloveniaInput) {
let gross = input.amount;

  const  {
    children = 0,
    childrenSpecial = 0,
    otherDependents = 0,
    bonusWorkYearsPercent = 0,
    materialCosts = 0,
  } = input;

  // 1. dodatek za delovno dobo
  gross += gross * (bonusWorkYearsPercent / 100);

  // 2. prispevki zaposlenega
  const contributions = gross * employeeContributionsRate;

  // 3. bruto - prispevki = osnova za dohodnino
  let taxableIncome = gross - contributions;

  // 4. mesečne olajšave
  const monthlyAllowance =
    (personalAllowance +
      childAllowance * children +
      childSpecialAllowance * childrenSpecial +
      dependentAllowance * otherDependents) /
    12;

  taxableIncome -= monthlyAllowance;
  if (taxableIncome < 0) taxableIncome = 0;

  // 5. izračunaj porez po razredih
  let tax = 0;
  let remaining = taxableIncome;

  for (const bracket of taxBrackets) {
    const taxable = Math.min(remaining, bracket.limit);
    tax += taxable * bracket.rate;
    remaining -= taxable;
    if (remaining <= 0) break;
  }

  // 6. neto plača
  const net = gross - contributions - tax + materialCosts; // dodamo materialne stroške

  return { net, contributions, tax };
}

export function netToGrossSlovenia(input: SloveniaInput) {
  const {
    amount: netTarget,
    children = 0,
    childrenSpecial = 0,
    otherDependents = 0,
    bonusWorkYearsPercent = 0,
    materialCosts = 0,
  } = input;

  // iterativno traženje bruto da bi dobio željeno neto
  let gross = netTarget / (1 - employeeContributionsRate); // početna procena
  let result = grossToNetSlovenia({
    amount: gross,
    children,
    childrenSpecial,
    otherDependents,
    bonusWorkYearsPercent,
    materialCosts,
  }).net;

  for (let i = 0; i < 20; i++) {
    const diff = netTarget - result;
    if (Math.abs(diff) < 0.01) break;
    gross += diff;
    result = grossToNetSlovenia({
      amount: gross,
      children,
      childrenSpecial,
      otherDependents,
      bonusWorkYearsPercent,
      materialCosts,
    }).net;
  }

  const { contributions, tax } = grossToNetSlovenia({
    amount: gross,
    children,
    childrenSpecial,
    otherDependents,
    bonusWorkYearsPercent,
    materialCosts,
  });

  return { gross, contributions, tax };
}

export const SloveniaCalculator: SalaryCalculator = {
  grossToNet: (input) => grossToNetSlovenia(input).net,
  netToGross: (input) => netToGrossSlovenia(input).gross,
};
