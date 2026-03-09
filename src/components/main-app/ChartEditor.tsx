"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

declare global {
  interface Window {
    Plotly: any;
  }
}

interface PlotlyHTMLElement extends HTMLDivElement {
  data?: any[];
  layout?: any;
}
interface ChartEditorProps {
  message: any;
  divRef: React.RefObject<PlotlyHTMLElement | null>;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSION COMPATIBILITY RULES
//
// Groups:
//   ALL_2D  — every 2D chart type. All freely convert to each other.
//             Pie/donut are included but handled with data aggregation.
//   ALL_3D  — every 3D chart type. All freely convert to each other.
//   CROSS   — 2D scatter/line/bubble can also go to 3D scatter/line, and vice
//             versa (they share x/y point data, just gains/loses a z axis).
//
// Only truly incompatible case: surface3d ↔ most 2D (surface needs a z-matrix,
// not a point list). We allow it but the render falls back gracefully.
// ─────────────────────────────────────────────────────────────────────────────

const ALL_2D = [
  "bar",
  "hbar",
  "stacked",
  "stacked100",
  "grouped",
  "line",
  "area",
  "stackedarea",
  "scatter",
  "bubble",
  "pie",
  "donut",
  "histogram",
  "heatmap",
  "box",
  "violin",
  "funnel",
  "waterfall",
];

const ALL_3D = ["scatter3d", "line3d", "mesh3d", "surface3d"];

// 2D types whose point-based data (x/y arrays) maps well into 3D
const CROSS_2D_TO_3D = [
  "scatter",
  "line",
  "area",
  "bubble",
  "bar",
  "grouped",
  "stacked",
  "histogram",
];
// 3D types whose data can reasonably flatten back to 2D
const CROSS_3D_TO_2D = ["scatter3d", "line3d"];

function canConvert(from: string, to: string): boolean {
  if (from === to) return true;
  const from2d = ALL_2D.includes(from);
  const from3d = ALL_3D.includes(from);
  const to2d = ALL_2D.includes(to);
  const to3d = ALL_3D.includes(to);

  // All 2D ↔ all 2D  ✅
  if (from2d && to2d) return true;

  // All 3D ↔ all 3D  ✅
  if (from3d && to3d) return true;

  // Selected 2D → 3D  ✅
  if (CROSS_2D_TO_3D.includes(from) && to3d) return true;

  // Selected 3D → 2D  ✅
  if (CROSS_3D_TO_2D.includes(from) && to2d) return true;

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// DETECT chart type id from a Plotly trace
// ─────────────────────────────────────────────────────────────────────────────
function detectChartTypeId(traces: any[]): ChartTypeId {
  if (!traces || traces.length === 0) return "bar";
  const t0 = traces[0];
  const type = (t0.type || "bar").toLowerCase();
  const mode = (t0.mode || "").toLowerCase();
  const fill = t0.fill || "";
  const orient = t0.orientation || "v";
  const barmode = ""; // checked at layout level

  if (type === "scatter3d" || (type === "scatter" && t0.z)) return "scatter3d";
  if (type === "mesh3d") return "mesh3d";
  if (type === "surface") return "surface3d";
  if (type === "scatter" && mode.includes("lines") && fill === "tonexty")
    return "stackedarea";
  if (type === "scatter" && mode.includes("lines") && fill) return "area";
  if (type === "scatter" && mode.includes("lines")) return "line";
  if (type === "scatter" && mode.includes("markers") && t0.marker?.sizeref)
    return "bubble";
  if (type === "scatter") return "scatter";
  if (type === "bar" && orient === "h") return "hbar";
  if (type === "bar") return "bar"; // barmode handled below
  if (type === "pie" && t0.hole && t0.hole > 0) return "donut";
  if (type === "pie") return "pie";
  if (type === "histogram") return "histogram";
  if (type === "box") return "box";
  if (type === "violin") return "violin";
  if (type === "heatmap") return "heatmap";
  if (type === "funnel") return "funnel";
  if (type === "waterfall") return "waterfall";
  return "bar";
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const PALETTES = [
  {
    id: "vivid",
    label: "Vivid",
    colors: [
      "#6366f1",
      "#8b5cf6",
      "#ec4899",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
      "#f97316",
    ],
  },
  {
    id: "ocean",
    label: "Ocean",
    colors: [
      "#06b6d4",
      "#0ea5e9",
      "#38bdf8",
      "#0284c7",
      "#0369a1",
      "#075985",
      "#7dd3fc",
      "#bae6fd",
    ],
  },
  {
    id: "sunset",
    label: "Sunset",
    colors: [
      "#f97316",
      "#ef4444",
      "#eab308",
      "#f43f5e",
      "#fb923c",
      "#fbbf24",
      "#dc2626",
      "#b45309",
    ],
  },
  {
    id: "forest",
    label: "Forest",
    colors: [
      "#4ade80",
      "#86efac",
      "#6ee7b7",
      "#a3e635",
      "#34d399",
      "#16a34a",
      "#15803d",
      "#166534",
    ],
  },
  {
    id: "galaxy",
    label: "Galaxy",
    colors: [
      "#a78bfa",
      "#c084fc",
      "#818cf8",
      "#e879f9",
      "#7dd3fc",
      "#f0abfc",
      "#9333ea",
      "#7c3aed",
    ],
  },
  {
    id: "mono",
    label: "Mono",
    colors: [
      "#1e293b",
      "#334155",
      "#475569",
      "#64748b",
      "#94a3b8",
      "#cbd5e1",
      "#e2e8f0",
      "#f8fafc",
    ],
  },
  {
    id: "neon",
    label: "Neon",
    colors: [
      "#00ff88",
      "#00e5ff",
      "#ff00c8",
      "#ffe600",
      "#ff4400",
      "#8800ff",
      "#00ffaa",
      "#ff0066",
    ],
  },
  {
    id: "pastel",
    label: "Pastel",
    colors: [
      "#fca5a5",
      "#fcd34d",
      "#6ee7b7",
      "#93c5fd",
      "#c4b5fd",
      "#f9a8d4",
      "#a5f3fc",
      "#bbf7d0",
    ],
  },
  {
    id: "earth",
    label: "Earth",
    colors: [
      "#92400e",
      "#b45309",
      "#d97706",
      "#ca8a04",
      "#78350f",
      "#44403c",
      "#57534e",
      "#713f12",
    ],
  },
  {
    id: "berry",
    label: "Berry",
    colors: [
      "#be185d",
      "#9d174d",
      "#db2777",
      "#ec4899",
      "#a21caf",
      "#86198f",
      "#7e22ce",
      "#6b21a8",
    ],
  },
  {
    id: "coral",
    label: "Coral",
    colors: [
      "#fb7185",
      "#f472b6",
      "#e879f9",
      "#c084fc",
      "#818cf8",
      "#60a5fa",
      "#34d399",
      "#fbbf24",
    ],
  },
  {
    id: "slate",
    label: "Slate",
    colors: [
      "#64748b",
      "#475569",
      "#6366f1",
      "#8b5cf6",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ef4444",
    ],
  },
];

const FONTS = [
  "Inter",
  "DM Sans",
  "Space Grotesk",
  "Outfit",
  "Manrope",
  "Plus Jakarta Sans",
  "Sora",
  "Nunito",
  "Poppins",
  "IBM Plex Sans",
  "DM Mono",
  "JetBrains Mono",
  "Fira Code",
  "Roboto",
  "Roboto Mono",
];

const BG_PRESETS = [
  { id: "white", label: "White", hex: "#ffffff" },
  { id: "paper", label: "Paper", hex: "#fafaf9" },
  { id: "light", label: "Light", hex: "#f3f4f6" },
  { id: "black", label: "Black", hex: "#0a0a0a" },
  { id: "slate", label: "Slate", hex: "#0f172a" },
  { id: "navy", label: "Navy", hex: "#0c1445" },
  { id: "purple", label: "Purple", hex: "#1a0533" },
  { id: "green", label: "Forest", hex: "#052e16" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CHART TYPE DEFINITIONS  (now includes 3D types)
// ─────────────────────────────────────────────────────────────────────────────

const CHART_TYPES = [
  // ── 2D Cartesian ──────────────────────────────────────────────────────────
  {
    id: "bar",
    label: "Column",
    plotlyType: "bar",
    orientation: "v",
    group: "2d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <rect
          x="2"
          y="14"
          width="6"
          height="12"
          rx="1.5"
          fill="currentColor"
          opacity=".4"
        />
        <rect
          x="11"
          y="8"
          width="6"
          height="18"
          rx="1.5"
          fill="currentColor"
          opacity=".7"
        />
        <rect x="20" y="3" width="6" height="23" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "hbar",
    label: "Bar",
    plotlyType: "bar",
    orientation: "h",
    group: "2d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <rect
          x="2"
          y="3"
          width="12"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity=".4"
        />
        <rect
          x="2"
          y="11"
          width="19"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity=".7"
        />
        <rect x="2" y="19" width="24" height="6" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "stacked",
    label: "Stacked",
    plotlyType: "bar",
    barmode: "stack",
    group: "2d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <rect x="2" y="18" width="6" height="8" rx="1" fill="currentColor" />
        <rect
          x="2"
          y="11"
          width="6"
          height="6"
          rx="1"
          fill="currentColor"
          opacity=".55"
        />
        <rect x="11" y="13" width="6" height="13" rx="1" fill="currentColor" />
        <rect
          x="11"
          y="6"
          width="6"
          height="6"
          rx="1"
          fill="currentColor"
          opacity=".55"
        />
        <rect x="20" y="9" width="6" height="17" rx="1" fill="currentColor" />
        <rect
          x="20"
          y="3"
          width="6"
          height="5"
          rx="1"
          fill="currentColor"
          opacity=".55"
        />
      </svg>
    ),
  },
  {
    id: "stacked100",
    label: "100% Stack",
    plotlyType: "bar",
    barmode: "relative",
    group: "2d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <rect
          x="2"
          y="2"
          width="6"
          height="24"
          rx="1"
          fill="currentColor"
          opacity=".3"
        />
        <rect
          x="2"
          y="14"
          width="6"
          height="12"
          rx="1"
          fill="currentColor"
          opacity=".7"
        />
        <rect x="2" y="20" width="6" height="6" rx="1" fill="currentColor" />
        <rect
          x="11"
          y="2"
          width="6"
          height="24"
          rx="1"
          fill="currentColor"
          opacity=".3"
        />
        <rect
          x="11"
          y="10"
          width="6"
          height="16"
          rx="1"
          fill="currentColor"
          opacity=".7"
        />
        <rect x="11" y="18" width="6" height="8" rx="1" fill="currentColor" />
        <rect
          x="20"
          y="2"
          width="6"
          height="24"
          rx="1"
          fill="currentColor"
          opacity=".3"
        />
        <rect
          x="20"
          y="8"
          width="6"
          height="18"
          rx="1"
          fill="currentColor"
          opacity=".7"
        />
        <rect x="20" y="16" width="6" height="10" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "grouped",
    label: "Grouped",
    plotlyType: "bar",
    barmode: "group",
    group: "2d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <rect x="2" y="12" width="5" height="14" rx="1" fill="currentColor" />
        <rect
          x="8"
          y="7"
          width="5"
          height="19"
          rx="1"
          fill="currentColor"
          opacity=".5"
        />
        <rect x="16" y="9" width="5" height="17" rx="1" fill="currentColor" />
        <rect
          x="22"
          y="3"
          width="5"
          height="23"
          rx="1"
          fill="currentColor"
          opacity=".5"
        />
      </svg>
    ),
  },
  {
    id: "line",
    label: "Line",
    plotlyType: "scatter",
    mode: "lines",
    group: "2d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <polyline
          points="2,24 7,15 12,18 18,9 23,13 26,5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "area",
    label: "Area",
    plotlyType: "scatter",
    mode: "lines",
    fill: "tozeroy",
    group: "2d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path
          d="M2 24 L7 15 L12 18 L18 9 L23 13 L26 5 L26 26 L2 26 Z"
          fill="currentColor"
          opacity=".25"
        />
        <polyline
          points="2,24 7,15 12,18 18,9 23,13 26,5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "stackedarea",
    label: "Stk. Area",
    plotlyType: "scatter",
    mode: "lines",
    fill: "tonexty",
    group: "2d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path
          d="M2 26 L26 26 L26 16 L18 20 L10 15 Z"
          fill="currentColor"
          opacity=".5"
        />
        <path
          d="M2 26 L26 26 L26 8 L18 12 L10 7 Z"
          fill="currentColor"
          opacity=".25"
        />
        <polyline
          points="2,26 10,15 18,20 26,16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="2,26 10,7 18,12 26,8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
      </svg>
    ),
  },
  {
    id: "scatter",
    label: "Scatter",
    plotlyType: "scatter",
    mode: "markers",
    group: "2d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <circle cx="5" cy="22" r="2.5" fill="currentColor" />
        <circle cx="11" cy="14" r="2.5" fill="currentColor" opacity=".8" />
        <circle cx="17" cy="18" r="2.5" fill="currentColor" opacity=".6" />
        <circle cx="22" cy="8" r="2.5" fill="currentColor" />
        <circle cx="8" cy="9" r="2" fill="currentColor" opacity=".5" />
        <circle cx="25" cy="16" r="2" fill="currentColor" opacity=".7" />
      </svg>
    ),
  },
  {
    id: "bubble",
    label: "Bubble",
    plotlyType: "scatter",
    mode: "markers",
    bubble: true,
    group: "2d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <circle cx="7" cy="20" r="5" fill="currentColor" opacity=".45" />
        <circle cx="20" cy="11" r="7" fill="currentColor" opacity=".3" />
        <circle cx="12" cy="17" r="3" fill="currentColor" opacity=".75" />
      </svg>
    ),
  },
  // ── Pie family ────────────────────────────────────────────────────────────
  {
    id: "pie",
    label: "Pie",
    plotlyType: "pie",
    group: "pie",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path d="M14 14 L14 2 A12 12 0 0 1 26 14 Z" fill="currentColor" />
        <path
          d="M14 14 L26 14 A12 12 0 0 1 7 24 Z"
          fill="currentColor"
          opacity=".6"
        />
        <path
          d="M14 14 L7 24 A12 12 0 0 1 14 2 Z"
          fill="currentColor"
          opacity=".3"
        />
      </svg>
    ),
  },
  {
    id: "donut",
    label: "Donut",
    plotlyType: "pie",
    hole: 0.45,
    group: "pie",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path d="M14 14 L14 3 A11 11 0 0 1 25 14 Z" fill="currentColor" />
        <path
          d="M14 14 L25 14 A11 11 0 0 1 6 22 Z"
          fill="currentColor"
          opacity=".6"
        />
        <path
          d="M14 14 L6 22 A11 11 0 0 1 14 3 Z"
          fill="currentColor"
          opacity=".3"
        />
        <circle cx="14" cy="14" r="5" fill="white" />
      </svg>
    ),
  },
  // ── Statistical ───────────────────────────────────────────────────────────
  {
    id: "histogram",
    label: "Histogram",
    plotlyType: "histogram",
    group: "stat",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <rect
          x="1"
          y="18"
          width="4"
          height="8"
          rx="1"
          fill="currentColor"
          opacity=".3"
        />
        <rect
          x="6"
          y="12"
          width="4"
          height="14"
          rx="1"
          fill="currentColor"
          opacity=".55"
        />
        <rect x="11" y="5" width="5" height="21" rx="1" fill="currentColor" />
        <rect
          x="17"
          y="9"
          width="4"
          height="17"
          rx="1"
          fill="currentColor"
          opacity=".55"
        />
        <rect
          x="22"
          y="14"
          width="5"
          height="12"
          rx="1"
          fill="currentColor"
          opacity=".3"
        />
      </svg>
    ),
  },
  {
    id: "heatmap",
    label: "Heatmap",
    plotlyType: "heatmap",
    group: "stat",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <rect
          x="2"
          y="2"
          width="7"
          height="7"
          rx="1"
          fill="currentColor"
          opacity=".12"
        />
        <rect
          x="11"
          y="2"
          width="7"
          height="7"
          rx="1"
          fill="currentColor"
          opacity=".5"
        />
        <rect
          x="20"
          y="2"
          width="7"
          height="7"
          rx="1"
          fill="currentColor"
          opacity=".9"
        />
        <rect
          x="2"
          y="11"
          width="7"
          height="7"
          rx="1"
          fill="currentColor"
          opacity=".55"
        />
        <rect x="11" y="11" width="7" height="7" rx="1" fill="currentColor" />
        <rect
          x="20"
          y="11"
          width="7"
          height="7"
          rx="1"
          fill="currentColor"
          opacity=".3"
        />
        <rect
          x="2"
          y="20"
          width="7"
          height="7"
          rx="1"
          fill="currentColor"
          opacity=".75"
        />
        <rect
          x="11"
          y="20"
          width="7"
          height="7"
          rx="1"
          fill="currentColor"
          opacity=".25"
        />
        <rect
          x="20"
          y="20"
          width="7"
          height="7"
          rx="1"
          fill="currentColor"
          opacity=".1"
        />
      </svg>
    ),
  },
  {
    id: "box",
    label: "Box Plot",
    plotlyType: "box",
    group: "stat",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <line
          x1="7"
          y1="3"
          x2="7"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <rect
          x="3"
          y="8"
          width="8"
          height="12"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
        />
        <line
          x1="3"
          y1="14"
          x2="11"
          y2="14"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <line
          x1="7"
          y1="20"
          x2="7"
          y2="25"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="5"
          x2="18"
          y2="9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <rect
          x="14"
          y="9"
          width="8"
          height="10"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
        />
        <line
          x1="14"
          y1="14"
          x2="22"
          y2="14"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <line
          x1="18"
          y1="19"
          x2="18"
          y2="24"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "violin",
    label: "Violin",
    plotlyType: "violin",
    group: "stat",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path
          d="M9 3 Q14 7 14 14 Q14 21 9 25 L19 25 Q14 21 14 14 Q14 7 19 3 Z"
          fill="currentColor"
          opacity=".55"
        />
        <line
          x1="14"
          y1="3"
          x2="14"
          y2="25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  // ── Financial ─────────────────────────────────────────────────────────────
  {
    id: "funnel",
    label: "Funnel",
    plotlyType: "funnel",
    group: "financial",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <rect x="1" y="2" width="26" height="5" rx="1.5" fill="currentColor" />
        <rect
          x="4"
          y="9"
          width="20"
          height="5"
          rx="1.5"
          fill="currentColor"
          opacity=".75"
        />
        <rect
          x="8"
          y="16"
          width="12"
          height="5"
          rx="1.5"
          fill="currentColor"
          opacity=".5"
        />
        <rect
          x="11"
          y="23"
          width="6"
          height="4"
          rx="1.5"
          fill="currentColor"
          opacity=".3"
        />
      </svg>
    ),
  },
  {
    id: "waterfall",
    label: "Waterfall",
    plotlyType: "waterfall",
    group: "financial",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <rect x="1" y="15" width="6" height="11" rx="1" fill="currentColor" />
        <rect
          x="8"
          y="9"
          width="5"
          height="6"
          rx="1"
          fill="currentColor"
          opacity=".5"
        />
        <rect
          x="14"
          y="12"
          width="5"
          height="9"
          rx="1"
          fill="#f87171"
          opacity=".75"
        />
        <rect
          x="20"
          y="5"
          width="7"
          height="7"
          rx="1"
          fill="currentColor"
          opacity=".8"
        />
      </svg>
    ),
  },
  // ── 3D ────────────────────────────────────────────────────────────────────
  {
    id: "scatter3d",
    label: "3D Scatter",
    plotlyType: "scatter3d",
    mode3d: "markers",
    group: "3d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path
          d="M14 3 L4 9 L4 21 L14 27 L24 21 L24 9 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity=".4"
        />
        <circle cx="8" cy="12" r="2.5" fill="currentColor" />
        <circle cx="19" cy="9" r="2" fill="currentColor" opacity=".7" />
        <circle cx="14" cy="19" r="3" fill="currentColor" opacity=".85" />
        <circle cx="21" cy="18" r="1.5" fill="currentColor" opacity=".5" />
      </svg>
    ),
  },
  {
    id: "line3d",
    label: "3D Line",
    plotlyType: "scatter3d",
    mode3d: "lines+markers",
    group: "3d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path
          d="M14 3 L4 9 L4 21 L14 27 L24 21 L24 9 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity=".4"
        />
        <polyline
          points="5,20 10,13 16,17 23,8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "mesh3d",
    label: "3D Mesh",
    plotlyType: "mesh3d",
    group: "3d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <polygon
          points="14,3 24,20 4,20"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="currentColor"
          opacity=".15"
        />
        <line
          x1="14"
          y1="3"
          x2="4"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="14"
          y1="3"
          x2="24"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="4"
          y1="20"
          x2="24"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="14"
          y1="3"
          x2="14"
          y2="20"
          stroke="currentColor"
          strokeWidth="1"
          opacity=".4"
        />
        <line
          x1="9"
          y1="11"
          x2="19"
          y2="11"
          stroke="currentColor"
          strokeWidth="1"
          opacity=".4"
        />
      </svg>
    ),
  },
  {
    id: "surface3d",
    label: "3D Surface",
    plotlyType: "surface",
    group: "3d",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path
          d="M3 20 Q7 10 14 12 Q21 14 25 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M3 24 Q7 16 14 17 Q21 18 25 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity=".55"
        />
        <path
          d="M3 20 Q7 10 14 12 Q21 14 25 6 L25 12 Q21 18 14 17 Q7 16 3 24 Z"
          fill="currentColor"
          opacity=".12"
        />
      </svg>
    ),
  },
] as const;

