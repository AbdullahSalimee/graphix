"use client";
import { useEffect, useRef } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ChartProps {}

interface ChartConfig {
  component: React.FC<ChartProps>;
  label: string;
  tag: string;
}

// ─── 10 UNIQUE PLOTLY-STYLE SVG CHARTS ────────────────────────────────────────

function AreaLineChart(_: ChartProps) {
  const pts = [12, 38, 28, 55, 42, 70, 58, 85, 65, 95, 72, 88];
  const W = 200,
    H = 110,
    pad = 10;
  const maxV = 100,
    minV = 0;
  const xStep = (W - pad * 2) / (pts.length - 1);
  const toY = (v: number) =>
    pad + (1 - (v - minV) / (maxV - minV)) * (H - pad * 2);
  const linePath = pts
    .map((v, i) => `${i === 0 ? "M" : "L"}${pad + i * xStep},${toY(v)}`)
    .join(" ");
  const areaPath =
    linePath +
    ` L${pad + (pts.length - 1) * xStep},${H - pad} L${pad},${H - pad} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
        <filter id="glow1">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="lineGrad1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {[25, 50, 75].map((p) => (
        <line
          key={p}
          x1={pad}
          y1={toY(p)}
          x2={W - pad}
          y2={toY(p)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.7"
          strokeDasharray="3,4"
        />
      ))}
      <path d={areaPath} fill="url(#ag1)" />
      <path
        d={linePath}
        fill="none"
        stroke="url(#lineGrad1)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow1)"
      />
      {pts.map((v, i) =>
        i % 3 === 2 ? (
          <g key={i}>
            <circle
              cx={pad + i * xStep}
              cy={toY(v)}
              r="4.5"
              fill="#0f172a"
              stroke="#06b6d4"
              strokeWidth="2"
            />
            <circle cx={pad + i * xStep} cy={toY(v)} r="1.5" fill="#06b6d4" />
          </g>
        ) : null,
      )}
      <rect
        x={pad + (pts.length - 1) * xStep - 22}
        y={toY(pts[pts.length - 1]) - 20}
        width={44}
        height={16}
        rx={5}
        fill="rgba(6,182,212,0.18)"
        stroke="rgba(6,182,212,0.4)"
        strokeWidth="0.8"
      />
      <text
        x={pad + (pts.length - 1) * xStep}
        y={toY(pts[pts.length - 1]) - 8}
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fill="#06b6d4"
      >
        +61.2%
      </text>
    </svg>
  );
}

function GroupedBarChart(_: ChartProps) {
  const groups: [string, number, number][] = [
    ["Jan", 42, 28],
    ["Feb", 68, 45],
    ["Mar", 55, 38],
    ["Apr", 82, 60],
    ["May", 74, 52],
    ["Jun", 95, 70],
  ];
  const W = 200,
    H = 110,
    pad = 12,
    maxV = 100;
  const gW = (W - pad * 2) / groups.length;
  const bW = gW * 0.32;
  const toY = (v: number) => pad + (1 - v / maxV) * (H - pad * 2);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        {groups.map((_, i) => (
          <linearGradient key={i} id={`bg${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={`hsl(${190 + i * 8},90%,${55 + i * 2}%)`}
            />
            <stop offset="100%" stopColor={`hsl(${200 + i * 8},85%,38%)`} />
          </linearGradient>
        ))}
      </defs>
      <line
        x1={pad}
        y1={H - pad}
        x2={W - pad}
        y2={H - pad}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.8"
      />
      {[33, 66].map((p) => (
        <line
          key={p}
          x1={pad}
          y1={toY(p)}
          x2={W - pad}
          y2={toY(p)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.6"
          strokeDasharray="3,4"
        />
      ))}
      {groups.map(([label, a, b], i) => {
        const cx = pad + i * gW + gW / 2;
        return (
          <g key={i}>
            <rect
              x={cx - bW - 1}
              y={toY(a)}
              width={bW}
              height={H - pad - toY(a)}
              rx="2.5"
              fill={`url(#bg${i})`}
              opacity="0.95"
            />
            <rect
              x={cx + 1}
              y={toY(b)}
              width={bW}
              height={H - pad - toY(b)}
              rx="2.5"
              fill="rgba(167,139,250,0.55)"
              stroke="rgba(167,139,250,0.7)"
              strokeWidth="0.6"
            />
            <text
              x={cx}
              y={H - 2}
              textAnchor="middle"
              fontSize="6.5"
              fill="rgba(255,255,255,0.4)"
            >
              {label}
            </text>
          </g>
        );
      })}
      <rect
        x={W - 68}
        y={pad}
        width={60}
        height={20}
        rx={4}
        fill="rgba(0,0,0,0.4)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.6"
      />
      <rect
        x={W - 65}
        y={pad + 5}
        width={6}
        height={6}
        rx={1.5}
        fill="#06b6d4"
      />
      <text x={W - 57} y={pad + 11} fontSize="6" fill="rgba(255,255,255,0.55)">
        2024
      </text>
      <rect
        x={W - 65}
        y={pad + 13}
        width={6}
        height={6}
        rx={1.5}
        fill="rgba(167,139,250,0.7)"
      />
      <text x={W - 57} y={pad + 19} fontSize="6" fill="rgba(255,255,255,0.4)">
        2023
      </text>
    </svg>
  );
}

