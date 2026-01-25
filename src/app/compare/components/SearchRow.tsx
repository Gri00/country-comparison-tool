"use client";

import CountrySearch from "@/app/components/CountrySearch";
import ResetButton from "./ResetButton";

type Country = {
  code: string;
  name: string;
  flag: string;
};

export default function SearchRow({
  countries,
  leftQuery,
  rightQuery,
  setLeftQuery,
  setRightQuery,
  setLeftCode,
  setRightCode,
  onReset,
  showReset = false,
}: {
  countries: Country[];
  leftQuery: string;
  rightQuery: string;
  setLeftQuery: (v: string) => void;
  setRightQuery: (v: string) => void;
  setLeftCode: (v: string) => void;
  setRightCode: (v: string) => void;
  onReset: () => void;
  showReset?: boolean;
}) {
  return (
    <div
      className={
        showReset
          ? "grid w-full grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 items-center"
          : "grid w-full grid-cols-1 md:grid-cols-2 gap-3 items-center"
      }
    >
      {/* LEFT */}
      <div className="w-full md:justify-self-start">
        <CountrySearch
          className="max-w-none"
          countries={countries}
          placeholder="Left country"
          value={leftQuery}
          onValueChange={setLeftQuery}
          onSelect={setLeftCode}
        />
      </div>

      {/* RESET */}
      {showReset ? (
        <div className="flex justify-center">
          <ResetButton onClick={onReset} />
        </div>
      ) : null}

      {/* RIGHT */}
      <div className="w-full md:justify-self-end">
        <CountrySearch
          className="max-w-none"
          countries={countries}
          placeholder="Right country"
          value={rightQuery}
          onValueChange={setRightQuery}
          onSelect={setRightCode}
        />
      </div>
    </div>
  );
}
