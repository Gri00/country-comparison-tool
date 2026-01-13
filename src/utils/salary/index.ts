import { SloveniaCalculator } from "./slovenia";

export type Country = "slovenia"; // kasnije dodaj "austria" | "germany" itd.

export interface SalaryInput {
  amount: number;
  children?: number;
}

export interface SalaryCalculator {
  grossToNet: (input: SalaryInput) => number;
  netToGross: (input: SalaryInput) => number;
}

const calculators: Record<string, SalaryCalculator> = {
  slovenia: SloveniaCalculator,
  // austria: AustriaCalculator,
  // germany: GermanyCalculator,
};

export const getCalculator = (country: Country): SalaryCalculator => {
  return calculators[country];
};