"use client";

import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/app/constants/countries";
import { useState } from "react";
import dynamic from "next/dynamic";
import CountrySearch from "./components/CountrySearch";

const MapComponent = dynamic(() => import("./components/MapComponent"), {
  ssr: false,
});

export default function HomePage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleCountryClick = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setTimeout(() => {
      router.push("/calculator");
    }, 1200);
  };

  return (
    <div
      className="
        min-h-screen bg-neutral-900 px-6 text-neutral-100
        grid place-items-center
      "
    >
      {/* CENTERED GRID CONTENT */}
      <div
        className="
          grid grid-cols-[auto_auto_auto]
          items-center
          gap-x-20
        "
      >
        {/* Header */}
        <div className="text-left max-w-sm">
          <h1 className="text-4xl md:text-7xl font-bold mb-4">
            How&apos;s life in <span className="text-emerald-400">...</span>
          </h1>

          {/* Searchbox */}
          <div className="mb-4">
            <CountrySearch
              countries={COUNTRIES}
              onSelect={handleCountryClick}
            />
          </div>
          <div className="flex flex-col items-center text-center">
            <p className="text-neutral-400 mb-3 mt-5">
              Compare salaries, taxes and quality of life
            </p>

            <button
              onClick={() => router.push("/compare")}
              className="
              inline-flex items-center gap-2
              px-7 py-3 rounded-xl
              bg-emerald-500 text-neutral-800
              font-semibold text-sm
              shadow-lg shadow-emerald-500/25
              transition-all duration-300
              hover:brightness-110 hover:scale-105
              active:scale-95
              mr-2
            "
            >
              Compare countries
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-6">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              onClick={() => handleCountryClick(country.code)}
              className="
                group relative w-24 h-24 rounded-2xl
                bg-neutral-800/70 backdrop-blur
                flex flex-col items-center justify-center
                text-4xl shadow-lg
                transition-all duration-300
                hover:-translate-y-1 hover:scale-105
                hover:shadow-emerald-500/30
                active:scale-95
              "
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {country.flag}
              </span>
              <span className="mt-1 text-xs text-neutral-400 group-hover:text-emerald-400 transition">
                {country.name}
              </span>
            </button>
          ))}
        </div>

        {/* Globe */}
        <div className="w-65 h-65 md:w-110 md:h-150 shrink-0">
          <MapComponent selectedCountryCode={selectedCountry} />
        </div>
      </div>
    </div>
  );
}
