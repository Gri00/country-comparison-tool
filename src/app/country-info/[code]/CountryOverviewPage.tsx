"use client";

import { playfair, serif, sora } from "@/app/fonts";
import CountryInfoPanel from "./components/CountryInfoPanel";
import CountryMediaCard from "./components/CountryMediaCard";
import SalaryCalculatorCard from "./components/SalaryCalculatorCard";
import { COUNTRY_META, EMPTY_COUNTRY_META } from "./data/countryMeta";

type Props = {
  countryCode: string;
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=2400&q=80";
const FALLBACK_SIDE =
  "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1800&q=80";

export default function CountryOverviewPage({ countryCode }: Props) {
  const code = (countryCode ?? "").toLowerCase();
  const fromDb = code ? COUNTRY_META[code] : undefined;

  const meta = fromDb ?? {
    ...EMPTY_COUNTRY_META,
    name: code ? code.toUpperCase() : EMPTY_COUNTRY_META.name,
    heroImage: FALLBACK_HERO,
    sideImage: FALLBACK_SIDE,
  };

  return (
    <div className="relative min-h-screen pt-7 text-neutral-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl"
          style={{ backgroundImage: `url(${meta.heroImage || FALLBACK_HERO})` }}
        />

        <div className="absolute inset-0 bg-neutral-950/10" />
        <div className="absolute inset-0 bg-linear-to-b from-neutral-950/10 via-neutral-950/10 to-neutral-950" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        {/* Header */}
        <div className="mb-7 text-center">
          <h1
            className={`${sora.className} tracking-tight leading-tight text-4xl md:text-5xl`}
          >
            {meta.name}
          </h1>
          {/* {meta.subtitle ? (
            <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-200/80">
              {meta.subtitle}
            </p>
          ) : null} */}
        </div>

        {/* Content grid: left info, right qol + images */}
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {/* LEFT */}
          <div className="lg:pr-2 h-full">
            <CountryInfoPanel meta={meta} />
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-6 lg:pl-2 items-stretch h-full">
            <SalaryCalculatorCard
              title="Gross / Net calculator"
              defaultCountry={code}
            />

            <CountryMediaCard
              countryCode={code}
              title={`Life in ${meta.name}`}
              fill
              images={[
                meta.sideImage || FALLBACK_SIDE,
                meta.heroImage || FALLBACK_HERO,
                meta.sideImage || FALLBACK_SIDE,
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
