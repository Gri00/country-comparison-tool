"use client";

import type { CountryMeta } from "../data/countryMeta";

export default function CountryInfoPanel({ meta }: { meta: CountryMeta }) {
  const quickFacts = [
    { label: "Capital", value: meta.capital },
    { label: "Population", value: meta.population },
    { label: "Currency", value: meta.currency },
    { label: "Languages", value: meta.languages },
    { label: "Timezone", value: meta.timezone },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium">Overview</div>
          <div className="mt-1 text-xs text-neutral-200/70">
            Quick facts and costs at a glance.
          </div>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-200/80">
          {meta.name}
        </div>
      </div>

      {/* Quick facts */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {quickFacts.map((it) => (
          <StatCard key={it.label} label={it.label} value={it.value} />
        ))}
      </div>

      {/* Note */}
      {meta.note ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-neutral-950/20 px-4 py-3 text-xs text-neutral-200/70">
          {meta.note}
        </div>
      ) : null}

      {/* Extra sections */}
      <div className="mt-6 space-y-4">
        <Section title="Cost of living">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Rent (50m² apt)" value={meta.rent50m2} />
            <StatCard label="Phone plan (basic)" value={meta.phonePlan} />
            <StatCard label="Home internet / month" value={meta.homeInternet} />
            <StatCard
              label="Public transport (monthly)"
              value={meta.publicTransport.monthly}
            />
            <StatCard
              label="Public transport (yearly)"
              value={meta.publicTransport.yearly}
            />
          </div>
        </Section>

        <Section title="City prices">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Beer" value={meta.cityPrices.beer} />
            <StatCard label="Coffee" value={meta.cityPrices.coffee} />
            <StatCard label="Meal (restaurant)" value={meta.cityPrices.meal} />
          </div>
        </Section>

        <Section title="Groceries">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Milk" value={meta.groceries.milk} />
            <StatCard label="Eggs" value={meta.groceries.eggs} />
            <StatCard label="Chicken" value={meta.groceries.chicken} />
            <StatCard label="Minced meat" value={meta.groceries.mincedMeat} />
            <StatCard label="Coca Cola" value={meta.groceries.cocaCola} />
          </div>
        </Section>

        <Section title="Fuel">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Petrol" value={meta.fuel.petrol} />
            <StatCard label="Diesel" value={meta.fuel.diesel} />
          </div>
        </Section>

        <Section title="Official website">
          <div className="mt-1">
            <a
              className="inline-flex items-center gap-2 text-sm text-neutral-100 underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
              href={meta.officialWebsite.url}
              target="_blank"
              rel="noreferrer"
            >
              {meta.officialWebsite.label}
              <span className="text-neutral-200/60">↗</span>
            </a>
          </div>
        </Section>
      </div>

      {/* <div className="mt-6 text-xs text-neutral-200/60">
        Next: taxes, healthcare, housing, job market…
      </div> */}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-950/20 p-4">
      <div className="text-[11px] uppercase tracking-widest text-neutral-200/60">
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[11px] uppercase tracking-widest text-neutral-200/60">
        {label}
      </div>
      <div className="mt-1 text-sm text-neutral-100">{value}</div>
    </div>
  );
}
