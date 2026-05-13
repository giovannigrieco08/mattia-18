"use client";
import { useRef } from "react";
import { motion, useInView } from "motion/react";

type Props = {
  text: string;
  className?: string;
  delayMs?: number;
  triggerKey?: string | number;
};

export function BlurText({ text, className = "", delayMs = 100, triggerKey }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { amount: 0.1, once: true });
  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        rowGap: "0.1em",
      }}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${triggerKey ?? ""}-${i}-${w}`}
          style={{ display: "inline-block", marginRight: "0.28em" }}
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={
            inView
              ? {
                  filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
                  opacity: [0, 0.5, 1],
                  y: [50, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 0.7,
            times: [0, 0.5, 1],
            ease: "easeOut",
            delay: (i * delayMs) / 1000,
          }}
        >
          {w}
        </motion.span>
      ))}
    </p>
  );
}
