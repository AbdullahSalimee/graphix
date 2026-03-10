"use client";

import { useEffect, useRef, useState } from "react";
import ChartToolbar from "./ChartToolbar";
import ChartEditor from "./ChartEditor";

const isMobile = () => typeof window !== "undefined" && window.innerWidth < 640;

// ─── Colour palette (stable per trace index, not randomised on every render) ──
const PALETTE = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#8b5cf6",
  "#14b8a6",
  "#84cc16",
  "#fb923c",
  "#a855f7",
  "#22d3ee",
  "#e11d48",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#0284c7",
];

function stableColor(i: number) {
  return PALETTE[i % PALETTE.length];
}

// ─── Detect chart type from Plotly trace ─────────────────────────────────────
function detectType(traces: any[]): string {
  if (!traces?.length) return "bar";
  const t = traces[0];
  const type = (t.type || "").toLowerCase();
  const mode = (t.mode || "").toLowerCase();
  if (type === "heatmap") return "heatmap";
  if (type === "waterfall") return "waterfall";
  if (type === "scatterpolar" || type === "barpolar") return "radar";
  if (type === "pie") return t.hole ? "donut" : "pie";
  if (type === "scatter3d") return "scatter3d";
  if (type === "surface") return "surface";
  if (type === "funnel") return "funnel";
  if (type === "bar") return "bar";
  if (type === "scatter") {
    if (
      mode.includes("lines") &&
      (t.fill === "tonexty" || t.fill === "tozeroy")
    )
      return "area";
    if (mode.includes("lines")) return "line";
    return "scatter";
  }
  if (type === "histogram") return "histogram";
  if (type === "box") return "box";
  if (type === "violin") return "violin";
  return type || "bar";
}

// ─── Pre-process traces before handing to Plotly ─────────────────────────────
function preprocessTraces(
  data: any[],
  layout: any,
): { data: any[]; layout: any } {
  if (!data?.length) return { data, layout };

  const chartType = detectType(data);
  const mobile = isMobile();

  // ── Scatter: if AI mistakenly put x=id-like column, try to fix ──────────────
  if (chartType === "scatter") {
    return {
      data: data.map((trace, i) => {
        const clr = stableColor(i);
        return {
          ...trace,
          type: "scatter",
          mode: trace.mode || "markers",
          marker: {
            ...(trace.marker || {}),
            color: trace.marker?.color || clr,
            size: mobile ? 6 : trace.marker?.size || 9,
            opacity: 0.82,
            line: { color: "white", width: 1 },
          },
          line: { color: clr, width: 2 },
        };
      }),
      layout,
    };
  }

  // ── Heatmap: ensure z is a 2D array ─────────────────────────────────────────
  if (chartType === "heatmap") {
    const trace = data[0];
    // If AI returned flat arrays, keep as-is; Plotly handles it
    return {
      data: [
        {
          ...trace,
          type: "heatmap",
          colorscale: trace.colorscale || "Viridis",
          showscale: true,
          hoverongaps: false,
        },
      ],
      layout: {
        ...layout,
        xaxis: { ...(layout.xaxis || {}), side: "bottom" },
      },
    };
  }

  // ── Waterfall: fix measure array if missing ──────────────────────────────────
  if (chartType === "waterfall") {
    const trace = data[0];
    const yVals: number[] = trace.y || trace.values || [];
    // Auto-generate measure array if absent
    const measure =
      trace.measure ||
      yVals.map((_: any, idx: number) => {
        if (idx === 0) return "absolute";
        if (idx === yVals.length - 1) return "total";
        return "relative";
      });
    return {
      data: [
        {
          ...trace,
          type: "waterfall",
          measure,
          connector: {
            line: { color: "rgba(0,0,0,0.15)", width: 1, dash: "dot" },
          },
          increasing: { marker: { color: "#10b981" } },
          decreasing: { marker: { color: "#ef4444" } },
          totals: { marker: { color: "#6366f1" } },
          textposition: "outside",
          text: trace.text || undefined,
        },
      ],
      layout,
    };
  }

  // ── Radar / Scatterpolar ─────────────────────────────────────────────────────
  if (chartType === "radar") {
    return {
      data: data.map((trace, i) => ({
        ...trace,
        type: "scatterpolar",
        fill: trace.fill || "toself",
        marker: { color: stableColor(i), size: 5 },
        line: { color: stableColor(i), width: 2 },
      })),
      layout: {
        ...layout,
        polar: {
          ...(layout.polar || {}),
          radialaxis: {
            visible: true,
            range: [0, 100],
            ...(layout.polar?.radialaxis || {}),
          },
          angularaxis: { ...(layout.polar?.angularaxis || {}) },
        },
      },
    };
  }

  // ── Default: colour each trace consistently ──────────────────────────────────
  return {
    data: data.map((trace, i) => {
      const clr = stableColor(i);
      const isPie = trace.type === "pie" || trace.type === "donut";
      return {
        ...trace,
        marker: {
          ...(trace.marker || {}),
          color: isPie ? PALETTE : trace.marker?.color || clr,
          size: mobile
            ? Math.min(trace.marker?.size || 6, 5)
            : trace.marker?.size || 7,
          line: { color: "white", width: isPie ? 2 : 1 },
        },
        line: {
          ...(trace.line || {}),
          color: trace.line?.color || clr,
          width: mobile ? 1.5 : trace.line?.width || 2.5,
        },
        fillcolor: trace.fill ? (trace.line?.color || clr) + "22" : undefined,
      };
    }),
    layout,
  };
}

