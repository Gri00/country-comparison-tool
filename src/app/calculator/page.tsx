"use client";

import { useMemo, useState } from "react";
import InputField from "@/app/components/InputField";
import ResultRow from "@/app/components/ResultRow";
import BackToHome from "@/app/components/BackToHome";
import ToggleField from "@/app/components/ToggleField";

import { CALCULATORS, SupportedCountryCode } from "@/utils/salary/registry";
import { InputFieldDef } from "@/utils/salary/types";

type Direction = "grossToNet" | "netToGross";

export default function SalaryCalculatorPage() {
  const [country, setCountry] = useState<SupportedCountryCode>("SI");
  const [direction, setDirection] = useState<Direction>("grossToNet");

  const calculator = useMemo(() => CALCULATORS[country], [country]);

  const [input, setInput] = useState<Record<string, string | number | boolean>>(
    () => {
      const obj: Record<string, string | number | boolean> = {};
      for (const f of CALCULATORS["SI"].fields) {
        if (f.type === "checkbox") obj[f.key] = false;
        else if (f.type === "select") obj[f.key] = f.options[0]?.value ?? "";
        else obj[f.key] = 0;
      }
      return obj;
    }
  );

  const [result, setResult] = useState<{
    gross: number;
    net: number;
    contributions: number;
    tax: number;
  } | null>(null);

  const onCountryChange = (code: SupportedCountryCode) => {
    setCountry(code);
    const obj: Record<string, string | number | boolean> = {};
    for (const f of CALCULATORS[code].fields) {
      if (f.type === "checkbox") obj[f.key] = false;
      else if (f.type === "select") obj[f.key] = f.options[0]?.value ?? "";
      else obj[f.key] = 0;
    }
    setInput(obj);
    setResult(null);
  };

  const setNumber = (key: string, value: string) => {
    setInput((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const setSelect = (key: string, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const setCheckbox = (key: string, checked: boolean) => {
    setInput((prev) => ({ ...prev, [key]: checked }));
  };

  const calculate = () => {
    const payload = input as unknown;
    const r =
      direction === "grossToNet"
        ? calculator.grossToNet(payload as never)
        : calculator.netToGross(payload as never);
    setResult(r);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-neutral-800/70 backdrop-blur rounded-2xl shadow-xl p-8">
        <BackToHome />

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-400">
            Salary Calculator
          </h1>
          <p className="text-neutral-400 mt-2">
            Gross ↔ Net estimate with breakdown
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="text-sm text-neutral-300 block mb-2">
              Country
            </label>
            <select
              value={country}
              onChange={(e) =>
                onCountryChange(e.target.value as SupportedCountryCode)
              }
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3"
            >
              {Object.entries(CALCULATORS).map(([code, c]) => (
                <option key={code} value={code}>
                  {c.countryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-neutral-300 block mb-2">Mode</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3"
            >
              <option value="grossToNet">Gross → Net</option>
              <option value="netToGross">Net → Gross</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calculator.fields.map((f: InputFieldDef<any>) => {
            if (f.type === "select") {
              return (
                <div key={f.key}>
                  <label className="block text-sm text-neutral-400 mb-1">
                    {f.label}
                  </label>
                  <select
                    value={String(input[f.key] ?? "")}
                    onChange={(e) => setSelect(f.key, e.target.value)}
                    className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-neutral-100
                      focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  >
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (f.type === "checkbox") {
              return (
                <ToggleField
                  key={f.key}
                  label={f.label}
                  checked={Boolean(input[f.key])}
                  onChange={(checked) => setCheckbox(f.key, checked)}
                />
              );
            }

            return (
              <InputField
                key={f.key}
                label={f.label}
                value={
                  typeof input[f.key] === "number"
                    ? (input[f.key] as number)
                    : 0
                }
                onChange={(v) => setNumber(f.key, v)}
                placeholder={f.placeholder}
              />
            );
          })}
        </div>

        <button
          onClick={calculate}
          className="w-full mt-6 bg-emerald-500 text-neutral-900 font-semibold py-3 rounded-xl hover:bg-emerald-400 transition"
        >
          Calculate
        </button>

        {result && (
          <div className="mt-8 bg-linear-to-br from-sky-900 to-sky-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-sky-300 mb-4">
              Result (monthly, {calculator.currency})
            </h2>
            <div className="space-y-2 text-sky-100">
              <ResultRow label="Net" value={result.net} highlight />
              <ResultRow label="Gross" value={result.gross} />
              <ResultRow
                label="Employee contributions"
                value={result.contributions}
              />
              <ResultRow label="Income tax" value={result.tax} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