function DonutChart(_: ChartProps) {
  const segs: { val: number; c1: string; c2: string; label: string }[] = [
    { val: 130, c1: "#6366f1", c2: "#4338ca", label: "SaaS" },
    { val: 85, c1: "#06b6d4", c2: "#0e7490", label: "API" },
    { val: 65, c1: "#10b981", c2: "#047857", label: "Ent" },
    { val: 80, c1: "#f59e0b", c2: "#b45309", label: "Ads" },
  ];
  const total = segs.reduce((s, x) => s + x.val, 0);
  const cx = 58,
    cy = 55,
    R = 42,
    r = 24;
  let angle = -90;

  const paths = segs.map((s) => {
    const sweep = (s.val / total) * 360;
    const s1 = ((angle - 90) * Math.PI) / 180;
    const e1 = ((angle + sweep - 90) * Math.PI) / 180;
    const x1o = cx + R * Math.cos(s1),
      y1o = cy + R * Math.sin(s1);
    const x2o = cx + R * Math.cos(e1),
      y2o = cy + R * Math.sin(e1);
    const x1i = cx + r * Math.cos(e1),
      y1i = cy + r * Math.sin(e1);
    const x2i = cx + r * Math.cos(s1),
      y2i = cy + r * Math.sin(s1);
    const large = sweep > 180 ? 1 : 0;
    const path = `M${x1o},${y1o} A${R},${R} 0 ${large},1 ${x2o},${y2o} L${x1i},${y1i} A${r},${r} 0 ${large},0 ${x2i},${y2i} Z`;
    angle += sweep;
    return { ...s, path };
  });

  return (
    <svg width={200} height={110} viewBox="0 0 200 110">
      <defs>
        {paths.map((s, i) => (
          <linearGradient key={i} id={`dg${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={s.c1} />
            <stop offset="100%" stopColor={s.c2} />
          </linearGradient>
        ))}
        <filter id="dShadow">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="5"
            floodColor="#000"
            floodOpacity="0.4"
          />
        </filter>
      </defs>
      {paths.map((s, i) => (
        <path
          key={i}
          d={s.path}
          fill={`url(#dg${i})`}
          stroke="rgba(10,15,28,0.8)"
          strokeWidth="2"
          filter="url(#dShadow)"
        />
      ))}
      <circle cx={cx} cy={cy} r={r - 2} fill="#080f1a" />
      <text
        x={cx}
        y={cy - 5}
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill="white"
      >
        74%
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fontSize="6.5"
        fill="rgba(148,163,184,0.8)"
      >
        Growth
      </text>
      {paths.map((s, i) => (
        <g key={i} transform={`translate(118,${18 + i * 22})`}>
          <rect width={8} height={8} rx={2} fill={s.c1} />
          <text
            x={12}
            y={7}
            fontSize="7"
            fill="rgba(203,213,225,0.85)"
            fontWeight="600"
          >
            {s.label}
          </text>
          <text
            x={50}
            y={7}
            fontSize="7"
            fill="rgba(203,213,225,0.5)"
            textAnchor="end"
          >
            {Math.round((s.val / total) * 100)}%
          </text>
        </g>
      ))}
    </svg>
  );
}

function HeatmapChart(_: ChartProps) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const weeks = 7;
  const W = 200,
    H = 110,
    pad = 14;
  const cW = (W - pad * 2 - days.length * 2) / weeks;
  const cH = (H - pad * 2 - days.length * 2) / days.length;
  const data = Array.from({ length: weeks }, () =>
    Array.from({ length: 7 }, () => Math.random()),
  );

  function heatCol(v: number): string {
    if (v < 0.25) return `rgba(6,182,212,${0.15 + v * 0.4})`;
    if (v < 0.5) return `rgba(99,102,241,${0.4 + v * 0.4})`;
    if (v < 0.75) return `rgba(139,92,246,${0.6 + v * 0.3})`;
    return `rgba(16,185,129,${0.8 + v * 0.2})`;
  }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id="hglow">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="hscale" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(6,182,212,0.3)" />
          <stop offset="50%" stopColor="rgba(99,102,241,0.8)" />
          <stop offset="100%" stopColor="rgba(16,185,129,1)" />
        </linearGradient>
      </defs>
      {days.map((d, i) => (
        <text
          key={i}
          x={pad - 4}
          y={pad + i * (cH + 2) + cH * 0.7}
          textAnchor="end"
          fontSize="6"
          fill="rgba(148,163,184,0.45)"
        >
          {d}
        </text>
      ))}
      {data.map((col, wi) =>
        col.map((v, di) => (
          <rect
            key={`${wi}-${di}`}
            x={pad + wi * (cW + 2)}
            y={pad + di * (cH + 2)}
            width={cW}
            height={cH}
            rx={2.5}
            fill={heatCol(v)}
            filter={v > 0.8 ? "url(#hglow)" : undefined}
          />
        )),
      )}
      <rect
        x={pad}
        y={H - 10}
        width={W - pad * 2}
        height={4}
        rx={2}
        fill="url(#hscale)"
      />
    </svg>
  );
}

