"use client";

import { useEffect, useRef, useState } from "react";

// ─── EXTEND WINDOW FOR PLOTLY ─────────────────────────────────────────────────

declare global {
  interface Window {
    Plotly: any;
  }
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ChipItem {
  label: string;
  delay: number;
}

interface LoadingStep {
  label: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TYPED_TEXT = "Make a 3D bar chart of monthly sales";

const CHIPS: ChipItem[] = [
  { label: "Monthly sales", delay: 0.8 },
  { label: "User growth", delay: 0.92 },
  { label: "Revenue Q4", delay: 1.04 },
];

const LOADING_STEPS: LoadingStep[] = [
  { label: "Parsing dataset…" },
  { label: "Detecting patterns…" },
  { label: "Choosing chart type…" },
  { label: "Rendering visuals…" },
];

const NUM_DOTS = 8;
const ORBIT_R = 36;

/* ─────────────────────────────────────────────
   BOX 1 – Animated Input Bar UI
───────────────────────────────────────────── */
export function BarSVG() {
  const [displayed, setDisplayed] = useState("");
  const [cursor, setCursor] = useState(true);

  // Typewriter
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(TYPED_TEXT.slice(0, i));
      if (i >= TYPED_TEXT.length) clearInterval(iv);
    }, 55);
    return () => clearInterval(iv);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const iv = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-[18px]">
      {/* Label */}
      <div className="text-[0.55rem] tracking-[0.18em] uppercase text-slate-400/60 mb-1">
        Graphy AI · Chart Generator
      </div>

      {/* Input bar */}
      <div className="relative w-[92%] flex items-center gap-[10px] bg-[rgba(15,23,42,0.85)] border border-sky-400/25 rounded-[14px] px-4 py-[13px] shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden">
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

        {/* Attachment icon */}
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(100,116,139,0.7)"
          strokeWidth="2"
        >
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>

        {/* Chart type badge */}
        <div className="flex items-center gap-[5px] shrink-0 bg-sky-400/[0.08] border border-sky-400/20 rounded-lg px-2 py-[3px] text-[0.6rem] text-sky-400/85 tracking-[0.05em] whitespace-nowrap">
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Bar Chart
        </div>

        {/* Typed text */}
        <div className="flex-1 text-[0.72rem] text-slate-200/90 tracking-[0.01em] min-h-[16px] leading-[1.4]">
          {displayed}
          <span
            className="inline-block w-[1.5px] h-[0.75em] bg-sky-400/90 ml-[1px] align-middle transition-opacity duration-100"
            style={{ opacity: cursor ? 1 : 0 }}
          />
        </div>

        {/* Send button */}
        <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-sky-400/90 to-indigo-500/80 shadow-[0_2px_12px_rgba(56,189,248,0.3)]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="flex gap-[7px] flex-wrap justify-center">
        {CHIPS.map(({ label, delay }) => (
          <div
            key={label}
            className="text-[0.55rem] px-[10px] py-1 rounded-full border border-slate-500/20 text-slate-400/60 bg-[rgba(15,23,42,0.4)] tracking-[0.04em] [animation:fadeUpChip_0.5s_ease_both]"
            style={{ animationDelay: `${delay}s` }}
          >
            {label}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeUpChip {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BOX 2 – Gorgeous Loading Animation
───────────────────────────────────────────── */
export function LineSVG() {
  const [tick, setTick] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Orbit tick
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(iv);
  }, []);

  // Progress loop
  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += 0.4;
      if (p > 100) p = 0;
      setProgress(p);
      setStepIndex(
        Math.floor((p / 100) * LOADING_STEPS.length) % LOADING_STEPS.length,
      );
    }, 30);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-[18px] overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(56,189,248,0.08),transparent_70%)]" />

      {/* Central orb */}
      <div className="relative w-24 h-24 shrink-0">
        {/* Slow outer ring */}
        <svg
          width="96"
          height="96"
          className="absolute inset-0 [animation:orb-spin_7s_linear_infinite]"
        >
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="rgba(56,189,248,0.12)"
            strokeWidth="1"
            strokeDasharray="3 9"
          />
        </svg>

        {/* Counter-rotating inner ring */}
        <svg
          width="96"
          height="96"
          className="absolute inset-0 [animation:orb-spin_4.5s_linear_infinite_reverse]"
        >
          <circle
            cx="48"
            cy="48"
            r="36"
            fill="none"
            stroke="rgba(99,102,241,0.18)"
            strokeWidth="1"
            strokeDasharray="2 7"
          />
        </svg>

        {/* Orbit track */}
        <svg width="96" height="96" className="absolute inset-0">
          <circle
            cx="48"
            cy="48"
            r={ORBIT_R}
            fill="none"
            stroke="rgba(56,189,248,0.05)"
            strokeWidth="1"
          />
        </svg>

        {/* Orbiting dots */}
        {Array.from({ length: NUM_DOTS }).map((_, i) => {
          const angle = ((tick * 2.2 + (i * 360) / NUM_DOTS) * Math.PI) / 180;
          const x = 48 + ORBIT_R * Math.cos(angle);
          const y = 48 + ORBIT_R * Math.sin(angle);
          const size = 1.8 + (i / NUM_DOTS) * 2.8;
          const opacity = 0.25 + 0.75 * (i / NUM_DOTS);
          const isCyan = i % 2 === 0;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${size}px`,
                height: `${size}px`,
                background: isCyan
                  ? "rgba(56,189,248,0.95)"
                  : "rgba(99,102,241,0.95)",
                transform: "translate(-50%,-50%)",
                boxShadow: `0 0 ${size * 3}px ${isCyan ? "rgba(56,189,248,0.7)" : "rgba(99,102,241,0.7)"}`,
                opacity,
              }}
            />
          );
        })}

        {/* Arc progress ring */}
        <svg width="96" height="96" className="absolute inset-0">
          <defs>
            <linearGradient id="arcG2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(56,189,248,0.9)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.9)" />
            </linearGradient>
          </defs>
          <circle
            cx="48"
            cy="48"
            r="26"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="3"
          />
          <circle
            cx="48"
            cy="48"
            r="26"
            fill="none"
            stroke="url(#arcG2)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(progress / 100) * 163.4} 163.4`}
            transform="rotate(-90 48 48)"
          />
        </svg>

        {/* Glowing core */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34px] h-[34px] rounded-full [animation:core-pulse_2.2s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(circle at 38% 38%, rgba(56,150,248,0.9), rgba(99,102,241,0.75) 55%, rgba(15,23,42,0.95))",
            boxShadow:
              "0 0 18px rgba(56,189,248,0.55), 0 0 36px rgba(56,189,248,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        />

        {/* Spinning icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [animation:orb-spin_3.5s_linear_infinite]">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2.2"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
      </div>

      {/* Text section */}
      <div className="flex flex-col items-center gap-[10px] w-[86%]">
        {/* Cycling step label */}
        <div
          key={stepIndex}
          className="text-[0.62rem] text-black tracking-[0.1em] uppercase [animation:fadeSlide_0.35s_ease_both]"
        >
          {LOADING_STEPS[stepIndex].label}
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-[2px] rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-[30ms] linear relative"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg,rgba(56,189,248,0.85),rgba(99,102,241,0.9))",
              boxShadow: "0 0 10px rgba(56,189,248,0.7)",
            }}
          >
            {/* Glowing tip */}
            <div className="absolute -right-[1px] -top-[3px] w-2 h-2 rounded-full bg-sky-400/95 shadow-[0_0_8px_rgba(56,189,248,1),0_0_16px_rgba(56,189,248,0.5)]" />
          </div>
        </div>

        {/* Percentage */}
        <div className="text-[0.55rem] text-sky-400/65 font-mono tracking-[0.08em]">
          {Math.round(progress)}%
        </div>

        {/* Shimmer skeleton lines */}
        <div className="w-full flex flex-col gap-[6px] mt-[2px]">
          {[90, 68, 48].map((w, i) => (
            <div
              key={i}
              className="h-1 rounded-full bg-white/5 overflow-hidden relative"
              style={{ width: `${w}%` }}
            >
              <div
                className="absolute inset-0 [animation:shimmer_2s_ease-in-out_infinite]"
                style={{
                  background:
                    "linear-gradient(90deg,transparent 0%,rgba(56,189,200,0.18) 50%,transparent 100%)",
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes orb-spin   { from { transform: rotate(0deg);   } to { transform: rotate(360deg); } }
        @keyframes core-pulse {
          0%,100% { box-shadow: 0 0 18px rgba(56,189,248,0.55), 0 0 36px rgba(56,189,248,0.22), inset 0 1px 0 rgba(255,255,255,0.18); }
          50%     { box-shadow: 0 0 28px rgba(56,189,248,0.8),  0 0 56px rgba(56,189,248,0.38), inset 0 1px 0 rgba(255,255,255,0.22); }
        }
        @keyframes fadeSlide  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer    { 0% { transform: translateX(-100%); } 100% { transform: translateX(220%); } }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BOX 3 – Plotly 3D Surface Chart
───────────────────────────────────────────── */
export function DonutSVG() {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef<boolean>(false);

  useEffect(() => {
    if (loaded.current) return;

    const renderChart = () => {
      if (!ref.current || !window.Plotly) return;
      loaded.current = true;

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const products = ["Alpha", "Beta", "Gamma"];
      const zData = products.map(() =>
        months.map(() => Math.round(30 + Math.random() * 65)),
      );

      const trace3d = {
        type: "surface",
        z: zData,
        x: months,
        y: products,
        colorscale: [
          [0, "rgba(15,23,42,0.9)"],
          [0.25, "rgba(99,102,241,0.8)"],
          [0.6, "rgba(56,189,248,0.85)"],
          [1, "rgba(236,72,153,0.95)"],
        ],
        contours: {
          z: {
            show: true,
            usecolormap: true,
            highlightcolor: "rgba(56,189,248,0.4)",
            project: { z: false },
          },
        },
        opacity: 0.92,
        showscale: false,
        lighting: {
          ambient: 0.6,
          diffuse: 0.8,
          specular: 0.5,
          roughness: 0.4,
          fresnel: 0.4,
        },
        lightposition: { x: 100, y: 200, z: 150 },
      };

      const layout = {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { l: 0, r: 0, t: 0, b: 0 },
        scene: {
          bgcolor: "rgba(0,0,0,0)",
          xaxis: {
            showgrid: true,
            gridcolor: "rgba(56,189,248,0.1)",
            tickfont: { color: "rgba(148,163,184,0.7)", size: 8 },
            zeroline: false,
          },
          yaxis: {
            showgrid: true,
            gridcolor: "rgba(99,102,241,0.1)",
            tickfont: { color: "rgba(148,163,184,0.7)", size: 8 },
            tickvals: [0, 1, 2],
            ticktext: products,
            zeroline: false,
          },
          zaxis: {
            showgrid: true,
            gridcolor: "rgba(255,255,255,0.05)",
            tickfont: { color: "rgba(148,163,184,0.7)", size: 8 },
            zeroline: false,
          },
          camera: {
            eye: { x: 1.6, y: -1.6, z: 1.2 },
            center: { x: 0, y: 0, z: -0.1 },
          },
          aspectmode: "manual",
          aspectratio: { x: 1.5, y: 0.8, z: 0.7 },
        },
        showlegend: false,
      };

      window.Plotly.newPlot(ref.current, [trace3d], layout, {
        displayModeBar: false,
        responsive: true,
        scrollZoom: false,
      });

      let angle = 0;
      const rotate = setInterval(() => {
        if (!ref.current) {
          clearInterval(rotate);
          return;
        }
        angle += 0.4;
        const rad = (angle * Math.PI) / 180;
        const r = 1.8;
        window.Plotly.relayout(ref.current, {
          "scene.camera": {
            eye: { x: r * Math.cos(rad), y: r * Math.sin(rad), z: 1.1 },
            center: { x: 0, y: 0, z: -0.1 },
          },
        });
      }, 50);
    };

    // Load Plotly if not already present
    if (window.Plotly) {
      renderChart();
    } else {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.27.1/plotly.min.js";
      script.onload = renderChart;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Live label */}
      <div className="absolute top-[6px] left-[10px] z-10 font-mono text-[0.5rem] text-black tracking-[0.12em] uppercase">
        3D Surface · Live
      </div>
      <div ref={ref} className="w-full h-full" />
    </div>
  );
}