type ChartTypeId = (typeof CHART_TYPES)[number]["id"];

const CHART_GROUPS = [
  {
    id: "2d",
    label: "2D Charts",
    types: CHART_TYPES.filter((c) => c.group === "2d"),
  },
  {
    id: "pie",
    label: "Pie / Donut",
    types: CHART_TYPES.filter((c) => c.group === "pie"),
  },
  {
    id: "stat",
    label: "Statistical",
    types: CHART_TYPES.filter((c) => c.group === "stat"),
  },
  {
    id: "financial",
    label: "Financial",
    types: CHART_TYPES.filter((c) => c.group === "financial"),
  },
  {
    id: "3d",
    label: "3D Charts",
    types: CHART_TYPES.filter((c) => c.group === "3d"),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MINI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Sec({
  title,
  children,
  open: defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid #f0f0f0" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "#fafafa")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "none")
        }
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#9ca3af",
          }}
        >
          {title}
        </span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.18s",
            flexShrink: 0,
          }}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="#c4c4c4"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <div style={{ padding: "2px 16px 14px" }}>{children}</div>}
    </div>
  );
}

function LRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
      }}
    >
      <span
        style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0, width: 74 }}
      >
        {label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      }}
    >
      <span style={{ fontSize: 11, color: "#374151" }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: value ? "#06b6d4" : "#e5e7eb",
          border: "none",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: value ? 18 : 3,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.18s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 11, color: "#374151" }}>{label}</span>
        <span
          style={{
            fontSize: 11,
            color: "#06b6d4",
            fontFamily: "monospace",
            fontWeight: 700,
            minWidth: 32,
            textAlign: "right",
          }}
        >
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: "#06b6d4",
          cursor: "pointer",
          height: 4,
        }}
      />
    </div>
  );
}

function TxtInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        padding: "7px 10px",
        fontSize: 11,
        border: `1.5px solid ${focused ? "#06b6d4" : "#e5e7eb"}`,
        borderRadius: 8,
        outline: "none",
        background: "#f9fafb",
        color: "#111827",
        boxSizing: "border-box",
        boxShadow: focused ? "0 0 0 3px rgba(6,182,212,0.1)" : "none",
        transition: "border-color 0.15s,box-shadow 0.15s",
      }}
    />
  );
}

function NumInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        width: "100%",
        padding: "7px 10px",
        fontSize: 11,
        border: "1.5px solid #e5e7eb",
        borderRadius: 8,
        outline: "none",
        background: "#f9fafb",
        color: "#111827",
        fontFamily: "monospace",
        boxSizing: "border-box",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INCOMPATIBLE CONVERSION BANNER
// Only shown for surface3d ↔ non-cross-2D types etc.
// ─────────────────────────────────────────────────────────────────────────────
function IncompatBanner({
  from,
  to,
  onDismiss,
}: {
  from: string;
  to: string;
  onDismiss: () => void;
}) {
  return (
    <div
      style={{
        margin: "8px 16px",
        padding: "8px 12px",
        background: "#fef3c7",
        border: "1px solid #fcd34d",
        borderRadius: 8,
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#92400e",
            margin: "0 0 2px",
          }}
        >
          Incompatible Conversion
        </p>
        <p style={{ fontSize: 10, color: "#b45309", margin: 0 }}>
          <strong>{from}</strong> → <strong>{to}</strong> is not supported. 3D
          surface charts require a Z-matrix and cannot be directly converted to
          most 2D types. Try converting to a 3D Scatter or 3D Line first.
        </p>
      </div>
      <button
        onClick={onDismiss}
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "#d97706",
          fontSize: 14,
          padding: 0,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EDITOR
// ─────────────────────────────────────────────────────────────────────────────

export default function ChartEditor({
  message,
  divRef,
  onClose,
}: ChartEditorProps) {
  const plotRef = useRef<PlotlyHTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [incompatWarning, setIncompatWarning] = useState<{
    from: string;
    to: string;
  } | null>(null);

  // ── Determine live source data ─────────────────────────────────────────────
  // Prefer the LIVE state from the main chart div (captures toolbar changes).
  // Fall back to original message content if Plotly hasn't rendered yet.
  const getLiveData = useCallback((): { data: any[]; layout: any } => {
    const liveDiv = divRef?.current;
    if (liveDiv && liveDiv.data && liveDiv.data.length > 0) {
      return {
        data: liveDiv.data,
        layout: liveDiv.layout || message?.content?.layout || {},
      };
    }
    return {
      data: message?.content?.data || [],
      layout: message?.content?.layout || {},
    };
  }, [divRef, message]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<
    "graph" | "style" | "axes" | "annotate" | "export"
  >("graph");
  const [chartTypeId, setChartTypeId] = useState<ChartTypeId>("bar");
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [bgHex, setBgHex] = useState("#ffffff");
  const [customBg, setCustomBg] = useState("#ffffff");
  const [borderRadius, setBorderRadius] = useState(12);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [xLabel, setXLabel] = useState("");
  const [yLabel, setYLabel] = useState("");
  const [showLegend, setShowLegend] = useState(true);
  const [legendPos, setLegendPos] = useState<
    "bottom" | "top" | "left" | "right"
  >("bottom");
  const [showGrid, setShowGrid] = useState(true);
  const [showZero, setShowZero] = useState(true);
  const [showTicks, setShowTicks] = useState(true);
  const [xAngle, setXAngle] = useState(0);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(12);
  const [titleSize, setTitleSize] = useState(18);
  const [lineWidth, setLineWidth] = useState(2);
  const [markerSize, setMarkerSize] = useState(7);
  const [opacity, setOpacity] = useState(90);
  const [barGap, setBarGap] = useState(20);
  const [smooth, setSmooth] = useState(false);
  const [showMarkers, setShowMarkers] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [fillOpacity, setFillOpacity] = useState(30);
  const [borderWidth, setBorderWidth] = useState(0);
  const [markerSymbol, setMarkerSymbol] = useState("circle");
  const [logX, setLogX] = useState(false);
  const [logY, setLogY] = useState(false);
  const [reverseX, setReverseX] = useState(false);
  const [reverseY, setReverseY] = useState(false);
  const [annotations, setAnnotations] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const [exportW, setExportW] = useState(1200);
  const [exportH, setExportH] = useState(700);

  // ── Seed state from LIVE chart (captures toolbar changes) ─────────────────
  useEffect(() => {
    const { data: liveData, layout: liveLayout } = getLiveData();

    // Title & labels — prefer live layout
    setTitle(
      typeof liveLayout.title === "string"
        ? liveLayout.title
        : liveLayout.title?.text || "",
    );
    setXLabel(liveLayout.xaxis?.title?.text || liveLayout.xaxis?.title || "");
    setYLabel(liveLayout.yaxis?.title?.text || liveLayout.yaxis?.title || "");

    // Detect chart type from live traces
    const detectedId = detectChartTypeId(liveData);
    setChartTypeId(detectedId);

    // Detect barmode for bar subtypes
    const barmode =
      liveLayout.barmode || (liveData[0] as any)?.barmode || "group";
    if (detectedId === "bar" && barmode === "stack") setChartTypeId("stacked");
    if (detectedId === "bar" && barmode === "relative")
      setChartTypeId("stacked100");
    if (detectedId === "bar" && barmode === "group" && liveData.length > 1)
      setChartTypeId("grouped");

    // Detect palette from first trace color
    if (liveData.length > 0) {
      const firstColor = (liveData[0] as any)?.marker?.color;
      const firstLineColor = (liveData[0] as any)?.line?.color;
      const c =
        (typeof firstColor === "string" ? firstColor : firstLineColor) || "";
      const found = PALETTES.findIndex((p) => p.colors.includes(c));
      if (found >= 0) setPaletteIdx(found);
    }

    // Legend
    setShowLegend(liveLayout.showlegend !== false);

    // Grid
    setShowGrid(liveLayout.xaxis?.showgrid !== false);
    setShowZero(liveLayout.xaxis?.zeroline !== false);

    setMounted(true);
  }, [getLiveData]);

  // ── Handle chart type change with compatibility guard ─────────────────────
  const handleChartTypeChange = useCallback(
    (newId: ChartTypeId) => {
      if (!canConvert(chartTypeId, newId)) {
        setIncompatWarning({ from: chartTypeId, to: newId });
        return;
      }
      setIncompatWarning(null);
      setChartTypeId(newId);
    },
    [chartTypeId],
  );

  // ── Build pie-compatible data from non-pie traces ─────────────────────────
  const buildPieData = useCallback((rawData: any[], pal: string[]) => {
    // Aggregate all y values summed per trace name for pie sectors
    if (rawData.length === 0) return [];
    const labels: string[] = [];
    const values: number[] = [];
    rawData.forEach((trace, i) => {
      const name = trace.name || `Series ${i + 1}`;
      const vals: number[] = trace.y || trace.values || trace.r || [];
      const total = Array.isArray(vals)
        ? vals.reduce((s: number, v: any) => s + (Number(v) || 0), 0)
        : Number(vals) || 0;
      labels.push(name);
      values.push(total);
    });
    return [
      {
        type: "pie",
        labels,
        values,
        marker: { colors: pal },
        textinfo: "label+percent",
        hoverinfo: "label+value+percent",
      },
    ];
  }, []);

  // ── Render chart ──────────────────────────────────────────────────────────
  const applyChart = useCallback(() => {
    if (!plotRef.current || typeof window === "undefined" || !window.Plotly)
      return;
    const Plotly = window.Plotly;
    const { data: liveData, layout: liveLayout } = getLiveData();

    const ct = CHART_TYPES.find((c) => c.id === chartTypeId) || CHART_TYPES[0];
    const pal = PALETTES[paletteIdx].colors;
    const isLightBg = ["#ffffff", "#fafaf9", "#f3f4f6"].includes(bgHex);
    const textClr = isLightBg ? "#374151" : "rgba(255,255,255,0.8)";
    const gridClr = isLightBg ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)";
    const lineClr = isLightBg ? "#e5e7eb" : "rgba(255,255,255,0.1)";
    const is3D = ct.group === "3d";
    const isPieType = ct.group === "pie";

    let data: any[];

    // ── Pie / Donut — needs special data aggregation ─────────────────────────
    if (isPieType) {
      const existing0 = liveData[0];
      // If source is already pie/donut, reuse directly
      if (existing0?.type === "pie") {
        data = liveData.map((t: any, i: number) => ({
          ...t,
          type: "pie",
          hole: (ct as any).hole || 0,
          marker: { ...t.marker, colors: pal },
        }));
      } else {
        // Convert from cartesian: aggregate y values per series into sectors
        data = buildPieData(liveData, pal);
        if ((ct as any).hole) data[0].hole = (ct as any).hole;
      }
    }

    // ── 3D charts ─────────────────────────────────────────────────────────────
    else if (is3D) {
      data = liveData.map((trace: any, i: number) => {
        const clr = pal[i % pal.length];
        const base: any = { ...trace };

        if (ct.plotlyType === "mesh3d") {
          base.type = "mesh3d";
          base.color = clr;
          base.opacity = opacity / 100;
          // ensure i/j/k exist for mesh
          if (!base.i) {
            const n = (base.x || []).length;
            base.i = [];
            base.j = [];
            base.k = [];
          }
        } else if (ct.plotlyType === "surface") {
          base.type = "surface";
          base.colorscale = ct.id === "surface3d" ? "Viridis" : base.colorscale;
          base.opacity = opacity / 100;
        } else {
          // scatter3d / line3d
          base.type = "scatter3d";
          base.mode = (ct as any).mode3d || "markers";
          base.marker = {
            ...(trace.marker || {}),
            color: clr,
            size: Math.max(markerSize - 2, 3),
            symbol: markerSymbol,
            opacity: opacity / 100,
          };
          base.line = { color: clr, width: lineWidth };
        }
        return base;
      });
    }

    // ── Standard 2D / statistical / financial ────────────────────────────────
    else {
      data = liveData.map((trace: any, i: number) => {
        const clr = pal[i % pal.length];
        const base: any = { ...trace };

        base.type = ct.plotlyType;
        base.name = trace.name || `Series ${i + 1}`;

        base.marker = {
          ...(trace.marker || {}),
          color: clr,
          size: (ct as any).bubble
            ? (trace.marker?.size ?? markerSize)
            : markerSize,
          opacity: opacity / 100,
          symbol: markerSymbol,
          line: { color: "rgba(255,255,255,0.3)", width: borderWidth },
        };
        base.line = {
          color: clr,
          width: lineWidth,
          shape: smooth ? "spline" : "linear",
        };

        if ((ct as any).mode) {
          base.mode =
            (ct as any).mode +
            (showMarkers && (ct as any).mode === "lines" ? "+markers" : "");
        } else if (ct.plotlyType === "scatter") {
          base.mode = "markers";
        } else {
          delete base.mode;
        }

        if ((ct as any).fill) {
          base.fill = (ct as any).fill;
          const fillAlpha = Math.round(fillOpacity * 2.55)
            .toString(16)
            .padStart(2, "0");
          base.fillcolor = clr + fillAlpha;
        } else {
          delete base.fill;
        }

        if ((ct as any).hole) base.hole = (ct as any).hole;
        else delete base.hole;
        if ((ct as any).orientation) base.orientation = (ct as any).orientation;
        else delete base.orientation;

        if (showLabels && ct.plotlyType !== "heatmap") {
          base.texttemplate = "%{y}";
          base.textposition = "outside";
          base.textfont = {
            size: fontSize - 1,
            color: textClr,
            family: fontFamily,
          };
          base.cliponaxis = false;
        } else {
          base.texttemplate = undefined;
          base.text = undefined;
        }

        return base;
      });
    }

    // ── Layout ────────────────────────────────────────────────────────────────
    const legendConfig: Record<string, any> = {
      bottom: {
        orientation: "h",
        x: 0.5,
        xanchor: "center",
        y: -0.22,
        yanchor: "top",
      },
      top: {
        orientation: "h",
        x: 0.5,
        xanchor: "center",
        y: 1.06,
        yanchor: "bottom",
      },
      left: { orientation: "v", x: -0.18, xanchor: "right", y: 0.5 },
      right: { orientation: "v", x: 1.04, xanchor: "left", y: 0.5 },
    };

    const layout: any = {
      autosize: true,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { family: fontFamily, size: fontSize, color: textClr },
      showlegend: showLegend,
      legend: showLegend
        ? {
            ...legendConfig[legendPos],
            font: { family: fontFamily, size: fontSize - 1, color: textClr },
            bgcolor: isLightBg ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.4)",
            bordercolor: lineClr,
            borderwidth: 1,
          }
        : undefined,
      margin: {
        t: 20,
        b: showLegend && legendPos === "bottom" ? 80 : 50,
        l: 60,
        r: 20,
      },
      bargap: barGap / 100,
      barmode: (ct as any).barmode || liveLayout?.barmode || "group",
    };

    // 3D scene config
    if (is3D) {
      layout.scene = {
        ...(liveLayout?.scene || {}),
        xaxis: {
          ...(liveLayout?.scene?.xaxis || {}),
          gridcolor: gridClr,
          tickfont: { color: textClr, size: 10 },
          backgroundcolor: "rgba(0,0,0,0)",
        },
        yaxis: {
          ...(liveLayout?.scene?.yaxis || {}),
          gridcolor: gridClr,
          tickfont: { color: textClr, size: 10 },
          backgroundcolor: "rgba(0,0,0,0)",
        },
        zaxis: {
          ...(liveLayout?.scene?.zaxis || {}),
          gridcolor: gridClr,
          tickfont: { color: textClr, size: 10 },
          backgroundcolor: "rgba(0,0,0,0)",
        },
        bgcolor: "rgba(0,0,0,0)",
      };
    }

    // 2D axes
    if (!is3D && !isPieType) {
      layout.xaxis = {
        ...(liveLayout?.xaxis || {}),
        title: xLabel
          ? { text: xLabel, font: { size: fontSize, color: textClr } }
          : undefined,
        showgrid: showGrid,
        gridcolor: gridClr,
        gridwidth: 1,
        zeroline: showZero,
        zerolinecolor: gridClr,
        zerolinewidth: 1.5,
        showticklabels: showTicks,
        tickfont: { size: fontSize - 1, color: textClr, family: fontFamily },
        tickangle: xAngle,
        automargin: true,
        type: logX ? "log" : undefined,
        autorange: reverseX ? "reversed" : true,
        showline: true,
        linecolor: lineClr,
        linewidth: 1,
      };
      layout.yaxis = {
        ...(liveLayout?.yaxis || {}),
        title: yLabel
          ? { text: yLabel, font: { size: fontSize, color: textClr } }
          : undefined,
        showgrid: showGrid,
        gridcolor: gridClr,
        gridwidth: 1,
        zeroline: showZero,
        zerolinecolor: gridClr,
        showticklabels: showTicks,
        tickfont: { size: fontSize - 1, color: textClr, family: fontFamily },
        automargin: true,
        type: logY ? "log" : undefined,
        autorange: reverseY ? "reversed" : true,
        showline: true,
        linecolor: lineClr,
        linewidth: 1,
      };
    }

    Plotly.react(plotRef.current, data, layout, {
      responsive: true,
      displayModeBar: false,
    });
  }, [
    chartTypeId,
    paletteIdx,
    bgHex,
    showLegend,
    legendPos,
    showGrid,
    showZero,
    showTicks,
    xAngle,
    fontFamily,
    fontSize,
    lineWidth,
    markerSize,
    opacity,
    barGap,
    smooth,
    showMarkers,
    showLabels,
    fillOpacity,
    markerSymbol,
    borderWidth,
    xLabel,
    yLabel,
    logX,
    logY,
    reverseX,
    reverseY,
    getLiveData,
    buildPieData,
  ]);

  useEffect(() => {
    if (mounted) applyChart();
  }, [mounted, applyChart]);

  const handleExport = (fmt: string) => {
    if (!plotRef.current || !window.Plotly) return;
    window.Plotly.downloadImage(plotRef.current, {
      format: fmt as any,
      width: exportW,
      height: exportH,
      filename: (title || "chart").replace(/[^a-z0-9]/gi, "_").toLowerCase(),
    });
  };

  const isLightBg = ["#ffffff", "#fafaf9", "#f3f4f6"].includes(bgHex);
  if (!mounted) return null;

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const TABS = [
    {
      id: "graph",
      label: "Graph",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="3" y="12" width="4" height="9" rx="1" />
          <rect x="10" y="7" width="4" height="14" rx="1" />
          <rect x="17" y="3" width="4" height="18" rx="1" />
        </svg>
      ),
    },
    {
      id: "style",
      label: "Style",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      id: "axes",
      label: "Axes",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="3" y1="21" x2="3" y2="3" />
          <line x1="3" y1="21" x2="21" y2="21" />
          <polyline points="7 14 11 10 15 13 21 7" />
        </svg>
      ),
    },
    {
      id: "annotate",
      label: "Notes",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      ),
    },
    {
      id: "export",
      label: "Export",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ] as const;

  // ── Render ────────────────────────────────────────────────────────────────
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        background: "#f4f5f7",
        fontFamily: "'Inter',-apple-system,sans-serif",
      }}
    >
      {/* ─── TOP BAR ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 20px",
          height: 54,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid #e5e7eb",
            borderRadius: 9,
            background: "none",
            cursor: "pointer",
            color: "#6b7280",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "none";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
            minWidth: 0,
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled chart"
            style={{
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 14,
              fontWeight: 700,
              color: "#111827",
              minWidth: 0,
              maxWidth: 280,
            }}
          />
          <span style={{ color: "#e5e7eb", fontSize: 16 }}>|</span>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Add subtitle…"
            style={{
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 13,
              color: "#9ca3af",
              minWidth: 0,
              maxWidth: 220,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {(["PNG", "SVG", "JPEG"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleExport(f.toLowerCase())}
              style={{
                padding: "6px 13px",
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 7,
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                color: "#6b7280",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#06b6d4";
                (e.currentTarget as HTMLElement).style.color = "#06b6d4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                (e.currentTarget as HTMLElement).style.color = "#6b7280";
              }}
            >
              {f}
            </button>
          ))}
          <button
            onClick={onClose}
            style={{
              padding: "7px 18px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg,#06b6d4,#0891b2)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(6,182,212,0.35)",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export & Publish
          </button>
        </div>
      </div>

      {/* ─── BODY ─── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* ─── CHART CANVAS ─── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 36,
            minWidth: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "radial-gradient(circle,#d1d5db 1.2px,transparent 1.2px)",
              backgroundSize: "22px 22px",
              opacity: 0.4,
            }}
          />
          <div
            style={{
              background: bgHex,
              borderRadius,
              boxShadow: isLightBg
                ? "0 8px 48px rgba(0,0,0,0.13),0 1px 4px rgba(0,0,0,0.05)"
                : "0 0 0 1px rgba(255,255,255,0.07),0 28px 70px rgba(0,0,0,0.75)",
              width: "min(100%,880px)",
              overflow: "hidden",
              position: "relative",
              zIndex: 1,
            }}
          >
            {(title || subtitle || showWatermark) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "18px 22px 10px",
                  borderBottom: title
                    ? `1px solid ${isLightBg ? "#f3f4f6" : "rgba(255,255,255,0.05)"}`
                    : "none",
                }}
              >
                <div>
                  {title && (
                    <h3
                      style={{
                        margin: 0,
                        fontSize: titleSize,
                        fontWeight: 700,
                        color: isLightBg ? "#111827" : "#fff",
                        fontFamily,
                        lineHeight: 1.25,
                      }}
                    >
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 12,
                        color: isLightBg ? "#9ca3af" : "rgba(255,255,255,0.4)",
                        fontFamily,
                      }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
                {showWatermark && (
                  <span
                    style={{
                      fontSize: 10,
                      color: isLightBg ? "#d1d5db" : "rgba(255,255,255,0.15)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      marginTop: 2,
                    }}
                  >
                    ✦ Graphix
                  </span>
                )}
              </div>
            )}
            {annotations.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                  padding: "8px 22px 0",
                }}
              >
                {annotations.map((a, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 10,
                      padding: "2px 9px",
                      borderRadius: 20,
                      background: "rgba(6,182,212,0.1)",
                      color: "#06b6d4",
                      border: "1px solid rgba(6,182,212,0.25)",
                      fontFamily: "monospace",
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
            <div ref={plotRef} style={{ width: "100%", minHeight: 380 }} />
          </div>
          <p
            style={{
              marginTop: 14,
              fontSize: 10,
              color: "#b0b8c4",
              fontFamily: "monospace",
            }}
          >
            Drag to zoom · Double-click to reset · Scroll to pan
          </p>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div
          style={{
            width: 308,
            background: "#fff",
            borderLeft: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #e5e7eb",
              flexShrink: 0,
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "10px 0 9px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderBottom:
                    tab === t.id
                      ? "2.5px solid #06b6d4"
                      : "2.5px solid transparent",
                  color: tab === t.id ? "#06b6d4" : "#9ca3af",
                  transition: "color 0.12s",
                }}
              >
                {t.icon}
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* ═══ GRAPH TAB ═══ */}
            {tab === "graph" && (
              <>
                {incompatWarning && (
                  <IncompatBanner
                    from={
                      CHART_TYPES.find((c) => c.id === incompatWarning.from)
                        ?.label || incompatWarning.from
                    }
                    to={
                      CHART_TYPES.find((c) => c.id === incompatWarning.to)
                        ?.label || incompatWarning.to
                    }
                    onDismiss={() => setIncompatWarning(null)}
                  />
                )}

                {CHART_GROUPS.map((group) => (
                  <Sec
                    key={group.id}
                    title={`${group.label} ${group.types.some((t) => t.id === chartTypeId) ? "· Active" : ""}`}
                    open={group.types.some((t) => t.id === chartTypeId)}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: 7,
                      }}
                    >
                      {group.types.map((ct) => {
                        const compatible = canConvert(chartTypeId, ct.id);
                        const isActive = chartTypeId === ct.id;
                        return (
                          <button
                            key={ct.id}
                            onClick={() => handleChartTypeChange(ct.id)}
                            title={
                              compatible
                                ? `Convert to ${ct.label}`
                                : `surface3d → 2D not supported directly. Convert to 3D Scatter first.`
                            }
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 6,
                              padding: "10px 4px 8px",
                              borderRadius: 10,
                              border: isActive
                                ? "2px solid #06b6d4"
                                : compatible
                                  ? "1.5px solid #e5e7eb"
                                  : "1.5px solid #fcd34d",
                              background: isActive
                                ? "rgba(6,182,212,0.06)"
                                : compatible
                                  ? "#fafafa"
                                  : "#fffbeb",
                              cursor: compatible ? "pointer" : "not-allowed",
                              transition: "all 0.12s",
                              color: isActive
                                ? "#06b6d4"
                                : compatible
                                  ? "#6b7280"
                                  : "#d97706",
                              opacity: compatible ? 1 : 0.5,
                              position: "relative",
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive && compatible) {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.borderColor = "#d1d5db";
                                (
                                  e.currentTarget as HTMLElement
                                ).style.background = "#f3f4f6";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive && compatible) {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.borderColor = "#e5e7eb";
                                (
                                  e.currentTarget as HTMLElement
                                ).style.background = "#fafafa";
                              }
                            }}
                          >
                            {ct.icon}
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 600,
                                textAlign: "center",
                                lineHeight: 1.25,
                                letterSpacing: "0.01em",
                              }}
                            >
                              {ct.label}
                            </span>
                            {!compatible && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: 3,
                                  right: 3,
                                  fontSize: 9,
                                }}
                              >
                                ⚠️
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Sec>
                ))}

                <Sec title="Data Labels">
                  <Toggle
                    label="Show values on chart"
                    value={showLabels}
                    onChange={setShowLabels}
                  />
                  <Toggle
                    label="Show markers on lines"
                    value={showMarkers}
                    onChange={setShowMarkers}
                  />
                </Sec>

                <Sec title="Legend" open={false}>
                  <Toggle
                    label="Show legend"
                    value={showLegend}
                    onChange={setShowLegend}
                  />
                  {showLegend && (
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          margin: "4px 0 6px",
                        }}
                      >
                        Position
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4,1fr)",
                          gap: 4,
                        }}
                      >
                        {(["top", "bottom", "left", "right"] as const).map(
                          (pos) => (
                            <button
                              key={pos}
                              onClick={() => setLegendPos(pos)}
                              style={{
                                padding: "5px 2px",
                                fontSize: 10,
                                fontWeight: 600,
                                borderRadius: 7,
                                border:
                                  legendPos === pos
                                    ? "1.5px solid #06b6d4"
                                    : "1.5px solid #e5e7eb",
                                background:
                                  legendPos === pos
                                    ? "rgba(6,182,212,0.07)"
                                    : "#fafafa",
                                color:
                                  legendPos === pos ? "#06b6d4" : "#9ca3af",
                                cursor: "pointer",
                                textTransform: "capitalize",
                              }}
                            >
                              {pos}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </Sec>

                <Sec title="Watermark" open={false}>
                  <Toggle
                    label="Show Graphix branding"
                    value={showWatermark}
                    onChange={setShowWatermark}
                  />
                </Sec>
              </>
            )}

            {/* ═══ STYLE TAB ═══ */}
            {tab === "style" && (
              <>
                <Sec title="Color Palette">
                  {PALETTES.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => setPaletteIdx(i)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "7px 8px",
                        borderRadius: 8,
                        border:
                          paletteIdx === i
                            ? "1.5px solid #06b6d4"
                            : "1.5px solid transparent",
                        background:
                          paletteIdx === i
                            ? "rgba(6,182,212,0.05)"
                            : "transparent",
                        cursor: "pointer",
                        marginBottom: 2,
                        transition: "all 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        if (paletteIdx !== i)
                          (e.currentTarget as HTMLElement).style.background =
                            "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        if (paletteIdx !== i)
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                      }}
                    >
                      <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                        {p.colors.slice(0, 6).map((c, j) => (
                          <span
                            key={j}
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 3,
                              background: c,
                              display: "block",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: paletteIdx === i ? "#06b6d4" : "#374151",
                          flex: 1,
                          textAlign: "left",
                        }}
                      >
                        {p.label}
                      </span>
                      {paletteIdx === i && (
                        <span
                          style={{
                            color: "#06b6d4",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </Sec>

                <Sec title="Background">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    {BG_PRESETS.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBgHex(b.hex)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 5,
                          padding: "8px 4px 7px",
                          borderRadius: 9,
                          border:
                            bgHex === b.hex
                              ? "2px solid #06b6d4"
                              : "1.5px solid #e5e7eb",
                          background:
                            bgHex === b.hex
                              ? "rgba(6,182,212,0.05)"
                              : "#fafafa",
                          cursor: "pointer",
                          transition: "all 0.1s",
                          color: bgHex === b.hex ? "#06b6d4" : "#9ca3af",
                        }}
                      >
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: b.hex,
                            border: "1px solid #d1d5db",
                            display: "block",
                          }}
                        />
                        <span style={{ fontSize: 9.5, fontWeight: 600 }}>
                          {b.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <LRow label="Custom">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="color"
                        value={customBg}
                        onChange={(e) => {
                          setCustomBg(e.target.value);
                          setBgHex(e.target.value);
                        }}
                        style={{
                          width: 32,
                          height: 32,
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 7,
                          cursor: "pointer",
                          padding: 2,
                          background: "none",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          fontFamily: "monospace",
                        }}
                      >
                        {customBg.toUpperCase()}
                      </span>
                    </div>
                  </LRow>
                </Sec>

                <Sec title="Typography">
                  <div style={{ marginBottom: 10 }}>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        margin: "0 0 5px",
                      }}
                    >
                      Font family
                    </p>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 11,
                        border: "1.5px solid #e5e7eb",
                        borderRadius: 8,
                        background: "#f9fafb",
                        color: "#111827",
                        outline: "none",
                      }}
                    >
                      {FONTS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Slider
                    label="Base font size"
                    value={fontSize}
                    min={8}
                    max={18}
                    unit="px"
                    onChange={setFontSize}
                  />
                  <Slider
                    label="Title font size"
                    value={titleSize}
                    min={12}
                    max={36}
                    unit="px"
                    onChange={setTitleSize}
                  />
                </Sec>

                <Sec title="Marks & Lines" open={false}>
                  <Slider
                    label="Opacity"
                    value={opacity}
                    min={20}
                    max={100}
                    unit="%"
                    onChange={setOpacity}
                  />
                  <Slider
                    label="Line width"
                    value={lineWidth}
                    min={1}
                    max={8}
                    onChange={setLineWidth}
                  />
                  <Slider
                    label="Marker size"
                    value={markerSize}
                    min={3}
                    max={20}
                    onChange={setMarkerSize}
                  />
                  <Slider
                    label="Bar gap"
                    value={barGap}
                    min={0}
                    max={60}
                    unit="%"
                    onChange={setBarGap}
                  />
                  <Slider
                    label="Fill opacity"
                    value={fillOpacity}
                    min={5}
                    max={80}
                    unit="%"
                    onChange={setFillOpacity}
                  />
                  <Slider
                    label="Border width"
                    value={borderWidth}
                    min={0}
                    max={5}
                    onChange={setBorderWidth}
                  />
                  <Toggle
                    label="Smooth curves (spline)"
                    value={smooth}
                    onChange={setSmooth}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        margin: "4px 0 6px",
                      }}
                    >
                      Marker symbol
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5,1fr)",
                        gap: 4,
                      }}
                    >
                      {[
                        "circle",
                        "square",
                        "diamond",
                        "triangle-up",
                        "cross",
                        "x",
                        "star",
                        "hexagram",
                        "pentagon",
                        "asterisk",
                      ].map((sym) => (
                        <button
                          key={sym}
                          onClick={() => setMarkerSymbol(sym)}
                          style={{
                            padding: "5px 2px",
                            fontSize: 9,
                            borderRadius: 6,
                            border:
                              markerSymbol === sym
                                ? "1.5px solid #06b6d4"
                                : "1.5px solid #e5e7eb",
                            background:
                              markerSymbol === sym
                                ? "rgba(6,182,212,0.08)"
                                : "#fafafa",
                            color: markerSymbol === sym ? "#06b6d4" : "#9ca3af",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          {sym
                            .replace("-up", "")
                            .replace("gram", "")
                            .slice(0, 4)}
                        </button>
                      ))}
                    </div>
                  </div>
                </Sec>

                <Sec title="Card" open={false}>
                  <Slider
                    label="Border radius"
                    value={borderRadius}
                    min={0}
                    max={28}
                    unit="px"
                    onChange={setBorderRadius}
                  />
                </Sec>
              </>
            )}

            {/* ═══ AXES TAB ═══ */}
            {tab === "axes" && (
              <>
                <Sec title="Axis Labels">
                  <div style={{ marginBottom: 10 }}>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        margin: "0 0 5px",
                      }}
                    >
                      X-Axis label
                    </p>
                    <TxtInput
                      value={xLabel}
                      onChange={setXLabel}
                      placeholder="e.g. Month"
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        margin: "0 0 5px",
                      }}
                    >
                      Y-Axis label
                    </p>
                    <TxtInput
                      value={yLabel}
                      onChange={setYLabel}
                      placeholder="e.g. Revenue ($)"
                    />
                  </div>
                </Sec>
                <Sec title="Grid & Lines">
                  <Toggle
                    label="Show grid lines"
                    value={showGrid}
                    onChange={setShowGrid}
                  />
                  <Toggle
                    label="Show zero line"
                    value={showZero}
                    onChange={setShowZero}
                  />
                  <Toggle
                    label="Show tick labels"
                    value={showTicks}
                    onChange={setShowTicks}
                  />
                </Sec>
                <Sec title="Scale">
                  <Toggle
                    label="Log scale — X axis"
                    value={logX}
                    onChange={setLogX}
                  />
                  <Toggle
                    label="Log scale — Y axis"
                    value={logY}
                    onChange={setLogY}
                  />
                  <Toggle
                    label="Reverse X axis"
                    value={reverseX}
                    onChange={setReverseX}
                  />
                  <Toggle
                    label="Reverse Y axis"
                    value={reverseY}
                    onChange={setReverseY}
                  />
                </Sec>
                <Sec title="X-Axis Rotation" open={false}>
                  <Slider
                    label="Tick angle"
                    value={xAngle}
                    min={-90}
                    max={90}
                    unit="°"
                    onChange={setXAngle}
                  />
                </Sec>
              </>
            )}

            {/* ═══ ANNOTATE TAB ═══ */}
            {tab === "annotate" && (
              <>
                <Sec title="Title & Subtitle">
                  <div style={{ marginBottom: 10 }}>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        margin: "0 0 5px",
                      }}
                    >
                      Chart title
                    </p>
                    <TxtInput
                      value={title}
                      onChange={setTitle}
                      placeholder="Add a title…"
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        margin: "0 0 5px",
                      }}
                    >
                      Subtitle / description
                    </p>
                    <TxtInput
                      value={subtitle}
                      onChange={setSubtitle}
                      placeholder="Optional subtitle…"
                    />
                  </div>
                </Sec>
                <Sec title="Annotation Labels">
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    <input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newNote.trim()) {
                          setAnnotations((a) => [...a, newNote.trim()]);
                          setNewNote("");
                        }
                      }}
                      placeholder="e.g. Peak Q3 · Enter to add"
                      style={{
                        flex: 1,
                        padding: "7px 10px",
                        fontSize: 11,
                        border: "1.5px solid #e5e7eb",
                        borderRadius: 8,
                        background: "#f9fafb",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newNote.trim()) {
                          setAnnotations((a) => [...a, newNote.trim()]);
                          setNewNote("");
                        }
                      }}
                      style={{
                        padding: "7px 13px",
                        fontSize: 12,
                        fontWeight: 700,
                        border: "none",
                        borderRadius: 8,
                        background: "#06b6d4",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                  {annotations.length === 0 ? (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#d1d5db",
                        textAlign: "center",
                        padding: "12px 0",
                      }}
                    >
                      No labels yet
                    </p>
                  ) : (
                    annotations.map((a, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px",
                          borderRadius: 8,
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          marginBottom: 5,
                        }}
                      >
                        <span style={{ fontSize: 11, color: "#374151" }}>
                          {a}
                        </span>
                        <button
                          onClick={() =>
                            setAnnotations((an) => an.filter((_, j) => j !== i))
                          }
                          style={{
                            border: "none",
                            background: "none",
                            color: "#d1d5db",
                            cursor: "pointer",
                            fontSize: 14,
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </Sec>
              </>
            )}

            {/* ═══ EXPORT TAB ═══ */}
            {tab === "export" && (
              <>
                <Sec title="Dimensions">
                  <LRow label="Width px">
                    <NumInput value={exportW} onChange={setExportW} />
                  </LRow>
                  <LRow label="Height px">
                    <NumInput value={exportH} onChange={setExportH} />
                  </LRow>
                  <p
                    style={{
                      fontSize: 10,
                      color: "#9ca3af",
                      margin: "2px 0 10px",
                    }}
                  >
                    Presets
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2,1fr)",
                      gap: 5,
                    }}
                  >
                    {[
                      { l: "Square", w: 800, h: 800 },
                      { l: "Landscape", w: 1200, h: 700 },
                      { l: "Portrait", w: 700, h: 1000 },
                      { l: "4K UHD", w: 3840, h: 2160 },
                      { l: "Twitter", w: 1200, h: 675 },
                      { l: "Instagram", w: 1080, h: 1080 },
                      { l: "Slide 16:9", w: 1920, h: 1080 },
                      { l: "Slide 4:3", w: 1024, h: 768 },
                    ].map((p) => {
                      const active = exportW === p.w && exportH === p.h;
                      return (
                        <button
                          key={p.l}
                          onClick={() => {
                            setExportW(p.w);
                            setExportH(p.h);
                          }}
                          style={{
                            padding: "7px 6px",
                            borderRadius: 8,
                            border: active
                              ? "1.5px solid #06b6d4"
                              : "1.5px solid #e5e7eb",
                            background: active
                              ? "rgba(6,182,212,0.06)"
                              : "#fafafa",
                            color: active ? "#06b6d4" : "#6b7280",
                            cursor: "pointer",
                            fontSize: 10,
                            fontWeight: 600,
                            transition: "all 0.1s",
                          }}
                        >
                          {p.l}
                          <span
                            style={{
                              display: "block",
                              fontSize: 9,
                              color: "#9ca3af",
                              fontFamily: "monospace",
                              marginTop: 2,
                            }}
                          >
                            {p.w}×{p.h}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Sec>
                <Sec title="Download">
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 7 }}
                  >
                    {(
                      [
                        {
                          fmt: "png",
                          label: "PNG",
                          desc: "Best for web & docs",
                          primary: true,
                        },
                        {
                          fmt: "svg",
                          label: "SVG",
                          desc: "Vector, infinite scale",
                          primary: false,
                        },
                        {
                          fmt: "jpeg",
                          label: "JPEG",
                          desc: "Compressed, smaller",
                          primary: false,
                        },
                      ] as const
                    ).map(({ fmt, label, desc, primary }) => (
                      <button
                        key={fmt}
                        onClick={() => handleExport(fmt)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "11px 14px",
                          borderRadius: 10,
                          border: primary ? "none" : "1.5px solid #e5e7eb",
                          background: primary
                            ? "linear-gradient(135deg,#06b6d4,#0891b2)"
                            : "#fafafa",
                          color: primary ? "#fff" : "#374151",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => {
                          if (!primary)
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "#06b6d4";
                        }}
                        onMouseLeave={(e) => {
                          if (!primary)
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "#e5e7eb";
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>
                            Download {label}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              opacity: 0.65,
                              marginTop: 1,
                            }}
                          >
                            {desc}
                          </div>
                        </div>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: 9,
                            fontFamily: "monospace",
                            opacity: 0.5,
                          }}
                        >
                          {exportW}×{exportH}
                        </span>
                      </button>
                    ))}
                  </div>
                </Sec>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
