"use client";

export default function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        rounded-2xl
        border border-neutral-700/60
        bg-neutral-800/60
        px-4 py-3
        text-sm font-semibold
        text-neutral-200
        hover:bg-neutral-800/80
        transition
        whitespace-nowrap
      "
      aria-label="Reset comparison"
      title="Reset"
    >
      Reset
    </button>
  );
}
