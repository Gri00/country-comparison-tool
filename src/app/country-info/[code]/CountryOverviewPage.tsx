import { sora } from "@/app/fonts";
import CountryInfoPanel from "./components/CountryInfoPanel";
import CountryMediaCard from "./components/CountryMediaCard";
import SalaryCalculatorCard from "./components/SalaryCalculatorCard";
import { getCountryMeta } from "@/lib/queries/getCountryMeta";

type Props = {
  countryCode: string;
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=2400&q=80";

const FALLBACK_SIDE =
  "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1800&q=80";

export default async function CountryOverviewPage({ countryCode }: Props) {
  const code = (countryCode ?? "").toLowerCase();

  const meta = await getCountryMeta(code);

  const heroImage = meta.heroImage || FALLBACK_HERO;
  const sideImage = meta.sideImage || FALLBACK_SIDE;

  return (
    <div className="relative min-h-screen pt-7 text-neutral-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl"
          style={{ backgroundImage: `url(${heroImage})` }}
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
        </div>

        {/* Content grid */}
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {/* LEFT */}
          <div className="lg:pr-2 h-full">
            <CountryInfoPanel meta={meta} />
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-6 lg:pl-2 items-stretch h-full">
            <SalaryCalculatorCard
              title="Brutto / Netto calculator"
              defaultCountry={code}
            />

            <CountryMediaCard
              countryCode={code}
              title={`Life in ${meta.name}`}
              fill
              images={[sideImage, heroImage, sideImage]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
