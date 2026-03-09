"use client";

import { useEffect, useRef, useState } from "react";
import ChartToolbar from "./ChartToolbar";
import ChartEditor from "./ChartEditor";

const isMobile = () => typeof window !== "undefined" && window.innerWidth < 640;

function buildLayout(baseLayout: any) {
  const mobile = isMobile();
  return {
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
      y: -0.22,
      xanchor: "center",
      yanchor: "top",
    },
    margin: mobile
      ? { t: 10, l: 46, r: 12, b: 80 }
      : { t: 10, l: 55, r: 24, b: 72 },
    xaxis: {
      ...(baseLayout.xaxis || {}),
      tickangle: mobile ? -40 : 0,
      tickfont: { size: mobile ? 9 : 11, color: "#9ca3af" },
      gridcolor: "rgba(0,0,0,0.05)",
      linecolor: "rgba(0,0,0,0.08)",
      zerolinecolor: "rgba(0,0,0,0.08)",
      showgrid: true,
      automargin: true,
    },
    yaxis: {
      ...(baseLayout.yaxis || {}),
      tickfont: { size: mobile ? 9 : 11, color: "#9ca3af" },
      gridcolor: "rgba(0,0,0,0.05)",
      linecolor: "rgba(0,0,0,0.08)",
      zerolinecolor: "rgba(0,0,0,0.08)",
      showgrid: true,
      automargin: true,
    },
    scene: {
      ...(baseLayout.scene || {}),
      xaxis: {
        ...(baseLayout.scene?.xaxis || {}),
        gridcolor: "rgba(0,0,0,0.15)",
        linecolor: "rgba(0,0,0,0.2)",
        zerolinecolor: "rgba(0,0,0,0.2)",
        tickfont: { color: "#6b7280", size: 10 },
        backgroundcolor: "rgba(0,0,0,0)",
      },
      yaxis: {
        ...(baseLayout.scene?.yaxis || {}),
        gridcolor: "rgba(0,0,0,0.15)",
        linecolor: "rgba(0,0,0,0.2)",
        zerolinecolor: "rgba(0,0,0,0.2)",
        tickfont: { color: "#6b7280", size: 10 },
        backgroundcolor: "rgba(0,0,0,0)",
      },
      zaxis: {
        ...(baseLayout.scene?.zaxis || {}),
        gridcolor: "rgba(0,0,0,0.15)",
        linecolor: "rgba(0,0,0,0.2)",
        zerolinecolor: "rgba(0,0,0,0.2)",
        tickfont: { color: "#6b7280", size: 10 },
        backgroundcolor: "rgba(0,0,0,0)",
      },
      bgcolor: "rgba(0,0,0,0)",
    },
    colorway: [
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
      "#f97316",
    ],
  };
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
        const layout = buildLayout(message.content?.layout || {});
        const mobile = isMobile();
        const PALETTE = [
          "#6366f1",
          "#818cf8",
          "#4f46e5",
          "#3b82f6",
          "#60a5fa",
          "#0ea5e9",
          "#38bdf8",
          "#0284c7",
          "#f43f5e",
          "#fb7185",
          "#e11d48",
          "#f472b6",
          "#ec4899",
          "#db2777",
          "#e879f9",
          "#d946ef",
          "#10b981",
          "#34d399",
          "#059669",
          "#14b8a6",
          "#2dd4bf",
          "#4ade80",
          "#22c55e",
          "#84cc16",
          "#a855f7",
          "#c084fc",
          "#7c3aed",
          "#8b5cf6",
          "#a78bfa",
          "#9333ea",
          "#6d28d9",
          "#7e22ce",
          "#fb923c",
          "#f97316",
          "#ea580c",
          "#f59e0b",
          "#fbbf24",
          "#d97706",
          "#fb7185",
          "#fca5a5",
          "#06b6d4",
          "#22d3ee",
          "#0891b2",
          "#67e8f9",
          "#0e7490",
          "#155e75",
          "#164e63",
          "#083344",
        ];
        const shuffled = [...PALETTE].sort(() => Math.random() - 0.5);
        const data = (message.content?.data || []).map(
          (trace: any, i: number) => {
            const color = shuffled[i % shuffled.length];
            const isPie = trace.type === "pie" || trace.type === "donut";
            return {
              ...trace,
              marker: {
                ...(trace.marker || {}),
                color: isPie ? shuffled : color,
                size: mobile
                  ? Math.min(trace.marker?.size || 6, 5)
                  : trace.marker?.size || 7,
                line: { color: "white", width: isPie ? 2 : 1.5 },
              },
              line: {
                ...(trace.line || {}),
                color,
                width: mobile ? 1.5 : trace.line?.width || 2.5,
              },
              fillcolor: trace.fill ? color + "22" : undefined,
            };
          },
        );
        window.Plotly.newPlot(divRef.current, data, layout, {
          responsive: true,
          displayModeBar: false,
          scrollZoom: false,
        });
      } catch (e) {
        console.error("Plotly render error:", e);
      }
    };
    tryRender();
  }, [message.status, message.content]);

  useEffect(() => {
    const onResize = () => {
      if (divRef.current && "Plotly" in window && rendered.current) {
        window.Plotly.relayout(
          divRef.current,
          buildLayout(message.content?.layout || {}),
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
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* On mobile: show only PNG, on desktop show all 3 */}
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
            {/* Mobile toolbar toggle */}
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

        {/* Mobile inline toolbar (shown below chart when toggled) */}
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

        {/* Desktop toolbar (floating on right) */}
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

// Inline mobile toolbar that appears below the chart
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
  const [labelOn, setLabelOn] = useState(false);

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
    if (n) {
      cardRef.current.style.background = "#111212";
      cardRef.current.style.borderColor = "rgba(255,255,255,0.08)";
      if (divRef.current && "Plotly" in window) {
        window.Plotly.relayout(divRef.current, {
          "xaxis.tickfont": { color: "rgba(255,255,255,0.5)" },
          "yaxis.tickfont": { color: "rgba(255,255,255,0.5)" },
          "xaxis.gridcolor": "rgba(255,255,255,0.08)",
          "yaxis.gridcolor": "rgba(255,255,255,0.08)",
          "font.color": "rgba(255,255,255,0.7)",
        } as any);
      }
    } else {
      cardRef.current.style.background = "#ffffff";
      cardRef.current.style.borderColor = "#e5e7eb";
      if (divRef.current && "Plotly" in window) {
        window.Plotly.relayout(divRef.current, {
          "xaxis.tickfont": { color: "#666" },
          "yaxis.tickfont": { color: "#666" },
          "xaxis.gridcolor": "rgba(0,0,0,0.08)",
          "yaxis.gridcolor": "rgba(0,0,0,0.08)",
          "font.color": "#333",
        } as any);
      }
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
    {
      label: "Edit",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
        </svg>
      ),
      onClick: onOpenEditor,
      active: false,
      accent: true,
    },
    {
      label: gridOn ? "Grid ✓" : "Grid",
      icon: (
        <svg
          width="14"
          height="14"
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
      ),
      onClick: toggleGrid,
      active: gridOn,
    },
    {
      label: legendOn ? "Legend ✓" : "Legend",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="9" y2="6" />
          <circle cx="6" cy="6" r="2" fill="currentColor" />
          <line x1="3" y1="12" x2="9" y2="12" />
          <circle cx="6" cy="12" r="2" fill="currentColor" />
          <line x1="12" y1="6" x2="21" y2="6" />
          <line x1="12" y1="12" x2="21" y2="12" />
        </svg>
      ),
      onClick: toggleLegend,
      active: legendOn,
    },
    {
      label: bgDark ? "Dark ✓" : "Dark",
      icon: (
        <svg
          width="14"
          height="14"
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
        </svg>
      ),
      onClick: toggleBg,
      active: bgDark,
    },
    {
      label: "Reset",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      ),
      onClick: resetZoom,
      active: false,
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
            a.accent
              ? "bg-cyan-500 text-white"
              : a.active
                ? "bg-neutral-900 text-white"
                : "bg-white border border-neutral-200 text-neutral-600"
          }`}
        >
          {a.icon}
          {a.label}
        </button>
      ))}
    </div>
  );
}