function RadarChart(_: ChartProps) {
  const axes = ["Revenue", "Users", "Churn", "NPS", "Growth", "Retention"];
  const vals = [85, 72, 45, 88, 76, 90];
  const vals2 = [60, 55, 65, 70, 50, 75];
  const cx = 65,
    cy = 55,
    maxR = 42,
    n = axes.length;

  function pt(i: number, v: number): [number, number] {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = (v / 100) * maxR;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  function axPt(i: number, r: number = maxR): [number, number] {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  const poly1 = vals.map((_, i) => pt(i, vals[i]).join(",")).join(" ");
  const poly2 = vals2.map((_, i) => pt(i, vals2[i]).join(",")).join(" ");

  return (
    <svg width={200} height={110} viewBox="0 0 200 110">
      <defs>
        <filter id="radarGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[0.3, 0.55, 0.8, 1].map((f) => (
        <polygon
          key={f}
          points={axes.map((_, i) => axPt(i, maxR * f).join(",")).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.7"
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = axPt(i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="0.7"
          />
        );
      })}
      <polygon
        points={poly1}
        fill="rgba(6,182,212,0.18)"
        stroke="#06b6d4"
        strokeWidth="1.8"
        filter="url(#radarGlow)"
      />
      <polygon
        points={poly2}
        fill="rgba(139,92,246,0.14)"
        stroke="#8b5cf6"
        strokeWidth="1.4"
      />
      {vals.map((v, i) => {
        const [x, y] = pt(i, v);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill="#080f1a"
            stroke="#06b6d4"
            strokeWidth="1.8"
          />
        );
      })}
      {axes.map((a, i) => {
        const [x, y] = axPt(i, maxR + 10);
        return (
          <text
            key={i}
            x={x}
            y={y + 3}
            textAnchor="middle"
            fontSize="6"
            fill="rgba(148,163,184,0.7)"
          >
            {a}
          </text>
        );
      })}
      <rect
        x={118}
        y={10}
        width={74}
        height={28}
        rx={4}
        fill="rgba(0,0,0,0.4)"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="0.6"
      />
      <line
        x1={122}
        y1={21}
        x2={133}
        y2={21}
        stroke="#06b6d4"
        strokeWidth="1.8"
      />
      <text x={136} y={24} fontSize="6.5" fill="rgba(203,213,225,0.7)">
        Current
      </text>
      <line
        x1={122}
        y1={32}
        x2={133}
        y2={32}
        stroke="#8b5cf6"
        strokeWidth="1.4"
      />
      <text x={136} y={35} fontSize="6.5" fill="rgba(203,213,225,0.5)">
        Target
      </text>
    </svg>
  );
}

