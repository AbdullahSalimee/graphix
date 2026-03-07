"use client";

import { useEffect, useRef, useState } from "react";

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

// ─── ALL chart groups with every subtype ──────────────────────────────────────

const CHART_GROUPS: ChartGroup[] = [
  {
    id: "line-scatter",
    label: "Line & Scatter",
    icon: "〜",
    description: "Trends, correlations, time series",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Line & Scatter Plot", prompt: "Line and Scatter Plot" },
      {
        label: "Data Labels Hover",
        prompt: "Line and Scatter Plot Data Labels Hover",
      },
      {
        label: "Line with Data Labels",
        prompt: "Line chart Data Labels on The Plot",
      },
      {
        label: "Scatter + Color Dimension",
        prompt: "Scatter Plot with a Color Dimension",
      },
      { label: "Grouped Scatter", prompt: "Grouped Scatter Plot" },
      {
        label: "Grouped Scatter Custom Gap",
        prompt: "Grouped Scatter Plot with Custom Scatter Gap",
      },
      { label: "Basic Line Plot", prompt: "Basic Line Plot" },
      { label: "Named Lines", prompt: "Adding Names to Line and Scatter Plot" },
      { label: "Stylized Line & Scatter", prompt: "Line and Scatter Stylized" },
      { label: "Styled Line Plot", prompt: "Styling Line Plot" },
      { label: "Colored Scatter", prompt: "Colored and Styled Scatter Plot" },
      {
        label: "Line Shape Interpolation",
        prompt: "Line Shape Options for Interpolation",
      },
      { label: "Line Dash", prompt: "Line Dash" },
      { label: "Connect Gaps", prompt: "line chart Connect Gaps Between Data" },
      { label: "Annotated Lines", prompt: "Labelling Lines with Annotations" },
    ],
  },
  {
    id: "bar",
    label: "Bar Charts",
    icon: "▐",
    description: "Comparisons, rankings, categories",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Bar Chart", prompt: "Basic Bar Chart" },
      { label: "Grouped Bar", prompt: "Grouped Bar Chart" },
      { label: "Stacked Bar", prompt: "Stacked Bar Chart" },
      { label: "Bar with Hover Text", prompt: "Bar Chart with Hover Text" },
      {
        label: "Bar with Direct Labels",
        prompt: "Bar Chart with Direct Labels",
      },
      {
        label: "Grouped Bar Direct Labels",
        prompt: "Grouped Bar Chart with Direct Labels",
      },
      { label: "Rotated Labels", prompt: "Bar Chart with Rotated Labels" },
      {
        label: "Custom Bar Colors",
        prompt: "Customizing Individual Bar Colors",
      },
      { label: "Custom Bar Base", prompt: "Customizing Individual Bar Base" },
      { label: "Colored & Styled Bar", prompt: "Colored and Styled Bar Chart" },
      { label: "Relative Barmode", prompt: "Bar Chart with Relative Barmode" },
    ],
  },
  {
    id: "pie-bubble",
    label: "Pie & Bubble",
    icon: "◉",
    description: "Proportions, distributions, sizes",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Pie Chart", prompt: "Basic Pie Chart" },
      { label: "Donut Chart", prompt: "Donut Chart" },
      { label: "Bubble Chart", prompt: "bubble chart" },
      { label: "Bubble Marker Size", prompt: "Marker Size on Bubble Charts" },
      {
        label: "Bubble Size + Color",
        prompt: "Marker Size and Color on Bubble Charts",
      },
      { label: "Bubble Hover Text", prompt: "Hover Text on Bubble Charts" },
      { label: "Bubble Size Scaling", prompt: "Bubble Size Scaling on Charts" },
      {
        label: "Marker Array (Beautiful)",
        prompt: "Marker Size, Color, and Symbol as an Array",
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
      { label: "Symmetric Error Bars", prompt: "Basic Symmetric Error Bars" },
      { label: "Bar with Error Bars", prompt: "Bar Chart with Error Bars" },
      { label: "Horizontal Error Bars", prompt: "Horizontal Error Bars" },
      { label: "Asymmetric Error Bars", prompt: "Asymmetric Error Bars" },
      { label: "Styled Error Bars", prompt: "Colored and Styled Error Bars" },
      { label: "Basic Box Plot", prompt: "Basic Box Plot" },
      {
        label: "Box + Underlying Data",
        prompt: "Box Plot That Displays the Underlying Data",
      },
      { label: "Horizontal Box Plot", prompt: "Horizontal Box Plot" },
      { label: "Grouped Box Plot", prompt: "Grouped Box Plot" },
      { label: "Box Styled Outliers", prompt: "Box Plot Styling Outliers" },
      { label: "Fully Styled Box Plot", prompt: "Fully Styled Box Plot" },
      { label: "Rainbow Box Plot", prompt: "Rainbow Box Plot" },
    ],
  },
  {
    id: "histogram",
    label: "Histograms",
    icon: "⬛",
    description: "Frequency, distribution, density",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Histogram", prompt: "Basic Histogram" },
      { label: "Overlaid Histogram", prompt: "Overlaid Histogram" },
      { label: "Stacked Histograms", prompt: "Stacked Histograms" },
      { label: "Styled Histogram", prompt: "Colored and Styled Histograms" },
      { label: "Cumulative Histogram", prompt: "Cumulative Histogram" },
      { label: "Normalized Histogram", prompt: "Normalized Histogram" },
      {
        label: "2D Histogram Contour",
        prompt: "2D Histogram Contour Plot with Histogram Subplots",
      },
      {
        label: "2D Histogram + Slider",
        prompt: "2D Histogram Contour Plot with Slider Control",
      },
    ],
  },
  {
    id: "filled-error",
    label: "Filled & Error",
    icon: "≋",
    description: "Confidence bands, filled areas",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Filled Lines", prompt: "Filled Lines" },
      {
        label: "Continuous Error Filled",
        prompt: "Continuous Error Bars Filled Lines",
      },
      {
        label: "Asymmetric + Offset",
        prompt: "Asymmetric Error Bars with a Constant Offset",
      },
      { label: "Continuous Error Bars", prompt: "Continuous Error Bars" },
    ],
  },
  {
    id: "contour-heat",
    label: "Contour & Heat",
    icon: "◈",
    description: "Density, intensity, 2D patterns",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Simple Contour", prompt: "Simple Contour Plot" },
      { label: "Basic Contour", prompt: "Basic Contour Plot" },
      { label: "Contour Lines", prompt: "Contour Lines" },
      { label: "Contour Labels", prompt: "Contour Line Labels" },
      { label: "Basic Heatmap", prompt: "Basic Heatmap" },
      {
        label: "Categorical Heatmap",
        prompt: "Heatmap with Categorical Axis Labels",
      },
      { label: "Annotated Heatmap", prompt: "Annotated Heatmap" },
    ],
  },
  {
    id: "scientific",
    label: "Scientific",
    icon: "⬡",
    description: "Ternary, parallel coords, log scales",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Ternary + Markers", prompt: "Basic Ternary Plot with Markers" },
      { label: "Soil Types Ternary", prompt: "Soil Types Ternary Plot" },
      {
        label: "Basic Parallel Coords",
        prompt: "Basic Parallel Coordinates Plot",
      },
      { label: "Parallel Coordinates", prompt: "Parallel Coordinates Plot" },
      {
        label: "Advanced Parallel Coords",
        prompt: "Advanced Parallel Coordinates Plot",
      },
      { label: "Log Plots", prompt: "Log Plots" },
      { label: "Logarithmic Axes", prompt: "Logarithmic Axes" },
    ],
  },
  {
    id: "financial",
    label: "Financial",
    icon: "₿",
    description: "Candlestick, waterfall, funnel, time series",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Waterfall", prompt: "Basic Waterfall Chart" },
      {
        label: "Multi-Category Waterfall",
        prompt: "Multi Category Waterfall Chart",
      },
      { label: "Styled Waterfall", prompt: "Style Waterfall Chart" },
      { label: "Simple Candlestick", prompt: "Simple Candlestick Chart" },
      {
        label: "Candlestick No Slider",
        prompt: "Candlestick Chart without Rangeslider",
      },
      {
        label: "Candlestick + Annotations",
        prompt: "Customise Candlestick Chart with Shapes and Annotations",
      },
      {
        label: "Candlestick + Rangeselector",
        prompt: "Candlestick Charts Add Rangeselector",
      },
      { label: "Basic Funnel", prompt: "Basic Funnel Plot" },
      {
        label: "Funnel + Marker Style",
        prompt: "Funnel Plot Setting Marker Size and Color",
      },
      { label: "Stacked Funnel", prompt: "Stacked Funnel" },
      {
        label: "Time Series + Rangeslider",
        prompt: "Time Series with Rangeslider",
      },
      { label: "Basic Time Series", prompt: "Basic Time Series" },
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
      { label: "Basic Ribbon Plot", prompt: "Basic Ribbon Plot" },
      { label: "3D Ribbon Plot", prompt: "Basic Ribbon Plot 3d" },
      {
        label: "Topographical Surface",
        prompt: "Topographical 3D Surface Plot",
      },
      { label: "Multiple 3D Surfaces", prompt: "Multiple 3D Surface Plots" },
      { label: "3D Mesh Plot", prompt: "Simple 3D Mesh Plot" },
      { label: "3D Line Chart", prompt: "3D line chart" },
      { label: "3D Mesh Tetrahedron", prompt: "3D Mesh Tetrahedron" },
      { label: "3D Line Plot", prompt: "3D Line Plot" },
      { label: "3D Line + Markers", prompt: "3D Line + Markers Plot" },
      { label: "3D Line Spiral", prompt: "3D Line Spiral Plot" },
      { label: "3D Random Walk", prompt: "3D Random Walk Plot" },
    ],
  },
];

