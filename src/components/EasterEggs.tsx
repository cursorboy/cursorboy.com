"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { secrets } from "@/content/portfolio";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Hidden delights:
 *  1. A styled console greeting on load.
 *  2. Konami code → particle burst + a secret toast.
 *  3. Typing "piam" anywhere → quick wink toast.
 */
export default function EasterEggs() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // 1. console greeting
    const css = "color:#16130f;font:600 14px ui-monospace,monospace";
    // eslint-disable-next-line no-console
    console.log(`%c${secrets.console}`, css);

    let kIdx = 0;
    let typed = "";
    let toastTimer: number;

    function fire(message: string, burst = false) {
      setToast(message);
      if (burst) window.dispatchEvent(new Event("kinetic:burst"));
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => setToast(null), 3400);
    }

    function onKey(e: KeyboardEvent) {
      // konami
      const want = KONAMI[kIdx];
      if (e.key.toLowerCase() === want.toLowerCase()) {
        kIdx++;
        if (kIdx === KONAMI.length) {
          kIdx = 0;
          fire(secrets.konami, true);
        }
      } else {
        kIdx = e.key === KONAMI[0] ? 1 : 0;
      }

      // keyword listener
      if (e.key.length === 1) {
        typed = (typed + e.key.toLowerCase()).slice(-8);
        if (typed.endsWith("piam")) fire("hey, that's me. ", true);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(toastTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="eggToast"
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
        >
          <span className="eggDot" />
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
