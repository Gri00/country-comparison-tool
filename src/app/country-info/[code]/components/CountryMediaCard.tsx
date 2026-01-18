"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QOL_INDEX_2026, QOL_MAX } from "../utils/qol";

type Props = {
  countryCode: string;
  title?: string;
  caption?: string;
  images: string[];
  autoMs?: number;
  fill?: boolean;
};

/* ---------- helpers ---------- */

function normCode(code: string) {
  return (code ?? "").trim().toUpperCase();
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function pctFromQol(qol: number) {
  return clamp((qol / QOL_MAX) * 100, 0, 100);
}

/* ---------- QoL bars ---------- */

function QualityOfLifeBars({ value }: { value: number }) {
  const p = pctFromQol(value);
  const segments = 12;
  const filled = Math.round((p / 100) * segments);

  return (
    <div className="mt-6">
      {/* Bars */}
      <div className="mt-3 flex gap-1">
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filled;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0.7, scaleY: 0.9 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.2, delay: i * 0.015 }}
              className={[
                "h-3 flex-1 rounded-sm border",
                isFilled
                  ? "bg-emerald-500/35 border-emerald-400/30"
                  : "bg-neutral-900 border-neutral-700/60",
              ].join(" ")}
            />
          );
        })}
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full border border-neutral-700/60 bg-neutral-900">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${p}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-emerald-500/40"
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs font-medium text-neutral-300">
          Quality of Life Index
        </div>
        <div className="text-xs text-neutral-400">
          {value.toFixed(1)} / {QOL_MAX}
        </div>
      </div>
    </div>
  );
}

/* ---------- main card ---------- */

export default function CountryMediaCard({
  countryCode,
  title,
  caption,
  images,
  autoMs = 4500,
  fill = false,
}: Props) {
  const code = normCode(countryCode);
  const qol = QOL_INDEX_2026[code] ?? 0;

  const slides = useMemo(() => (images ?? []).filter(Boolean), [images]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), autoMs);
    return () => clearInterval(t);
  }, [slides.length, autoMs]);

  useEffect(() => setIdx(0), [slides.length]);

  const current = slides[idx];

  return (
    <div
      className={[
        "flex flex-col overflow-hidden rounded-2xl",
        "bg-neutral-800/70 backdrop-blur",
        "border border-neutral-700/60",
        "shadow-xl",
        fill ? "flex-1 min-h-0" : "",
      ].join(" ")}
    >
      {/* TOP CONTENT */}
      <div className="px-5 pt-6">
        {title && (
          <div className="text-base md:text-lg font-semibold text-neutral-100">
            {title}
          </div>
        )}

        {caption && (
          <div className="mt-2 text-xs text-neutral-400">{caption}</div>
        )}

        {qol > 0 ? (
          <QualityOfLifeBars value={qol} />
        ) : (
          <div className="mt-6 text-xs text-neutral-500">
            QoL index not available for {code}.
          </div>
        )}

        <div className="mt-4 text-xs text-neutral-400">
          Quality of Life index based on Numbeo (2026).
        </div>
      </div>

      {fill && code === "SI" ? (
        <div className="flex-1 flex items-end justify-center pb-1">
          <div className="uppercase tracking-widest text-neutral-400" />
        </div>
      ) : null}

      {/* SLIDESHOW pinned to bottom */}
      <div className="relative mt-2 h-64 w-full sm:h-80">
        <AnimatePresence mode="wait">
          <motion.div
            key={current ?? "empty"}
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {current ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${current})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-900" />
            )}

            <div className="absolute inset-0 bg-linear-to-t from-neutral-950/55 via-neutral-950/25 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* controls */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() =>
                setIdx((i) => (i - 1 + slides.length) % slides.length)
              }
              className="
                absolute left-3 top-1/2 -translate-y-1/2
                rounded-full border border-neutral-700/60
                bg-neutral-900/70 backdrop-blur
                px-3 py-2 text-sm text-neutral-200
                hover:bg-neutral-800 transition
              "
              aria-label="Previous image"
            >
              ‹
            </button>

            <button
              onClick={() => setIdx((i) => (i + 1) % slides.length)}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                rounded-full border border-neutral-700/60
                bg-neutral-900/70 backdrop-blur
                px-3 py-2 text-sm text-neutral-200
                hover:bg-neutral-800 transition
              "
              aria-label="Next image"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={[
                    "h-2 w-2 rounded-full border transition",
                    i === idx
                      ? "bg-emerald-400 border-emerald-400"
                      : "bg-neutral-700 border-neutral-600 hover:bg-neutral-600",
                  ].join(" ")}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div
        className="
          h-7
          border-t border-neutral-700/60
          bg-neutral-800/50
        "
      />
    </div>
  );
}