// ─── Build Plotly layout ──────────────────────────────────────────────────────
function buildLayout(baseLayout: any, chartType: string) {
  const mobile = isMobile();
  const isRadar = chartType === "radar";
  const isHeatmap = chartType === "heatmap";

  const base: any = {
    ...baseLayout,
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    title: undefined,
    font: {
      color: "#6b7280",
      size: mobile ? 10 : 12,
      family: "Inter, DM Sans, sans-serif",
    },
    legend: {
      ...(baseLayout.legend || {}),
      bgcolor: "rgba(15,15,20,0.85)",
      bordercolor: "rgba(255,255,255,0.08)",
      borderwidth: 1,
      font: { size: mobile ? 10 : 12, color: "#e5e7eb" },
      orientation: "h",
      x: 0.5,
      y: isRadar ? -0.15 : -0.22,
      xanchor: "center",
      yanchor: "top",
    },
    margin: mobile
      ? { t: 10, l: 46, r: 12, b: 80 }
      : { t: 10, l: 55, r: 24, b: 72 },
  };

  // Axes only for cartesian charts
  if (!isRadar) {
    base.xaxis = {
      ...(baseLayout.xaxis || {}),
      tickangle: mobile ? -40 : isHeatmap ? -30 : 0,
      tickfont: { size: mobile ? 9 : 11, color: "#9ca3af" },
      gridcolor: "rgba(0,0,0,0.05)",
      linecolor: "rgba(0,0,0,0.08)",
      zerolinecolor: "rgba(0,0,0,0.08)",
      showgrid: !isHeatmap,
      automargin: true,
    };
    base.yaxis = {
      ...(baseLayout.yaxis || {}),
      tickfont: { size: mobile ? 9 : 11, color: "#9ca3af" },
      gridcolor: "rgba(0,0,0,0.05)",
      linecolor: "rgba(0,0,0,0.08)",
      zerolinecolor: "rgba(0,0,0,0.08)",
      showgrid: !isHeatmap,
      automargin: true,
    };
  }

  // Radar polar config
  if (isRadar) {
    base.polar = {
      ...(baseLayout.polar || {}),
      bgcolor: "rgba(0,0,0,0)",
      radialaxis: {
        visible: true,
        gridcolor: "rgba(0,0,0,0.08)",
        tickfont: { size: 9, color: "#9ca3af" },
        ...(baseLayout.polar?.radialaxis || {}),
      },
      angularaxis: {
        gridcolor: "rgba(0,0,0,0.08)",
        tickfont: { size: mobile ? 9 : 11, color: "#6b7280" },
        ...(baseLayout.polar?.angularaxis || {}),
      },
    };
  }

  return base;
}

interface Message {
  id: string;
  from: "user" | "ai";
  content: string | any;
  status?: "loading" | "success" | "error";
  hasFile?: boolean;
  fileName?: string;
}

