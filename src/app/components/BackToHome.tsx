import Link from "next/link";

export default function BackToHome() {
  return (
    <div className="mb-6">
      <Link
        href="/"
        className="text-sm text-neutral-400 hover:text-emerald-400 transition"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
