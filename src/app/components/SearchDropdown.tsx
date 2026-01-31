"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type SearchOption = {
  code: string; // e.g. "DE"
  name: string; // e.g. "Germany"
  flag?: string; // e.g. "🇩🇪" (optional)
};

type Props = {
  countries: SearchOption[];
  value: string; // selected country code ("" if none)
  onChange: (countryCode: string) => void;

  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
};

export default function SearchDropdown({
  countries,
  value,
  onChange,
  placeholder = "Search a country…",
  className,
  disabled,
  label,
}: Props) {
  const selected = useMemo(() => {
    const v = (value ?? "").toUpperCase();
    return countries.find((c) => c.code.toUpperCase() === v) ?? null;
  }, [countries, value]);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // search happens INSIDE dropdown
  const [search, setSearch] = useState("");

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const srOnlyKeyRef = useRef<HTMLInputElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;

    return countries.filter((c) => {
      const name = c.name.toLowerCase();
      const code = c.code.toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [countries, search]);

  // Close on outside click
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const openDropdown = () => {
    if (disabled) return;
    setOpen(true);

    // reset search when opening
    setSearch("");

    // set active index to currently selected
    const idx = countries.findIndex(
      (c) => c.code.toUpperCase() === (value ?? "").toUpperCase(),
    );
    setActiveIndex(idx >= 0 ? idx : 0);

    // focus search
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  const pick = (c: SearchOption) => {
    setOpen(false);
    setSearch("");
    onChange(c.code);
    srOnlyKeyRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (
      !open &&
      (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      openDropdown();
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
    <div className={className}>
      {label ? (
        <label className="text-sm text-neutral-300 block mb-1">{label}</label>
      ) : null}

      <div
        ref={wrapperRef}
        className={[
          "relative w-full",
          disabled ? "opacity-50 pointer-events-none" : "",
        ].join(" ")}
      >
        {/* display field (NOT editable) */}
        <button
          type="button"
          onClick={openDropdown}
          className="
            w-full text-left
            flex items-center justify-between gap-3
            rounded-2xl
            bg-neutral-900/70 backdrop-blur
            border border-neutral-700/60
            px-4 py-3
            shadow-lg
            hover:border-neutral-600/70
            focus:outline-none focus:border-emerald-500/60
            focus:shadow-emerald-500/10
            transition
          "
        >
          <span className="truncate text-neutral-100">
            {selected ? (
              <span className="flex items-center gap-3">
                {selected.flag ? (
                  <span className="text-xl">{selected.flag}</span>
                ) : null}
                <span>{selected.name}</span>
              </span>
            ) : (
              <span className="text-neutral-500">{placeholder}</span>
            )}
          </span>

          {/* caret */}
          <svg
            className={[
              "h-4 w-4 text-neutral-400 transition",
              open ? "rotate-180" : "rotate-0",
            ].join(" ")}
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
        </button>

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
            {/* Search bar ALWAYS on (country-only component) */}
            <div className="p-3 border-b border-neutral-800/70">
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search…"
                className="
                  w-full rounded-xl
                  bg-neutral-950/60 border border-neutral-800/80
                  px-3 py-2
                  text-sm text-neutral-100 placeholder:text-neutral-500
                  outline-none focus:border-emerald-500/60
                "
              />
            </div>

            {/* keyboard handler */}
            <input
              ref={srOnlyKeyRef}
              className="sr-only"
              onKeyDown={onKeyDown}
              aria-hidden="true"
            />

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
                      className={[
                        "w-full text-left px-4 py-3",
                        "flex items-center justify-between gap-3",
                        "transition",
                        active ? "bg-neutral-800/70" : "bg-transparent",
                        "hover:bg-neutral-800/70",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-3">
                        {c.flag ? (
                          <span className="text-xl">{c.flag}</span>
                        ) : null}
                        <span className="text-sm text-neutral-100">
                          {c.name}
                        </span>
                      </span>

                      <span
                        className={[
                          "text-xs transition",
                          active ? "text-emerald-400" : "text-neutral-500",
                        ].join(" ")}
                      >
                        {c.code.toUpperCase()}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
