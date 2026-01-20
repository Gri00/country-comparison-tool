"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail } from "lucide-react";
import SpaceShooter from "./components/SpaceShooter";

export default function ContactPage() {
  const email = "test@test.com";
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="mx-auto w-full max-w-5xl px-6 pt-24 pb-12">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Contact
          </h1>

          <p className="mt-3 text-neutral-300 leading-relaxed">
            For business enquiries, sponsorships, or if you found some bugs,
            please contact me at:
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-neutral-100 hover:bg-neutral-900 transition"
              href={`mailto:${email}`}
            >
              <Mail className="h-4 w-4 text-neutral-200" />
              <span className="font-medium">{email}</span>
            </a>

            <button
              onClick={() => setShowSecret((v) => !v)}
              className="ml-auto inline-flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/30 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
            >
              <span className="text-lg">🕹️</span>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showSecret && (
              <motion.div
                initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                transition={{ duration: 0.25 }}
                className="mt-8"
              >
                <SpaceShooter />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
