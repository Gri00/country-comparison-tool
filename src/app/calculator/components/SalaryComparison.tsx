"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
} from "framer-motion";

import InputField from "@/app/components/InputField";
import ToggleField from "@/app/components/ToggleField";

import { CALCULATORS, SupportedCountryCode } from "@/utils/salary/registry";
import { InputFieldDef } from "@/utils/salary/types";
import TogglePlusXButton from "./TogglePlusXButton";

type Direction = "grossToNet" | "netToGross";
type CountryValue = SupportedCountryCode | "";

type CalcState = {
  id: string;
  country: CountryValue;
  direction: Direction;
  input: Record<string, string | number | boolean>;
  result: {
    gross: number;
    net: number;
    contributions: number;
    tax: number;
  } | null;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function buildDefaultInput(code: CountryValue) {
  if (!code) return {};
  const obj: Record<string, string | number | boolean> = {};
  const fields = CALCULATORS[code].fields;

  for (const f of fields) {
    if (f.type === "checkbox") obj[f.key] = false;
    else if (f.type === "select") obj[f.key] = f.options[0]?.value ?? "";
    else obj[f.key] = 0;
  }
  return obj;
}

function createEmptyCalc(): CalcState {
  return {
    id: uid(),
    country: "",
    direction: "grossToNet",
    input: {},
    result: null,
  };
}

/* -------------------- animated numbers  -------------------- */

function formatNumber(n: number, decimals: number) {
  const fixed = n.toFixed(decimals);
  const parts = fixed.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function currencySymbol(currency?: string) {
  if (!currency) return "";
  if (currency.toUpperCase() === "EUR") return "€";
  return "";
}

function AnimatedMoney({
  value,
  currency,
  decimals = 0,
}: {
  value: number;
  currency?: string; // "EUR" -> €
  decimals?: number;
}) {
  const mv = useMotionValue(0);

  const text = useTransform(mv, (latest) => {
    const n = Number.isFinite(latest) ? latest : 0;
    const sym = currencySymbol(currency);
    return `${sym}${formatNumber(n, decimals)}`;
  });

  useEffect(() => {
    const controls = animate(mv, value ?? 0, {
      duration: 0.85,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, mv]);

  return <motion.span className="tabular-nums">{text}</motion.span>;
}

function SimpleResultRow({
  label,
  value,
  highlight,
  currency,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  currency?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm text-neutral-300">{label}</div>
      <div
        className={[
          "text-sm tabular-nums",
          highlight ? "text-emerald-200 font-semibold" : "text-neutral-100",
        ].join(" ")}
      >
        <AnimatedMoney value={value} currency={currency} decimals={0} />
      </div>
    </div>
  );
}

/* -------------------- Calculator Card -------------------- */

function CalculatorCard({
  state,
  title,
  onUpdate,
}: {
  state: CalcState;
  title: string;
  onUpdate: (next: CalcState) => void;
}) {
  const calculator = useMemo(
    () => (state.country ? CALCULATORS[state.country] : null),
    [state.country],
  );

  const setCountry = (code: CountryValue) => {
    onUpdate({
      ...state,
      country: code,
      input: buildDefaultInput(code),
      result: null,
    });
  };

  const setDirection = (direction: Direction) => {
    onUpdate({ ...state, direction, result: null });
  };

  const setNumber = (key: string, value: string) => {
    onUpdate({
      ...state,
      input: { ...state.input, [key]: parseFloat(value) || 0 },
    });
  };

  const setSelect = (key: string, value: string) => {
    onUpdate({
      ...state,
      input: { ...state.input, [key]: value },
    });
  };

  const setCheckbox = (key: string, checked: boolean) => {
    onUpdate({
      ...state,
      input: { ...state.input, [key]: checked },
    });
  };

  const calculate = () => {
    if (!calculator) return;
    const payload = state.input as unknown;
    const r =
      state.direction === "grossToNet"
        ? calculator.grossToNet(payload as never)
        : calculator.netToGross(payload as never);

    onUpdate({ ...state, result: r });
  };

  return (
    <div
      className="
        w-full max-w-md
        bg-neutral-800/70 backdrop-blur
        rounded-2xl shadow-xl
        border border-neutral-700/60
        p-6
      "
    >
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          {title}
        </p>

        <h2 className="text-lg font-semibold text-emerald-300 mt-1">
          {calculator ? calculator.countryName : "Please select a country"}
        </h2>

        <p className="text-xs text-neutral-400 mt-1">
          {calculator ? calculator.currency : "—"}
        </p>
      </div>

      {/* Top controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div className="sm:col-span-2">
          <label className="text-sm text-neutral-300 block mb-1">Country</label>
          <select
            value={state.country}
            onChange={(e) => setCountry(e.target.value as CountryValue)}
            className="
              w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-neutral-100
              focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400
            "
          >
            <option value="">Select…</option>
            {Object.entries(CALCULATORS).map(([code, c]) => (
              <option key={code} value={code}>
                {c.countryName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-neutral-300 block mb-1">Mode</label>
          <select
            value={state.direction}
            onChange={(e) => setDirection(e.target.value as Direction)}
            disabled={!calculator}
            className="
              w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-neutral-100
              focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <option value="grossToNet">Gross → Net</option>
            <option value="netToGross">Net → Gross</option>
          </select>
        </div>
      </div>

      {/* Empty state */}
      {!calculator ? (
        <div className="mt-4 rounded-xl border border-dashed border-neutral-700/70 bg-neutral-900/30 p-4">
          <p className="text-sm text-neutral-300 font-medium">
            Please select a country
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Choose a country to show the relevant fields and calculate.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {calculator.fields.map((f: InputFieldDef<any>) => {
              if (f.type === "select") {
                return (
                  <div key={f.key}>
                    <label className="block text-sm text-neutral-400 mb-1">
                      {f.label}
                    </label>
                    <select
                      value={String(state.input[f.key] ?? "")}
                      onChange={(e) => setSelect(f.key, e.target.value)}
                      className="
                        w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-neutral-100
                        focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400
                      "
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
                  <div key={f.key} className="sm:col-span-2">
                    <ToggleField
                      label={f.label}
                      checked={Boolean(state.input[f.key])}
                      onChange={(checked) => setCheckbox(f.key, checked)}
                    />
                  </div>
                );
              }

              return (
                <InputField
                  key={f.key}
                  label={f.label}
                  value={
                    typeof state.input[f.key] === "number"
                      ? (state.input[f.key] as number)
                      : 0
                  }
                  onChange={(v) => setNumber(f.key, v)}
                  placeholder={f.placeholder}
                />
              );
            })}
          </div>

          <motion.button
            whileTap={{ scale: 0.985 }}
            onClick={calculate}
            className="w-full mt-5 bg-emerald-500 text-neutral-900 font-semibold py-3 rounded-xl hover:bg-emerald-400 transition"
          >
            Calculate
          </motion.button>

          <AnimatePresence mode="wait">
            {state.result ? (
              <motion.div
                key={`${state.direction}-${Math.round(state.result.net * 100)}`}
                initial={{ opacity: 0, y: 10, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.985 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="
                  mt-5 rounded-2xl p-5
                  border border-neutral-700/60
                  bg-neutral-900/40 backdrop-blur-xl
                  shadow-[0_12px_40px_-18px_rgba(0,0,0,0.75)]
                  relative overflow-hidden
                "
              >
                <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-100">
                        Result{" "}
                        <span className="text-neutral-400 font-normal">
                          (monthly)
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        {state.direction === "grossToNet"
                          ? "Gross → Net"
                          : "Net → Gross"}
                      </p>
                    </div>

                    <span
                      className="
                        text-[11px] px-2 py-1 rounded-full
                        border border-neutral-700/60 bg-neutral-900/60 text-neutral-200
                      "
                    >
                      {calculator?.currency ?? "—"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <SimpleResultRow
                      label="Net"
                      value={state.result.net}
                      highlight
                      currency={calculator?.currency}
                    />
                    <SimpleResultRow
                      label="Gross"
                      value={state.result.gross}
                      currency={calculator?.currency}
                    />
                    <SimpleResultRow
                      label="Employee contributions"
                      value={state.result.contributions}
                      currency={calculator?.currency}
                    />
                    <SimpleResultRow
                      label="Total tax"
                      value={state.result.tax}
                      currency={calculator?.currency}
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/* -------------------- Page wrapper (unchanged) -------------------- */

export default function SalaryComparison() {
  const [left, setLeft] = useState<CalcState>(() => createEmptyCalc());
  const [right, setRight] = useState<CalcState | null>(null);

  const hasRight = Boolean(right);

  const handlePlusOrReset = () => {
    if (hasRight) {
      setLeft(createEmptyCalc());
      setRight(null);
      return;
    }
    setRight(createEmptyCalc());
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mt-10 mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-400">
            Salary Calculator
          </h1>
          <p className="text-neutral-400 mt-2">
            Compare two countries side-by-side
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start justify-items-center">
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full flex justify-center"
          >
            <CalculatorCard
              state={left}
              title="Calculator A"
              onUpdate={setLeft}
            />
          </motion.div>

          <div className="flex items-center justify-center lg:pt-16">
            <TogglePlusXButton isOpen={hasRight} onClick={handlePlusOrReset} />
          </div>

          <div className="w-full flex justify-center">
            <AnimatePresence mode="wait">
              {right ? (
                <motion.div
                  key="right"
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex justify-center"
                >
                  <CalculatorCard
                    state={right}
                    title="Calculator B"
                    onUpdate={setRight}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="
                    w-full max-w-md
                    rounded-2xl border border-dashed border-neutral-700/70
                    bg-neutral-900/30
                    p-6 text-center
                  "
                >
                  <p className="text-neutral-300 font-semibold">
                    Add another calculator
                  </p>
                  <p className="text-neutral-500 text-sm mt-2">
                    Click the + button to compare another country.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
