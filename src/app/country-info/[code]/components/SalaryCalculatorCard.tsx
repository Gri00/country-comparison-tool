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
import ResultRow from "@/app/components/ResultRow";

import { CALCULATORS, SupportedCountryCode } from "@/utils/salary/registry";
import { InputFieldDef } from "@/utils/salary/types";

type Direction = "grossToNet" | "netToGross";
type CountryValue = SupportedCountryCode | "";

type CalcState = {
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

function resolveCalculatorKey(code: string): SupportedCountryCode | "" {
  const upper = (code ?? "").trim().toUpperCase();
  return upper && upper in CALCULATORS ? (upper as SupportedCountryCode) : "";
}

function ArrowIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DarkNativeSelect({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="
          w-full rounded-xl bg-neutral-900/80 border border-neutral-700
          px-3 py-2 pr-9 text-neutral-100
          appearance-none
          focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {children}
      </select>
      <ArrowIcon />
    </div>
  );
}

/* -------------------- animated numbers -------------------- */

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

/* -------------------- component -------------------- */

export default function SalaryCalculatorCard({
  defaultCountry,
  title = "Gross / Net calculator",
}: {
  defaultCountry: string;
  title?: string;
}) {
  const resolved = resolveCalculatorKey(defaultCountry);

  const [state, setState] = useState<CalcState>(() => ({
    country: "",
    direction: "grossToNet",
    input: {},
    result: null,
  }));

  const [pulseKey, setPulseKey] = useState(0);

  // Sync locked country when prop arrives/changes
  useEffect(() => {
    if (!resolved) {
      console.warn(
        "[SalaryCalculatorCard] Could not resolve calculator key from:",
        defaultCountry,
        "available keys:",
        Object.keys(CALCULATORS),
      );
      return;
    }

    setState((prev) => {
      if (prev.country === resolved) return prev;
      return {
        ...prev,
        country: resolved,
        input: buildDefaultInput(resolved),
        result: null,
      };
    });
  }, [defaultCountry, resolved]);

  const calculator = useMemo(
    () => (state.country ? CALCULATORS[state.country] : null),
    [state.country],
  );

  const setDirection = (direction: Direction) => {
    setState((s) => ({ ...s, direction, result: null }));
  };

  const setNumber = (key: string, value: string) => {
    setState((s) => ({
      ...s,
      input: { ...s.input, [key]: parseFloat(value) || 0 },
    }));
  };

  const setSelect = (key: string, value: string) => {
    setState((s) => ({
      ...s,
      input: { ...s.input, [key]: value },
    }));
  };

  const setCheckbox = (key: string, checked: boolean) => {
    setState((s) => ({
      ...s,
      input: { ...s.input, [key]: checked },
    }));
  };

  const calculate = () => {
    if (!calculator) return;

    const payload = state.input as unknown;

    const r =
      state.direction === "grossToNet"
        ? calculator.grossToNet(payload as never)
        : calculator.netToGross(payload as never);

    // result updates -> animated numbers will count to new values
    setState((s) => ({ ...s, result: r }));
    setPulseKey((k) => k + 1);
  };

  return (
    <div
      className="
        w-full
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
          {calculator ? calculator.countryName : "Loading…"}
        </h2>

        <p className="text-xs text-neutral-400 mt-1">
          {calculator ? calculator.currency : "—"}
        </p>
      </div>

      {/* Top controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {/* Country (locked, read-only) */}
        <div className="sm:col-span-2">
          <label className="text-sm text-neutral-300 block mb-1">Country</label>
          <div
            className="
              w-full rounded-xl bg-neutral-900/60 border border-neutral-700
              px-3 py-2 text-neutral-100
              flex items-center justify-between
            "
            aria-readonly="true"
          >
            <span className="truncate">
              {calculator ? calculator.countryName : "—"}
            </span>
            <span className="text-xs text-neutral-500">{resolved || "—"}</span>
          </div>
        </div>

        {/* Mode */}
        <div>
          <label className="text-sm text-neutral-300 block mb-1">Mode</label>
          <DarkNativeSelect
            value={state.direction}
            onChange={(v) => setDirection(v as Direction)}
            disabled={!calculator}
          >
            <option value="grossToNet">Gross → Net</option>
            <option value="netToGross">Net → Gross</option>
          </DarkNativeSelect>
        </div>
      </div>

      {!calculator ? (
        <div className="mt-4 rounded-xl border border-dashed border-neutral-700/70 bg-neutral-900/30 p-4">
          <p className="text-sm text-neutral-300 font-medium">
            Calculator not available
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            No salary calculator found for code:{" "}
            <span className="text-neutral-300">{defaultCountry}</span>
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
                    <DarkNativeSelect
                      value={String(state.input[f.key] ?? "")}
                      onChange={(v) => setSelect(f.key, v)}
                    >
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </DarkNativeSelect>
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
            className="
              w-full mt-5 bg-emerald-500 text-neutral-900 font-semibold py-3 rounded-xl
              hover:bg-emerald-400 transition
            "
          >
            Calculate
          </motion.button>
          <div
            className="
    mt-5
    rounded-2xl
    border border-neutral-700/60
    bg-neutral-900/40 backdrop-blur-xl
    shadow-[0_12px_40px_-18px_rgba(0,0,0,0.75)]
    relative overflow-hidden
  "
          >
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="relative p-5 h-52.5 sm:h-47.5">
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
              <motion.div
                key={pulseKey}
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="h-[calc(100%-44px)]"
              >
                {state.result ? (
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
                ) : (
                  <div className="h-full flex items-center">
                    <div className="w-full rounded-xl border border-dashed border-neutral-700/70 bg-neutral-900/30 p-4">
                      <p className="text-sm text-neutral-300 font-medium">
                        Ready to calculate
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Enter values above and click{" "}
                        <span className="text-neutral-300">Calculate</span>.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
