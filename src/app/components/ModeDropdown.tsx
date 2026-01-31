"use client";

import React, { useEffect, useRef, useState } from "react";

type ModeOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: ModeOption[];
  disabled?: boolean;
  className?: string;
};

export default function ModeDropdown({
  value,
  onChange,
  options,
  disabled,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  // close on outside click (this effect is allowed – no setState inside body)
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const pick = (v: string) => {
    setOpen(false);
    onChange(v);
  };

  return (
    <div
      ref={wrapperRef}
      className={[
        "relative w-full",
        disabled ? "opacity-50 pointer-events-none" : "",
        className ?? "",
      ].join(" ")}
    >
      {/* Closed field */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="
          w-full
          flex items-center justify-between gap-3
          rounded-2xl
          bg-neutral-900/70 backdrop-blur
          border border-neutral-700/60
          px-4 py-3
          text-left
          shadow-lg
          hover:border-neutral-600/70
          focus:outline-none focus:border-emerald-500/60
          transition
        "
      >
        <span className="text-neutral-100">
          {selected?.label ?? "Select mode"}
        </span>

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
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => pick(o.value)}
                className={[
                  "w-full px-4 py-3 text-left",
                  "flex items-center justify-between",
                  "transition",
                  active ? "bg-neutral-800/70" : "bg-transparent",
                  "hover:bg-neutral-800/70",
                ].join(" ")}
              >
                <span className="text-sm text-neutral-100">{o.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
