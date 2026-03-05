// components/ChatArea.tsx
"use client";

import { useEffect, useRef } from "react";
import ChartToolbar from "./ChartToolbar";

// ── Helper: detect mobile ─────────────────────────────────────────────────────
const isMobile = () => typeof window !== "undefined" && window.innerWidth < 640;

// ── Build responsive Plotly layout ────────────────────────────────────────────
function buildLayout(baseLayout: any) {
  const mobile = isMobile();

  return {
    ...baseLayout,
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      color: "#94a3b8",
      size: mobile ? 10 : 12,
      family: "DM Sans, sans-serif",
    },
    legend: mobile
      ? {
          orientation: "h",
          x: 0,
          y: -0.28,
          font: { size: 10, color: "#94a3b8" },
          bgcolor: "rgba(0,0,0,0)",
        }
      : {
          ...(baseLayout.legend || {}),
          bgcolor: "rgba(7,13,26,0.85)",
          bordercolor: "rgba(56,189,248,0.15)",
          borderwidth: 1,
          font: { size: 12, color: "#94a3b8" },
        },
    margin: mobile
      ? { t: 40, l: 46, r: 10, b: 70 }
      : { t: 50, l: 55, r: 30, b: 50 },
    title: baseLayout.title
      ? {
          ...(typeof baseLayout.title === "string"
            ? { text: baseLayout.title }
            : baseLayout.title),
          font: {
            size: mobile ? 13 : 18,
            color: "#e2e8f0",
            family: "Playfair Display, serif",
          },
          x: 0.5,
          xanchor: "center",
        }
      : undefined,
    xaxis: {
      ...(baseLayout.xaxis || {}),
      tickangle: mobile ? -40 : 0,
      tickfont: { size: mobile ? 9 : 11, color: "#64748b" },
      gridcolor: "rgba(56,189,248,0.07)",
      linecolor: "rgba(56,189,248,0.12)",
      zerolinecolor: "rgba(56,189,248,0.12)",
      automargin: true,
    },
    yaxis: {
      ...(baseLayout.yaxis || {}),
      tickfont: { size: mobile ? 9 : 11, color: "#64748b" },
      gridcolor: "rgba(56,189,248,0.07)",
      linecolor: "rgba(56,189,248,0.12)",
      zerolinecolor: "rgba(56,189,248,0.12)",
      automargin: true,
    },
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Main Chat Area ────────────────────────────────────────────────────────────
export default function ChatArea({ messages }: ChatAreaProps) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5 md:gap-6 px-4 md:px-6 py-5 md:py-6 overflow-y-auto">
      {messages.map((msg, idx) => (
        <div
          key={msg.id}
          className="msg-row animate-fade-up"
          style={{ animationDelay: `${idx * 30}ms` }}
        >
          {msg.from === "user" ? (
            <div className="user-bubble max-w-[85%] ml-auto md:max-w-[65%]">
              {msg.hasFile && (
                <div className="file-badge mb-1.5 flex items-center gap-1.5 text-sky-400 text-xs">
                  <span>📎</span>
                  {msg.fileName || "Attached file"}
                </div>
              )}
              <div className="text-slate-200 text-sm md:text-base leading-relaxed">
                {msg.content}
              </div>
            </div>
          ) : (
            <div className="ai-block w-full">
              <ChartBlock message={msg} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Chart Block ───────────────────────────────────────────────────────────────
function ChartBlock({ message }: ChartBlockProps) {
  const divRef = useRef<PlotlyHTMLElement | null>(null);
  const rendered = useRef(false);

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

        const data = (message.content?.data || []).map((trace: any) => ({
          ...trace,
          ...(mobile && trace.type !== "pie" && trace.type !== "bar"
            ? {
                line: {
                  ...(trace.line || {}),
                  width: Math.min(trace.line?.width || 2, 1.5),
                },
                marker: {
                  ...(trace.marker || {}),
                  size: Math.min(trace.marker?.size || 8, 5),
                },
              }
            : {}),
        }));

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
      <div className="chart-loading flex flex-col items-center justify-center gap-4 p-12 md:p-16">
        <div className="dots flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p className="text-slate-400 text-sm tracking-wide">
          Generating visualization…
        </p>
      </div>
    );
  }

  if (message.status === "error") {
    return (
      <div className="chart-error p-5 md:p-6 text-red-400 text-sm bg-red-900/10 border border-red-500/20 rounded-xl">
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
    <div className="chart-card bg-gradient-to-br from-[#0c1628]/97 to-[#08141a]/99 rounded-xl border border-sky-500/10 shadow-[0_0_60px_rgba(56,189,248,0.04),0_24px_64px_rgba(0,0,0,0.45)] overflow-hidden">
      <div className="chart-card-toolbar flex items-center justify-between px-4 py-2.5 border-b border-white/4 min-h-[42px]">
        <span className="chart-card-title text-slate-600 text-xs font-mono tracking-wide truncate flex-1">
          {chartTitle}
        </span>
      </div>

      <div
        ref={divRef}
        className="chart-plot w-full h-[300px] md:h-[340px] lg:h-[420px]"
      />

      <ChartToolbar divRef={divRef} message={message} />
    </div>
  );
}
