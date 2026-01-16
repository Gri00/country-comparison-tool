"use client";

import { useEffect, useState } from "react";

interface InputFieldProps {
  label: string;
  value?: number;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function InputField({
  label,
  value,
  onChange,
  placeholder,
}: InputFieldProps) {
  const [internalValue, setInternalValue] = useState<string>("");

  // Sync spoljašnja number vrednost u input (npr. kad resetuješ formu / menjaš državu)
  useEffect(() => {
    if (value === undefined || value === 0) {
      setInternalValue("");
    } else {
      setInternalValue(String(value));
    }
  }, [value]);

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">{label}</label>
      <input
        type="number"
        value={internalValue}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value; // string ("" ili "2000" itd.)
          setInternalValue(v);
          onChange(v);
        }}
        className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-neutral-100
          focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
      />
    </div>
  );
}
