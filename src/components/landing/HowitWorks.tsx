"use client";

import { useEffect, useRef, useState, useCallback, MouseEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartSubtype {
  label: string;
  prompt: string | null;
}

interface ChartGroup {
  id: string;
  label: string;
  icon: string;
  description: string;
  subtypes: ChartSubtype[];
}

// ─── Chart groups (neutral palette) ──────────────────────────────────────────

const CHART_GROUPS: ChartGroup[] = [
  {
    id: "line-scatter",
    label: "Line & Scatter",
    icon: "〜",
    description: "Trends, correlations, time series",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Line Plot", prompt: "Basic Line Plot" },
      {
        label: "Scatter + Color Dim",
        prompt: "Scatter Plot with a Color Dimension",
      },
      { label: "Line Dash", prompt: "Line Dash" },
      { label: "Styled Line Plot", prompt: "Styling Line Plot" },
      { label: "Connect Gaps", prompt: "Connect Gaps Between Data" },
    ],
  },
  {
    id: "bar",
    label: "Bar Charts",
    icon: "▐",
    description: "Comparisons, rankings, categories",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Grouped Bar", prompt: "Grouped Bar Chart" },
      { label: "Stacked Bar", prompt: "Stacked Bar Chart" },
      {
        label: "Bar with Direct Labels",
        prompt: "Bar Chart with Direct Labels",
      },
      {
        label: "Custom Bar Colors",
        prompt: "Customizing Individual Bar Colors",
      },
    ],
  },
  {
    id: "pie-bubble",
    label: "Pie & Bubble",
    icon: "◉",
    description: "Proportions, distributions, sizes",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Donut Chart", prompt: "Donut Chart" },
      { label: "Bubble Chart", prompt: "bubble chart" },
      {
        label: "Bubble Size + Color",
        prompt: "Marker Size and Color on Bubble Charts",
      },
    ],
  },
  {
    id: "statistical",
    label: "Statistical",
    icon: "σ",
    description: "Distributions, errors, outliers",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Box Plot", prompt: "Basic Box Plot" },
      { label: "Grouped Box Plot", prompt: "Grouped Box Plot" },
      { label: "Symmetric Error Bars", prompt: "Basic Symmetric Error Bars" },
      { label: "Styled Error Bars", prompt: "Colored and Styled Error Bars" },
    ],
  },
  {
    id: "contour-heat",
    label: "Contour & Heat",
    icon: "◈",
    description: "Density, intensity, 2D patterns",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Heatmap", prompt: "Basic Heatmap" },
      { label: "Annotated Heatmap", prompt: "Annotated Heatmap" },
      { label: "Contour Lines", prompt: "Contour Lines" },
    ],
  },
  {
    id: "financial",
    label: "Financial",
    icon: "₿",
    description: "Candlestick, waterfall, funnel",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Simple Candlestick", prompt: "Simple Candlestick Chart" },
      { label: "Basic Waterfall", prompt: "Basic Waterfall Chart" },
      { label: "Basic Funnel", prompt: "Basic Funnel Plot" },
    ],
  },
  {
    id: "3d",
    label: "3D Charts",
    icon: "◆",
    description: "Three-dimensional visualizations",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "3D Scatter", prompt: "3D Scatter Plot" },
      {
        label: "Topographical Surface",
        prompt: "Topographical 3D Surface Plot",
      },
      { label: "3D Line Spiral", prompt: "3D Line Spiral Plot" },
      { label: "3D Mesh Plot", prompt: "3D Mesh Plot" },
    ],
  },
  {
    id: "scientific",
    label: "Scientific",
    icon: "⬡",
    description: "Ternary, parallel coords",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Parallel Coordinates", prompt: "Parallel Coordinates Plot" },
      { label: "Log Plots", prompt: "Log Plots" },
      { label: "Ternary + Markers", prompt: "Basic Ternary Plot with Markers" },
    ],
  },
];

// ─── Step 1: Input Bar ────────────────────────────────────────────────────────

