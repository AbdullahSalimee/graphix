// components/ChartToolbar.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface PlotlyHTMLElement extends HTMLDivElement {
  data?: any[];
  layout?: any;
}

const PALETTES = [
  {
    id: "ocean",
    label: "Ocean",
    colors: ["#38bdf8", "#818cf8", "#34d399", "#f472b6", "#fb923c", "#a78bfa"],
  },
  {
    id: "fire",
    label: "Fire",
    colors: ["#f97316", "#ef4444", "#eab308", "#f43f5e", "#fb923c", "#fbbf24"],
  },
  {
    id: "forest",
    label: "Forest",
    colors: ["#4ade80", "#86efac", "#6ee7b7", "#a3e635", "#34d399", "#bef264"],
  },
  {
    id: "galaxy",
    label: "Galaxy",
    colors: ["#a78bfa", "#c084fc", "#818cf8", "#e879f9", "#7dd3fc", "#f0abfc"],
  },
  {
    id: "mono",
    label: "Mono",
    colors: ["#f8fafc", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155"],
  },
  {
    id: "neon",
    label: "Neon",
    colors: ["#00ff88", "#00e5ff", "#ff00c8", "#ffe600", "#ff4400", "#8800ff"],
  },
] as const;

const CONVERT_TYPES = [
  { id: "bar", label: "Bar", icon: "▐" },
  { id: "line", label: "Line", icon: "〜" },
  { id: "pie", label: "Pie", icon: "◉" },
  { id: "scatter", label: "Scatter", icon: "⁙" },
  { id: "area", label: "Area", icon: "△" },
  { id: "histogram", label: "Histogram", icon: "⬛" },
] as const;

const EXPORT_FORMATS = ["PNG", "SVG", "JPEG"] as const;

type Palette = (typeof PALETTES)[number];
type ConvertType = (typeof CONVERT_TYPES)[number];

interface ChartToolbarProps {
  divRef: React.RefObject<PlotlyHTMLElement | null>;
  message: any;
}

function PortalPopup({
  anchorRef,
  open,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.top - 8, left: r.left + r.width / 2 });
  }, [open, anchorRef]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed z-[99999] min-w-[200px] pointer-events-auto bg-[#080e1c]/98 border border-sky-500/22 rounded-xl p-2.5 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(56,189,248,0.05)]"
      style={{
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

function Tip({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setPos({ top: r.top - 6, left: r.left + r.width / 2 });
      }}
      onMouseLeave={() => setPos(null)}
    >
      {children}
      {pos &&
        createPortal(
          <div
            className="fixed pointer-events-none z-[99999] px-2.5 py-1 text-xs rounded bg-[#080e1a]/97 border border-sky-500/18 text-slate-400 whitespace-nowrap tracking-wide"
            style={{
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {label}
          </div>,
          document.body,
        )}
    </div>
  );
}

function Divider() {
  return <div className="w-px h-[22px] bg-white/7 flex-shrink-0 mx-0.5" />;
}

function PopLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-slate-600 text-[0.65rem] tracking-wider uppercase mb-2 px-0.5">
      {children}
    </div>
  );
}

export default function ChartToolbar({ divRef, message }: ChartToolbarProps) {
  const [activePalette, setActivePalette] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [gridOn, setGridOn] = useState(true);
  const [legendOn, setLegendOn] = useState(true);
  const [bgDark, setBgDark] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [activeConvert, setActiveConvert] = useState<string | null>(null);
  const [labelOn, setLabelOn] = useState(false);

  const convertBtnRef = useRef<HTMLDivElement>(null);
  const paletteBtnRef = useRef<HTMLDivElement>(null);
  const exportBtnRef = useRef<HTMLDivElement>(null);

  const closeAll = useCallback(() => {
    setShowPalette(false);
    setShowExport(false);
    setShowConvert(false);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const inside = [convertBtnRef, paletteBtnRef, exportBtnRef].some(
        (r) => r.current && r.current.contains(e.target as Node),
      );
      if (!inside) closeAll();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [closeAll]);

  // ── Chart mutations ──────────────────────────────────────────────────────
  const applyPalette = (palette: Palette) => {
    if (!divRef.current || !("Plotly" in window)) return;
    setActivePalette(palette.id);
    setShowPalette(false);
    (divRef.current.data ?? []).forEach((trace: any, i: number) => {
      const c = palette.colors[i % palette.colors.length];
      const update: any =
        trace.type === "pie"
          ? { "marker.colors": [[...palette.colors]] }
          : { "marker.color": [c], "line.color": [c] };
      window.Plotly.restyle(divRef.current!, update, [i]);
    });
  };

  const toggleGrid = () => {
    if (!divRef.current || !("Plotly" in window)) return;
    const n = !gridOn;
    setGridOn(n);
    window.Plotly.relayout(divRef.current, {
      "xaxis.showgrid": n,
      "yaxis.showgrid": n,
      "xaxis.zeroline": n,
      "yaxis.zeroline": n,
    } as any);
  };

  const toggleLegend = () => {
    if (!divRef.current || !("Plotly" in window)) return;
    const n = !legendOn;
    setLegendOn(n);
    window.Plotly.relayout(divRef.current, { showlegend: n } as any);
  };

  const toggleBg = () => {
    if (!divRef.current || !("Plotly" in window)) return;
    const n = !bgDark;
    setBgDark(n);
    window.Plotly.relayout(divRef.current, {
      paper_bgcolor: n ? "rgba(0,0,0,0)" : "rgba(255,255,255,0.04)",
      plot_bgcolor: n ? "rgba(0,0,0,0)" : "rgba(255,255,255,0.03)",
    } as any);
  };

  const toggleLabels = () => {
    if (!divRef.current || !("Plotly" in window)) return;
    const n = !labelOn;
    setLabelOn(n);
    (divRef.current.data ?? []).forEach((_: any, i: number) => {
      const update: any = {
        textposition: [n ? "outside" : "none"],
        textinfo: [n ? "label+percent" : "label"],
      };
      window.Plotly.restyle(divRef.current!, update, [i]);
    });
  };

  const convertChart = (type: ConvertType) => {
    if (!divRef.current || !("Plotly" in window)) return;
    setActiveConvert(type.id);
    setShowConvert(false);
    const typeMap: Record<string, string> = {
      bar: "bar",
      line: "scatter",
      scatter: "scatter",
      pie: "pie",
      area: "scatter",
      histogram: "histogram",
    };
    const modeMap: Record<string, string> = {
      line: "lines",
      scatter: "markers",
      area: "lines",
    };
    (divRef.current.data ?? []).forEach((_: any, i: number) => {
      const u: any = { type: [typeMap[type.id]] };
      if (modeMap[type.id]) u.mode = [modeMap[type.id]];
      if (type.id === "area") u.fill = ["tozeroy"];
      window.Plotly.restyle(divRef.current!, u, [i]);
    });
  };

  const download = async (fmt: (typeof EXPORT_FORMATS)[number]) => {
    if (!divRef.current || !("Plotly" in window)) return;
    setDownloading(true);
    setShowExport(false);
    try {
      const title = message.content?.layout?.title?.text || "chart";
      await window.Plotly.downloadImage(divRef.current, {
        format: fmt.toLowerCase() as any,
        width: 1400,
        height: 800,
        filename: title.replace(/[^a-z0-9]/gi, "_").toLowerCase(),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const resetZoom = () => {
    if (!divRef.current || !("Plotly" in window)) return;
    window.Plotly.relayout(divRef.current, {
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    } as any);
  };

  const currentPalette = activePalette
    ? (PALETTES.find((p) => p.id === activePalette) ?? PALETTES[0])
    : PALETTES[0];

  return (
    <div className="w-full bg-gradient-to-r from-[#080e1a]/97 to-[#0a1220]/97 border-t border-sky-500/8 rounded-b-xl px-3 py-2 flex items-center gap-1.5 overflow-x-auto overflow-y-visible scrollbar-hide">
      {/* Convert */}
      <div ref={convertBtnRef} className="flex-shrink-0">
        <Tip label="Convert chart type">
          <button
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${showConvert ? "bg-sky-500/13 border border-sky-500/35 text-sky-400" : "bg-white/3 border border-white/7 text-slate-500 hover:text-slate-300"}`}
            onClick={() => {
              closeAll();
              setShowConvert((v) => !v);
            }}
          >
            <span className="text-base">⇄</span>
            <span>Convert</span>
            {activeConvert && (
              <span className="text-sky-400 text-[0.65rem] opacity-80">
                •{activeConvert}
              </span>
            )}
          </button>
        </Tip>
        <PortalPopup anchorRef={convertBtnRef} open={showConvert}>
          <PopLabel>Switch Chart Type</PopLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {CONVERT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => convertChart(type)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 text-xs rounded-lg transition-all duration-150 ${activeConvert === type.id ? "bg-sky-500/13 border border-sky-500/35 text-sky-400" : "bg-white/3 border border-white/7 text-slate-400 hover:bg-white/6"}`}
              >
                <span className="text-lg">{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </PortalPopup>
      </div>

      <Divider />

      {/* Colors */}
      <div ref={paletteBtnRef} className="flex-shrink-0">
        <Tip label="Change color palette">
          <button
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${showPalette ? "bg-sky-500/13 border border-sky-500/35 text-sky-400" : "bg-white/3 border border-white/7 text-slate-500 hover:text-slate-300"}`}
            onClick={() => {
              closeAll();
              setShowPalette((v) => !v);
            }}
          >
            <span className="flex gap-0.5 items-center">
              {currentPalette.colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: c }}
                />
              ))}
            </span>
            <span>Colors</span>
          </button>
        </Tip>
        <PortalPopup anchorRef={paletteBtnRef} open={showPalette}>
          <PopLabel>Color Palette</PopLabel>
          <div className="flex flex-col gap-1.5">
            {PALETTES.map((palette) => (
              <button
                key={palette.id}
                onClick={() => applyPalette(palette)}
                className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg transition-all duration-150 ${activePalette === palette.id ? "bg-sky-500/10 border border-sky-500/30" : "bg-white/2 border border-white/6 hover:bg-white/5"}`}
              >
                <div className="flex gap-0.5">
                  {palette.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-3.5 h-3.5 rounded border border-white/5"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span
                  className={`text-xs ${activePalette === palette.id ? "text-sky-400" : "text-slate-500"}`}
                >
                  {palette.label}
                </span>
                {activePalette === palette.id && (
                  <span className="ml-auto text-sky-400 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </PortalPopup>
      </div>

      <Divider />

      {/* Grid */}
      <Tip label={gridOn ? "Hide grid" : "Show grid"}>
        <button
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${gridOn ? "bg-sky-500/13 border border-sky-500/35 text-sky-400" : "bg-white/3 border border-white/7 text-slate-500 hover:text-slate-300"}`}
          onClick={toggleGrid}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span>Grid</span>
        </button>
      </Tip>

      {/* Legend */}
      <Tip label={legendOn ? "Hide legend" : "Show legend"}>
        <button
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${legendOn ? "bg-sky-500/13 border border-sky-500/35 text-sky-400" : "bg-white/3 border border-white/7 text-slate-500 hover:text-slate-300"}`}
          onClick={toggleLegend}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="9" y2="6" />
            <circle cx="6" cy="6" r="2" fill="currentColor" />
            <line x1="3" y1="12" x2="9" y2="12" />
            <circle cx="6" cy="12" r="2" fill="currentColor" />
            <line x1="3" y1="18" x2="9" y2="18" />
            <circle cx="6" cy="18" r="2" fill="currentColor" />
            <line x1="12" y1="6" x2="21" y2="6" />
            <line x1="12" y1="12" x2="21" y2="12" />
            <line x1="12" y1="18" x2="21" y2="18" />
          </svg>
          <span>Legend</span>
        </button>
      </Tip>

      {/* Labels */}
      <Tip label={labelOn ? "Hide data labels" : "Show data labels"}>
        <button
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${labelOn ? "bg-sky-500/13 border border-sky-500/35 text-sky-400" : "bg-white/3 border border-white/7 text-slate-500 hover:text-slate-300"}`}
          onClick={toggleLabels}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <span>Labels</span>
        </button>
      </Tip>

      {/* Background */}
      <Tip label={bgDark ? "Light background" : "Dark background"}>
        <button
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${!bgDark ? "bg-sky-500/13 border border-sky-500/35 text-sky-400" : "bg-white/3 border border-white/7 text-slate-500 hover:text-slate-300"}`}
          onClick={toggleBg}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <span>{bgDark ? "Light" : "Dark"}</span>
        </button>
      </Tip>

      <Divider />

      {/* Reset */}
      <Tip label="Reset zoom & pan">
        <button
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap bg-white/3 border border-white/7 text-slate-500 hover:text-slate-300"
          onClick={resetZoom}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>Reset</span>
        </button>
      </Tip>

      <Divider />

      {/* Export */}
      <div ref={exportBtnRef} className="flex-shrink-0">
        <Tip label="Export chart">
          <button
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap disabled:opacity-60 ${showExport ? "bg-sky-500/13 border border-sky-500/35 text-sky-400" : "bg-white/3 border border-white/7 text-slate-500 hover:text-slate-300"}`}
            onClick={() => {
              closeAll();
              setShowExport((v) => !v);
            }}
            disabled={downloading}
          >
            {downloading ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            <span>{downloading ? "Exporting…" : "Export"}</span>
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </Tip>
        <PortalPopup anchorRef={exportBtnRef} open={showExport}>
          <PopLabel>Export As</PopLabel>
          <div className="flex flex-col gap-1">
            {EXPORT_FORMATS.map((fmt) => (
              <button
                key={fmt}
                onClick={() => download(fmt)}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 justify-start bg-white/3 border border-white/7 text-slate-400 hover:bg-white/6"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {fmt}
              </button>
            ))}
          </div>
        </PortalPopup>
      </div>

      
    </div>
  );
}
