"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import SearchRow from "./components/SearchRow";
import { COUNTRIES } from "../constants/countries";
import CountryInfoPanel from "../country-info/[code]/components/CountryInfoPanel";
import {
  CountryMeta,
  COUNTRY_META,
} from "../country-info/[code]/data/countryMeta";

export default function ComparePage() {
  const [leftCode, setLeftCode] = useState<string | null>(null);
  const [rightCode, setRightCode] = useState<string | null>(null);

  const [leftQuery, setLeftQuery] = useState("");
  const [rightQuery, setRightQuery] = useState("");

  const countries = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        code: c.code,
        name: c.name,
        flag: c.flag,
      })),
    [],
  );

  const ready = Boolean(leftCode && rightCode);

  useEffect(() => {
    document.body.dataset.compareReady = ready ? "1" : "0";
    return () => {
      delete document.body.dataset.compareReady;
    };
  }, [ready]);

  const reset = () => {
    setLeftCode(null);
    setRightCode(null);
    setLeftQuery("");
    setRightQuery("");
  };

  const leftMeta: CountryMeta | null = leftCode
    ? (COUNTRY_META[leftCode] ?? null)
    : null;

  const rightMeta: CountryMeta | null = rightCode
    ? (COUNTRY_META[rightCode] ?? null)
    : null;

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <LayoutGroup>
        {/* TOP BAR */}
        <div className="sticky top-0 z-20">
          <div className="mx-auto w-full max-w-6xl px-6 py-4">
            <AnimatePresence initial={false}>
              {ready && (
                <motion.div
                  key="top-search"
                  layoutId="searchRow"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-4 shadow-lg shadow-black/30"
                >
                  <SearchRow
                    countries={countries}
                    leftQuery={leftQuery}
                    rightQuery={rightQuery}
                    setLeftQuery={setLeftQuery}
                    setRightQuery={setRightQuery}
                    setLeftCode={(c) => setLeftCode(c)}
                    setRightCode={(c) => setRightCode(c)}
                    onReset={reset}
                    showReset
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* HERO */}
        <AnimatePresence initial={false}>
          {!ready && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 grid place-items-center px-6"
            >
              <div className="w-full max-w-3xl">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold tracking-tight">
                    Compare countries
                  </h1>
                  <p className="mt-2 text-neutral-300/80">
                    Pick two countries to see the overview side by side.
                  </p>
                </div>

                <motion.div
                  layoutId="searchRow"
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-2xl shadow-black/40"
                >
                  <SearchRow
                    countries={countries}
                    leftQuery={leftQuery}
                    rightQuery={rightQuery}
                    setLeftQuery={setLeftQuery}
                    setRightQuery={setRightQuery}
                    setLeftCode={(c) => setLeftCode(c)}
                    setRightCode={(c) => setRightCode(c)}
                    onReset={reset}
                    showReset={false}
                  />

                  <div className="mt-4 text-center text-xs text-neutral-300/60">
                    Tip: use ↑ ↓ and Enter
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DETAILS */}
        <AnimatePresence initial={false}>
          {ready && leftMeta && rightMeta && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="mx-auto w-full max-w-6xl px-6 pb-24 pt-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CountryInfoPanel meta={leftMeta} />
                <CountryInfoPanel meta={rightMeta} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
