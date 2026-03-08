// components/ChartMorph.tsx
"use client";

import { useEffect, useRef, useState } from "react";

// ── Static data ───────────────────────────────────────────────────────────────
const DATA = [
  { v: 0.38, color: "#78716c" },
  { v: 0.71, color: "#57534e" },
  { v: 0.52, color: "#a8a29e" },
  { v: 0.89, color: "#44403c" },
  { v: 0.61, color: "#79716b" },
  { v: 0.95, color: "#292524" },
  { v: 0.44, color: "#a1a1aa" },
] as const;

// ── Constants ─────────────────────────────────────────────────────────────────
const W = 240;
const H = 160;
const PX = 16;
const PY = 14;
const IW = W - PX * 2;
const IH = H - PY * 2;
const N = DATA.length;

// ── Utilities ─────────────────────────────────────────────────────────────────
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ── Geometry helpers ──────────────────────────────────────────────────────────
function bars(progress = 1) {
  const bw = IW / N;
  return DATA.map((d, i) => {
    const h = IH * d.v * progress;
    return {
      x: PX + i * bw + bw * 0.12,
      y: PY + IH - h,
      w: bw * 0.76,
      h,
      cx: PX + i * bw + bw * 0.5,
      color: d.color,
    };
  });
}

function linePoints() {
  const bw = IW / (N - 1);
  return DATA.map((d, i) => ({
    x: PX + i * bw,
    y: PY + IH * (1 - d.v),
    color: d.color,
  }));
}

function pieSlices(grow = 1) {
  const cx = W / 2;
  const cy = H / 2 + 2;
  const r = Math.min(IW, IH) * 0.42 * grow;
  const tot = DATA.reduce((s, d) => s + d.v, 0);
  let a = -Math.PI / 2;
  return DATA.map((d) => {
    const sw = (d.v / tot) * Math.PI * 2;
    const s = a;
    a += sw;
    return { cx, cy, r, s, e: a, color: d.color };
  });
}