function ScatterChart(_: ChartProps) {
  const W = 200,
    H = 110,
    pad = 14;
  const pts = Array.from({ length: 28 }, () => ({
    x: 8 + Math.random() * 78,
    y: 10 + Math.random() * 78,
    s: 3 + Math.random() * 5,
    c: Math.random(),
  }));

  function col(c: number): string {
    if (c < 0.33) return "#6366f1";
    if (c < 0.66) return "#06b6d4";
    return "#10b981";
  }
  const toX = (v: number) => pad + (v * (W - pad * 2)) / 100;
  const toY = (v: number) => H - pad - (v * (H - pad * 2)) / 100;

  const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const my = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const num = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const den = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const slope = num / den,
    intercept = my - slope * mx;
  const tx1 = 5,
    ty1 = slope * tx1 + intercept;
  const tx2 = 95,
    ty2 = slope * tx2 + intercept;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id="scatterGlow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[25, 50, 75].map((p) => (
        <line
          key={`h${p}`}
          x1={pad}
          y1={toY(p)}
          x2={W - pad}
          y2={toY(p)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.6"
          strokeDasharray="3,4"
        />
      ))}
      {[25, 50, 75].map((p) => (
        <line
          key={`v${p}`}
          x1={toX(p)}
          y1={pad}
          x2={toX(p)}
          y2={H - pad}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.6"
          strokeDasharray="3,4"
        />
      ))}
      <line
        x1={toX(tx1)}
        y1={toY(ty1)}
        x2={toX(tx2)}
        y2={toY(ty2)}
        stroke="rgba(245,158,11,0.5)"
        strokeWidth="1.5"
        strokeDasharray="4,3"
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={toX(p.x)}
          cy={toY(p.y)}
          r={p.s}
          fill={col(p.c)}
          opacity="0.75"
          filter="url(#scatterGlow)"
        />
      ))}
    </svg>
  );
}