const TOTAL_TYPES = CHART_GROUPS.reduce((s, g) => s + g.subtypes.length - 1, 0);

// ─── Step 1 ───────────────────────────────────────────────────────────────────

const DEMO_TEXT = "Show me a 3D scatter of sales vs. engagement by region";

function StepInput({ active }: { active: boolean }) {
  const [typed, setTyped] = useState("");
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    if (!active) {
      setTyped("");
      return;
    }
    let i = 0;
    setTyped("");
    const blinkId = setInterval(() => setCursorOn((c) => !c), 530);
    const typeId = setInterval(() => {
      i++;
      setTyped(DEMO_TEXT.slice(0, i));
      if (i >= DEMO_TEXT.length) clearInterval(typeId);
    }, 36);
    return () => {
      clearInterval(typeId);
      clearInterval(blinkId);
    };
  }, [active]);

  return (
    <div
      className={`transition-all duration-700 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div
        className="rounded-2xl border border-white/10 bg-white overflow-hidden"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        {/* Chrome */}
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
        {/* Empty canvas */}
        <div
          className="h-44 flex items-center justify-center"
          style={{
            background:
              "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,0,0,0.04) 39px,rgba(0,0,0,0.04) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(0,0,0,0.04) 39px,rgba(0,0,0,0.04) 40px)",
          }}
        >
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center mx-auto mb-2">
              <span className="text-xl text-zinc-300">◈</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Your chart will appear here
            </p>
          </div>
        </div>
        {/* Input bar */}
        <div className="p-3 border-t border-zinc-100">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-500 text-[11px] font-mono whitespace-nowrap shadow-sm">
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
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-500 text-[11px] font-mono whitespace-nowrap shadow-sm">
              <span>⬡</span> Chart Type
            </button>
            <div className="flex-1 font-mono text-[12px] text-zinc-700 min-w-0 flex items-center gap-px">
              <span>{typed}</span>
              {active && (
                <span
                  className={`inline-block w-[1.5px] h-3.5 bg-zinc-800 transition-opacity ${cursorOn ? "opacity-100" : "opacity-0"}`}
                />
              )}
              {!typed && !active && (
                <span className="text-zinc-300">
                  Write your request or add a CSV…
                </span>
              )}
            </div>
            <button className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0">
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
      <div
        className={`mt-5 transition-all duration-700 delay-200 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <p className="text-white/70 text-sm leading-relaxed">
          Type any plain-English request —{" "}
          <span className="text-white/40 font-mono text-[11px]">
            "Show revenue by region for Q4"
          </span>{" "}
          — or drag in a CSV file. No SQL, no setup required.
        </p>
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function StepSelector({ active }: { active: boolean }) {
  const [activeGroup, setActiveGroup] = useState<ChartGroup | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      setActiveGroup(null);
      setSelected(null);
      return;
    }
    const t1 = setTimeout(() => setActiveGroup(CHART_GROUPS[9]), 500);
    const t2 = setTimeout(() => setSelected("3D Scatter"), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active]);

  return (
    <div
      className={`transition-all duration-700 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div
        className="rounded-2xl border border-white/10 bg-white overflow-hidden"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        {/* Chrome */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-[10px] text-zinc-500">
              Select chart type
            </span>
          </div>
          <span className="font-mono text-[10px] text-zinc-400">
            {CHART_GROUPS.length} categories · {TOTAL_TYPES} types
          </span>
        </div>

        {/* Body */}
        <div className="flex" style={{ height: 360 }}>
          {/* Groups */}
          <div className="w-44 flex-shrink-0 border-r border-zinc-100 overflow-y-auto bg-zinc-50 py-1">
            {CHART_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() =>
                  setActiveGroup(activeGroup?.id === g.id ? null : g)
                }
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left transition-all duration-150 border-l-2 ${
                  activeGroup?.id === g.id
                    ? "bg-white border-l-zinc-800"
                    : "border-l-transparent hover:bg-white/80 hover:border-l-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base w-5 text-center flex-shrink-0 text-zinc-500">
                    {g.icon}
                  </span>
                  <div className="min-w-0">
                    <div
                      className={`text-[11px] font-semibold truncate ${activeGroup?.id === g.id ? "text-zinc-900" : "text-zinc-500"}`}
                    >
                      {g.label}
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">
                      {g.subtypes.length - 1} types
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[9px] flex-shrink-0 transition-transform duration-150 ${activeGroup?.id === g.id ? "rotate-90 text-zinc-800" : "text-zinc-300"}`}
                >
                  ▶
                </span>
              </button>
            ))}
          </div>

          {/* Subtypes */}
          <div className="flex-1 overflow-y-auto p-3 bg-white">
            {!activeGroup ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-300">
                <span className="text-5xl">⬡</span>
                <span className="text-xs font-mono text-zinc-400 text-center">
                  Select a category
                  <br />
                  to see all chart types
                </span>
              </div>
            ) : (
              <div style={{ animation: "hiwFadeSlide 0.18s ease both" }}>
                <div className="flex items-start justify-between px-1 pb-3 mb-2 border-b border-zinc-100">
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      {activeGroup.icon} {activeGroup.label}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {activeGroup.description}
                    </div>
                  </div>
                  <span className="font-mono text-[9px] text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded flex-shrink-0 ml-2">
                    {activeGroup.subtypes.length - 1} types
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {activeGroup.subtypes.map((sub, i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(sub.label)}
                      className={`text-left px-2.5 py-2 rounded-lg text-[11px] transition-all duration-100 border ${
                        sub.prompt === null
                          ? "col-span-2 bg-zinc-900 border-zinc-900 text-white font-semibold hover:bg-zinc-800"
                          : selected === sub.label
                            ? "bg-zinc-900 border-zinc-900 text-white"
                            : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 hover:bg-zinc-50"
                      }`}
                    >
                      {sub.prompt === null ? (
                        <span className="flex items-center gap-2">
                          <span>✦</span>Let AI choose the best{" "}
                          {activeGroup.label} type
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 font-mono">
                          <span
                            className={`w-1 h-1 rounded-full flex-shrink-0 ${selected === sub.label ? "bg-white" : "bg-zinc-300"}`}
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
          <span className="font-mono text-[10px] text-zinc-400">
            Click category → pick type → AI generates it
          </span>
          {selected && (
            <span className="font-mono text-[10px] text-white bg-zinc-900 px-2 py-0.5 rounded">
              ✓ {selected}
            </span>
          )}
        </div>
      </div>

      <div
        className={`mt-5 transition-all duration-700 delay-200 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <p className="text-white/70 text-sm leading-relaxed">
          Choose from {TOTAL_TYPES}+ chart types across {CHART_GROUPS.length}{" "}
          categories — or let AI automatically pick the most effective
          visualization for your data.
        </p>
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function StepProcessing({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);
  const PROC = [
    {
      icon: "◈",
      label: "Parsing your request",
      detail: "Understanding data structure & intent",
    },
    {
      icon: "⬡",
      label: "Selecting chart type",
      detail: "Matching 3D Scatter to your dataset",
    },
    {
      icon: "σ",
      label: "Mapping dimensions",
      detail: "x: Sales  ·  y: Engagement  ·  z: Region",
    },
    {
      icon: "✦",
      label: "Rendering visualization",
      detail: "Applying styling, axes & interactions",
    },
  ];

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    setStep(0);
    const ids = PROC.map((_, i) =>
      setTimeout(() => setStep(i + 1), 500 + i * 950),
    );
    return () => ids.forEach(clearTimeout);
  }, [active]);

  return (
    <div
      className={`transition-all duration-700 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div
        className="rounded-2xl border border-white/10 bg-white overflow-hidden"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        {/* Chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="flex items-center gap-2 ml-3">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-50 animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-zinc-600" />
            </span>
            <span className="font-mono text-[10px] text-zinc-500">
              AI is working…
            </span>
          </div>
        </div>

        <div className="divide-y divide-zinc-50">
          {PROC.map((s, i) => {
            const done = step > i + 1;
            const current = step === i + 1;
            return (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-4 transition-all duration-500 ${step <= i ? "opacity-20" : "opacity-100"}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-400 ${done ? "bg-zinc-900 text-white" : current ? "bg-zinc-100 border-2 border-zinc-300" : "bg-zinc-50 text-zinc-300 border border-zinc-100"}`}
                >
                  {current ? (
                    <svg
                      className="animate-spin text-zinc-600"
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
                  ) : done ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7l3 3 6-6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span className="text-base text-zinc-400">{s.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold ${done ? "text-zinc-800" : current ? "text-zinc-700" : "text-zinc-400"}`}
                  >
                    {s.label}
                  </p>
                  <p
                    className={`text-[11px] font-mono mt-0.5 ${done || current ? "text-zinc-400" : "text-zinc-300"}`}
                  >
                    {s.detail}
                  </p>
                </div>
                {done && (
                  <span className="font-mono text-[10px] text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    done
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50">
          <div className="h-1 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full bg-zinc-900 rounded-full transition-all duration-700"
              style={{ width: `${(step / PROC.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="font-mono text-[10px] text-zinc-400">
              Processing your data
            </span>
            <span className="font-mono text-[10px] text-zinc-700 font-semibold">
              {Math.round((step / PROC.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div
        className={`mt-5 transition-all duration-700 delay-200 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <p className="text-white/70 text-sm leading-relaxed">
          GraphAI parses intent, maps every dimension to an optimal visual
          encoding, and generates a fully interactive chart — in under 3
          seconds.
        </p>
      </div>
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

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
        const n = 130;
        const regions = ["North", "South", "East", "West", "Central"];
        const palette: Record<string, string> = {
          North: "#06b6d4", // cyan
          South: "#a855f7", // violet
          East: "#f59e0b", // amber
          West: "#10b981", // emerald
          Central: "#f43f5e", // rose
        };
        const base: Record<string, [number, number]> = {
          North: [62, 72],
          South: [44, 55],
          East: [76, 82],
          West: [54, 65],
          Central: [50, 60],
        };
        const x: number[] = [],
          y: number[] = [],
          z: number[] = [];
        const colors: string[] = [],
          sizes: number[] = [],
          texts: string[] = [];

        for (let i = 0; i < n; i++) {
          const r = regions[Math.floor(Math.random() * regions.length)];
          const xv = base[r][0] + (Math.random() - 0.5) * 38;
          const yv = base[r][1] + (Math.random() - 0.5) * 38;
          const zv = xv * 0.42 + yv * 0.34 + Math.random() * 18;
          x.push(+xv.toFixed(1));
          y.push(+yv.toFixed(1));
          z.push(+zv.toFixed(1));
          colors.push(palette[r]);
          sizes.push(4 + zv / 16);
          texts.push(
            `<b>${r}</b><br>Sales: ${xv.toFixed(0)}k<br>Engagement: ${yv.toFixed(0)}%<br>Score: ${zv.toFixed(0)}`,
          );
        }

        Plotly.react(
          plotRef.current!,
          [
            // one trace per region so we get a proper colored legend
            ...Object.entries(palette).map(([region, color]) => {
              const xi: number[] = [],
                yi: number[] = [],
                zi: number[] = [];
              const ti: string[] = [],
                si: number[] = [];
              for (let k = 0; k < x.length; k++) {
                if (texts[k].startsWith(`<b>${region}`)) {
                  xi.push(x[k]);
                  yi.push(y[k]);
                  zi.push(z[k]);
                  ti.push(texts[k]);
                  si.push(sizes[k]);
                }
              }
              return {
                type: "scatter3d",
                mode: "markers",
                name: region,
                x: xi,
                y: yi,
                z: zi,
                text: ti,
                hovertemplate: "%{text}<extra></extra>",
                marker: {
                  size: si.map((s) => s * 1.4),
                  color,
                  opacity: 0.92,
                  line: { color: "rgba(255,255,255,0.25)", width: 0.8 },
                },
              } as any;
            }),
          ],
          {
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            scene: {
              bgcolor: "transparent",
              xaxis: {
                title: {
                  text: "Sales (k)",
                  font: { size: 10, color: "#06b6d4" },
                },
                gridcolor: "rgba(6,182,212,0.15)",
                zerolinecolor: "rgba(6,182,212,0.25)",
                tickfont: { size: 9, color: "rgba(255,255,255,0.4)" },
                backgroundcolor: "rgba(6,182,212,0.03)",
              },
              yaxis: {
                title: {
                  text: "Engagement (%)",
                  font: { size: 10, color: "#06b6d4" },
                },
                gridcolor: "rgba(6,182,212,0.15)",
                zerolinecolor: "rgba(6,182,212,0.25)",
                tickfont: { size: 9, color: "rgba(255,255,255,0.4)" },
                backgroundcolor: "rgba(6,182,212,0.03)",
              },
              zaxis: {
                title: { text: "Score", font: { size: 10, color: "#06b6d4" } },
                gridcolor: "rgba(6,182,212,0.15)",
                zerolinecolor: "rgba(6,182,212,0.25)",
                tickfont: { size: 9, color: "rgba(255,255,255,0.4)" },
                backgroundcolor: "rgba(6,182,212,0.03)",
              },
              camera: { eye: { x: 1.6, y: 1.6, z: 1.1 } },
              aspectmode: "cube",
            },
            legend: {
              font: {
                size: 11,
                color: "rgba(255,255,255,0.75)",
                family: "DM Mono, monospace",
              },
              bgcolor: "rgba(0,0,0,0.4)",
              bordercolor: "rgba(6,182,212,0.2)",
              borderwidth: 1,
              x: 0.01,
              y: 0.99,
            },
            margin: { t: 10, b: 0, l: 0, r: 0 },
            showlegend: true,
          },
          { displayModeBar: false, responsive: true },
        );

        setReady(true);
      });
    }, 350);

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
      className={`transition-all duration-700 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#080f1a",    
          border: "1px solid rgba(6,182,212,0.25)",
          boxShadow:
            "0 0 0 1px rgba(6,182,212,0.08), 0 24px 64px rgba(0,0,0,0.8), 0 0 80px rgba(6,182,212,0.08)",
        }}
      >
        {/* Chrome */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{
            background: "rgba(6,182,212,0.05)",
            borderColor: "rgba(6,182,212,0.15)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <div className="flex items-center gap-2 ml-3">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-40 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-cyan-400" />
              </span>
              <span className="font-mono text-[10px] text-cyan-400/70">
                3D Sales Scatter — Ready
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {["SVG", "CSV", "PNG"].map((f) => (
              <button
                key={f}
                className="px-2 py-0.5 rounded font-mono text-[10px] border transition-colors"
                style={
                  f === "PNG"
                    ? {
                        background: "#06b6d4",
                        borderColor: "#06b6d4",
                        color: "#000",
                      }
                    : {
                        background: "transparent",
                        borderColor: "rgba(6,182,212,0.2)",
                        color: "rgba(6,182,212,0.5)",
                      }
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="relative" style={{ height: 360 }}>
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
          >
            <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
          </div>
          {!ready && (
            <div
              className="absolute inset-0 flex items-center justify-center gap-3"
              style={{ color: "#06b6d4" }}
            >
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
              <span className="text-xs font-mono">Rendering 3D chart…</span>
            </div>
          )}
        </div>

        <div
          className={`px-4 py-3 flex items-center gap-2.5 transition-all duration-500 delay-700 ${ready ? "opacity-100" : "opacity-0"}`}
          style={{
            borderTop: "1px solid rgba(6,182,212,0.15)",
            background: "rgba(6,182,212,0.05)",
          }}
        >
          <span className="text-cyan-400 text-xs">✦</span>
          <span className="font-mono text-[11px] text-cyan-300/70">
            East & North regions show strongest correlation (r = 0.87) —
            potential growth targets
          </span>
        </div>
      </div>

      <div
        className={`mt-5 transition-all duration-700 delay-200 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <p className="text-white/70 text-sm leading-relaxed">
          Your chart is fully interactive — rotate, zoom, hover for details.
          Export in one click, or embed anywhere with a snippet.
        </p>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

const NAV_STEPS = [
  { label: "Write your request", sub: "Plain English or CSV upload" },
  {
    label: "Choose chart type",
    sub: `${TOTAL_TYPES}+ types, ${CHART_GROUPS.length} categories`,
  },
  { label: "AI processes your data", sub: "Parse · Map · Render" },
  { label: "Get your chart", sub: "Interactive & export-ready" },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  // Track whether the left nav should be visible (only while section is in view)
  const [navVisible, setNavVisible] = useState(false);
  const [navStyle, setNavStyle] = useState<React.CSSProperties>({});

  // ── IntersectionObserver for step highlighting.
  //    Skip the first callback burst that fires synchronously on mount
  //    (before any scroll) so it never overrides the default step-0 on load.
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      let initialFired = false;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!initialFired) {
              initialFired = true; // swallow the mount-time callback
              return;
            }
            if (entry.isIntersecting) setActiveStep(i);
          });
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // ── Scroll handler: compute the fixed left nav position so it tracks
  //    the section's left edge and stays vertically centered in viewport.
  //    It shows only while the scrollable content block is on screen.
  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      // The scrollable content starts after the header (~300px into section)
      const contentStart = rect.top + 300;
      const contentEnd = rect.bottom - 200; // leave room for CTA

      // Show nav only when content zone is on screen
      if (contentStart > window.innerHeight || contentEnd < 0) {
        setNavVisible(false);
        return;
      }

      setNavVisible(true);

      // Left position = section's left edge + some padding
      // Right panel starts at ~260px from section left (w-56 + gap)
      const leftPx = rect.left + 32; // 32px = px-8

      // Vertical: center the nav panel in the viewport
      const navHeight = 280; // approx height of nav
      const top = Math.max(
        80,
        Math.min(
          window.innerHeight - navHeight - 40,
          window.innerHeight / 2 - navHeight / 2,
        ),
      );

      setNavStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${leftPx}px`,
        width: "220px",
        zIndex: 50,
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const NavPanel = () => (
    <div
      style={navVisible ? navStyle : { display: "none" }}
      className="hidden lg:block"
    >
      <div className="space-y-1">
        {NAV_STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() =>
              stepRefs.current[i]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
            }
            className="w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-300"
            style={{
              background:
                activeStep === i ? "rgba(6,182,212,0.07)" : "transparent",
              border:
                activeStep === i
                  ? "1px solid rgba(6,182,212,0.2)"
                  : "1px solid transparent",
            }}
          >
            <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300"
                style={{
                  background:
                    activeStep === i
                      ? "#06b6d4"
                      : activeStep > i
                        ? "rgba(6,182,212,0.2)"
                        : "rgba(255,255,255,0.07)",
                  color:
                    activeStep === i
                      ? "#000"
                      : activeStep > i
                        ? "#06b6d4"
                        : "rgba(255,255,255,0.2)",
                  boxShadow:
                    activeStep === i ? "0 0 12px rgba(6,182,212,0.5)" : "none",
                }}
              >
                {activeStep > i ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M1.5 5l2.5 2.5 4.5-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < NAV_STEPS.length - 1 && (
                <div
                  className="w-px mt-1 h-9 transition-all duration-700"
                  style={{
                    background:
                      activeStep > i
                        ? "rgba(6,182,212,0.35)"
                        : "rgba(255,255,255,0.06)",
                  }}
                />
              )}
            </div>
            <div className="min-w-0 pb-2">
              <p
                className="text-xs font-semibold transition-colors duration-300"
                style={{
                  color:
                    activeStep === i
                      ? "#06b6d4"
                      : activeStep > i
                        ? "rgba(255,255,255,0.35)"
                        : "rgba(255,255,255,0.25)",
                }}
              >
                {s.label}
              </p>
              <p
                className="hiw-mono text-[10px] mt-0.5"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                {s.sub}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-5 px-3">
        <div
          className="h-px rounded-full overflow-hidden"
          style={{ background: "rgba(6,182,212,0.1)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${((activeStep + 1) / NAV_STEPS.length) * 100}%`,
              background: "linear-gradient(90deg, #06b6d4, white)",
            }}
          />
        </div>
        <p
          className="hiw-mono text-[10px] mt-2"
          style={{ color: "rgba(6,182,212,0.4)" }}
        >
          Step {activeStep + 1} of {NAV_STEPS.length}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* The fixed nav lives OUTSIDE the section so it's never clipped by overflow:hidden */}
      <NavPanel />

      <section
        ref={sectionRef}
        className="hiw-root relative overflow-hidden"
        style={{
          background: "#111212",
          backgroundImage: `
      linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)
    `,
          backgroundSize: "40px 40px",
        }}
      >
        {/* Header */}
        <div className="max-w-5xl mx-auto px-8 pt-28 pb-20 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{
              border: "1px solid rgba(6,182,212,0.25)",
              background: "rgba(6,182,212,0.06)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span
              className=" text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "rgba(6,182,212,0.8)" }}
            >
              How it works
            </span>
          </div>
          <h2 className="text-4xl md:text-7xl font-extrabold text-white tracking-tighter  mb-5">
            From question to chart
            <br />
            <span style={{ color: "rgba(255,255,255,0.2)" }}>
              in four steps.
            </span>
          </h2>
          <p
            className="hiw-mono text-sm max-w-sm mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            No code. No SQL. No configuration.
            <br />
            Just describe what you need.
          </p>
        </div>

        {/* Content: right-side scrolling steps with left gutter for the fixed nav */}
        <div className="max-w-5xl mx-auto px-8 pb-32">
          {/* Indent the right content to leave room for the fixed nav */}
          <div className="lg:pl-64">
            <div className="space-y-40">
              {[StepInput, StepSelector, StepProcessing, StepChart].map(
                (StepComponent, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                    }}
                    className="min-h-[85vh] flex flex-col justify-center"
                  >
                    <StepComponent active={activeStep === i} />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          
        >
          <div className=" w-full px-8 py-20 text-center  ">
            <p className="text-2xl font-bold text-white mb-2">
              Ready to see your data differently?
            </p>
            <p
              className="hiw-mono text-sm mb-8"
              style={{ color: "rgba(6,182,212,0.5)" }}
            >
              Join 12,000+ teams already using GraphAI.
            </p>
            <button
              className="px-8 py-3.5 rounded-xl text-black text-sm font-bold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                boxShadow: "0 0 40px rgba(6,182,212,0.35)",
              }}
            >
              Start for free →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
