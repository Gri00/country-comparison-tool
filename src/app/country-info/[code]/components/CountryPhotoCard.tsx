"use client";

type Props = {
  title?: string;
  caption?: string;
  imageUrl: string;
};

export default function CountryPhotoCard({ title, caption, imageUrl }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]">
      {title ? (
        <div className="px-5 pt-5">
          <div className="text-sm font-medium text-neutral-100">{title}</div>
          {caption ? (
            <div className="mt-1 text-xs text-neutral-200/70">{caption}</div>
          ) : null}
        </div>
      ) : null}

      <div className="relative mt-4 aspect-video w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950/35 via-transparent to-transparent" />
      </div>

      <div className="px-5 py-4">
        <div className="text-xs text-neutral-200/70">
          Tip: kasnije možeš da ubaciš “highlights” (cost of living, safety,
          expat vibe…) ili mini galeriju.
        </div>
      </div>
    </div>
  );
}
