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
              <div className="max-w-[75%] bg-neutral-100 border border-neutral-200 rounded-2xl rounded-tr-sm px-4 py-2.5">
                {msg.hasFile && (
                  <div className="mb-1.5 flex items-center gap-1.5 text-neutral-400 text-xs">
                    <span>📎</span>
                    <span className="font-mono">
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
      {/* Editor modal */}
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
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-neutral-300" />
            <span className="text-neutral-500 text-xs font-medium tracking-wide truncate">
              {chartTitle}
            </span>
          </div>
          <div className="flex items-center gap-1">
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
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wide transition-all ${i === 2 ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"}`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Plotly */}
        <div
          ref={divRef}
          className="w-full h-[320px] md:h-[380px] lg:h-[440px] px-2"
        />

        {/* Toolbar — NOW includes the open-editor arrow button */}
        <ChartToolbar
          divRef={divRef}
          cardRef={cardRef}
          message={message}
          onOpenEditor={() => setEditorOpen(true)}
        />
      </div>
    </>
  );
}
