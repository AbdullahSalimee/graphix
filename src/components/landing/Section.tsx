"use client";

import { useEffect, useRef, useState } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface FloatingCardProps {
  className?: string;
  style?: React.CSSProperties; // add this
}
interface StatNumberProps {
  num: number | null;
  suffix: string;
  prefix?: string;
  delay: number;
}

interface PlotlyChartProps {
  chartIndex: number;
  animating: boolean;
}

interface ChartDef {
  query: string;
  title: string;
  build: (Plotly: any, el: HTMLElement) => Promise<void>;
}

// ─── FLOATING CHART COMPONENTS ───────────────────────────────────────────────

export function GlowAreaChart({ className = "",style }: FloatingCardProps) {
  return (
    <div
      className={`absolute bg-white/20 backdrop-blur-2xl border border-white/90 rounded-[18px] shadow-[0_4px_24px_rgba(60,90,200,0.10),0_1.5px_6px_rgba(60,90,200,0.07),inset_0_1px_0_rgba(255,255,255,0.8)] flex items-center justify-center ${className}`}
      style={{ ...style, padding: "16px 18px" }}
    >
      <svg width="160" height="100" viewBox="0 0 160 100">
        <defs>
          <linearGradient id="area1Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F7FFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#4F7FFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="area2Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </linearGradient>
          <filter id="glow1">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[20, 40, 60, 80].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="160"
            y2={y}
            stroke="#D0DCFA"
            strokeWidth="0.5"
            strokeDasharray="4,4"
          />
        ))}
        <path
          d="M0,75 C20,70 35,50 55,55 C75,60 90,40 110,45 C130,50 145,35 160,30 L160,100 L0,100Z"
          fill="url(#area2Grad)"
        />
        <path
          d="M0,75 C20,70 35,50 55,55 C75,60 90,40 110,45 C130,50 145,35 160,30"
          fill="none"
          stroke="#A78BFA"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#glow1)"
          opacity="0.8"
        />
        <path
          d="M0,85 C25,75 40,55 60,45 C80,35 95,50 115,35 C135,22 148,20 160,15 L160,100 L0,100Z"
          fill="url(#area1Grad)"
        />
        <path
          d="M0,85 C25,75 40,55 60,45 C80,35 95,50 115,35 C135,22 148,20 160,15"
          fill="none"
          stroke="#4F7FFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glow1)"
        />
        {(
          [
            [60, 45],
            [115, 35],
            [160, 15],
          ] as [number, number][]
        ).map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="6" fill="#4F7FFF" opacity="0.15" />
            <circle
              cx={x}
              cy={y}
              r="3.5"
              fill="white"
              stroke="#4F7FFF"
              strokeWidth="2"
            />
          </g>
        ))}
        <rect
          x="90"
          y="18"
          width="48"
          height="24"
          rx="6"
          fill="white"
          style={{ filter: "drop-shadow(0 2px 8px rgba(79,127,255,0.18))" }}
        />
        <text
          x="114"
          y="30"
          textAnchor="middle"
          fontSize="7"
          fontWeight="700"
          fill="#1a2a5e"
        >
          +24.5%
        </text>
        <text x="114" y="38" textAnchor="middle" fontSize="5.5" fill="#6B7FBB">
          Revenue
        </text>
        <line
          x1="114"
          y1="42"
          x2="114"
          y2="36"
          stroke="#4F7FFF"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </svg>
    </div>
  );
}

