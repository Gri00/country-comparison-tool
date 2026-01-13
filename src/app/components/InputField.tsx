"use client";

interface InputFieldProps {
  label: string;
  value?: number;
  onChange: (value: string) => void;
}

export default function InputField({
  label,
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">
        {label}
      </label>
      <input
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-neutral-100
          focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
      />
    </div>
  );
}
