"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  key: string;
  label: string;
  href: string;
};

export default function AppBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items: NavItem[] = useMemo(
    () => [
      { key: "home", label: "Home", href: "/" },
      { key: "compare", label: "Compare", href: "/compare" },
      { key: "calc", label: "Bruto ↔ Netto", href: "/calculator" },
      { key: "contact", label: "Contact", href: "/contact" },
    ],
    [],
  );

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 md:hidden",
          "transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* 
        Mobile: centered (left-1/2 + -translate-x-1/2)
        Desktop: pinned left (left-6, no translate)
      */}
      <div
        className={[
          "fixed top-4 z-50 hidden-when-compare-ready",
          "left-40 -translate-x-1/2",
          "md:top-7 md:left-6 md:translate-x-0",
        ].join(" ")}
      >
        <div
          className="relative h-10"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {/* ===== Desktop menu items (md+) ===== */}
          <div
            className={[
              "hidden md:flex",
              "absolute left-0 top-1/2 -translate-y-1/2",
              "items-center gap-3",
              "pl-32.5",
              "transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
              open
                ? "opacity-100 translate-x-0 pointer-events-auto blur-0"
                : "opacity-0 -translate-x-3 pointer-events-none blur-[2px]",
            ].join(" ")}
          >
            {items.map((item, idx) => {
              const active = pathname === item.href;
              const isCalc = item.key === "calc";

              return (
                <button
                  key={item.key}
                  onClick={() => go(item.href)}
                  style={{ transitionDelay: open ? `${idx * 70}ms` : "0ms" }}
                  className={[
                    "group inline-flex items-center",
                    "px-3 py-2 rounded-full",
                    "bg-neutral-800/70 backdrop-blur",
                    "ring-1 ring-emerald-500/20",
                    "shadow-lg shadow-emerald-500/20",
                    "transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                    open
                      ? "translate-y-0 opacity-100"
                      : "translate-y-1 opacity-0",
                    "hover:brightness-110 hover:-translate-y-0.5 hover:scale-[1.03]",
                    "active:scale-95",
                    active ? "ring-2 ring-emerald-400/60" : "",
                    isCalc ? "px-5" : "",
                  ].join(" ")}
                >
                  <span className="text-sm font-semibold text-neutral-100 whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ===== Mobile dropdown panel (<md) ===== */}
          <div
            className={[
              "md:hidden",
              "absolute left-15 top-12 -translate-x-1/2",
              "w-[min(92vw,420px)]",
              "rounded-2xl",
              "bg-neutral-900/70 backdrop-blur",
              "ring-1 ring-emerald-500/20",
              "shadow-2xl shadow-emerald-500/15",
              "p-2",
              "transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
              open
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-2 pointer-events-none",
            ].join(" ")}
          >
            <div className="grid gap-2">
              {items.map((item, idx) => {
                const active = pathname === item.href;

                return (
                  <button
                    key={item.key}
                    onClick={() => go(item.href)}
                    style={{ transitionDelay: open ? `${idx * 55}ms` : "0ms" }}
                    className={[
                      "w-full inline-flex items-center justify-center",
                      "px-4 py-3 rounded-full",
                      "bg-neutral-800/60",
                      "ring-1 ring-emerald-500/15",
                      "shadow-lg shadow-emerald-500/10",
                      "transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                      open
                        ? "translate-y-0 opacity-100"
                        : "translate-y-1 opacity-0",
                      "hover:brightness-110 hover:-translate-y-0.5 hover:scale-[1.01]",
                      "active:scale-95",
                      active ? "ring-2 ring-emerald-400/60" : "",
                    ].join(" ")}
                  >
                    <span className="text-sm font-semibold text-neutral-100">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===== TOGGLE (shared) ===== */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className={[
              "absolute left-0 top-1/2 -translate-y-1/2",
              "inline-flex items-center justify-center",
              "h-10 rounded-full px-3",
              "bg-neutral-800/70 backdrop-blur",
              "ring-1 ring-emerald-500/25",
              "shadow-lg shadow-emerald-500/25",
              "transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
              "hover:brightness-110 hover:scale-[1.03]",
              "active:scale-95",
            ].join(" ")}
          >
            <span className="relative w-6 h-6 grid place-items-center">
              <HamburgerToX open={open} />
            </span>

            <span className="relative ml-2 w-14 h-5 overflow-hidden">
              <span
                className={[
                  "absolute inset-0 text-sm font-semibold text-neutral-100",
                  "transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                  open
                    ? "opacity-0 -translate-y-2"
                    : "opacity-100 translate-y-0",
                ].join(" ")}
              >
                Menu
              </span>
              <span
                className={[
                  "absolute inset-0 text-sm font-semibold text-neutral-100",
                  "transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                  open
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2",
                ].join(" ")}
              >
                Close
              </span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

function HamburgerToX({ open }: { open: boolean }) {
  return (
    <span className="relative w-6 h-6">
      <span
        className={[
          "absolute left-0 top-1.5 h-0.5 w-6 rounded-full bg-emerald-400",
          "transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          open ? "top-2.75 rotate-45" : "rotate-0",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-2.75 h-0.5 w-6 rounded-full bg-emerald-400",
          "transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          open ? "opacity-0 scale-x-75" : "opacity-100 scale-x-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-4 h-0.5 w-6 rounded-full bg-emerald-400",
          "transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          open ? "top-2.75 -rotate-45" : "rotate-0",
        ].join(" ")}
      />
    </span>
  );
}
