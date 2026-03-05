// components/ChartTypeSelector.tsx
"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChartSubtype {
  label: string;
  prompt: string | null;
}

interface ChartGroup {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  subtypes: ChartSubtype[];
}

interface SelectedChart {
  groupLabel: string;
  subLabel: string;
  prompt: string | null;
  group?: string;
}

interface ChartTypeSelectorProps {
  onSelect: (selection: SelectedChart | null) => void;
}

// ── Full Chart Groups Data ────────────────────────────────────────────────────
const CHART_GROUPS: ChartGroup[] = [
  {
    id: "line-scatter",
    label: "Line & Scatter",
    icon: "〜",
    color: "#38bdf8",
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
    color: "#34d399",
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
    color: "#f472b6",
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
    color: "#fbbf24",
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
    color: "#a78bfa",
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
    color: "#fb7185",
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
    color: "#22d3ee",
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
    color: "#4ade80",
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
    color: "#f59e0b",
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
    color: "#e879f9",
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChartTypeSelector({
  onSelect,
}: ChartTypeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<ChartGroup | null>(null);
  const [selected, setSelected] = useState<SelectedChart | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveGroup(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleGroupClick = (group: ChartGroup) => {
    setActiveGroup(activeGroup?.id === group.id ? null : group);
  };

  const handleSubSelect = (group: ChartGroup, sub: ChartSubtype) => {
    const sel: SelectedChart =
      sub.prompt === null
        ? { groupLabel: group.label, subLabel: "AI Choice", prompt: null }
        : { groupLabel: group.label, subLabel: sub.label, prompt: sub.prompt };

    setSelected(sel);
    onSelect(sel);
    setOpen(false);
    setActiveGroup(null);
  };

  const handleGroupDirectSelect = (group: ChartGroup, e: MouseEvent) => {
    e.stopPropagation();
    const sel: SelectedChart = {
      groupLabel: group.label,
      subLabel: "AI Choice",
      prompt: null,
      group: group.id,
    };
    setSelected(sel);
    onSelect(sel);
    setOpen(false);
    setActiveGroup(null);
  };

  const clearSelection = (e: MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    onSelect(null);
  };

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger Button */}
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          setActiveGroup(null);
        }}
        className={`
          flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-lg
          transition-all duration-150 whitespace-nowrap flex-shrink-0
          ${
            selected
              ? "bg-sky-500/10 border border-sky-500/35 text-sky-400"
              : "bg-white/3 border border-white/7 text-slate-600 hover:text-slate-300 hover:bg-white/5"
          }
        `}
      >
        {selected ? (
          <>
            <span className="text-base">
              {CHART_GROUPS.find((g) => g.label === selected.groupLabel)
                ?.icon ?? "⬡"}
            </span>
            <span className="max-w-[90px] truncate">
              {selected.subLabel === "AI Choice"
                ? selected.groupLabel
                : selected.subLabel}
            </span>
            <span
              onClick={clearSelection}
              className="ml-0.5 opacity-60 hover:opacity-90 cursor-pointer text-sm"
            >
              ✕
            </span>
          </>
        ) : (
          <>
            <span className="text-lg">⬡</span>
            <span>Chart Type</span>
            <span className="text-xs opacity-50 ml-0.5">▾</span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`
            absolute bottom-full left-0 z-[9999] w-[620px] max-w-[calc(100vw-2rem)]
            bg-gradient-to-br from-[#070d1a] to-[#050b14] border border-sky-500/15
            rounded-xl shadow-[0_-20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(56,189,248,0.05)]
            overflow-hidden animate-[dropUp_0.18s_cubic-bezier(0.16,1,0.3,1)_both]
          `}
        >
          {/* Keyframes */}
          <style jsx global>{`
            @keyframes dropUp {
              from {
                opacity: 0;
                transform: translateY(8px) scale(0.98);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(-6px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>

          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-mono tracking-wider uppercase">
              Select Chart Type
            </span>
            <span className="text-xs text-slate-800">
              {CHART_GROUPS.length} categories ·{" "}
              {CHART_GROUPS.reduce((sum, g) => sum + g.subtypes.length - 1, 0)}{" "}
              types
            </span>
          </div>

          <div className="flex h-[320px]">
            {/* Left column - Groups */}
            <div className="w-[200px] flex-shrink-0 border-r border-white/4 overflow-y-auto py-2">
              {CHART_GROUPS.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleGroupClick(group)}
                  className={`
                    flex items-center justify-between px-4 py-2.5 cursor-pointer transition-all duration-150
                    border-l-2
                    ${
                      activeGroup?.id === group.id
                        ? "bg-sky-500/7 border-l-[var(--group-color)]"
                        : "hover:bg-white/3 border-l-transparent"
                    }
                  `}
                  style={
                    { "--group-color": group.color } as React.CSSProperties
                  }
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className="text-xl w-[18px] text-center"
                      style={{
                        color: group.color,
                        filter: `drop-shadow(0 0 4px ${group.color}55)`,
                      }}
                    >
                      {group.icon}
                    </span>
                    <div>
                      <div
                        className={`text-xs font-medium ${
                          activeGroup?.id === group.id
                            ? "text-slate-200"
                            : "text-slate-500"
                        }`}
                      >
                        {group.label}
                      </div>
                      <div className="text-[0.62rem] text-slate-700 mt-0.5">
                        {group.subtypes.length - 1} types
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-xs transition-transform duration-150"
                    style={{
                      color:
                        activeGroup?.id === group.id ? group.color : "#1e3a5f",
                      transform:
                        activeGroup?.id === group.id ? "rotate(90deg)" : "none",
                    }}
                  >
                    ▶
                  </span>
                </div>
              ))}
            </div>

            {/* Right column - Subtypes or placeholder */}
            <div className="flex-1 overflow-y-auto p-2">
              {!activeGroup ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 opacity-40">
                  <div className="text-5xl">⬡</div>
                  <div className="text-slate-500 text-xs text-center leading-relaxed">
                    Select a category
                    <br />
                    to see chart subtypes
                  </div>
                </div>
              ) : (
                <div className="animate-[slideIn_0.15s_ease_both]">
                  {/* Group header */}
                  <div className="px-2 py-3 mb-1 border-b border-white/4">
                    <div
                      className="text-xs font-mono tracking-wide mb-1"
                      style={{ color: activeGroup.color }}
                    >
                      {activeGroup.icon} {activeGroup.label.toUpperCase()}
                    </div>
                    <div className="text-xs text-slate-500">
                      {activeGroup.description}
                    </div>
                  </div>

                  {/* Subtypes grid */}
                  <div className="grid grid-cols-2 gap-0.5">
                    {activeGroup.subtypes.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubSelect(activeGroup, sub)}
                        className={`
                          text-left px-3 py-2 rounded-lg transition-all duration-100 text-xs
                          ${
                            sub.prompt === null
                              ? "col-span-2 bg-[rgba(var(--group-rgb),0.06)] border border-[rgba(var(--group-rgb),0.2)] text-[var(--group-color)] font-medium"
                              : "bg-white/2 border border-transparent hover:bg-sky-500/8 hover:text-slate-200"
                          }
                        `}
                        style={
                          {
                            "--group-rgb": hexToRgb(activeGroup.color),
                            "--group-color": activeGroup.color,
                          } as React.CSSProperties
                        }
                      >
                        {sub.prompt === null ? (
                          <div className="flex items-center gap-2">
                            <span className="text-base">✦</span>
                            Let AI choose the best {activeGroup.label} type
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className="w-1 h-1 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: activeGroup.color,
                                opacity: 0.6,
                              }}
                            />
                            {sub.label}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-white/4 flex items-center justify-between text-xs">
            <span className="text-slate-800">
              Click category → pick type → AI will generate that exact chart
            </span>
            <button
              onClick={() => {
                setOpen(false);
                setActiveGroup(null);
              }}
              className="text-slate-700 hover:text-slate-400 transition-colors"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
