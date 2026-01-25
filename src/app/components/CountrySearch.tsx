"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Country = {
  code: string;
  name: string;
  flag: string;
};

type Props = {
  countries: Country[];
  onSelect: (countryCode: string) => void;
  placeholder?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
};

export default function CountrySearch({
  countries,
  onSelect,
  placeholder = "Search a country...",
  value,
  onValueChange,
  className,
}: Props) {
  const [internalQuery, setInternalQuery] = useState("");
  const query = value ?? internalQuery;

  const setQuery = (v: string) => {
    if (onValueChange) onValueChange(v);
    else setInternalQuery(v);
  };

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, query]);

  // Close on outside click
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const pick = (country: { code: string; name: string }) => {
    setQuery(country.name);
    setOpen(false);
    inputRef.current?.blur();
    onSelect(country.code);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      setActiveIndex(0);
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) pick(item);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full ${className ?? "max-w-sm"}`}
    >
      <div
        className="
          flex items-center gap-3
          rounded-2xl
          bg-neutral-800/70 backdrop-blur
          border border-neutral-700/60
          px-4 py-3
          shadow-lg
          focus-within:border-emerald-500/60
          focus-within:shadow-emerald-500/10
          transition
        "
      >
        {/* Icon */}
        <svg
          className="h-5 w-5 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M21 21l-4.3-4.3m1.3-5.2a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => {
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-neutral-100 placeholder:text-neutral-500"
        />

        {/* Hint */}
        <span className="text-[11px] text-neutral-500 select-none hidden md:inline">
          Enter
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute z-50 mt-3 w-full
            rounded-2xl
            bg-neutral-900/95 backdrop-blur
            border border-neutral-700/60
            shadow-xl
            overflow-hidden
          "
        >
          <div className="max-h-72 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-neutral-400">
                No matches.
              </div>
            ) : (
              filtered.map((c, idx) => {
                const active = idx === activeIndex;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => pick(c)}
                    className={`
                      w-full text-left px-4 py-3
                      flex items-center justify-between gap-3
                      transition
                      ${active ? "bg-neutral-800/70" : "bg-transparent"}
                      hover:bg-neutral-800/70
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{c.flag}</span>
                      <span className="text-sm text-neutral-100">{c.name}</span>
                    </span>
                    <span
                      className={`
                        text-xs transition
                        ${active ? "text-emerald-400" : "text-neutral-500"}
                      `}
                    >
                      {c.code}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 text-[11px] text-neutral-500 border-t border-neutral-800/70">
            Tip: use ↑ ↓ and Enter
          </div>
        </div>
      )}
    </div>
  );
}
