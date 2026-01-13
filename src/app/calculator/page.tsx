"use client";

import { useState } from "react";
import { grossToNetSlovenia, SloveniaInput } from "@/utils/salary/slovenia";

import InputField from "@/app/components/InputField";
import ResultRow from "@/app/components/ResultRow";
import BackToHome from "@/app/components/BackToHome";

export default function SloveniaPage() {
  const [input, setInput] = useState<SloveniaInput>({
    amount: 0,
    bonusWorkYearsPercent: 0,
    children: 0,
    childrenSpecial: 0,
    otherDependents: 0,
    materialCosts: 0,
  });

  const [result, setResult] = useState<{
    net: number;
    contributions: number;
    tax: number;
  } | null>(null);

  const handleChange = (field: keyof SloveniaInput, value: string) => {
    setInput((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const calculate = () => {
    setResult(grossToNetSlovenia(input));
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-neutral-800/70 backdrop-blur rounded-2xl shadow-xl p-8">

        <BackToHome />

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-400">
            Slovenia Salary Calculator
          </h1>
          <p className="text-neutral-400 mt-2">
            Gross → Net salary calculation with tax breakdown
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Bruto plača (€)" value={input.amount} onChange={(v) => handleChange("amount", v)} />
          <InputField label="Bonus za delovno dobo (%)" value={input.bonusWorkYearsPercent} onChange={(v) => handleChange("bonusWorkYearsPercent", v)} />
          <InputField label="Število otrok" value={input.children} onChange={(v) => handleChange("children", v)} />
          <InputField label="Posebni otroci" value={input.childrenSpecial} onChange={(v) => handleChange("childrenSpecial", v)} />
          <InputField label="Drugi vzdrževani" value={input.otherDependents} onChange={(v) => handleChange("otherDependents", v)} />
          <InputField label="Materialni stroški (€)" value={input.materialCosts} onChange={(v) => handleChange("materialCosts", v)} />
        </div>

        <button
          onClick={calculate}
          className="w-full mt-6 bg-emerald-500 text-neutral-900 font-semibold py-3 rounded-xl hover:bg-emerald-400 transition"
        >
          Izračunaj
        </button>

        {result && (
          <div className="mt-8 bg-linear-to-br from-sky-900 to-sky-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-sky-300 mb-4">
              Rezultat
            </h2>

            <div className="space-y-2 text-sky-100">
              <ResultRow label="Neto plača" value={result.net} highlight />
              <ResultRow label="Prispevki" value={result.contributions} />
              <ResultRow label="Porez" value={result.tax} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
