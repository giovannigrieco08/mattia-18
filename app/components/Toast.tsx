"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, XIcon } from "./icons";

export type ToastMessage = { title: string; body?: string };

export function Toast({
  message,
  onClose,
  autoDismissMs = 5000,
}: {
  message: ToastMessage | null;
  onClose: () => void;
  autoDismissMs?: number;
}) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(id);
  }, [message, autoDismissMs, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed left-4 right-4 bottom-24 z-[70] paper-card-strong rounded-xl pl-3 pr-4 py-3 flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="alert"
        >
          <div
            className="w-1 self-stretch rounded-full -my-1"
            style={{ background: "var(--color-wine)" }}
          />
          <AlertTriangle size={20} className="shrink-0" style={{ color: "var(--color-wine)" }} />
          <div className="flex-1">
            <div
              className="text-[13px] font-medium leading-tight"
              style={{ color: "var(--color-ink)" }}
            >
              {message.title}
            </div>
            {message.body && (
              <div
                className="text-[12px] mt-0.5 leading-tight"
                style={{ color: "var(--color-ink-soft)" }}
              >
                {message.body}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center shrink-0"
            style={{ color: "rgba(90,78,69,0.6)" }}
            aria-label="Chiudi"
          >
            <XIcon size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
