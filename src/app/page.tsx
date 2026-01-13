"use client";

import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/app/constants/countries";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 text-neutral-100">
      <div className="text-center">

        <h1 className="text-4xl md:text-5xl font-bold mb-12">
          How&apos;s life in{" "}
          <span className="text-emerald-400">...</span>
        </h1>

        <div className="flex gap-8 justify-center">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              // onClick={() =>
              //   router.push(`/countryInfo?country=${country.code}`)
              // }
              onClick={() =>
                router.push(`/calculator`)
              }
              className="group relative w-28 h-28 rounded-2xl bg-neutral-800/70 backdrop-blur
                flex flex-col items-center justify-center text-5xl shadow-lg
                transition-all duration-300
                hover:-translate-y-2 hover:scale-110
                hover:shadow-emerald-500/30 active:scale-95"
            >
              <span className="transition-transform duration-300 group-hover:scale-125">
                {country.flag}
              </span>

              <span className="mt-2 text-sm text-neutral-400 group-hover:text-emerald-400 transition">
                {country.name}
              </span>

              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition
                bg-linear-to-br from-emerald-500/10 to-sky-500/10" />
            </button>
          ))}
        </div>

        <p className="mt-10 text-neutral-400">
          Compare salaries, taxes and quality of life
        </p>
      </div>
    </div>
  );
}