function arcPath({
  cx,
  cy,
  r,
  s,
  e,
}: {
  cx: number;
  cy: number;
  r: number;
  s: number;
  e: number;
}) {
  if (r < 0.5) return "";
  const x1 = cx + r * Math.cos(s);
  const y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e);
  const y2 = cy + r * Math.sin(e);
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${e - s > Math.PI ? 1 : 0} 1 ${x2},${y2}Z`;
}

function spline(pts: { x: number; y: number }[]) {
  if (!pts.length) return "";
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const mx = (p.x + c.x) / 2;
    d += ` C${mx},${p.y} ${mx},${c.y} ${c.x},${c.y}`;
  }
  return d;
}

// ── Isometric cube ────────────────────────────────────────────────────────────
function iso(
  x: number,
  y: number,
  z: number,
  cx: number,
  cy: number,
  s: number,
) {
  const sx = (x - z) * Math.cos(Math.PI / 6) * s;
  const sy = (x + z) * Math.sin(Math.PI / 6) * s - y * s;
  return [cx + sx, cy + sy];
}

function cubeGeometry(cx: number, cy: number, angle: number, scale: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const pts3d = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ].map(([x, y, z]) => [x * cos - z * sin, y, x * sin + z * cos]);

  const p = pts3d.map(([x, y, z]) =>
    iso(x as number, y as number, z as number, cx, cy, scale),
  );
  const pt = (ix: number) => `${p[ix][0].toFixed(2)},${p[ix][1].toFixed(2)}`;
  const face = (indices: number[]) =>
    "M" + indices.map((i) => pt(i)).join(" L") + "Z";

  return [
    {
      d: face([0, 1, 5, 4]),
      fill: "#d6d3d1",
      opacity: 0.5,
      stroke: "#a8a29e",
      sOpacity: 0.6,
    },
    {
      d: face([0, 3, 7, 4]),
      fill: "#e7e5e4",
      opacity: 0.4,
      stroke: "#d6d3d1",
      sOpacity: 0.5,
    },
    {
      d: face([1, 2, 6, 5]),
      fill: "#e7e5e4",
      opacity: 0.4,
      stroke: "#d6d3d1",
      sOpacity: 0.5,
    },
    {
      d: face([3, 2, 6, 7]),
      fill: "#c4bfbb",
      opacity: 0.6,
      stroke: "#78716c",
      sOpacity: 0.7,
    },
    {
      d: face([0, 1, 2, 3]),
      fill: "#f5f3f0",
      opacity: 0.7,
      stroke: "#a8a29e",
      sOpacity: 0.5,
    },
    {
      d: face([4, 5, 6, 7]),
      fill: "#1c1917",
      opacity: 0.08,
      stroke: "#57534e",
      sOpacity: 0.4,
    },
  ];
}

// ── Phase timing ──────────────────────────────────────────────────────────────
const DUR = [1.4, 0.9, 1.4, 0.9, 1.4, 0.9, 1.8, 0.9];
const TOTAL = DUR.reduce((a, b) => a + b, 0);

// ── SVG Components ────────────────────────────────────────────────────────────
function Bars({ prog = 1, alpha = 1 }: { prog?: number; alpha?: number }) {
  return (
    <g opacity={alpha}>
      {bars(prog).map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="1.5"
            fill={DATA[i].color}
            opacity="0.12"
          />
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="1.5"
            fill="none"
            stroke={DATA[i].color}
            strokeWidth="1"
            opacity="0.5"
          />
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height="2.5"
            rx="1"
            fill={DATA[i].color}
            opacity="0.9"
          />
        </g>
      ))}
    </g>
  );
}

function Line({ alpha = 1 }: { alpha?: number }) {
  const pts = linePoints();
  const pd = spline(pts);
  const bot = PY + IH;
  const area = pd + ` L${pts[pts.length - 1].x},${bot} L${pts[0].x},${bot}Z`;

  return (
    <g opacity={alpha}>
      <path d={area} fill="url(#lf-light)" />
      <path
        d={pd}
        fill="none"
        stroke="#57534e"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={p.color} opacity="0.1" />
          <circle cx={p.x} cy={p.y} r="2.5" fill={p.color} opacity="0.8" />
          <circle cx={p.x} cy={p.y} r="1" fill="#fff" opacity="0.95" />
        </g>
      ))}
    </g>
  );
}

function Pie({ grow = 1, alpha = 1 }: { grow?: number; alpha?: number }) {
  const slices = pieSlices(grow);
  const { cx, cy, r } = slices[0] || { cx: W / 2, cy: H / 2, r: 0 };

  return (
    <g opacity={alpha}>
      {slices.map((s, i) => (
        <g key={i}>
          <path d={arcPath(s)} fill={s.color} opacity="0.12" />
          <path
            d={arcPath(s)}
            fill="none"
            stroke={s.color}
            strokeWidth="1.2"
            opacity="0.7"
          />
        </g>
      ))}
      {grow > 0.2 && (
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.38}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="1"
        />
      )}
      {slices.map((s, i) => {
        const mx = (s.s + s.e) / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + s.r * Math.cos(mx)}
            y2={cy + s.r * Math.sin(mx)}
            stroke={s.color}
            strokeWidth="0.5"
            opacity="0.3"
          />
        );
      })}
    </g>
  );
}

function Cube({
  alpha = 1,
  angle = 0,
  scale = 1,
}: {
  alpha?: number;
  angle?: number;
  scale?: number;
}) {
  const cx = W / 2;
  const cy = H / 2 - 2;
  const faces = cubeGeometry(cx, cy, angle, 28 * scale);
  return (
    <g opacity={alpha}>
      {faces.map((f, i) => (
        <g key={i}>
          <path d={f.d} fill={f.fill} opacity={f.opacity} />
          <path
            d={f.d}
            fill="none"
            stroke={f.stroke}
            strokeWidth="0.9"
            opacity={f.sOpacity}
            strokeLinejoin="round"
          />
        </g>
      ))}
    </g>
  );
}

// ── Transitions ───────────────────────────────────────────────────────────────
function BarToLine({ t }: { t: number }) {
  const bs = bars(1);
  const lp = linePoints();
  const pts = lp.map((p, i) => ({
    x: lerp(bs[i].cx, p.x, t),
    y: lerp(bs[i].y, p.y, t),
    color: p.color,
  }));
  const bot = PY + IH;
  const pd = spline(pts);
  const area = pd + ` L${pts[pts.length - 1].x},${bot} L${pts[0].x},${bot}Z`;

  return (
    <g>
      <g opacity={lerp(1, 0, t)}>
        {bs.map((b, i) => (
          <g key={i}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="1.5"
              fill={DATA[i].color}
              opacity="0.12"
            />
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="1.5"
              fill="none"
              stroke={DATA[i].color}
              strokeWidth="1"
              opacity="0.5"
            />
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height="2.5"
              rx="1"
              fill={DATA[i].color}
              opacity="0.9"
            />
          </g>
        ))}
      </g>
      <g opacity={ease(t)}>
        <path d={area} fill="url(#lf-light)" />
        <path
          d={pd}
          fill="none"
          stroke="#57534e"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="2.5" fill={p.color} opacity="0.8" />
            <circle cx={p.x} cy={p.y} r="1" fill="#fff" opacity="0.95" />
          </g>
        ))}
      </g>
    </g>
  );
}

function LineToPie({ t }: { t: number }) {
  return (
    <g>
      <g opacity={1 - ease(t)}>
        <Line alpha={1} />
      </g>
      <g opacity={ease(t)}>
        <Pie grow={t} alpha={1} />
      </g>
    </g>
  );
}

function PieToCube({ t, cubeAngle }: { t: number; cubeAngle: number }) {
  const et = ease(t);
  return (
    <g>
      <g opacity={1 - et}>
        <Pie grow={lerp(1, 0, et)} alpha={1} />
      </g>
      <g opacity={et}>
        <Cube angle={cubeAngle} scale={et} alpha={1} />
      </g>
    </g>
  );
}

function CubeToBar({ t, cubeAngle }: { t: number; cubeAngle: number }) {
  const et = ease(t);
  return (
    <g>
      <g opacity={1 - et}>
        <Cube angle={cubeAngle} scale={1} alpha={1} />
      </g>
      <g opacity={et}>
        <Bars prog={et} alpha={1} />
      </g>
    </g>
  );
}

function Content({
  phase,
  pt,
  cubeAngle,
}: {
  phase: number;
  pt: number;
  cubeAngle: number;
}) {
  if (phase === 0) return <Bars prog={1} />;
  if (phase === 1) return <BarToLine t={pt} />;
  if (phase === 2) return <Line />;
  if (phase === 3) return <LineToPie t={pt} />;
  if (phase === 4) return <Pie grow={1} />;
  if (phase === 5) return <PieToCube t={pt} cubeAngle={cubeAngle} />;
  if (phase === 6) return <Cube angle={cubeAngle} scale={1} alpha={1} />;
  if (phase === 7) return <CubeToBar t={pt} cubeAngle={cubeAngle} />;
  return null;
}

// ── Main export ───────────────────────────────────────────────────────────────
interface ChartMorphProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function ChartMorph({ className = "" }: ChartMorphProps) {
  const [t, setT] = useState(0);
  const t0 = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const tick = (ts: number) => {
      if (!t0.current) t0.current = ts;
      setT(((ts - t0.current) / 1000) % TOTAL);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  let phase = 0,
    pt = 0,
    acc = 0;
  for (let i = 0; i < DUR.length; i++) {
    if (t < acc + DUR[i]) {
      phase = i;
      pt = (t - acc) / DUR[i];
      break;
    }
    acc += DUR[i];
  }

  const cubeAngle = (t / TOTAL) * Math.PI * 4;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 w-full ${className}`}
    >
      {/* Heading */}
      <div className="text-center">
        <h1
          className="font-black tracking-tight text-4xl md:text-5xl lg:text-6xl text-neutral-900"
          style={{ letterSpacing: "-0.03em" }}
        >
          AI-Powered
          <br />
          <span className="text-neutral-400">Data Visualization</span>
        </h1>
        <p className="mt-3 text-neutral-500 text-base md:text-lg font-medium">
          Describe your data in plain English.{" "}
          <span className="text-neutral-800 font-semibold">
            Get beautiful charts instantly.
          </span>
        </p>

        {/* Feature chips */}
        <div className="mt-5 flex flex-wrap gap-1.5 justify-center">
          {[
            { icon: "▬", label: "Bar & Line" },
            { icon: "◕", label: "Pie & Donut" },
            { icon: "▦", label: "Heatmaps" },
            { icon: "◈", label: "3D Charts" },
            { icon: "⊞", label: "Upload CSV" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-semibold font-mono bg-white border border-neutral-200 text-neutral-500 shadow-sm"
            >
              <span className="text-neutral-400 text-[10px]">{icon}</span>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="relative w-full max-w-[260px] mx-auto">
        {/* Outer card */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden p-3">
          {/* Mini toolbar */}
          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-neutral-100">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
            <span className="ml-auto font-mono text-[8.5px] text-neutral-300 uppercase tracking-widest">
              Live Preview
            </span>
          </div>

          {/* SVG */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block w-full overflow-visible"
          >
            <defs>
              <linearGradient id="lf-light" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#57534e" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#57534e" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((v) => (
              <line
                key={v}
                x1={PX}
                y1={PY + IH * (1 - v)}
                x2={W - PX}
                y2={PY + IH * (1 - v)}
                stroke="#e5e2de"
                strokeWidth="0.5"
                strokeDasharray="3 3"
              />
            ))}
            {/* Baseline */}
            <line
              x1={PX}
              y1={PY + IH}
              x2={W - PX}
              y2={PY + IH}
              stroke="#d6d3d1"
              strokeWidth="0.75"
            />

            <Content phase={phase} pt={pt} cubeAngle={cubeAngle} />
          </svg>
        </div>

        {/* Decorative corner ticks */}
        <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-neutral-400 rounded-tl-sm" />
        <div className="absolute -top-px -right-px w-3 h-3 border-t border-r border-neutral-400 rounded-tr-sm" />
        <div className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-neutral-400 rounded-bl-sm" />
        <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-neutral-400 rounded-br-sm" />
      </div>
    </div>
  );
}
  