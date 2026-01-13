"use client";

import { useState } from "react";
import Link from "next/link";

export default function ComparePage() {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative h-screen overflow-hidden bg-neutral-900 text-neutral-100">

      {/* LEFT SIDE – Dark */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-900"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <div className="max-w-md text-center px-6">
          <h2 className="text-3xl font-bold mb-4 text-emerald-400">
            Salary Calculator
          </h2>
          <p className="text-neutral-300 mb-6">
            Calculate your net salary and understand taxes clearly.
          </p>
          <Link
            href="/calculator"
            className="inline-block bg-emerald-500 text-neutral-900 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-400 transition"
          >
            Open Calculator
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE – Soft Blue */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-sky-900 via-sky-800 to-sky-900"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <div className="max-w-md text-center px-6">
          <h2 className="text-3xl font-bold mb-4 text-sky-300">
            Country Comparison
          </h2>
          <p className="text-sky-200">
            Compare living costs and purchasing power between countries.
          </p>
        </div>
      </div>

      {/* CENTER DIVIDER */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-neutral-500"
        style={{ left: `${position}%` }}
      />

      {/* SLIDER */}
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-1/2 accent-emerald-400"
      />
    </div>
  );
}
