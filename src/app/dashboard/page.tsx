"use client";
import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import GraphCard from "@/components/dashboard/GraphCard";
import {
  CYAN,
  BORDER,
  GRAPHS,
  STATS,
  ACTIVITY,
  TEMPLATES,
  USER,
  PAGE_TITLE,
  Tab,
} from "@/lib/Data";

// ══════════════════════════════════════════════════════════════
// SMALL REUSABLE INLINE HELPERS
// ══════════════════════════════════════════════════════════════
function DiagDivider() {
  return (
    <div
      className="h-[1px] relative overflow-hidden"
      style={{ background: BORDER }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg,transparent 0,transparent 3px,${CYAN}55 3px,${CYAN}55 6px)`,
          backgroundSize: "9px 9px",
          animation: "diagMove 1.4s linear infinite",
        }}
      />
    </div>
  );
}

function CyanBtn({
  label,
  onClick,
  sm,
}: {
  label: string;
  onClick?: () => void;
  sm?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-syne font-bold uppercase tracking-widest text-[#090b0e] hover:opacity-85 transition-opacity ${sm ? "px-4 py-2 text-[0.7rem]" : "px-6 py-3 text-[0.78rem]"}`}
      style={{ background: CYAN }}
    >
      {label}
    </button>
  );
}

function GhostBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 font-syne font-bold text-[0.72rem] uppercase tracking-wider border hover:bg-[rgba(255,255,255,0.04)] transition-colors"
      style={{ borderColor: BORDER, color: "rgba(255,255,255,0.45)" }}
    >
      {label}
    </button>
  );
}

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-syne font-extrabold text-[1.4rem] text-white tracking-tight">
        {title}
      </h2>
      {sub && (
        <p
          className="text-[0.82rem] mt-1"
          style={{ color: "rgba(255,255,255,0.38)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-[0.75rem] font-syne font-semibold mb-6 hover:opacity-75 transition-opacity"
      style={{ color: CYAN }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Back to Dashboard
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
// GRAPH GRID (shared between My Graphs / Shared / Favourites)
// ══════════════════════════════════════════════════════════════
function GraphGrid({
  graphs,
  emptyMsg = "No graphs found",
}: {
  graphs: typeof GRAPHS;
  emptyMsg?: string;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Line" | "Bar" | "Area">("All");
  const list = graphs.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All" || g.tag === filter),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-[300px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search graphs…"
            className="w-full bg-[#0d1014] text-white text-[0.8rem] pl-8 pr-4 py-2 outline-none placeholder-[#3a3f47] transition-colors"
            style={{ border: "1px solid", borderColor: search ? CYAN : BORDER }}
          />
        </div>
        <div className="flex gap-1">
          {(["All", "Line", "Bar", "Area"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-[0.7rem] font-syne font-bold uppercase tracking-wider border transition-all"
              style={{
                background: filter === f ? CYAN : "transparent",
                color: filter === f ? "#090b0e" : "rgba(255,255,255,0.35)",
                borderColor: filter === f ? CYAN : BORDER,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {list.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((g, i) => (
            <GraphCard key={g.id} graph={g} index={i} />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center py-20 border"
          style={{ borderColor: BORDER }}
        >
          <span className="text-4xl mb-3 opacity-20">📊</span>
          <p
            className="font-syne font-bold text-[0.9rem]"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            {emptyMsg}
          </p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD HOME
// ══════════════════════════════════════════════════════════════
function DashboardHome({ setTab }: { setTab: (t: Tab) => void }) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setM(true), 60);
    return () => clearTimeout(t);
  }, []);
  const anim = (delay = 0) =>
    m ? { animation: `fadeUp 0.5s ease ${delay}s both` } : { opacity: 0 };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Welcome */}
      <div style={anim(0)}>
        <p
          className="text-[0.64rem] uppercase tracking-[0.2em] mb-1 text-center"
          style={{ color: CYAN }}
        >
          Good morning
        </p>
        <h1 className="font-syne font-extrabold text-[2.4rem] text-white leading-none tracking-tight">
          <span className="text-cyan-600">{USER.name.split(" ")[0]}'s</span>{" "}
          workspace
          <span
            style={{ color: "transparent", WebkitTextStroke: `1.5px ${CYAN}` }}
          >
            .
          </span>
        </h1>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2px border place-items-center w-full"
        style={{ borderColor: BORDER, ...anim(0.06) }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            className="px-5 py-3 flex flex-col gap-1.5 cursor-default"
          >
            <span
              className="text-[0.6rem] uppercase tracking-[0.1em]"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              {s.label}
            </span>
            <span className="font-syne font-extrabold text-[1.9rem] text-white leading-none">
              {s.value}
            </span>
            <span className="text-[0.68rem]" style={{ color: CYAN }}>
              {s.delta}
            </span>
          </div>
        ))}
      </div>

      {/* ── ACTION BUTTONS ROW ── */}
      <div style={anim(0.12)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* New Graph */}
          <button
            onClick={() => setTab("new-graph")}
            className="group hover:cursor-pointer relative flex flex-col items-center justify-center gap-3 px-6 py-3 border overflow-hidden text-center transition-all duration-200 bg-white/80 rounded-xl hover:bg-white/90"
            style={{ borderColor: `${CYAN}55` }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div
              className="w-12 h-12 border flex items-center justify-center relative z-10 group-hover:border-[rgba(8,145,178,0.8)] transition-colors"
              style={{ borderColor: CYAN, color: CYAN }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div className="relative z-10">
              <p className="font-syne font-bold text-[0.92rem] text-[#111212]">
                New Graph
              </p>
              <p className="text-[0.72rem] mt-0.5 text-[#111212]">
                Build from scratch
              </p>
            </div>
            <span
              className="text-[0.6rem] font-syne font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: CYAN }}
            >
              Create →
            </span>
          </button>

          {/* Google Sheets */}
          <button
            onClick={() => setTab("import-google")}
            className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 border overflow-hidden text-center transition-all duration-200 hover:border-[rgba(255,255,255,0.25)]"
            style={{ background: "#0a0d10", borderColor: BORDER }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
              }}
            />
            <div
              className="w-12 h-12 border border-[#1e2227] flex items-center justify-center relative z-10 group-hover:border-[rgba(255,255,255,0.2)] transition-colors"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {/* Google Sheets icon approximation */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>
            <div className="relative z-10">
              <p className="font-syne font-bold text-[0.92rem] text-white">
                Google Sheets
              </p>
              <p
                className="text-[0.72rem] mt-0.5"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                Connect live data
              </p>
            </div>
            <span
              className="absolute bottom-3 right-3 text-[0.6rem] font-syne font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Connect →
            </span>
          </button>

          {/* Upload Excel */}
          <button
            onClick={() => setTab("import-excel")}
            className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 border overflow-hidden text-center transition-all duration-200 hover:border-[rgba(255,255,255,0.25)]"
            style={{ background: "#0a0d10", borderColor: BORDER }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
              }}
            />
            <div
              className="w-12 h-12 border border-[#1e2227] flex items-center justify-center relative z-10 group-hover:border-[rgba(255,255,255,0.2)] transition-colors"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
            <div className="relative z-10">
              <p className="font-syne font-bold text-[0.92rem] text-white">
                Upload Excel
              </p>
              <p
                className="text-[0.72rem] mt-0.5"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                XLS / XLSX / CSV
              </p>
            </div>
            <span
              className="absolute bottom-3 right-3 text-[0.6rem] font-syne font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Upload →
            </span>
          </button>

          {/* Paste Data */}
          <button
            onClick={() => setTab("import-paste")}
            className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 border overflow-hidden text-center transition-all duration-200 hover:border-[rgba(255,255,255,0.25)]"
            style={{ background: "#0a0d10", borderColor: BORDER }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
              }}
            />
            <div
              className="w-12 h-12 border border-[#1e2227] flex items-center justify-center relative z-10 group-hover:border-[rgba(255,255,255,0.2)] transition-colors"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
            </div>
            <div className="relative z-10">
              <p className="font-syne font-bold text-[0.92rem] text-white">
                Paste Data
              </p>
              <p
                className="text-[0.72rem] mt-0.5"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                Tabular text / JSON
              </p>
            </div>
            <span
              className="absolute bottom-3 right-3 text-[0.6rem] font-syne font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Paste →
            </span>
          </button>
        </div>
      </div>

      {/* Diagonal divider */}
      <div style={anim(0.18)}>
        <DiagDivider />
      </div>

      {/* Recent graphs */}
      <div style={anim(0.18)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne font-bold text-[1rem] text-white">
            Recent Graphs
          </h2>
          <button
            onClick={() => setTab("graphs")}
            className="text-[0.72rem] font-syne font-semibold hover:opacity-70 transition-opacity"
            style={{ color: CYAN }}
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {GRAPHS.slice(0, 6).map((g, i) => (
            <GraphCard key={g.id} graph={g} index={i} />
          ))}
        </div>
      </div>

      {/* Activity + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={anim(0.24)}>
        {/* Activity */}
        <div
          className="border"
          style={{ background: "#0a0d10", borderColor: BORDER }}
        >
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: BORDER }}
          >
            <h3 className="font-syne font-bold text-[0.88rem] text-white">
              Activity
            </h3>
            <span
              className="text-[0.6rem] uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Last 7 days
            </span>
          </div>
          {ACTIVITY.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 border-b hover:bg-[rgba(255,255,255,0.015)] transition-colors"
              style={{ borderColor: BORDER }}
            >
              <div
                className="w-7 h-7 rounded-sm flex items-center justify-center font-syne font-bold text-[0.58rem] flex-shrink-0"
                style={{
                  background:
                    a.avatar === USER.avatar
                      ? `${CYAN}20`
                      : "rgba(255,255,255,0.06)",
                  color:
                    a.avatar === USER.avatar ? CYAN : "rgba(255,255,255,0.4)",
                }}
              >
                {a.avatar}
              </div>
              <p className="flex-1 text-[0.77rem] text-white leading-tight">
                <span style={{ color: "rgba(255,255,255,0.38)" }}>
                  {a.action}{" "}
                </span>
                <span className="font-syne font-semibold">{a.graph}</span>
              </p>
              <span
                className="text-[0.63rem]"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                {a.time}
              </span>
            </div>
          ))}
        </div>

        {/* Favourites preview */}
        <div
          className="border"
          style={{ background: "#0a0d10", borderColor: BORDER }}
        >
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: BORDER }}
          >
            <h3 className="font-syne font-bold text-[0.88rem] text-white">
              Starred
            </h3>
            <button
              onClick={() => setTab("favourites")}
              className="text-[0.65rem] font-syne font-semibold hover:opacity-70 transition-opacity"
              style={{ color: CYAN }}
            >
              See all →
            </button>
          </div>
          {GRAPHS.filter((g) => g.starred).map((g, i) => (
            <div
              key={g.id}
              className="flex items-center gap-4 px-5 py-3 border-b hover:bg-[rgba(255,255,255,0.015)] transition-colors cursor-pointer group"
              style={{ borderColor: BORDER }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill={CYAN}
                stroke={CYAN}
                strokeWidth="1.8"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="font-syne font-semibold text-[0.82rem] text-white truncate">
                  {g.title}
                </p>
                <p
                  className="text-[0.67rem] truncate"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {g.category}
                </p>
              </div>
              <span
                className="text-[0.7rem] font-syne font-bold"
                style={{ color: g.trendUp ? CYAN : "rgba(255,90,90,0.7)" }}
              >
                {g.trend}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// NEW GRAPH PAGE
// ══════════════════════════════════════════════════════════════
function NewGraphPage({ setTab }: { setTab: (t: Tab) => void }) {
  const [chartType, setChartType] = useState<string>("Line");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const types = [
    {
      id: "Line",
      icon: (
        <>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </>
      ),
      label: "Line Chart",
      sub: "Trends over time",
    },
    {
      id: "Bar",
      icon: (
        <>
          <rect x="18" y="3" width="4" height="18" />
          <rect x="11" y="8" width="4" height="13" />
          <rect x="4" y="13" width="4" height="8" />
        </>
      ),
      label: "Bar Chart",
      sub: "Compare values",
    },
    {
      id: "Area",
      icon: (
        <>
          <path d="M21 15l-5-5L10 16 3 9" />
          <path d="M21 15H3v4h18v-4z" fill="currentColor" fillOpacity="0.2" />
        </>
      ),
      label: "Area Chart",
      sub: "Volume & fill",
    },
    {
      id: "Pie",
      icon: (
        <>
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </>
      ),
      label: "Pie / Donut",
      sub: "Proportions",
    },
    {
      id: "Scatter",
      icon: (
        <>
          <circle cx="7.5" cy="7.5" r="1.5" />
          <circle cx="18.5" cy="5.5" r="1.5" />
          <circle cx="11.5" cy="11.5" r="1.5" />
          <circle cx="14.5" cy="17.5" r="1.5" />
          <circle cx="5.5" cy="17.5" r="1.5" />
        </>
      ),
      label: "Scatter",
      sub: "Correlation",
    },
    {
      id: "Table",
      icon: (
        <>
          <rect x="3" y="3" width="18" height="18" rx="1" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </>
      ),
      label: "Data Table",
      sub: "Raw records",
    },
  ];

  return (
    <div className="max-w-[760px]">
      <BackBtn onClick={() => setTab("dashboard")} />
      <PageHeader
        title="New Graph"
        sub="Choose a chart type and configure your visualization"
      />

      {/* Steps indicator */}
      <div className="flex items-center gap-0 mb-8">
        {[
          ["1", "Type"],
          ["2", "Details"],
          ["3", "Data"],
        ].map(([n, l], i) => (
          <div key={n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 flex items-center justify-center font-syne font-bold text-[0.72rem] border transition-all"
                style={{
                  background: step >= Number(n) ? CYAN : "transparent",
                  borderColor: step >= Number(n) ? CYAN : BORDER,
                  color:
                    step >= Number(n) ? "#090b0e" : "rgba(255,255,255,0.3)",
                }}
              >
                {n}
              </div>
              <span
                className="text-[0.72rem] font-syne font-medium hidden sm:block"
                style={{
                  color: step >= Number(n) ? "white" : "rgba(255,255,255,0.3)",
                }}
              >
                {l}
              </span>
            </div>
            {i < 2 && (
              <div
                className="w-10 h-[1px] mx-3"
                style={{ background: step > i + 1 ? CYAN : BORDER }}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-5">
          <p
            className="text-[0.8rem]"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Select the chart type that best represents your data
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setChartType(t.id)}
                className="flex flex-col items-center gap-3 p-5 border transition-all duration-150"
                style={{
                  background: chartType === t.id ? `${CYAN}10` : "#0a0d10",
                  borderColor: chartType === t.id ? CYAN : BORDER,
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: chartType === t.id ? CYAN : "rgba(255,255,255,0.4)",
                  }}
                >
                  {t.icon}
                </svg>
                <div>
                  <p className="font-syne font-bold text-[0.82rem] text-white text-center">
                    {t.label}
                  </p>
                  <p
                    className="text-[0.68rem] text-center mt-0.5"
                    style={{ color: "rgba(255,255,255,0.32)" }}
                  >
                    {t.sub}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <CyanBtn label="Next: Details →" onClick={() => setStep(2)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <p
            className="text-[0.8rem]"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Give your graph a name and description
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[0.66rem] uppercase tracking-[0.1em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Graph Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monthly Revenue Q1"
                className="w-full text-white text-[0.9rem] px-4 py-3 outline-none transition-colors placeholder-[#3a3f47]"
                style={{
                  background: "#0d1014",
                  border: "1px solid",
                  borderColor: title ? CYAN : BORDER,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = title ? CYAN : BORDER)
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[0.66rem] uppercase tracking-[0.1em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Description
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="What does this graph show?"
                rows={3}
                className="w-full text-white text-[0.88rem] px-4 py-3 outline-none resize-none transition-colors placeholder-[#3a3f47]"
                style={{
                  background: "#0d1014",
                  border: "1px solid",
                  borderColor: BORDER,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
                onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[0.66rem] uppercase tracking-[0.1em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Category
              </label>
              <select
                className="w-full text-white text-[0.88rem] px-4 py-3 outline-none appearance-none cursor-pointer"
                style={{
                  background: "#0d1014",
                  border: "1px solid",
                  borderColor: BORDER,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {[
                  "Finance",
                  "Growth",
                  "Retention",
                  "Product",
                  "Operations",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <GhostBtn label="← Back" onClick={() => setStep(1)} />
            <CyanBtn label="Next: Add Data →" onClick={() => setStep(3)} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <p
            className="text-[0.8rem]"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Choose how to add data to your{" "}
            <strong style={{ color: "white" }}>{chartType}</strong> graph
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Upload File",
                sub: "CSV / XLSX",
                icon: (
                  <>
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </>
                ),
                tab: "import-excel",
              },
              {
                label: "Google Sheets",
                sub: "Connect live",
                icon: (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="1" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </>
                ),
                tab: "import-google",
              },
              {
                label: "Paste Data",
                sub: "Manual entry",
                icon: (
                  <>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" />
                  </>
                ),
                tab: "import-paste",
              },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setTab(opt.tab as Tab)}
                className="flex flex-col items-center gap-3 p-6 border hover:border-[rgba(8,145,178,0.5)] hover:bg-[rgba(8,145,178,0.04)] transition-all"
                style={{ background: "#0a0d10", borderColor: BORDER }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {opt.icon}
                </svg>
                <div>
                  <p className="font-syne font-bold text-[0.85rem] text-white text-center">
                    {opt.label}
                  </p>
                  <p
                    className="text-[0.7rem] text-center mt-0.5"
                    style={{ color: "rgba(255,255,255,0.32)" }}
                  >
                    {opt.sub}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <GhostBtn label="← Back" onClick={() => setStep(2)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// IMPORT: GOOGLE SHEETS
// ══════════════════════════════════════════════════════════════
function ImportGooglePage({ setTab }: { setTab: (t: Tab) => void }) {
  const [step, setStep] = useState<"connect" | "pick" | "done">("connect");
  const [url, setUrl] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [sheet, setSheet] = useState("");

  const mockSheets = [
    "Revenue Report 2024",
    "User Metrics Q4",
    "Marketing KPIs",
    "Product Analytics",
  ];

  function handleConnect() {
    if (!url) return;
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setStep("pick");
    }, 1800);
  }

  return (
    <div className="max-w-[640px]">
      <BackBtn onClick={() => setTab("dashboard")} />
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 border flex items-center justify-center"
          style={{ borderColor: `${CYAN}55`, color: CYAN }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="3" width="18" height="18" rx="1" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </div>
        <div>
          <h2 className="font-syne font-extrabold text-[1.3rem] text-white">
            Connect Google Sheets
          </h2>
          <p
            className="text-[0.78rem]"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Link a spreadsheet and keep your graphs in sync
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 text-[0.72rem] font-syne font-medium">
        {[
          ["connect", "Authenticate"],
          ["pick", "Select Sheet"],
          ["done", "Done"],
        ].map(([id, label], i) => {
          const active = step === id;
          const past =
            (step === "pick" && i === 0) || (step === "done" && i < 2);
          return (
            <div key={id} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 flex items-center justify-center text-[0.6rem] font-syne font-bold border transition-all"
                  style={{
                    background: active || past ? CYAN : "transparent",
                    borderColor: active || past ? CYAN : BORDER,
                    color: active || past ? "#090b0e" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {past ? "✓" : i + 1}
                </div>
                <span
                  style={{ color: active ? "white" : "rgba(255,255,255,0.3)" }}
                >
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className="w-8 h-[1px]"
                  style={{ background: past ? CYAN : BORDER }}
                />
              )}
            </div>
          );
        })}
      </div>

      {step === "connect" && (
        <div className="flex flex-col gap-5">
          <div
            className="border p-5 flex flex-col gap-3"
            style={{ background: "#0a0d10", borderColor: BORDER }}
          >
            <p className="font-syne font-bold text-[0.88rem] text-white">
              Sheet URL
            </p>
            <p
              className="text-[0.78rem]"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              Paste the URL from your Google Sheets browser tab. Make sure the
              sheet is set to "Anyone with link can view".
            </p>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/…"
              className="w-full text-white text-[0.82rem] px-4 py-3 outline-none transition-colors placeholder-[#3a3f47]"
              style={{
                background: "#0d1014",
                border: "1px solid",
                borderColor: url ? CYAN : BORDER,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = url ? CYAN : BORDER)
              }
            />
          </div>

          {/* OAuth alternative */}
          <div
            className="border p-4 flex items-center justify-between gap-4"
            style={{ background: "#0a0d10", borderColor: BORDER }}
          >
            <div>
              <p className="font-syne font-semibold text-[0.85rem] text-white">
                Sign in with Google
              </p>
              <p
                className="text-[0.72rem] mt-0.5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Browse all your spreadsheets
              </p>
            </div>
            <button
              className="px-4 py-2 font-syne font-bold text-[0.72rem] uppercase tracking-wider border hover:bg-[rgba(255,255,255,0.04)] transition-colors"
              style={{ borderColor: BORDER, color: "rgba(255,255,255,0.5)" }}
            >
              OAuth →
            </button>
          </div>

          <div className="flex justify-end">
            <CyanBtn
              label={connecting ? "Connecting…" : "Connect Sheet"}
              onClick={handleConnect}
            />
          </div>
        </div>
      )}

      {step === "pick" && (
        <div className="flex flex-col gap-5">
          <div
            className="border p-4 flex items-center gap-3"
            style={{ background: `${CYAN}08`, borderColor: `${CYAN}44` }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={CYAN}
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-[0.8rem] text-white">
              Connected successfully. Select a sheet to import.
            </p>
          </div>
          <p
            className="text-[0.78rem]"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            4 sheets found in your spreadsheet:
          </p>
          <div className="flex flex-col gap-2">
            {mockSheets.map((s) => (
              <button
                key={s}
                onClick={() => setSheet(s)}
                className="flex items-center justify-between px-5 py-4 border transition-all text-left"
                style={{
                  background: sheet === s ? `${CYAN}10` : "#0a0d10",
                  borderColor: sheet === s ? CYAN : BORDER,
                }}
              >
                <div className="flex items-center gap-3">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    style={{
                      color: sheet === s ? CYAN : "rgba(255,255,255,0.3)",
                    }}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="1" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                  <span className="font-syne font-medium text-[0.85rem] text-white">
                    {s}
                  </span>
                </div>
                {sheet === s && (
                  <span
                    className="text-[0.6rem] font-syne font-bold uppercase tracking-wider"
                    style={{ color: CYAN }}
                  >
                    Selected
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostBtn label="← Back" onClick={() => setStep("connect")} />
            <CyanBtn label="Import Sheet" onClick={() => setStep("done")} />
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <div
            className="w-16 h-16 border flex items-center justify-center"
            style={{ borderColor: CYAN, background: `${CYAN}12` }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke={CYAN}
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h3 className="font-syne font-extrabold text-[1.3rem] text-white mb-2">
              Sheet connected!
            </h3>
            <p
              className="text-[0.82rem]"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <strong style={{ color: "white" }}>{sheet}</strong> is now linked.
              Your graphs will update when the sheet changes.
            </p>
          </div>
          <div className="flex gap-3">
            <GhostBtn
              label="Back to Dashboard"
              onClick={() => setTab("dashboard")}
            />
            <CyanBtn
              label="Create Graph →"
              onClick={() => setTab("new-graph")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// IMPORT: EXCEL UPLOAD
// ══════════════════════════════════════════════════════════════
function ImportExcelPage({ setTab }: { setTab: (t: Tab) => void }) {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState(false);

  const mockRows = [
    ["Month", "Revenue", "Users", "Churn"],
    ["Jan 2024", "84200", "1240", "2.1%"],
    ["Feb 2024", "91500", "1380", "1.9%"],
    ["Mar 2024", "88300", "1310", "2.3%"],
    ["Apr 2024", "96800", "1520", "1.7%"],
    ["May 2024", "103200", "1680", "1.5%"],
  ];

  function handleFile(f: File) {
    setFile(f);
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      setPreview(true);
    }, 1400);
  }

  return (
    <div className="max-w-[700px]">
      <BackBtn onClick={() => setTab("dashboard")} />
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 border flex items-center justify-center"
          style={{ borderColor: `${CYAN}55`, color: CYAN }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
        </div>
        <div>
          <h2 className="font-syne font-extrabold text-[1.3rem] text-white">
            Upload Excel Sheet
          </h2>
          <p
            className="text-[0.78rem]"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Supports .xlsx, .xls and .csv files up to 50MB
          </p>
        </div>
      </div>

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed p-16 flex flex-col items-center gap-5 text-center transition-all duration-200 cursor-pointer"
          style={{
            borderColor: drag ? CYAN : BORDER,
            background: drag ? `${CYAN}08` : "transparent",
          }}
          onClick={() => document.getElementById("xlsx-input")?.click()}
        >
          <input
            id="xlsx-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
          <div
            className="w-16 h-16 border flex items-center justify-center transition-colors"
            style={{
              borderColor: drag ? CYAN : BORDER,
              color: drag ? CYAN : "rgba(255,255,255,0.25)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>
          <div>
            <p className="font-syne font-bold text-[1rem] text-white mb-1">
              Drop your file here
            </p>
            <p
              className="text-[0.8rem]"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              or click to browse your computer
            </p>
          </div>
          <div className="flex gap-3 text-[0.68rem] font-syne font-bold uppercase tracking-wider">
            {[".xlsx", ".xls", ".csv"].map((ext) => (
              <span
                key={ext}
                className="px-2 py-1 border"
                style={{ borderColor: BORDER, color: "rgba(255,255,255,0.3)" }}
              >
                {ext}
              </span>
            ))}
          </div>
        </div>
      ) : parsing ? (
        <div
          className="border p-12 flex flex-col items-center gap-4"
          style={{ background: "#0a0d10", borderColor: BORDER }}
        >
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${CYAN}33`, borderTopColor: CYAN }}
          />
          <p className="font-syne font-bold text-white">Parsing {file.name}…</p>
          <p
            className="text-[0.78rem]"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Detecting columns and data types
          </p>
        </div>
      ) : preview ? (
        <div className="flex flex-col gap-5">
          <div
            className="border p-3 flex items-center gap-3"
            style={{ background: `${CYAN}08`, borderColor: `${CYAN}44` }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={CYAN}
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-[0.8rem] text-white flex-1">
              <strong>{file.name}</strong> — {mockRows.length - 1} rows,{" "}
              {mockRows[0].length} columns detected
            </p>
            <button
              onClick={() => {
                setFile(null);
                setParsing(false);
                setPreview(false);
              }}
              className="text-[0.68rem] font-syne font-semibold hover:opacity-70 transition-opacity"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Change file
            </button>
          </div>

          <div>
            <p className="font-syne font-bold text-[0.85rem] text-white mb-3">
              Data Preview
            </p>
            <div
              className="overflow-x-auto border"
              style={{ borderColor: BORDER }}
            >
              <table className="w-full text-[0.78rem]">
                <thead>
                  <tr style={{ background: "#0a0d10" }}>
                    {mockRows[0].map((h, i) => (
                      <th
                        key={i}
                        className="text-left px-4 py-3 font-syne font-bold border-b border-r last:border-r-0"
                        style={{ borderColor: BORDER, color: CYAN }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockRows.slice(1).map((row, ri) => (
                    <tr
                      key={ri}
                      className="border-b hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      style={{ borderColor: BORDER }}
                    >
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-4 py-3 border-r last:border-r-0"
                          style={{
                            borderColor: BORDER,
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[0.78rem] font-syne font-semibold text-white">
              Map columns to chart axes:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["X Axis (Category)", "Month"],
                ["Y Axis (Values)", "Revenue"],
              ].map(([label, val]) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label
                    className="text-[0.62rem] uppercase tracking-[0.1em]"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {label}
                  </label>
                  <select
                    defaultValue={val}
                    className="text-white text-[0.85rem] px-4 py-2.5 outline-none appearance-none"
                    style={{
                      background: "#0d1014",
                      border: "1px solid",
                      borderColor: BORDER,
                    }}
                  >
                    {mockRows[0].map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <GhostBtn
              label="Start Over"
              onClick={() => {
                setFile(null);
                setParsing(false);
                setPreview(false);
              }}
            />
            <CyanBtn
              label="Create Graph →"
              onClick={() => setTab("new-graph")}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// IMPORT: PASTE DATA
// ══════════════════════════════════════════════════════════════
function ImportPastePage({ setTab }: { setTab: (t: Tab) => void }) {
  const [raw, setRaw] = useState("");
  const [format, setFormat] = useState<"csv" | "json" | "tsv">("csv");
  const [parsed, setParsed] = useState(false);

  const placeholders: Record<string, string> = {
    csv: `Month,Revenue,Users\nJan,84200,1240\nFeb,91500,1380\nMar,88300,1310`,
    json: `[\n  {"Month":"Jan","Revenue":84200,"Users":1240},\n  {"Month":"Feb","Revenue":91500,"Users":1380}\n]`,
    tsv: `Month\tRevenue\tUsers\nJan\t84200\t1240\nFeb\t91500\t1380`,
  };

  const mockPreview = [
    ["Month", "Revenue", "Users"],
    ["Jan", "84200", "1240"],
    ["Feb", "91500", "1380"],
    ["Mar", "88300", "1310"],
  ];

  return (
    <div className="max-w-[700px]">
      <BackBtn onClick={() => setTab("dashboard")} />
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 border flex items-center justify-center"
          style={{ borderColor: `${CYAN}55`, color: CYAN }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
        </div>
        <div>
          <h2 className="font-syne font-extrabold text-[1.3rem] text-white">
            Paste Data
          </h2>
          <p
            className="text-[0.78rem]"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Paste CSV, JSON or tab-separated data directly
          </p>
        </div>
      </div>

      {!parsed ? (
        <div className="flex flex-col gap-5">
          {/* Format selector */}
          <div className="flex gap-1">
            {(["csv", "json", "tsv"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className="px-4 py-1.5 text-[0.7rem] font-syne font-bold uppercase tracking-wider border transition-all"
                style={{
                  background: format === f ? CYAN : "transparent",
                  color: format === f ? "#090b0e" : "rgba(255,255,255,0.35)",
                  borderColor: format === f ? CYAN : BORDER,
                }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={placeholders[format]}
              rows={10}
              className="w-full text-white text-[0.82rem] px-4 py-4 outline-none resize-y font-mono placeholder-[#2a2f38] leading-relaxed"
              style={{
                background: "#0a0d10",
                border: "1px solid",
                borderColor: raw ? `${CYAN}66` : BORDER,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = `${CYAN}66`)}
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = raw ? `${CYAN}66` : BORDER)
              }
            />
            {raw && (
              <button
                onClick={() => setRaw("")}
                className="absolute top-3 right-3 text-[0.65rem] font-syne font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p
              className="text-[0.72rem]"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {raw.split("\n").filter(Boolean).length} line
              {raw.split("\n").filter(Boolean).length !== 1 ? "s" : ""} detected
            </p>
            <CyanBtn
              label="Parse Data →"
              onClick={() => raw.trim() && setParsed(true)}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div
            className="border p-3 flex items-center gap-3"
            style={{ background: `${CYAN}08`, borderColor: `${CYAN}44` }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={CYAN}
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-[0.8rem] text-white">
              Parsed successfully — {mockPreview.length - 1} rows detected
            </p>
            <button
              onClick={() => setParsed(false)}
              className="ml-auto text-[0.68rem] font-syne font-semibold hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Edit
            </button>
          </div>

          <div>
            <p className="font-syne font-bold text-[0.85rem] text-white mb-3">
              Preview
            </p>
            <div
              className="overflow-x-auto border"
              style={{ borderColor: BORDER }}
            >
              <table className="w-full text-[0.78rem]">
                <thead>
                  <tr style={{ background: "#0a0d10" }}>
                    {mockPreview[0].map((h, i) => (
                      <th
                        key={i}
                        className="text-left px-4 py-3 font-syne font-bold border-b border-r last:border-r-0"
                        style={{ borderColor: BORDER, color: CYAN }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockPreview.slice(1).map((row, ri) => (
                    <tr
                      key={ri}
                      className="border-b hover:bg-[rgba(255,255,255,0.02)]"
                      style={{ borderColor: BORDER }}
                    >
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-4 py-3 border-r last:border-r-0"
                          style={{
                            borderColor: BORDER,
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <GhostBtn label="← Edit Data" onClick={() => setParsed(false)} />
            <CyanBtn
              label="Create Graph →"
              onClick={() => setTab("new-graph")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TEMPLATES TAB
// ══════════════════════════════════════════════════════════════
function TemplatesTab({ setTab }: { setTab: (t: Tab) => void }) {
  return (
    <div className="flex flex-col gap-6 max-w-[900px]">
      <PageHeader
        title="Templates"
        sub="Start faster with pre-built chart collections"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TEMPLATES.map((t, i) => (
          <div
            key={t.title}
            className="border p-6 flex flex-col gap-3 cursor-pointer transition-all"
            style={{
              background: "#0a0d10",
              borderColor: BORDER,
              animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${CYAN}55`;
              e.currentTarget.style.background = `${CYAN}05`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = BORDER;
              e.currentTarget.style.background = "#0a0d10";
            }}
          >
            <div className="flex items-start justify-between">
              <span className="font-syne font-extrabold text-[1.1rem] text-white">
                {t.title}
              </span>
              <span
                className="text-[0.58rem] border px-2 py-0.5 uppercase tracking-wider font-syne font-bold"
                style={{
                  color: CYAN,
                  borderColor: `${CYAN}44`,
                  background: `${CYAN}10`,
                }}
              >
                {t.tag}
              </span>
            </div>
            <p
              className="text-[0.78rem]"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              {t.desc}
            </p>
            <p
              className="text-[0.7rem]"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              {t.count} pre-built charts
            </p>
            <button
              className="self-start text-[0.7rem] font-syne font-bold uppercase tracking-widest px-4 py-2 border transition-all hover:bg-[rgba(8,145,178,0.1)]"
              style={{ borderColor: CYAN, color: CYAN }}
              onClick={() => setTab("new-graph")}
            >
              Use Template →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SETTINGS TAB
// ══════════════════════════════════════════════════════════════
function SettingsTab() {
  const [name, setName] = useState(USER.name);
  const [email, setEmail] = useState(USER.email);
  const inputCls =
    "w-full text-white text-[0.88rem] px-4 py-3 outline-none transition-colors";

  return (
    <div className="flex flex-col gap-6 max-w-[540px]">
      <PageHeader title="Settings" sub="Manage your account preferences" />

      <div
        className="border"
        style={{ background: "#0a0d10", borderColor: BORDER }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: BORDER }}>
          <h3 className="font-syne font-bold text-[0.9rem] text-white">
            Profile
          </h3>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {[
            { label: "Full Name", v: name, set: setName },
            { label: "Email", v: email, set: setEmail },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label
                className="text-[0.66rem] uppercase tracking-[0.1em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {f.label}
              </label>
              <input
                value={f.v}
                onChange={(e) => f.set(e.target.value)}
                className={inputCls}
                style={{
                  background: "#0d1014",
                  border: "1px solid",
                  borderColor: BORDER,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
                onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
              />
            </div>
          ))}
          <CyanBtn label="Save Changes" sm onClick={() => {}} />
        </div>
      </div>

      <div
        className="border p-5 flex flex-col gap-3"
        style={{ background: "#0a0d10", borderColor: "rgba(255,80,80,0.2)" }}
      >
        <p className="font-syne font-bold text-[0.9rem] text-red-400">
          Danger Zone
        </p>
        <DiagDivider />
        <button className="self-start px-5 py-2.5 font-syne font-bold text-[0.75rem] uppercase tracking-widest border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// BILLING TAB
// ══════════════════════════════════════════════════════════════
function BillingTab() {
  return (
    <div className="flex flex-col gap-5 max-w-[620px]">
      <PageHeader title="Billing" sub="Manage your plan and payment" />

      <div
        className="border p-6 flex items-start justify-between gap-4"
        style={{ background: "#0a0d10", borderColor: `${CYAN}55` }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-syne font-extrabold text-[1rem] text-white">
              Pro Plan
            </span>
            <span
              className="text-[0.58rem] px-2 py-0.5 font-syne font-bold uppercase tracking-wider"
              style={{ background: CYAN, color: "#090b0e" }}
            >
              Active
            </span>
          </div>
          <p
            className="text-[0.78rem]"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            $29 / month · Renews Feb 1, 2026
          </p>
          <div
            className="flex gap-4 mt-3 text-[0.73rem]"
            style={{ color: CYAN }}
          >
            <span>✓ Unlimited graphs</span>
            <span>✓ 10GB storage</span>
            <span>✓ Priority support</span>
          </div>
        </div>
        <GhostBtn label="Manage" />
      </div>

      <div
        className="border p-5"
        style={{ background: "#0a0d10", borderColor: BORDER }}
      >
        <div className="flex justify-between text-[0.75rem] mb-3">
          <span style={{ color: "rgba(255,255,255,0.38)" }}>Storage</span>
          <span className="text-white font-syne font-bold">2.1 / 10 GB</span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: BORDER }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: "21%", background: CYAN }}
          />
        </div>
      </div>

      <div
        className="border"
        style={{ background: "#0a0d10", borderColor: BORDER }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: BORDER }}>
          <h3 className="font-syne font-bold text-[0.9rem] text-white">
            Invoice History
          </h3>
        </div>
        {[
          ["Jan 2026", "$29.00", "Paid"],
          ["Dec 2025", "$29.00", "Paid"],
          ["Nov 2025", "$29.00", "Paid"],
        ].map(([date, amt, status]) => (
          <div
            key={date}
            className="flex items-center px-5 py-3 border-b last:border-b-0 hover:bg-[rgba(255,255,255,0.015)] transition-colors"
            style={{ borderColor: BORDER }}
          >
            <span className="flex-1 text-[0.82rem] text-white font-syne font-medium">
              {date}
            </span>
            <span
              className="text-[0.82rem] mr-8"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {amt}
            </span>
            <span
              className="text-[0.65rem] font-syne font-bold uppercase tracking-wider px-2 py-0.5"
              style={{
                color: CYAN,
                background: `${CYAN}15`,
                border: `1px solid ${CYAN}44`,
              }}
            >
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// HELP TAB
// ══════════════════════════════════════════════════════════════
function HelpTab() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    {
      q: "How do I share a graph?",
      a: "Open any graph and click the Share button. You'll get a public link instantly. You can also set expiry dates or password-protect links from the share settings.",
    },
    {
      q: "Can I import from Google Sheets?",
      a: "Yes — go to the Dashboard and click Connect Google Sheets, or use the Import section. It takes about 30 seconds to authenticate and link a spreadsheet.",
    },
    {
      q: "How do I change my plan?",
      a: "Go to Billing in the sidebar. You can upgrade, downgrade, or cancel your subscription at any time. Downgrades take effect at the end of your billing cycle.",
    },
    {
      q: "Is my data encrypted?",
      a: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never sell your data or use it to train any models. You can export or delete everything at any time.",
    },
    {
      q: "What file formats can I import?",
      a: "We support .xlsx, .xls, .csv, JSON arrays, and tab-separated values. We also support live connections to Google Sheets and Airtable.",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[620px]">
      <PageHeader
        title="Help & Support"
        sub="Answers and a real human if you need one"
      />
      <div className="flex flex-col gap-1">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="border overflow-hidden"
            style={{ background: "#0a0d10", borderColor: BORDER }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[rgba(255,255,255,0.015)] transition-colors"
            >
              <span className="font-syne font-semibold text-[0.85rem] text-white">
                {f.q}
              </span>
              <span
                className="text-[1rem] font-light transition-transform duration-200 flex-shrink-0"
                style={{
                  color: CYAN,
                  transform: open === i ? "rotate(45deg)" : "none",
                  display: "inline-block",
                }}
              >
                +
              </span>
            </button>
            {open === i && (
              <div
                className="px-5 pb-4 pt-3 text-[0.8rem] leading-relaxed border-t"
                style={{ color: "rgba(255,255,255,0.45)", borderColor: BORDER }}
              >
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        className="border p-6 flex items-center gap-5"
        style={{ background: "#0a0d10", borderColor: BORDER }}
      >
        <div className="flex-1">
          <p className="font-syne font-bold text-white mb-1">Still stuck?</p>
          <p
            className="text-[0.78rem]"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Our team replies within 24 hours on business days.
          </p>
        </div>
        <CyanBtn label="Contact Us" sm />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ROOT PAGE
// ══════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sideOpen, setSide] = useState(true);

  return (
    <div
      className="min-h-screen bg-black text-white flex overflow-hidden"
      style={{
        animation: "fadeUp 0.5s ease both",
      }}
    >
      <Sidebar
        open={sideOpen}
        tab={tab}
        onTab={setTab}
        userName={USER.name}
        userAvatar={USER.avatar}
        userPlan={USER.plan}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar */}
        <header
          className="flex-shrink-0 flex items-center gap-4 px-6 py-3.5 border-b backdrop-blur-sm sticky top-0 z-10 bg-cyan-600"
          style={{ borderColor: BORDER }}
        >
          <button
            onClick={() => setSide((s) => !s)}
            className="flex flex-col gap-[5px] p-1.5 opacity-30 hover:opacity-90 transition-opacity"
          >
            <span className="w-4 h-[1.5px] bg-white block" />
            <span className="w-4 h-[1.5px] bg-white block" />
            <span className="w-3 h-[1.5px] bg-white block" />
          </button>
          <div className="flex items-center gap-2 text-[0.76rem]">
            <span style={{ color: "rgba(255,255,255,0.22)" }}>Graphix</span>
            <span style={{ color: "rgba(255,255,255,0.18)" }}>/</span>
            <span className="text-white font-syne font-semibold">
              {PAGE_TITLE[tab]}
            </span>
          </div>
          <div className="flex-1" />

          {/* <div className="w-1/2 h-6 bg-[repeating-linear-gradient(-45deg,black_0px,white_5px,transparent_5px,transparent_10px)]"></div> */}
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center font-syne font-bold text-[0.68rem] cursor-pointer"
            style={{ background: `${CYAN}22`, color: CYAN }}
          >
            {USER.avatar}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-8 bg-[#111212]">
          {tab === "dashboard" && <DashboardHome setTab={setTab} />}
          {tab === "graphs" && (
            <GraphGrid graphs={GRAPHS} emptyMsg="No graphs yet" />
          )}
          {tab === "shared" && (
            <GraphGrid
              graphs={GRAPHS.slice(0, 3)}
              emptyMsg="Nothing shared with you yet"
            />
          )}
          {tab === "favourites" && (
            <GraphGrid
              graphs={GRAPHS.filter((g) => g.starred)}
              emptyMsg="Star graphs to save them here"
            />
          )}
          {tab === "templates" && <TemplatesTab setTab={setTab} />}
          {tab === "settings" && <SettingsTab />}
          {tab === "billing" && <BillingTab />}
          {tab === "help" && <HelpTab />}
          {tab === "new-graph" && <NewGraphPage setTab={setTab} />}
          {tab === "import-google" && <ImportGooglePage setTab={setTab} />}
          {tab === "import-excel" && <ImportExcelPage setTab={setTab} />}
          {tab === "import-paste" && <ImportPastePage setTab={setTab} />}
        </main>
      </div>
    </div>
  );
}