function CandlestickChart(_: ChartProps) {
  const candles = [
    { o: 52, h: 68, l: 48, c: 64 },
    { o: 64, h: 72, l: 58, c: 60 },
    { o: 60, h: 75, l: 54, c: 71 },
    { o: 71, h: 80, l: 65, c: 68 },
    { o: 68, h: 85, l: 62, c: 80 },
    { o: 80, h: 88, l: 72, c: 74 },
    { o: 74, h: 90, l: 70, c: 86 },
    { o: 86, h: 94, l: 80, c: 82 },
    { o: 82, h: 96, l: 75, c: 91 },
    { o: 91, h: 98, l: 84, c: 88 },
  ];
  const W = 200,
    H = 110,
    pad = 10;
  const cW = (W - pad * 2) / candles.length;
  const bW = cW * 0.55;
  const allVals = candles.flatMap((c) => [c.h, c.l]);
  const minV = Math.min(...allVals) - 2;
  const maxV = Math.max(...allVals) + 2;
  const toY = (v: number) =>
    pad + (1 - (v - minV) / (maxV - minV)) * (H - pad * 2);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id="candleGlow">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={pad}
          y1={pad + f * (H - pad * 2)}
          x2={W - pad}
          y2={pad + f * (H - pad * 2)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.6"
          strokeDasharray="3,4"
        />
      ))}
      {candles.map((c, i) => {
        const bull = c.c >= c.o;
        const color = bull ? "#10b981" : "#f43f5e";
        const cx = pad + i * cW + cW / 2;
        const bodyTop = toY(Math.max(c.o, c.c));
        const bodyBot = toY(Math.min(c.o, c.c));
        return (
          <g key={i} filter="url(#candleGlow)">
            <line
              x1={cx}
              y1={toY(c.h)}
              x2={cx}
              y2={toY(c.l)}
              stroke={color}
              strokeWidth="1.2"
              opacity="0.7"
            />
            <rect
              x={cx - bW / 2}
              y={bodyTop}
              width={bW}
              height={Math.max(bodyBot - bodyTop, 1)}
              rx="1.5"
              fill={bull ? "rgba(16,185,129,0.85)" : "rgba(244,63,94,0.85)"}
              stroke={color}
              strokeWidth="0.6"
            />
          </g>
        );
      })}
    </svg>
  );
}

