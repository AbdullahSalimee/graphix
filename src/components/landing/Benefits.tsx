"use client";

import { MutableRefObject } from "react";
import useReveal from "./useReveal";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type RevealRef = MutableRefObject<HTMLDivElement | null>;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PILLS: string[] = [
  "Actionable insights",
  "No ambiguity",
  "Fewer meetings",
  "Faster decisions",
  "Less back & forth",
  "Stronger alignment",
  "Shared understanding",
  "87 chart types",
  "Zero design skills",
  "Instant PNG download",
  "CSV upload",
  "3D charts",
  "Heatmaps",
  "Auto key rotation",
  "100% free",
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function Benefits() {
  const ref = useReveal() as RevealRef;

  return (
    <div
      className="relative z-10 border-y border-white/10 overflow-hidden bg-gradient-to-br from-[#030a18] to-[#060818]"
      style={{ padding: "5.5rem 2rem" }}
    >
      {/* Radial glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(56,189,248,0.05),transparent_70%)]" />

      {/* Heading */}
      <div ref={ref} className="text-center mb-12">
        <div className="font-mono text-[0.63rem] tracking-[0.16em] uppercase text-sky-400/75 mb-5">
          Why Graphy AI
        </div>
        <h2
          className="font-bold text-slate-200 tracking-tight leading-[1.1]"
          style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}
        >
          Benefits of{" "}
          <em className="not-italic text-sky-400">data storytelling</em>
        </h2>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-2.5 justify-center max-w-[820px] mx-auto mt-8">
        {PILLS.map((p) => (
          <div
            key={p}
            className="
              px-4 py-2
              bg-sky-400/[0.08] border border-sky-400/10
              rounded-full
              text-[0.84rem] text-slate-700 font-medium tracking-wide
              cursor-default
              transition-all duration-200
              hover:border-sky-400/20 hover:text-slate-400 hover:-translate-y-0.5
            "
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
