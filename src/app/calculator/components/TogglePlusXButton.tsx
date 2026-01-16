import { AnimatePresence, motion } from "framer-motion";

export default function TogglePlusXButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Reset comparison" : "Add another calculator"}
      title={isOpen ? "Reset comparison" : "Add another calculator"}
      className="
        group
        h-12 w-12 rounded-full
        border border-neutral-700 bg-neutral-800/70
        grid place-items-center
        hover:border-emerald-400/60 hover:bg-neutral-800
        transition
        focus:outline-none focus:ring-2 focus:ring-emerald-400/60
        will-change-transform
      "
    >
      <div className="relative h-6 w-6">
        <AnimatePresence initial={false} mode="wait">
          {!isOpen ? (
            <motion.span
              key="plus"
              initial={{ opacity: 0, rotate: -90, scale: 0.9 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.9 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 grid place-items-center text-2xl leading-none text-neutral-200 group-hover:text-emerald-300"
            >
              +
            </motion.span>
          ) : (
            <motion.span
              key="x"
              initial={{ opacity: 0, rotate: -90, scale: 0.9 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.9 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 grid place-items-center text-2xl leading-none text-neutral-200 group-hover:text-emerald-300"
            >
              ×
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}