function BubbleChart(_: ChartProps) {
  const bubbles: {
    x: number;
    y: number;
    r: number;
    label: string;
    c: string;
  }[] = [
    { x: 20, y: 70, r: 18, label: "US", c: "#6366f1" },
    { x: 45, y: 45, r: 28, label: "EU", c: "#06b6d4" },
    { x: 70, y: 30, r: 12, label: "UK", c: "#10b981" },
    { x: 60, y: 65, r: 20, label: "APAC", c: "#f59e0b" },
    { x: 30, y: 25, r: 15, label: "LATAM", c: "#8b5cf6" },
    { x: 82, y: 72, r: 10, label: "ME", c: "#f43f5e" },
  ];
  const W = 200,
    H = 110,
    pad = 10;
  const toX = (v: number) => pad + (v * (W - pad * 2)) / 100;
  const toY = (v: number) => H - pad - (v * (H - pad * 2)) / 100;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        {bubbles.map((b, i) => (
          <radialGradient key={i} id={`bub${i}`} cx="38%" cy="32%">
            <stop offset="0%" stopColor={b.c} stopOpacity="0.95" />
            <stop offset="100%" stopColor={b.c} stopOpacity="0.3" />
          </radialGradient>
        ))}
        <filter id="bubGlow">
          <feGaussianBlur stdDeviation="3" result="bl" />
          <feMerge>
            <feMergeNode in="bl" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[25, 50, 75].map((p) => (
        <line
          key={p}
          x1={pad}
          y1={toY(p)}
          x2={W - pad}
          y2={toY(p)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.6"
          strokeDasharray="3,4"
        />
      ))}
      {bubbles.map((b, i) => (
        <g key={i}>
          <circle
            cx={toX(b.x)}
            cy={toY(b.y)}
            r={b.r}
            fill={`url(#bub${i})`}
            stroke={b.c}
            strokeWidth="0.8"
            opacity="0.88"
            filter="url(#bubGlow)"
          />
          <circle
            cx={toX(b.x) - b.r * 0.3}
            cy={toY(b.y) - b.r * 0.3}
            r={b.r * 0.25}
            fill="rgba(255,255,255,0.15)"
          />
          <text
            x={toX(b.x)}
            y={toY(b.y) + 3}
            textAnchor="middle"
            fontSize={b.r > 14 ? 7 : 5.5}
            fontWeight="700"
            fill="white"
          >
            {b.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StackedAreaChart(_: ChartProps) {
  const xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const a = [20, 25, 28, 35, 32, 40, 44, 50, 48, 55, 60];
  const b = [15, 18, 20, 22, 25, 28, 26, 30, 32, 35, 38];
  const c = [10, 12, 15, 14, 18, 16, 20, 22, 20, 24, 26];
  const W = 200,
    H = 110,
    pad = 10;
  const toX = (i: number) => pad + (i * (W - pad * 2)) / 10;
  const maxSum = Math.max(...xs.map((_, i) => a[i] + b[i] + c[i]));
  const toY = (v: number) => H - pad - (v * (H - pad * 2)) / maxSum;

  const pathA =
    xs
      .map(
        (_, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(a[i] + b[i] + c[i])}`,
      )
      .join(" ") +
    xs
      .slice()
      .reverse()
      .map((_, ri) => {
        const i = 10 - ri;
        return `L${toX(i)},${toY(b[i] + c[i])}`;
      })
      .join(" ") +
    " Z";
  const pathB =
    xs
      .map((_, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(b[i] + c[i])}`)
      .join(" ") +
    xs
      .slice()
      .reverse()
      .map((_, ri) => {
        const i = 10 - ri;
        return `L${toX(i)},${toY(c[i])}`;
      })
      .join(" ") +
    " Z";
  const pathC =
    xs.map((_, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(c[i])}`).join(" ") +
    ` L${toX(10)},${H - pad} L${toX(0)},${H - pad} Z`;

  const lineA = xs
    .map((_, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(a[i] + b[i] + c[i])}`)
    .join(" ");
  const lineB = xs
    .map((_, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(b[i] + c[i])}`)
    .join(" ");
  const lineC = xs
    .map((_, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(c[i])}`)
    .join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id="areaGlow2">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={pad}
          y1={pad + f * (H - pad * 2)}
          x2={W - pad}
          y2={pad + f * (H - pad * 2)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.6"
          strokeDasharray="3,4"
        />
      ))}
      <path d={pathC} fill="rgba(16,185,129,0.35)" />
      <path d={pathB} fill="rgba(6,182,212,0.3)" />
      <path d={pathA} fill="rgba(99,102,241,0.25)" />
      <path
        d={lineC}
        fill="none"
        stroke="#10b981"
        strokeWidth="1.6"
        filter="url(#areaGlow2)"
      />
      <path
        d={lineB}
        fill="none"
        stroke="#06b6d4"
        strokeWidth="1.6"
        filter="url(#areaGlow2)"
      />
      <path
        d={lineA}
        fill="none"
        stroke="#6366f1"
        strokeWidth="1.8"
        filter="url(#areaGlow2)"
      />
    </svg>
  );
}

function FunnelChart(_: ChartProps) {
  const stages: { label: string; val: number; c: string }[] = [
    { label: "Visitors", val: 10000, c: "#6366f1" },
    { label: "Leads", val: 4200, c: "#8b5cf6" },
    { label: "Trials", val: 1800, c: "#06b6d4" },
    { label: "Paying", val: 620, c: "#10b981" },
    { label: "Elite", val: 88, c: "#f59e0b" },
  ];
  const W = 200,
    H = 110,
    pad = 8;
  const maxW = W - pad * 2 - 50;
  const maxVal = stages[0].val;
  const rowH = (H - pad * 2) / stages.length;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        {stages.map((s, i) => (
          <linearGradient key={i} id={`fg${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={s.c} stopOpacity="0.9" />
            <stop offset="100%" stopColor={s.c} stopOpacity="0.4" />
          </linearGradient>
        ))}
        <filter id="funnelGlow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {stages.map((s, i) => {
        const barW = maxW * (s.val / maxVal);
        const y = pad + i * rowH;
        const x = pad + (maxW - barW) / 2;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y + 1.5}
              width={barW}
              height={rowH - 3}
              rx="3"
              fill={`url(#fg${i})`}
              filter="url(#funnelGlow)"
            />
            <rect
              x={x}
              y={y + 1.5}
              width={barW * 0.25}
              height={rowH - 3}
              rx="3"
              fill="rgba(255,255,255,0.12)"
            />
            <text
              x={pad + maxW / 2}
              y={y + rowH / 2 + 3}
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="700"
              fill="rgba(255,255,255,0.85)"
            >
              {s.label}
            </text>
            <text
              x={pad + maxW + 4}
              y={y + rowH / 2 + 3}
              fontSize="6"
              fill="rgba(148,163,184,0.7)"
              fontWeight="600"
            >
              {s.val >= 1000 ? `${(s.val / 1000).toFixed(1)}k` : s.val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function WaterfallChart(_: ChartProps) {
  const items: {
    label: string;
    val: number;
    type: "base" | "pos" | "neg" | "total";
  }[] = [
    { label: "Start", val: 500, type: "base" },
    { label: "+Rev", val: 320, type: "pos" },
    { label: "-COGS", val: -140, type: "neg" },
    { label: "+Other", val: 80, type: "pos" },
    { label: "-Ops", val: -110, type: "neg" },
    { label: "Net", val: 650, type: "total" },
  ];
  const W = 200,
    H = 110,
    pad = 12;
  const bW = ((W - pad * 2) / items.length) * 0.62;
  const minV = 0,
    maxV = 700;
  const toY = (v: number) =>
    pad + (1 - (v - minV) / (maxV - minV)) * (H - pad * 2 - 10);

  let running = 500;
  const bars = items.map((it) => {
    if (it.type === "base" || it.type === "total") {
      const bar = { start: 0, end: it.val, type: it.type, label: it.label };
      if (it.type !== "total") running = it.val;
      return bar;
    }
    const prev = running;
    running += it.val;
    return {
      start: Math.min(prev, running),
      end: Math.max(prev, running),
      type: it.type,
      label: it.label,
    };
  });

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id="wfGlow">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={pad}
          y1={pad + f * (H - pad * 2)}
          x2={W - pad}
          y2={pad + f * (H - pad * 2)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.6"
          strokeDasharray="3,4"
        />
      ))}
      {bars.map((b, i) => {
        const x =
          pad +
          (i * (W - pad * 2)) / items.length +
          (W - pad * 2) / items.length / 2 -
          bW / 2;
        const color =
          b.type === "base"
            ? "#6366f1"
            : b.type === "total"
              ? "#06b6d4"
              : b.type === "pos"
                ? "#10b981"
                : "#f43f5e";
        return (
          <g key={i} filter="url(#wfGlow)">
            <rect
              x={x}
              y={toY(b.end)}
              width={bW}
              height={Math.max(toY(b.start) - toY(b.end), 2)}
              rx="2.5"
              fill={color}
              opacity="0.88"
            />
            <text
              x={x + bW / 2}
              y={H - 2}
              textAnchor="middle"
              fontSize="5.5"
              fill="rgba(148,163,184,0.5)"
            >
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function GaugeChart(_: ChartProps) {
  const val = 72;
  const cx = 100,
    cy = 72,
    R = 50;
  const startA = Math.PI * 0.85,
    endA = Math.PI * 2.15;
  const totalA = endA - startA;
  const valA = startA + totalA * (val / 100);

  function arc(
    cx: number,
    cy: number,
    R: number,
    a1: number,
    a2: number,
  ): string {
    const x1 = cx + R * Math.cos(a1),
      y1 = cy + R * Math.sin(a1);
    const x2 = cx + R * Math.cos(a2),
      y2 = cy + R * Math.sin(a2);
    const large = a2 - a1 > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2}`;
  }

  const zones: { from: number; to: number; c: string }[] = [
    { from: 0, to: 0.35, c: "#f43f5e" },
    { from: 0.35, to: 0.65, c: "#f59e0b" },
    { from: 0.65, to: 1, c: "#10b981" },
  ];

  const nx = cx + R * 0.7 * Math.cos(valA);
  const ny = cy + R * 0.7 * Math.sin(valA);

  return (
    <svg width={200} height={110} viewBox="0 0 200 110">
      <defs>
        <filter id="gaugeGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={arc(cx, cy, R + 1, startA, endA)}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {zones.map((z, i) => (
        <path
          key={i}
          d={arc(cx, cy, R, startA + totalA * z.from, startA + totalA * z.to)}
          fill="none"
          stroke={z.c}
          strokeWidth="10"
          opacity="0.75"
          filter="url(#gaugeGlow)"
        />
      ))}
      <path
        d={arc(cx, cy, R, startA, valA)}
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle
        cx={cx}
        cy={cy}
        r="5"
        fill="#080f1a"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
      />
      <circle cx={cx} cy={cy} r="2.5" fill="white" />
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fill="white"
      >
        {val}%
      </text>
      <text
        x={cx}
        y={cy + 29}
        textAnchor="middle"
        fontSize="6.5"
        fill="rgba(148,163,184,0.6)"
      >
        Performance
      </text>
    </svg>
  );
}

// ─── CHART CONFIGS ────────────────────────────────────────────────────────────

const CHARTS: ChartConfig[] = [
  { component: AreaLineChart, label: "Area Line", tag: "Trend" },
  { component: GroupedBarChart, label: "Grouped Bar", tag: "Compare" },
  { component: DonutChart, label: "Donut", tag: "Share" },
  { component: HeatmapChart, label: "Heatmap", tag: "Activity" },
  { component: RadarChart, label: "Radar", tag: "Multi-axis" },
  { component: ScatterChart, label: "Scatter", tag: "Correlation" },
  { component: CandlestickChart, label: "Candlestick", tag: "OHLC" },
  { component: BubbleChart, label: "Bubble", tag: "Distribution" },
  { component: StackedAreaChart, label: "Stacked Area", tag: "Composition" },
  { component: FunnelChart, label: "Funnel", tag: "Conversion" },
  { component: WaterfallChart, label: "Waterfall", tag: "Variance" },
  { component: GaugeChart, label: "Gauge", tag: "KPI" },
];

// ─── MARQUEE ──────────────────────────────────────────────────────────────────

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const SPEED = 0.45;

  const startTick = () => {
    const track = trackRef.current;
    if (!track) return;
    const tick = () => {
      posRef.current += SPEED;
      const halfW = track.scrollWidth / 2;
      if (posRef.current >= halfW) posRef.current = 0;
      track.style.transform = `translateX(-${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopTick = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  };

  useEffect(() => {
    startTick();
    return stopTick;
  }, []);

  const items = [...CHARTS, ...CHARTS];

  return (
    <div
      className="relative z-10 overflow-hidden py-8 bg-white"
      onMouseEnter={stopTick}
      onMouseLeave={startTick}
    >
      {/* Fade edges — opacity mask, no colour bleed */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 z-10 bg-gradient-to-r from-white/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 z-10 bg-gradient-to-l from-white/80 to-transparent" />

      <div ref={trackRef} className="flex gap-4 w-max will-change-transform ">
        {items.map((chart, i) => {
          const Chart = chart.component;
          return (
            <div
              key={i}
              className="
                shrink-0 cursor-default
                w-[220px] h-[158px]
                bg-neutral-900 rounded-[14px]
                border border-white/[0.07]
                p-[10px_10px_8px]
                shadow-[0_4px_24px_rgba(0,0,0,0.4)]
                transition-[border-color,box-shadow,transform] duration-300
                hover:border-cyan-500/30
                hover:shadow-[0_8px_40px_rgba(6,182,212,0.12),0_0_0_1px_rgba(6,182,212,0.1)]
                hover:-translate-y-1
                
              "
            >
              {/* Chart canvas */}
              <div className="w-full h-[110px] overflow-hidden rounded-lg">
                <Chart />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-2 px-0.5">
                <span className="font-mono text-[0.62rem] text-slate-400 font-semibold tracking-[0.04em]">
                  {chart.label}
                </span>
                <span className="font-mono text-[0.56rem] text-cyan-500/70 bg-cyan-500/[0.08] border border-cyan-500/20 rounded-full px-[7px] py-px tracking-[0.06em] uppercase">
                  {chart.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
