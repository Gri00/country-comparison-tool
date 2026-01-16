"use client";

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export default function ToggleField({
  label,
  checked,
  onChange,
  description,
}: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-700 bg-neutral-900/60 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm text-neutral-200 truncate">{label}</p>
        {description ? (
          <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-7 w-12 items-center rounded-full transition",
          "focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:ring-offset-2 focus:ring-offset-neutral-900",
          checked ? "bg-emerald-500" : "bg-neutral-700",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 transform rounded-full bg-neutral-100 shadow-sm transition",
            checked ? "translate-x-6" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
