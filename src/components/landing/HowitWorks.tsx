"use client";

import {
  useEffect,
  useRef,
  useState,
  MutableRefObject,
  CSSProperties,
} from "react";
import useReveal from "./useReveal";
import { BarSVG, LineSVG, DonutSVG } from "./Charts";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ChartType = "bar" | "line" | "donut";
type SlideDirection = "left" | "right";

interface Step {
  n: string;
  title: string;
  chart: ChartType;
  flip: boolean;
  body: string;
}

interface StepRowProps {
  step: Step;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    n: "01",
    title: "Add your data",
    chart: "bar",
    flip: false,
    body: "Upload CSV or JSON, paste values, or describe what you want. No formatting required — Graphy AI reads every row and extracts exact values.",
  },
  {
    n: "02",
    title: "Let AI work its magic",
    chart: "line",
    flip: true,
    body: "Our AI inspects your dataset and builds the perfect visualization — right chart type, right colors, right labels. Ask for changes in plain English.",
  },
  {
    n: "03",
    title: "Make your data shine",
    chart: "donut",
    flip: false,
    body: "Download a high-resolution PNG, share a live link, or embed anywhere. Your data, looking its absolute best, in under two seconds.",
  },
];

// ─── SLIDE-IN HOOK ────────────────────────────────────────────────────────────

function useSlideIn(
  direction: SlideDirection = "left",
  delay: number = 0,
): [MutableRefObject<HTMLElement | null>, CSSProperties] {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const translateX = direction === "left" ? "-80px" : "80px";

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : `translateX(${translateX})`,
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`,
  };

  return [ref, style];
}

// ─── STEP ROW ─────────────────────────────────────────────────────────────────

function StepRow({ step }: StepRowProps) {
  const textRef = useReveal(step.flip ? "reveal-r" : "reveal-l");
  const vizRef = useReveal(step.flip ? "reveal-l" : "reveal-r");

  const textDir: SlideDirection = step.flip ? "right" : "left";
  const vizDir: SlideDirection = step.flip ? "left" : "right";

  const [slideTextRef, slideTextStyle] = useSlideIn(textDir, 0);
  const [slideVizRef, slideVizStyle] = useSlideIn(vizDir, 0.15);

  const Chart =
    step.chart === "bar" ? BarSVG : step.chart === "line" ? LineSVG : DonutSVG;

  return (
    <div
      className={`flex items-center gap-16 flex-wrap ${step.flip ? "flex-row-reverse" : ""}`}
      style={{ marginBottom: "5.5rem" }}
    >
      {/* ── Text block ── */}
      <div
        ref={(el) => {
          (textRef as MutableRefObject<HTMLElement | null>).current = el;
          slideTextRef.current = el;
        }}
        className="flex-1 basis-[280px]"
        style={slideTextStyle}
      >
        <div className="font-bold text-[5.5rem] leading-none text-white mb-2">
          {step.n}
        </div>
        <div className="font-mono text-[0.63rem] tracking-[0.16em] uppercase text-black mb-5">
          Step {step.n}
        </div>
        <h3
          className="font-bold text-neutral-700 tracking-tight leading-[1.1] mb-4"
          style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)" }}
        >
          {step.title}
        </h3>
        <p className="text-cyan-900 leading-[1.8] max-w-[400px]">{step.body}</p>
      </div>

      {/* ── Viz box ── */}
      <div
        ref={(el) => {
          (vizRef as MutableRefObject<HTMLElement | null>).current = el;
          slideVizRef.current = el;
        }}
        className="
          flex-1 basis-[340px] h-[260px]
          rounded-2xl border border-white/10
          bg-gradient-to-br from-white/5 to-white/[0.02]
          flex items-center justify-center
          relative overflow-hidden
          shadow-[0_20px_80px_rgba(0,0,0,0.5)]
        "
        style={slideVizStyle}
      >
        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.04),transparent_70%)]" />
        <div className="w-[88%] h-[82%]">
          <Chart />
        </div>
      </div>
    </div>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const ref = useReveal();

  return (
    <section className="relative z-10 px-8 py-28 max-w-[1100px] mx-auto">
      <div
        ref={ref as MutableRefObject<HTMLDivElement>}
        className="text-center mb-20"
      >
        <div className="font-mono text-[0.63rem] tracking-[0.16em] uppercase text-black/75 mb-5">
          How it works
        </div>
        <h2
          className="font-bold text-neutral-700 tracking-tight leading-[1.1] mb-5"
          style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}
        >
          Three steps to <em className="not-italic text-sky-500">clarity</em>
        </h2>
        <p className="text-slate-400 leading-[1.8] max-w-[460px] mx-auto">
          From raw data to a chart you're proud to share — in under a minute.
        </p>
      </div>

      {STEPS.map((s) => (
        <StepRow key={s.n} step={s} />
      ))}
    </section>
  );
}
