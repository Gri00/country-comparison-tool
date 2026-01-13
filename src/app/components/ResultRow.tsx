interface ResultRowProps {
  label: string;
  value: number;
  highlight?: boolean;
}

export default function ResultRow({
  label,
  value,
  highlight = false,
}: ResultRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-neutral-300">{label}</span>
      <span
        className={`font-mono text-lg ${
          highlight ? "text-emerald-400 font-bold" : ""
        }`}
      >
        {value.toFixed(2)} €
      </span>
    </div>
  );
}