interface ChatAreaProps {
  messages: Message[];
}

interface PlotlyHTMLElement extends HTMLDivElement {
  data?: any[];
  layout?: any;
}

interface ChartBlockProps {
  message: Message;
}

export default function ChatArea({ messages }: ChatAreaProps) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5 md:gap-6 px-2 md:px-4 py-5 md:py-6">
      {messages.map((msg, idx) => (
        <div
          key={msg.id}
          className="msg-row animate-fade-up"
          style={{ animationDelay: `${idx * 30}ms` }}
        >
          {msg.from === "user" ? (
            <div className="flex justify-end">
              <div className="max-w-[85%] sm:max-w-[75%] bg-cyan-300 border border-white rounded-2xl rounded-tr-sm px-3 py-2 sm:px-4 sm:py-2.5">
                {msg.hasFile && (
                  <div className="mb-1.5 flex items-center gap-1.5 text-neutral-400 text-xs">
                    <span>📎</span>
                    <span className="font-mono truncate max-w-[180px]">
                      {msg.fileName || "Attached file"}
                    </span>
                  </div>
                )}
                <p className="text-neutral-700 text-sm leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <ChartBlock message={msg} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ChartBlock({ message }: ChartBlockProps) {
  const divRef = useRef<PlotlyHTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rendered = useRef(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);

  useEffect(() => {
    if (message.status !== "success" || rendered.current || !divRef.current)
      return;

    const tryRender = () => {
      if (!("Plotly" in window)) {
        setTimeout(tryRender, 100);
        return;
      }
      if (rendered.current || !divRef.current) return;
      rendered.current = true;

      try {
        const rawData = message.content?.data || [];
        const rawLayout = message.content?.layout || {};
        const chartType = detectType(rawData);

        const { data, layout: processedLayout } = preprocessTraces(
          rawData,
          rawLayout,
        );
        const layout = buildLayout(processedLayout, chartType);

        window.Plotly.newPlot(divRef.current, data, layout, {
          responsive: true,
          displayModeBar: false,
          scrollZoom: false,
        });
      } catch (e) {
        console.error("Plotly render error:", e);
        // Show fallback error inside chart area
        if (divRef.current) {
          divRef.current.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ef4444;font-size:13px;gap:8px;padding:24px;text-align:center;">
              <span>⚠</span><span>Chart render failed — try a different chart type or check your data format.</span>
            </div>`;
        }
      }
    };
    tryRender();
  }, [message.status, message.content]);

  useEffect(() => {
    const onResize = () => {
      if (divRef.current && "Plotly" in window && rendered.current) {
        const chartType = detectType(message.content?.data || []);
        window.Plotly.relayout(
          divRef.current,
          buildLayout(message.content?.layout || {}, chartType),
        );
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [message.content]);

  if (message.status === "loading") {
    return (
      <div className="flex flex-col items-start gap-3 py-6 px-2">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p className="text-neutral-400 text-xs tracking-wide">
          Generating visualization…
        </p>
      </div>
    );
  }

  if (message.status === "error") {
    return (
      <div className="p-4 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl">
        ⚠ {message.content}
      </div>
    );
  }

  const chartTitle =
    message.content?.layout?.title?.text ||
    (typeof message.content?.layout?.title === "string"
      ? message.content.layout.title
      : "Chart");

  const chartType = detectType(message.content?.data || []);

  return (
    <>
      {editorOpen && (
        <ChartEditor
          message={message}
          divRef={divRef}
          onClose={() => setEditorOpen(false)}
        />
      )}

      <div
        ref={cardRef}
        className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-visible w-full"
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-2 h-2 rounded-full bg-neutral-300 flex-shrink-0" />
            <span className="text-neutral-500 text-xs font-medium tracking-wide truncate">
              {chartTitle}
            </span>
            {/* Chart type badge */}
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-400 flex-shrink-0">
              {chartType}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => {
                if (!divRef.current || !("Plotly" in window)) return;
                const name = chartTitle
                  .replace(/[^a-z0-9]/gi, "_")
                  .toLowerCase();
                window.Plotly.downloadImage(divRef.current, {
                  format: "png",
                  width: 1400,
                  height: 800,
                  filename: name,
                });
              }}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wide transition-all bg-neutral-900 text-white sm:hidden"
            >
              PNG
            </button>
            {(["SVG", "CSV", "PNG"] as const).map((fmt, i) => (
              <button
                key={fmt}
                onClick={() => {
                  if (!divRef.current || !("Plotly" in window)) return;
                  const name = chartTitle
                    .replace(/[^a-z0-9]/gi, "_")
                    .toLowerCase();
                  window.Plotly.downloadImage(divRef.current, {
                    format: fmt.toLowerCase() as any,
                    width: 1400,
                    height: 800,
                    filename: name,
                  });
                }}
                className={`hidden sm:block text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wide transition-all ${i === 2 ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"}`}
              >
                {fmt}
              </button>
            ))}
            <button
              onClick={() => setToolbarOpen((v) => !v)}
              className="sm:hidden w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-900 text-white ml-1"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="19" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Plotly chart */}
        <div
          ref={divRef}
          className="w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[440px] px-1 sm:px-2"
        />

        {/* Mobile inline toolbar */}
        {toolbarOpen && (
          <div className="sm:hidden border-t border-neutral-100 px-3 py-2.5 bg-neutral-50 rounded-b-2xl">
            <MobileToolbarInline
              divRef={divRef}
              cardRef={cardRef}
              message={message}
              onOpenEditor={() => {
                setToolbarOpen(false);
                setTimeout(() => setEditorOpen(true), 0);
              }}
              onClose={() => setToolbarOpen(false)}
            />
          </div>
        )}

        {/* Desktop toolbar */}
        <div className="hidden sm:block">
          <ChartToolbar
            divRef={divRef}
            cardRef={cardRef}
            message={message}
            onOpenEditor={() => setEditorOpen(true)}
          />
        </div>
      </div>
    </>
  );
}

function MobileToolbarInline({
  divRef,
  cardRef,
  message,
  onOpenEditor,
  onClose,
}: {
  divRef: React.RefObject<PlotlyHTMLElement | null>;
  cardRef: React.RefObject<HTMLDivElement | null>;
  message: any;
  onOpenEditor: () => void;
  onClose: () => void;
}) {
  const [gridOn, setGridOn] = useState(true);
  const [legendOn, setLegendOn] = useState(true);
  const [bgDark, setBgDark] = useState(false);

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
    if (!cardRef.current) return;
    const n = !bgDark;
    setBgDark(n);
    cardRef.current.style.background = n ? "#111212" : "#ffffff";
    cardRef.current.style.borderColor = n
      ? "rgba(255,255,255,0.08)"
      : "#e5e7eb";
    if (divRef.current && "Plotly" in window) {
      window.Plotly.relayout(
        divRef.current,
        n
          ? {
              "xaxis.tickfont": { color: "rgba(255,255,255,0.5)" },
              "yaxis.tickfont": { color: "rgba(255,255,255,0.5)" },
              "xaxis.gridcolor": "rgba(255,255,255,0.08)",
              "yaxis.gridcolor": "rgba(255,255,255,0.08)",
              "font.color": "rgba(255,255,255,0.7)",
            }
          : ({
              "xaxis.tickfont": { color: "#666" },
              "yaxis.tickfont": { color: "#666" },
              "xaxis.gridcolor": "rgba(0,0,0,0.08)",
              "yaxis.gridcolor": "rgba(0,0,0,0.08)",
              "font.color": "#333",
            } as any),
      );
    }
  };
  const resetZoom = () => {
    if (!divRef.current || !("Plotly" in window)) return;
    window.Plotly.relayout(divRef.current, {
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    } as any);
  };

  const actions = [
    { label: "Edit", onClick: onOpenEditor, active: false, accent: true },
    { label: gridOn ? "Grid ✓" : "Grid", onClick: toggleGrid, active: gridOn },
    {
      label: legendOn ? "Legend ✓" : "Legend",
      onClick: toggleLegend,
      active: legendOn,
    },
    { label: bgDark ? "Dark ✓" : "Dark", onClick: toggleBg, active: bgDark },
    { label: "Reset", onClick: resetZoom, active: false },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${a.accent ? "bg-cyan-500 text-white" : a.active ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600"}`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
