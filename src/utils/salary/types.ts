export type SalaryDirection = "grossToNet" | "netToGross";

export type MoneyBreakdown = {
  gross: number;
  net: number;
  contributions: number;
  tax: number;
};

export type BaseSalaryInput = {
  amount: number; // monthly amount (gross or net depending on direction)
};

export type FieldType = "number" | "select" | "checkbox";

export type SelectOption = { value: string; label: string };

export type InputFieldDef<T> =
  | {
      key: keyof T & string;
      label: string;
      type?: "number";
      step?: number;
      min?: number;
      placeholder?: string;
    }
  | {
      key: keyof T & string;
      label: string;
      type: "select";
      options: SelectOption[];
    }
  | {
      key: keyof T & string;
      label: string;
      type: "checkbox";
    };

export type CountryCalculator<TInput extends BaseSalaryInput> = {
  countryCode: string;
  countryName: string;
  currency: string;
  fields: InputFieldDef<TInput>[];
  grossToNet: (input: TInput) => MoneyBreakdown;
  netToGross: (input: TInput) => MoneyBreakdown;
};