const DEMO_TEXT = "Show me a 3D scatter of sales vs. engagement by region";

function StepInput({ active }: { active: boolean }) {
  const [typed, setTyped] = useState("");
  const [cursor, setCursor] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setTyped("");
      return;
    }
    let i = 0;
    setTyped("");
    const blinkId = setInterval(() => setCursor((c) => !c), 530);
    const typeId = setInterval(() => {
      i++;
      setTyped(DEMO_TEXT.slice(0, i));
      if (i >= DEMO_TEXT.length) clearInterval(typeId);
    }, 38);
    timerRef.current = typeId;
    return () => {
      clearInterval(typeId);
      clearInterval(blinkId);
    };
  }, [active]);

  return (
    <div
      className={`transition-all duration-700 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      {/* Mock app window */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="flex-1 mx-3 h-5 rounded bg-white border border-zinc-200 flex items-center px-2 gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            <span className="font-mono text-[10px] text-zinc-400">
              app.graphai.io
            </span>
          </div>
        </div>

        {/* Empty chart area */}
        <div className="h-48 bg-[repeating-linear-gradient(0deg,transparent,transparent_39px,rgba(0,0,0,0.04)_39px,rgba(0,0,0,0.04)_40px),repeating-linear-gradient(90deg,transparent,transparent_39px,rgba(0,0,0,0.04)_39px,rgba(0,0,0,0.04)_40px)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl text-zinc-300">◈</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Your chart will appear here
            </p>
          </div>
        </div>

        {/* Input bar */}
        <div className="p-3 border-t border-zinc-100 bg-white">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 shadow-sm">
            {/* Upload pill */}
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 transition-all text-[11px] font-mono whitespace-nowrap shadow-sm">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <rect
                  x="1"
                  y="1"
                  width="10"
                  height="10"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M4 6h4M6 4v4"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              Add CSV
            </button>
            {/* Chart type pill */}
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 transition-all text-[11px] font-mono whitespace-nowrap shadow-sm">
              <span className="text-[13px]">⬡</span>
              Chart Type
            </button>
            {/* Text input */}
            <div className="flex-1 font-mono text-[12px] text-zinc-700 min-w-0 flex items-center gap-0.5">
              <span>{typed}</span>
              {cursor && active && (
                <span className="inline-block w-[1.5px] h-3.5 bg-zinc-800 animate-none" />
              )}
              {!typed && !active && (
                <span className="text-zinc-300">
                  Write your request or add a CSV…
                </span>
              )}
            </div>
            {/* Send */}
            <button className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-700 transition-colors flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 6h10M7 2l4 4-4 4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Annotation */}
      <div
        className={`mt-5 flex items-start gap-3 transition-all duration-700 delay-300 ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
      >
        <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
          1
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-800">
            Describe what you want
          </p>
          <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">
            Type a plain-English request or upload a CSV. No SQL, no code — just
            describe your insight.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Chart Selector ───────────────────────────────────────────────────

function StepSelector({ active }: { active: boolean }) {
  const [activeGroup, setActiveGroup] = useState<ChartGroup | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      setActiveGroup(null);
      setSelected(null);
      return;
    }
    // Auto-demo: open 3D Charts after a delay
    const t1 = setTimeout(() => setActiveGroup(CHART_GROUPS[6]), 600);
    const t2 = setTimeout(() => setSelected("3D Scatter"), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active]);

  return (
    <div
      className={`transition-all duration-700 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[10px] text-zinc-400">
            Select chart type
          </span>
        </div>

        {/* Selector panel */}
        <div className="flex" style={{ height: 300 }}>
          {/* Left: groups */}
          <div className="w-44 flex-shrink-0 border-r border-zinc-100 overflow-y-auto bg-zinc-50 py-1">
            {CHART_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() =>
                  setActiveGroup(activeGroup?.id === g.id ? null : g)
                }
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-left transition-all duration-150 border-l-2 ${
                  activeGroup?.id === g.id
                    ? "bg-white border-l-zinc-800 text-zinc-900"
                    : "border-l-transparent text-zinc-500 hover:bg-white hover:text-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base w-4 text-center flex-shrink-0 text-zinc-700">
                    {g.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium truncate">
                      {g.label}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {g.subtypes.length - 1} types
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] flex-shrink-0 transition-transform duration-150 ${activeGroup?.id === g.id ? "rotate-90 text-zinc-800" : "text-zinc-300"}`}
                >
                  ▶
                </span>
              </button>
            ))}
          </div>

          {/* Right: subtypes */}
          <div className="flex-1 overflow-y-auto p-3">
            {!activeGroup ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-300">
                <span className="text-4xl">⬡</span>
                <span className="text-xs font-mono text-center">
                  Select a category
                  <br />
                  to see subtypes
                </span>
              </div>
            ) : (
              <div className="animate-[fadeSlide_0.18s_ease_both]">
                <div className="px-1 py-2 mb-2 border-b border-zinc-100">
                  <div className="text-[10px] font-mono text-zinc-800 font-semibold tracking-wider uppercase">
                    {activeGroup.icon} {activeGroup.label}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {activeGroup.description}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {activeGroup.subtypes.map((sub, i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(sub.label)}
                      className={`text-left px-2.5 py-2 rounded-lg text-[11px] transition-all duration-100 border ${
                        sub.prompt === null
                          ? "col-span-2 bg-zinc-50 border-zinc-200 text-zinc-800 font-medium hover:bg-zinc-100"
                          : selected === sub.label
                            ? "bg-zinc-900 border-zinc-900 text-white"
                            : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800"
                      }`}
                    >
                      {sub.prompt === null ? (
                        <span className="flex items-center gap-1.5">
                          <span>✦</span>Let AI choose
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 font-mono">
                          <span
                            className={`w-1 h-1 rounded-full flex-shrink-0 ${selected === sub.label ? "bg-white" : "bg-zinc-400"}`}
                          />
                          {sub.label}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-400">
            {CHART_GROUPS.length} categories ·{" "}
            {CHART_GROUPS.reduce((s, g) => s + g.subtypes.length - 1, 0)} types
          </span>
          {selected && (
            <span className="text-[10px] font-mono text-zinc-700 bg-white border border-zinc-200 px-2 py-0.5 rounded-md">
              ✓ {selected}
            </span>
          )}
        </div>
      </div>

      <div
        className={`mt-5 flex items-start gap-3 transition-all duration-700 delay-300 ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
      >
        <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
          2
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-800">
            Choose your chart type
          </p>
          <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">
            Pick from 60+ chart types across 8 categories, or let AI select the
            most effective one for your data.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: AI Processing ────────────────────────────────────────────────────

function StepProcessing({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  const STEPS = [
    {
      icon: "◈",
      label: "Parsing your request…",
      detail: "Understanding data structure & intent",
    },
    {
      icon: "⬡",
      label: "Selecting chart type…",
      detail: "Matching 3D Scatter to your dataset",
    },
    {
      icon: "σ",
      label: "Mapping dimensions…",
      detail: "x: Sales  y: Engagement  z: Region",
    },
    {
      icon: "✦",
      label: "Rendering visualization…",
      detail: "Applying styling & interactions",
    },
  ];

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    setStep(0);
    const ids = STEPS.map((_, i) =>
      setTimeout(() => setStep(i + 1), 600 + i * 900),
    );
    return () => ids.forEach(clearTimeout);
  }, [active]);

  return (
    <div
      className={`transition-all duration-700 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            <span className="font-mono text-[10px] text-zinc-500">
              AI is processing…
            </span>
          </div>
        </div>

        {/* Processing steps */}
        <div className="p-6 space-y-0">
          {STEPS.map((s, i) => {
            const done = step > i + 1;
            const current = step === i + 1;
            const pending = step <= i;
            return (
              <div
                key={i}
                className={`flex items-start gap-4 py-4 border-b border-zinc-50 last:border-0 transition-all duration-500 ${
                  pending ? "opacity-25" : "opacity-100"
                }`}
              >
                {/* Icon / spinner */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    done
                      ? "bg-zinc-900 text-white"
                      : current
                        ? "bg-zinc-100 border-2 border-zinc-300 text-zinc-700"
                        : "bg-zinc-50 text-zinc-300"
                  }`}
                >
                  {current ? (
                    <svg
                      className="animate-spin"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeOpacity="0.2"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : done ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7l3 3 6-6"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm">{s.icon}</span>
                  )}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p
                    className={`text-sm font-semibold transition-colors duration-300 ${done ? "text-zinc-800" : current ? "text-zinc-700" : "text-zinc-400"}`}
                  >
                    {s.label}
                  </p>
                  <p
                    className={`text-xs mt-0.5 font-mono transition-colors duration-300 ${done || current ? "text-zinc-400" : "text-zinc-300"}`}
                  >
                    {s.detail}
                  </p>
                </div>
                {done && (
                  <div className="ml-auto flex-shrink-0">
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full">
                      done
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-5">
          <div className="h-1 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full bg-zinc-900 rounded-full transition-all duration-700"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] font-mono text-zinc-400">
              Processing…
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {Math.round((step / STEPS.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div
        className={`mt-5 flex items-start gap-3 transition-all duration-700 delay-300 ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
      >
        <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
          3
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-800">
            AI processes your data
          </p>
          <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">
            GraphAI parses your request, selects the optimal encoding, maps your
            dimensions, and renders the visualization in seconds.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: 3D Plotly Chart ──────────────────────────────────────────────────

function StepChart({ active }: { active: boolean }) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active || !plotRef.current) {
      setReady(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      import("plotly.js-dist-min").then(({ default: Plotly }) => {
        if (cancelled || !plotRef.current) return;

        // Generate rich 3D scatter data
        const n = 120;
        const regions = ["North", "South", "East", "West", "Central"];
        const regionColors: Record<string, string> = {
          North: "#1a1a2e",
          South: "#16213e",
          East: "#0f3460",
          West: "#533483",
          Central: "#27272a",
        };

        const x: number[] = [],
          y: number[] = [],
          z: number[] = [];
        const colors: string[] = [],
          sizes: number[] = [],
          texts: string[] = [];

        for (let i = 0; i < n; i++) {
          const region = regions[Math.floor(Math.random() * regions.length)];
          const baseSales = {
            North: 60,
            South: 45,
            East: 75,
            West: 55,
            Central: 50,
          }[region]!;
          const baseEng = {
            North: 70,
            South: 55,
            East: 80,
            West: 65,
            Central: 60,
          }[region]!;
          const xv = baseSales + (Math.random() - 0.5) * 40;
          const yv = baseEng + (Math.random() - 0.5) * 40;
          const zv = xv * 0.4 + yv * 0.35 + Math.random() * 20;
          x.push(parseFloat(xv.toFixed(1)));
          y.push(parseFloat(yv.toFixed(1)));
          z.push(parseFloat(zv.toFixed(1)));
          colors.push(regionColors[region]);
          sizes.push(4 + zv / 18);
          texts.push(
            `${region}<br>Sales: ${xv.toFixed(0)}k<br>Eng: ${yv.toFixed(0)}%<br>Score: ${zv.toFixed(0)}`,
          );
        }

        Plotly.react(
          plotRef.current!,
          [
            {
              type: "scatter3d",
              mode: "markers",
              x,
              y,
              z,
              text: texts,
              hovertemplate: "%{text}<extra></extra>",
              marker: {
                size: sizes,
                color: colors,
                opacity: 0.88,
                line: { color: "rgba(255,255,255,0.15)", width: 0.5 },
                symbol: "circle",
              },
            } as any,
            // Add trend surface
            {
              type: "mesh3d",
              x: [20, 100, 100, 20],
              y: [20, 20, 100, 100],
              z: [22, 54, 78, 46],
              opacity: 0.06,
              color: "#27272a",
              hoverinfo: "none",
            } as any,
          ],
          {
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            scene: {
              bgcolor: "transparent",
              xaxis: {
                title: {
                  text: "Sales (k)",
                  font: { size: 9, color: "#a1a1aa" },
                },
                gridcolor: "rgba(0,0,0,0.06)",
                zerolinecolor: "rgba(0,0,0,0.08)",
                tickfont: { size: 8, color: "#a1a1aa" },
                backgroundcolor: "rgba(0,0,0,0)",
              },
              yaxis: {
                title: {
                  text: "Engagement (%)",
                  font: { size: 9, color: "#a1a1aa" },
                },
                gridcolor: "rgba(0,0,0,0.06)",
                zerolinecolor: "rgba(0,0,0,0.08)",
                tickfont: { size: 8, color: "#a1a1aa" },
                backgroundcolor: "rgba(0,0,0,0)",
              },
              zaxis: {
                title: { text: "Score", font: { size: 9, color: "#a1a1aa" } },
                gridcolor: "rgba(0,0,0,0.06)",
                zerolinecolor: "rgba(0,0,0,0.08)",
                tickfont: { size: 8, color: "#a1a1aa" },
                backgroundcolor: "rgba(0,0,0,0)",
              },
              camera: { eye: { x: 1.6, y: 1.6, z: 1.1 } },
              aspectmode: "cube",
            },
            margin: { t: 0, b: 0, l: 0, r: 0 },
            showlegend: false,
          },
          { displayModeBar: false, responsive: true },
        );
        setReady(true);
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      import("plotly.js-dist-min").then(({ default: Plotly }) => {
        if (plotRef.current) Plotly.purge(plotRef.current);
      });
    };
  }, [active]);

  return (
    <div
      className={`transition-all duration-700 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center justify-between gap-1.5 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <div className="flex items-center gap-1.5 ml-3">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-500 opacity-40 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-zinc-600" />
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                3D Sales Scatter — Ready
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {["SVG", "CSV", "PNG"].map((f) => (
              <button
                key={f}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${f === "PNG" ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-600"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div
          className={`transition-all duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
          style={{ height: 340 }}
        >
          <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Loading state */}
        {!ready && (
          <div className="h-[340px] flex items-center justify-center gap-3 text-zinc-400">
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeOpacity="0.2"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs font-mono">Rendering…</span>
          </div>
        )}

        {/* Insight bar */}
        <div
          className={`border-t border-zinc-100 px-4 py-3 bg-zinc-50 flex items-center gap-2 transition-all duration-500 delay-500 ${ready ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-zinc-700 text-xs">✦</span>
          <span className="text-xs font-mono text-zinc-600">
            North & East regions show strongest sales-engagement correlation (r
            = 0.87)
          </span>
        </div>
      </div>

      <div
        className={`mt-5 flex items-start gap-3 transition-all duration-700 delay-300 ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
      >
        <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
          4
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-800">
            Beautiful chart, instantly
          </p>
          <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">
            Your interactive chart appears with AI-generated insights, export
            options, and full drill-down capability.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "input",
    label: "Write your request",
    sub: "Plain English or CSV upload",
  },
  {
    id: "selector",
    label: "Choose chart type",
    sub: "60+ types across 8 categories",
  },
  {
    id: "processing",
    label: "AI processes your data",
    sub: "Parsing, mapping, rendering",
  },
  { id: "chart", label: "Get your chart", sub: "Interactive & export-ready" },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-spy: update active step based on scroll position
  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;

      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        if (midpoint > windowH * 0.15 && midpoint < windowH * 0.7) {
          setActiveStep(i);
        }
      });
    };

    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap');

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressIn {
          from { width: 0%; }
          to   { width: 100%; }
        }

        .hiw-root {
          font-family: 'Bricolage Grotesque', sans-serif;
        }

        /* Custom scrollbar */
        .hiw-left::-webkit-scrollbar { width: 0; }
      `}</style>

      <section
        ref={sectionRef}
        className="hiw-root relative bg-white overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      >
        {/* Section header */}
        <div className="max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 animate-pulse" />
            <span
              className="text-[11px] font-semibold text-zinc-600 tracking-widest uppercase"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              How it works
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-4">
            From question to chart
            <br />
            <span className="text-zinc-400">in four steps.</span>
          </h2>
          <p className="text-base text-zinc-500 max-w-lg mx-auto leading-relaxed">
            No code, no SQL, no configuration. Just describe what you need and
            GraphAI handles the rest.
          </p>
        </div>

        {/* Sticky layout */}
        <div className="max-w-5xl mx-auto px-8 pb-32">
          <div className="flex gap-16 items-start">
            {/* ── LEFT: sticky nav ── */}
            <div className="w-52 flex-shrink-0 sticky top-24 self-start hidden lg:block">
              <div className="space-y-1">
                {STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      stepRefs.current[i]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-300 group ${
                      activeStep === i
                        ? "bg-white border border-zinc-200 shadow-sm"
                        : "hover:bg-white/60"
                    }`}
                  >
                    {/* Step number + connector */}
                    <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                          activeStep === i
                            ? "bg-zinc-900 text-white"
                            : activeStep > i
                              ? "bg-zinc-200 text-zinc-500"
                              : "bg-zinc-100 text-zinc-400"
                        }`}
                      >
                        {activeStep > i ? (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M1.5 5l2.5 2.5 4.5-4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`w-px mt-1 transition-all duration-700 ${activeStep > i ? "h-8 bg-zinc-300" : "h-8 bg-zinc-100"}`}
                        />
                      )}
                    </div>
                    <div className="min-w-0 pb-2">
                      <p
                        className={`text-xs font-semibold transition-colors duration-300 ${activeStep === i ? "text-zinc-900" : "text-zinc-500"}`}
                      >
                        {s.label}
                      </p>
                      <p
                        className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {s.sub}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-6 px-3">
                <div className="h-0.5 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 rounded-full transition-all duration-700"
                    style={{
                      width: `${((activeStep + 1) / STEPS.length) * 100}%`,
                    }}
                  />
                </div>
                <p
                  className="text-[10px] text-zinc-400 mt-1.5"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Step {activeStep + 1} of {STEPS.length}
                </p>
              </div>
            </div>

            {/* ── RIGHT: scrolling content ── */}
            <div className="flex-1 min-w-0 space-y-32">
              {/* Step 1 */}
              <div
                ref={(el) => {
                  stepRefs.current[0] = el;
                }}
                className="min-h-[70vh] flex flex-col justify-center"
              >
                <StepInput active={activeStep === 0} />
              </div>

              {/* Step 2 */}
              <div
                ref={(el) => {
                  stepRefs.current[1] = el;
                }}
                className="min-h-[70vh] flex flex-col justify-center"
              >
                <StepSelector active={activeStep === 1} />
              </div>

              {/* Step 3 */}
              <div
                ref={(el) => {
                  stepRefs.current[2] = el;
                }}
                className="min-h-[70vh] flex flex-col justify-center"
              >
                <StepProcessing active={activeStep === 2} />
              </div>

              {/* Step 4 */}
              <div
                ref={(el) => {
                  stepRefs.current[3] = el;
                }}
                className="min-h-[70vh] flex flex-col justify-center"
              >
                <StepChart active={activeStep === 3} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="border-t border-zinc-100 bg-white/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-8 py-16 text-center">
            <p className="text-2xl font-bold text-zinc-900 mb-2">
              Ready to see your data differently?
            </p>
            <p className="text-sm text-zinc-500 mb-6">
              Join 12,000+ teams already using GraphAI.
            </p>
            <button className="px-8 py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors shadow-lg">
              Start for free →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