export function Bars3DChart({ className = "", style }: FloatingCardProps) {
  const bars = [
    { h: 52, front: ["#5B8FFF", "#3D6EEE"], side: "#2A55CC", top: "#9BBFFF" },
    { h: 78, front: ["#7AAAFF", "#4F7FFF"], side: "#3A65DD", top: "#B0CFFF" },
    { h: 40, front: ["#4A7AEE", "#2A55DD"], side: "#1A44BB", top: "#8AACFF" },
    { h: 88, front: ["#6BA0FF", "#4880EF"], side: "#3060CE", top: "#A8C8FF" },
    { h: 60, front: ["#8AB8FF", "#5A8FEE"], side: "#4070DE", top: "#BBDAFF" },
  ];
  const W = 18,
    GAP = 6,
    DEPTH = 7,
    BASE = 95;
  return (
    <div
      className={`absolute  backdrop-blur-2xl border border-white/90 rounded-[18px] shadow-[0_4px_24px_rgba(60,90,200,0.10),0_1.5px_6px_rgba(60,90,200,0.07),inset_0_1px_0_rgba(255,255,255,0.8)] flex items-center justify-center ${className}`}
      style={{ ...style, padding: "16px 18px" }}
    
    >
      <svg width="150" height="105" viewBox="0 0 150 105">
        <defs>
          {bars.map((b, i) => (
            <linearGradient key={i} id={`bf${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={b.front[0]} />
              <stop offset="100%" stopColor={b.front[1]} />
            </linearGradient>
          ))}
          <filter id="barShadow">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="4"
              floodColor="#3060CE"
              floodOpacity="0.18"
            />
          </filter>
        </defs>
        <line
          x1="8"
          y1={BASE}
          x2="148"
          y2={BASE}
          stroke="#D0DCFA"
          strokeWidth="1"
        />
        {[BASE - 25, BASE - 50, BASE - 75].map((y) => (
          <line
            key={y}
            x1="8"
            y1={y}
            x2="148"
            y2={y}
            stroke="#E0EAFF"
            strokeWidth="0.5"
            strokeDasharray="3,4"
          />
        ))}
        {bars.map((b, i) => {
          const x = i * (W + GAP) + 12;
          const top = BASE - b.h;
          return (
            <g key={i} filter="url(#barShadow)">
              <polygon
                points={`${x + W},${top} ${x + W + DEPTH},${top - DEPTH} ${x + W + DEPTH},${BASE - DEPTH} ${x + W},${BASE}`}
                fill={b.side}
                opacity="0.75"
              />
              <rect
                x={x}
                y={top}
                width={W}
                height={b.h}
                rx="3"
                fill={`url(#bf${i})`}
              />
              <polygon
                points={`${x},${top} ${x + DEPTH},${top - DEPTH} ${x + W + DEPTH},${top - DEPTH} ${x + W},${top}`}
                fill={b.top}
              />
              <rect
                x={x + 2}
                y={top + 3}
                width={5}
                height={b.h * 0.35}
                rx="2"
                fill="white"
                opacity="0.18"
              />
            </g>
          );
        })}
        <text
          x={3 * (W + GAP) + 12 + W / 2}
          y={BASE - 88 - 8}
          textAnchor="middle"
          fontSize="8"
          fontWeight="800"
          fill="#1a2a5e"
        >
          88
        </text>
      </svg>
    </div>
  );
}

export function RichDonut({ className = "",style }: FloatingCardProps) {
  const segs: [number, number, [string, string], string][] = [
    [0, 130, ["#4F7FFF", "#2A55DD"], "Series A"],
    [130, 90, ["#A78BFA", "#7C55EE"], "Series B"],
    [220, 60, ["#34D399", "#059669"], "Series C"],
    [280, 80, ["#FB923C", "#EA6000"], "Series D"],
  ];
  const cx = 62,
    cy = 58,
    R = 46,
    r = 28;
  return (
    <div
      className={`absolute bg-white/20 backdrop-blur-2xl border border-white/90 rounded-[18px] shadow-[0_4px_24px_rgba(60,90,200,0.10),0_1.5px_6px_rgba(60,90,200,0.07),inset_0_1px_0_rgba(255,255,255,0.8)] flex items-center justify-center ${className}`}
      style={{ ...style, padding: "16px 18px" }}
    >
      <svg width="130" height="120" viewBox="0 0 130 120">
        <defs>
          {segs.map(([, , c], i) => (
            <linearGradient key={i} id={`dg${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c[0]} />
              <stop offset="100%" stopColor={c[1]} />
            </linearGradient>
          ))}
          <filter id="donutShadow">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="5"
              floodColor="#3060CE"
              floodOpacity="0.22"
            />
          </filter>
        </defs>
        <ellipse
          cx={cx}
          cy={cy + 5}
          rx={R + 4}
          ry={8}
          fill="#3060CE"
          opacity="0.12"
        />
        {segs.map(([start, sweep], i) => {
          const s = ((start - 90) * Math.PI) / 180;
          const e = ((start + sweep - 90) * Math.PI) / 180;
          const x1o = cx + R * Math.cos(s),
            y1o = cy + R * Math.sin(s);
          const x2o = cx + R * Math.cos(e),
            y2o = cy + R * Math.sin(e);
          const x1i = cx + r * Math.cos(e),
            y1i = cy + r * Math.sin(e);
          const x2i = cx + r * Math.cos(s),
            y2i = cy + r * Math.sin(s);
          const large = sweep > 180 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M${x1o},${y1o} A${R},${R} 0 ${large},1 ${x2o},${y2o} L${x1i},${y1i} A${r},${r} 0 ${large},0 ${x2i},${y2i} Z`}
              fill={`url(#dg${i})`}
              stroke="white"
              strokeWidth="2"
              filter="url(#donutShadow)"
            />
          );
        })}
        <circle cx={cx} cy={cy} r={r - 2} fill="white" />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          fill="#1a2a5e"
        >
          74%
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="6" fill="#6B7FBB">
          Growth
        </text>
        {segs.map(([, , c, label], i) => (
          <g key={i} transform={`translate(${cx + R + 6}, ${20 + i * 20})`}>
            <rect x={0} y={-5} width={7} height={7} rx={2} fill={c[0]} />
            <text x={10} y={2} fontSize="6" fill="#4A5E8A" fontWeight="600">
              {label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function BeautifulHeatmap({ className = "",style }: FloatingCardProps) {
  const data = [
    [0.1, 0.4, 0.8, 0.6, 0.3, 0.9, 0.5],
    [0.7, 0.2, 0.5, 1.0, 0.4, 0.6, 0.2],
    [0.3, 0.9, 0.3, 0.7, 0.8, 0.1, 0.7],
    [0.8, 0.5, 0.9, 0.2, 0.6, 0.7, 0.4],
    [0.4, 0.7, 0.2, 0.8, 0.1, 0.5, 0.9],
  ];
  function heatColor(v: number): string {
    if (v < 0.33) {
      const t = v / 0.33;
      return `rgba(${Math.round(30 + t * 49)}, ${Math.round(60 + t * 67)}, ${Math.round(200 + t * 55)}, ${0.4 + v * 0.6})`;
    } else if (v < 0.66) {
      const t = (v - 0.33) / 0.33;
      return `rgba(79, ${Math.round(127 + t * 73)}, ${Math.round(255 - t * 45)}, ${0.7 + v * 0.3})`;
    } else {
      const t = (v - 0.66) / 0.34;
      return `rgba(${Math.round(79 - t * 46)}, ${Math.round(200 + t * 45)}, ${Math.round(210 - t * 60)}, ${0.85 + t * 0.15})`;
    }
  }
  return (
    <div
      className={`absolute bg-white/20 backdrop-blur-2xl border border-white/90 rounded-[18px] shadow-[0_4px_24px_rgba(60,90,200,0.10),0_1.5px_6px_rgba(60,90,200,0.07),inset_0_1px_0_rgba(255,255,255,0.8)] flex items-center justify-center ${className}`}
      style={{ ...style, padding: "16px 18px" }}
    >
      <svg width="140" height="100" viewBox="0 0 140 100">
        <defs>
          <filter id="cellGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="scalebar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(30,60,200,0.5)" />
            <stop offset="50%" stopColor="rgba(79,200,210,0.9)" />
            <stop offset="100%" stopColor="rgba(33,245,150,1)" />
          </linearGradient>
        </defs>
        {data.map((row, r) =>
          row.map((v, c) => (
            <g key={`${r}-${c}`}>
              <rect
                x={c * 19 + 3}
                y={r * 18 + 3}
                width={17}
                height={16}
                rx={4}
                fill={heatColor(v)}
                filter={v > 0.8 ? "url(#cellGlow)" : undefined}
              />
              {v > 0.85 && (
                <rect
                  x={c * 19 + 5}
                  y={r * 18 + 5}
                  width={5}
                  height={4}
                  rx={2}
                  fill="white"
                  opacity="0.35"
                />
              )}
            </g>
          )),
        )}
        <rect
          x={3}
          y={96}
          width={134}
          height={3}
          rx={1.5}
          fill="url(#scalebar)"
        />
      </svg>
    </div>
  );
}

// ─── PAGE DATA ────────────────────────────────────────────────────────────────

const STATS: [number | null, string, string, string?][] = [
  [87, "+", "Chart Types"],
  [2, "s", "Generation", "<"],
  [null, "∞", "Free Requests"],
  [10, "", "Categories"],
];

function useCountUp(target: number | null, delay: number = 0): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / 1500, 1);
        setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, []);
  return count;
}

function StatNumber({ num, suffix, prefix = "", delay }: StatNumberProps) {
  const count = useCountUp(num, delay);
  return <>{num === null ? suffix : `${prefix}${count}${suffix}`}</>;
}

const HISTORY = [
  "Revenue Q4 2024",
  "User growth YoY",
  "Sales funnel",
  "Weekly activity",
];

const CHARTS: ChartDef[] = [
  {
    query: "radial chart",
    title: "Wind-Rose Distribution",
    build: (Plotly, el) => {
      const cats = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"];
      return Plotly.react(
        el,
        [
          {
            type: "barpolar",
            r: [28, 18, 34, 20, 14, 24, 30, 22],
            theta: cats,
            name: "Q4 2024",
            marker: {
              color: cats.map(
                (_, i) => `hsla(${200 + i * 18}, 85%, 58%, 0.82)`,
              ),
              line: { color: "rgba(255,255,255,0.12)", width: 1 },
            },
            base: 0,
          },
          {
            type: "barpolar",
            r: [14, 28, 18, 30, 22, 16, 20, 28],
            theta: cats,
            name: "Q3 2024",
            marker: {
              color: "rgba(167,139,250,0.38)",
              line: { color: "rgba(167,139,250,0.5)", width: 1 },
            },
            base: 0,
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "#94a3b8",
            size: 10,
            family: "'JetBrains Mono', monospace",
          },
          polar: {
            bgcolor: "rgba(14,165,233,0.03)",
            radialaxis: {
              visible: true,
              range: [0, 40],
              gridcolor: "rgba(148,163,184,0.12)",
              linecolor: "rgba(148,163,184,0.15)",
              tickfont: { size: 8, color: "#475569" },
              ticksuffix: "k",
            },
            angularaxis: {
              gridcolor: "rgba(148,163,184,0.1)",
              linecolor: "rgba(148,163,184,0.15)",
              tickfont: { size: 11, color: "#94a3b8" },
            },
          },
          legend: {
            font: { size: 10, color: "#94a3b8" },
            bgcolor: "rgba(8,15,26,0.7)",
            bordercolor: "rgba(255,255,255,0.08)",
            borderwidth: 1,
            x: 1.05,
            y: 1,
          },
          margin: { t: 20, b: 20, l: 30, r: 90 },
          showlegend: true,
          transition: { duration: 700, easing: "cubic-in-out" },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
  {
    query: "bar chart — monthly revenue",
    title: "Monthly Revenue",
    build: (Plotly, el) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return Plotly.react(
        el,
        [
          {
            type: "bar",
            x: months,
            y: [42, 55, 38, 70, 65, 80, 74, 90, 68, 85, 95, 110],
            name: "2024",
            marker: {
              color: months.map(
                (_, i) => `hsla(${195 + i * 4}, 82%, ${48 + i * 1.5}%, 0.9)`,
              ),
              line: { color: "rgba(14,165,233,0.3)", width: 0.5 },
            },
            hovertemplate: "<b>%{x}</b><br>$%{y}M<extra></extra>",
          },
          {
            type: "bar",
            x: months,
            y: [30, 40, 28, 55, 50, 62, 58, 72, 55, 68, 78, 90],
            name: "2023",
            marker: {
              color: "rgba(139,92,246,0.38)",
              line: { color: "rgba(139,92,246,0.5)", width: 0.5 },
            },
            hovertemplate: "<b>%{x}</b><br>$%{y}M<extra></extra>",
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "#94a3b8",
            size: 10,
            family: "'JetBrains Mono', monospace",
          },
          barmode: "group",
          bargap: 0.18,
          bargroupgap: 0.06,
          xaxis: {
            gridcolor: "rgba(148,163,184,0.07)",
            linecolor: "rgba(148,163,184,0.12)",
            tickfont: { size: 9 },
            zeroline: false,
          },
          yaxis: {
            gridcolor: "rgba(148,163,184,0.07)",
            linecolor: "rgba(148,163,184,0.12)",
            tickfont: { size: 9 },
            zeroline: false,
            ticksuffix: "M",
          },
          legend: {
            font: { size: 10, color: "#94a3b8" },
            bgcolor: "rgba(8,15,26,0.7)",
            bordercolor: "rgba(255,255,255,0.08)",
            borderwidth: 1,
            orientation: "h",
            x: 0,
            y: 1.08,
          },
          margin: { t: 36, b: 32, l: 44, r: 16 },
          showlegend: true,
          transition: { duration: 700, easing: "cubic-in-out" },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
  {
    query: "3D scatter — sales data",
    title: "3D Sales Scatter",
    build: (Plotly, el) => {
      const n = 80;
      const x = Array.from({ length: n }, () => Math.random() * 100);
      const y = Array.from({ length: n }, () => Math.random() * 100);
      const z = x.map((v, i) => v * 0.45 + y[i] * 0.35 + Math.random() * 18);
      return Plotly.react(
        el,
        [
          {
            type: "scatter3d",
            mode: "markers",
            x,
            y,
            z,
            marker: {
              size: z.map((v) => 3.5 + v / 30),
              color: z,
              colorscale: [
                [0, "rgba(14,165,233,0.7)"],
                [0.35, "rgba(99,102,241,0.85)"],
                [0.7, "rgba(167,139,250,0.9)"],
                [1, "rgba(34,197,94,1)"],
              ],
              opacity: 0.88,
              line: { color: "rgba(255,255,255,0.05)", width: 0.3 },
            },
            hovertemplate:
              "x: %{x:.1f}<br>y: %{y:.1f}<br>z: %{z:.1f}<extra></extra>",
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "#94a3b8",
            size: 9,
            family: "'JetBrains Mono', monospace",
          },
          scene: {
            xaxis: {
              backgroundcolor: "rgba(0,0,0,0)",
              gridcolor: "rgba(148,163,184,0.09)",
              zerolinecolor: "rgba(148,163,184,0.12)",
              tickfont: { size: 8 },
              title: { text: "Revenue", font: { size: 9, color: "#475569" } },
            },
            yaxis: {
              backgroundcolor: "rgba(0,0,0,0)",
              gridcolor: "rgba(148,163,184,0.09)",
              zerolinecolor: "rgba(148,163,184,0.12)",
              tickfont: { size: 8 },
              title: { text: "Volume", font: { size: 9, color: "#475569" } },
            },
            zaxis: {
              backgroundcolor: "rgba(0,0,0,0)",
              gridcolor: "rgba(148,163,184,0.09)",
              zerolinecolor: "rgba(148,163,184,0.12)",
              tickfont: { size: 8 },
              title: { text: "Score", font: { size: 9, color: "#475569" } },
            },
            bgcolor: "transparent",
            camera: { eye: { x: 1.5, y: 1.5, z: 1.0 } },
          },
          margin: { t: 0, b: 0, l: 0, r: 0 },
          showlegend: false,
          transition: { duration: 700, easing: "cubic-in-out" },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
  {
    query: "line chart — user growth",
    title: "User Growth Over Time",
    build: (Plotly, el) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return Plotly.react(
        el,
        [
          {
            type: "scatter",
            mode: "lines+markers",
            x: months,
            y: [12, 19, 28, 35, 42, 58, 65, 72, 80, 91, 105, 120],
            name: "Active Users",
            line: {
              color: "#0ea5e9",
              width: 2.5,
              shape: "spline",
              smoothing: 1.2,
            },
            fill: "tozeroy",
            fillcolor: "rgba(14,165,233,0.09)",
            marker: {
              color: "#fff",
              size: 6,
              line: { color: "#0ea5e9", width: 2 },
            },
            hovertemplate: "<b>%{x}</b><br>%{y}K users<extra></extra>",
          },
          {
            type: "scatter",
            mode: "lines+markers",
            x: months,
            y: [8, 13, 18, 22, 30, 40, 45, 52, 60, 70, 82, 95],
            name: "New Signups",
            line: {
              color: "#a78bfa",
              width: 2.2,
              shape: "spline",
              smoothing: 1.2,
            },
            fill: "tozeroy",
            fillcolor: "rgba(167,139,250,0.07)",
            marker: {
              color: "#fff",
              size: 5,
              line: { color: "#a78bfa", width: 2 },
            },
            hovertemplate: "<b>%{x}</b><br>%{y}K signups<extra></extra>",
          },
          {
            type: "scatter",
            mode: "lines",
            x: months,
            y: [5, 8, 10, 13, 12, 18, 20, 20, 20, 21, 23, 25],
            name: "Churned",
            line: {
              color: "rgba(251,113,133,0.75)",
              width: 1.5,
              shape: "spline",
              dash: "dot",
            },
            hovertemplate: "<b>%{x}</b><br>%{y}K churned<extra></extra>",
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "#94a3b8",
            size: 10,
            family: "'JetBrains Mono', monospace",
          },
          xaxis: {
            gridcolor: "rgba(148,163,184,0.07)",
            linecolor: "rgba(148,163,184,0.12)",
            tickfont: { size: 9 },
            zeroline: false,
          },
          yaxis: {
            gridcolor: "rgba(148,163,184,0.07)",
            linecolor: "rgba(148,163,184,0.12)",
            tickfont: { size: 9 },
            zeroline: false,
            ticksuffix: "K",
          },
          legend: {
            font: { size: 10, color: "#94a3b8" },
            bgcolor: "rgba(8,15,26,0.7)",
            bordercolor: "rgba(255,255,255,0.08)",
            borderwidth: 1,
            orientation: "h",
            x: 0,
            y: 1.1,
          },
          margin: { t: 36, b: 32, l: 44, r: 16 },
          showlegend: true,
          transition: { duration: 700, easing: "cubic-in-out" },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
  {
    query: "heatmap — weekly activity",
    title: "Weekly Activity Heatmap",
    build: (Plotly, el) => {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const hrs = ["6am", "9am", "12pm", "3pm", "6pm", "9pm", "12am"];
      const peak: Record<string, number> = {
        Mon: 0.8,
        Tue: 0.9,
        Wed: 1.0,
        Thu: 0.95,
        Fri: 0.85,
        Sat: 0.45,
        Sun: 0.35,
      };
      const hrW = [0.4, 0.9, 1.0, 0.95, 0.7, 0.5, 0.25];
      const z = hrs.map((_, hi) =>
        days.map((d) =>
          Math.round(peak[d] * hrW[hi] * (55 + Math.random() * 45)),
        ),
      );
      return Plotly.react(
        el,
        [
          {
            type: "heatmap",
            z,
            x: days,
            y: hrs,
            colorscale: [
              [0, "rgba(8,15,26,0.95)"],
              [0.2, "rgba(7,89,133,0.8)"],
              [0.5, "rgba(14,165,233,0.85)"],
              [0.75, "rgba(99,211,180,0.9)"],
              [1, "rgba(34,197,94,1)"],
            ],
            showscale: true,
            colorbar: {
              thickness: 10,
              tickfont: { size: 8, color: "#64748b" },
              outlinecolor: "transparent",
              bgcolor: "transparent",
            },
            hoverongaps: false,
            hovertemplate: "%{x} %{y}<br>%{z} events<extra></extra>",
            xgap: 3,
            ygap: 3,
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "#94a3b8",
            size: 10,
            family: "'JetBrains Mono', monospace",
          },
          xaxis: {
            tickfont: { size: 10 },
            linecolor: "rgba(148,163,184,0.12)",
            side: "bottom",
          },
          yaxis: {
            tickfont: { size: 9 },
            linecolor: "rgba(148,163,184,0.12)",
            autorange: "reversed",
          },
          margin: { t: 16, b: 36, l: 46, r: 68 },
          showlegend: false,
          transition: { duration: 700, easing: "cubic-in-out" },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
];


// ─── PLOTLY CHART RENDERER ────────────────────────────────────────────────────

function PlotlyChart({ chartIndex, animating }: PlotlyChartProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    import("plotly.js-dist-min").then(({ default: Plotly }) => {
      Plotly.purge(ref.current!);
      CHARTS[chartIndex].build(Plotly, ref.current!);
    });
  }, [chartIndex]);

  useEffect(
    () => () => {
      import("plotly.js-dist-min").then(({ default: Plotly }) => {
        if (ref.current) Plotly.purge(ref.current);
      });
    },
    [],
  );

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        opacity: animating ? 0 : 1,
        transform: animating
          ? "scale(0.97) translateY(6px)"
          : "scale(1) translateY(0)",
        transition:
          "opacity 0.42s ease, transform 0.42s cubic-bezier(0.16,1,0.3,1)",
      }}
    />
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

interface HeroProps {
  onLaunch?: () => void;
}

export default function HeroSection({ onLaunch }: HeroProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActiveIdx((i) => (i + 1) % CHARTS.length);
        setAnimating(false);
      }, 450);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const chart = CHARTS[activeIdx];

  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8 pt-32 pb-20 text-center overflow-hidden">
      {/* ── Floating charts ── */}

      {/* chart-1: top-left, rotate -10deg, floatA 4.5s */}
      <Bars3DChart className="[--r:-10deg] top-[10%] left-[3%] [animation:floatA_4.5s_ease-in-out_infinite] " />

      {/* chart-2: 28% top, 9% left, rotate -23deg, floatB 5.2s 0.5s */}
      <GlowAreaChart className="[--r:-23deg] top-[28%] left-[9%] [animation:floatB_5.2s_ease-in-out_infinite_0.5s]" />

      {/* chart-4: 28% top, 13% right, rotate 10deg, floatB 5s 0.3s */}
      <RichDonut className="[--r:10deg] top-[28%] right-[13%] [animation:floatB_5s_ease-in-out_infinite_0.3s]" />

      {/* chart-5: 10% top, 5% right, rotate 13deg, floatA 4.3s 0.8s */}
      <BeautifulHeatmap className="[--r:13deg] top-[10%] right-[5%] [animation:floatA_4.3s_ease-in-out_infinite_0.8s]" />

      {/* ── Badge ── */}
      <div className="[animation:fadeUp_0.7s_cubic-bezier(0.16,1,0.3,1)_both] inline-flex items-center gap-2 border border-cyan-900/20 bg-cyan-900/[0.08] rounded-full px-3.5 py-1.5 mb-10 font-mono text-[0.68rem] text-black tracking-widest uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#000000] [animation:pulseDot_1.8s_ease-in-out_infinite]" />
        Now with 87 chart types · including 3D &amp; Heatmaps
      </div>

      {/* ── Headline ── */}
      <h1
        className="text-7xl font-bold leading-[0.97] text-neutral-700 tracking-tight mb-1"
        style={{ fontFamily: "'Chakra Petch', sans-serif" }}
      >
        The{" "}
        <em className="not-italic animate-pulse bg-gradient-to-r from-neutral-600 via-black to-neutral-600 bg-clip-text text-transparent">
          AI
        </em>{" "}
        Graph Maker
      </h1>

      <p className="text-cyan-900 max-w-[500px] leading-5 mt-6 mb-12">
        From messy data to breathtaking charts in seconds.
        <br />
        Describe what you want — AI does the rest.
      </p>

      {/* ── Buttons ── */}
      <div className="[animation:fadeUp_0.7s_cubic-bezier(0.16,1,0.3,1)_0.3s_both] flex gap-4 justify-center items-center flex-wrap">
        <a
          href="#_"
          className="h-fit mx-auto relative px-5 py-2 overflow-hidden font-medium text-gray-600 bg-gray-100 border border-gray-100 rounded-lg shadow-inner group"
        >
          <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-full ease" />
          <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-full ease" />
          <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease" />
          <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease" />
          <span className="absolute inset-0 w-full h-full duration-300 delay-300 bg-gray-900 opacity-0 group-hover:opacity-100" />
          <span className="relative transition-colors duration-300 delay-200 group-hover:text-white ease">
            Start for free
          </span>
        </a>
        <a
          href="#_"
          className="relative rounded px-5 py-2 overflow-hidden group bg-cyan-700 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-cyan-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-cyan-400 transition-all ease-out duration-300"
        >
          <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease" />
          <span className="relative font-semibold">Watch a Demo</span>
        </a>
      </div>

      {/* ── Stats row ── */}
      <div className="[animation:fadeUp_0.7s_cubic-bezier(0.16,1,0.3,1)_0.4s_both] flex flex-wrap justify-center mt-12 w-full max-w-[680px] border border-white/10 rounded-2xl bg-white/[0.06] backdrop-blur-xl overflow-hidden">
        {STATS.map(([num, suffix, label, prefix], i) => (
          <div
            key={label}
            className={`flex-1 basis-[120px] py-6 px-4 text-center transition-colors duration-200 hover:bg-white/[0.08] ${i < STATS.length - 1 ? "border-r border-white/10" : ""}`}
          >
            <div className="font-bold text-4xl text-cyan-600 leading-none mb-1.5">
              <StatNumber
                num={num}
                suffix={suffix}
                prefix={prefix}
                delay={i * 200}
              />
            </div>
            <div className="font-mono text-[0.62rem] text-slate-700 tracking-widest uppercase">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── App preview ── */}
      <div
        className="[animation:fadeUp_0.7s_cubic-bezier(0.16,1,0.3,1)_0.5s_both] relative w-full max-w-[960px]"
        style={{ marginTop: "4.5rem" }}
      >
        {/* Glow halo */}
        <div
          className="absolute -inset-px rounded-[22px] -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.35) 0%, transparent 70%)",
            filter: "blur(18px)",
          }}
        />

        <div
          className="rounded-[20px] border overflow-hidden"
          style={{
            background: "#080f1a",
            borderColor: "rgba(255,255,255,0.09)",
            boxShadow:
              "0 0 0 1px rgba(14,165,233,0.08), 0 40px 130px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{
              background: "#040b15",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_4px_#ff5f5766]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] shadow-[0_0_4px_#febc2e66]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] shadow-[0_0_4px_#28c84066]" />
            <div
              className="flex-1 h-5 rounded-md ml-3 flex items-center gap-1.5 px-3 border"
              style={{
                background: "#080f1a",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "rgba(34,197,94,0.7)" }}
              />
              <span className="font-mono text-[0.67rem] text-slate-500">
                graphy.ai/app
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              {["Workspace", "Charts", "Export"].map((t, i) => (
                <span
                  key={t}
                  className="font-mono text-[0.65rem] px-2.5 py-0.5 rounded-md"
                  style={{
                    color: i === 0 ? "#38bdf8" : "#475569",
                    background:
                      i === 0 ? "rgba(14,165,233,0.1)" : "transparent",
                    border:
                      i === 0
                        ? "1px solid rgba(14,165,233,0.2)"
                        : "1px solid transparent",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex" style={{ height: 500 }}>
            {/* Sidebar */}
            <div
              className="w-[190px] shrink-0 border-r p-3 flex flex-col gap-1 overflow-y-auto"
              style={{
                background: "#040b15",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <div className="font-mono text-[0.6rem] text-slate-600 tracking-widest uppercase mb-2 px-1">
                History
              </div>

              {/* Active history item */}
              <div
                key={activeIdx}
                className="px-2.5 py-2 rounded-lg font-mono text-[0.7rem] flex items-center gap-2 overflow-hidden [animation:cycleIn_0.44s_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(14,165,233,0.05))",
                  border: "1px solid rgba(14,165,233,0.2)",
                  color: "#38bdf8",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: "#38bdf8",
                    boxShadow: "0 0 5px #38bdf8",
                  }}
                />
                <span className="truncate">{chart.query}</span>
              </div>

              {HISTORY.map((t, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1.5 font-mono text-[0.68rem] text-slate-600 hover:text-slate-400 cursor-pointer rounded-lg truncate transition-colors"
                  style={{ border: "1px solid transparent" }}
                >
                  {t}
                </div>
              ))}

              <div
                className="mt-auto pt-3 border-t space-y-2"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                {[
                  { label: "Charts", val: "142" },
                  { label: "Exports", val: "38" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between px-1"
                  >
                    <span className="font-mono text-[0.62rem] text-slate-600">
                      {s.label}
                    </span>
                    <span className="font-mono text-[0.68rem] text-slate-400">
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col p-4 gap-3 min-w-0 overflow-hidden">
              {/* User message bubble */}
              <div className="flex justify-end">
                <div
                  key={`msg-${activeIdx}`}
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-mono text-[0.78rem] text-slate-200 [animation:cycleIn_0.44s_cubic-bezier(0.16,1,0.3,1)_both] max-w-xs"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(14,165,233,0.18), rgba(99,102,241,0.12))",
                    border: "1px solid rgba(14,165,233,0.22)",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="shrink-0 text-sky-400"
                  >
                    <circle
                      cx="6"
                      cy="5"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M2 11c0-2.2 1.8-4 4-4s4 1.8 4 4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  {chart.query}
                </div>
              </div>

              {/* Chart card */}
              <div
                className="rounded-2xl border flex-1 flex flex-col overflow-hidden min-h-0"
                style={{
                  background:
                    "linear-gradient(160deg, #0a1628 0%, #060d18 100%)",
                  borderColor: "rgba(255,255,255,0.08)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                {/* Chart header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
                  style={{
                    borderColor: "rgba(255,255,255,0.07)",
                    background: "rgba(4,11,21,0.6)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex w-2 h-2">
                      <span className="[animation:ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-40" />
                      <span className="relative inline-flex rounded-full w-2 h-2 bg-sky-400" />
                    </span>
                    <span
                      key={`ttl-${activeIdx}`}
                      className="font-mono text-[0.7rem] text-slate-400 tracking-wide [animation:cycleIn_0.44s_cubic-bezier(0.16,1,0.3,1)_both]"
                    >
                      {chart.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {["SVG", "CSV", "PNG"].map((fmt) => (
                      <button
                        key={fmt}
                        className="flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[0.63rem] transition-colors"
                        style={{
                          color: fmt === "PNG" ? "#38bdf8" : "#475569",
                          background:
                            fmt === "PNG"
                              ? "rgba(14,165,233,0.1)"
                              : "transparent",
                          border: `1px solid ${fmt === "PNG" ? "rgba(14,165,233,0.25)" : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        {fmt === "PNG" && (
                          <svg
                            width="9"
                            height="9"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M6 1v7M3 5l3 3 3-3M1 10h10"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plotly chart */}
                <div className="flex-1 min-h-0 p-1">
                  <PlotlyChart chartIndex={activeIdx} animating={animating} />
                </div>
              </div>

              {/* Input bar */}
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 border shrink-0"
                style={{
                  background: "#040b15",
                  borderColor: "rgba(255,255,255,0.09)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
              >
                <button
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-slate-500 hover:text-slate-300 transition-colors border"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <rect
                      x="1"
                      y="1"
                      width="12"
                      height="12"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M4 7h6M7 4v6"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[0.64rem] text-slate-400 border shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle
                      cx="5"
                      cy="5"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M5 3v2l1.5 1"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Chart Type
                </button>
                <input
                  readOnly
                  placeholder='Describe a chart… e.g "Monthly sales for 2024"'
                  className="flex-1 bg-transparent outline-none font-mono text-[0.74rem] text-slate-500 placeholder:text-slate-700 min-w-0"
                />
                <button
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
                    boxShadow: "0 0 12px rgba(14,165,233,0.35)",
                  }}
                >
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
        </div>
      </div>

      {/* ── Keyframe animations (Tailwind arbitrary can't cover complex keyframes) ── */}
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50%       { transform: translateY(-12px) rotate(var(--r, 0deg)); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50%       { transform: translateY(-8px) rotate(var(--r, 0deg)); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes cycleIn {
          from { opacity: 0; transform: translateY(9px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
