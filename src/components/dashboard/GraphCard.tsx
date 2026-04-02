"use client";

import { useState, useEffect, useRef } from "react";
import {
  CYAN,
  WHITE,
  W08,
  W12,
  W20,
  W35,
  W55,
  C08,
  C18,
  C35,
} from "@/lib/Tokens";
import { IC } from "@/lib/Tokens";
import { Chip, Ico } from "./UIKit";
import ChartEditor from "@/components/main-app/ChartEditor";

declare global {
  interface Window {
    Plotly: any;
  }
}

// ── Mini Plotly preview ───────────────────────────────────────
function PlotlyMini({ chartConfig }: { chartConfig: Record<string, any> }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    const render = () => {
      if (!window.Plotly || !ref.current) return;
      try {
        const data = (chartConfig.data ?? []).map((trace: any) => ({
          ...trace,
          hoverinfo: "none",
        }));
        const layout = {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          margin: { t: 2, b: 2, l: 2, r: 2 },
          showlegend: false,
          xaxis: { visible: false, fixedrange: true },
          yaxis: { visible: false, fixedrange: true },
          height: 88,
          title: "",
          annotations: [],
        };
        window.Plotly.react(ref.current, data, layout, {
          displayModeBar: false,
          responsive: true,
          staticPlot: true,
        });
      } catch {}
    };
    if (window.Plotly) {
      render();
    } else {
      const t = setInterval(() => {
        if (window.Plotly) {
          clearInterval(t);
          render();
        }
      }, 200);
      return () => clearInterval(t);
    }
  }, [chartConfig]);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: 88, pointerEvents: "none" }}
    />
  );
}

// ── Sparkline fallback ────────────────────────────────────────
function Sparkline({ data, hover }: { data: number[]; hover: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = c.offsetWidth * 2;
    c.height = c.offsetHeight * 2;
    ctx.scale(2, 2);
    const W = c.offsetWidth,
      H = c.offsetHeight;
    const mn = Math.min(...data),
      mx = Math.max(...data),
      rng = mx - mn || 1;
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - ((v - mn) / rng) * (H - 18) - 9,
    }));
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(
      0,
      hover ? "rgba(8,145,178,0.30)" : "rgba(255,255,255,0.07)",
    );
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.moveTo(pts[0].x, H);
    ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cx, pts[i - 1].y, cx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.lineTo(pts[pts.length - 1].x, H);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cx, pts[i - 1].y, cx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = hover ? CYAN : "rgba(255,255,255,0.55)";
    ctx.lineWidth = hover ? 2 : 1.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, hover ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fillStyle = hover ? CYAN : WHITE;
    ctx.fill();
  }, [data, hover]);
  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
}

// ── GraphCard ────────────────────────────────────────────────
export default function GraphCard({
  graph,
  index = 0,
}: {
  graph: any;
  index?: number;
}) {
  const [hov, setHov] = useState(false);
  const [vis, setVis] = useState(false);
  const [star, setStar] = useState(graph.starred);
  const [editorOpen, setEditorOpen] = useState(false);
  const plotRef = useRef<any>(null);

  const hasPlotly = !!graph.chartConfig?.data?.length;

  // ChartEditor reads `message.content.data` / `.layout`
  const fakeMessage = hasPlotly
    ? {
        id: graph.id,
        from: "ai" as const,
        content: {
          data: graph.chartConfig.data,
          layout: {
            ...(graph.chartConfig.layout ?? {}),
            title: { text: graph.title },
          },
        },
        status: "success" as const,
      }
    : null;

  useEffect(() => {
    const t = setTimeout(() => setVis(true), index * 65 + 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => hasPlotly && setEditorOpen(true)}
        style={{
          border: `1px solid ${hov ? CYAN : W08}`,
          borderRadius: 6,
          overflow: "hidden",
          cursor: hasPlotly ? "pointer" : "default",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          opacity: vis ? 1 : 0,
          transform: vis ? "none" : "translateY(14px)",
          transition:
            "opacity 0.4s ease, transform 0.4s ease, border-color 0.2s",
        }}
      >
        {/* top accent */}
        <div
          style={{
            height: 2,
            background: hov
              ? `linear-gradient(90deg,${CYAN},transparent)`
              : "transparent",
            transition: "background 0.3s",
          }}
        />

        {/* preview */}
        <div
          style={{
            height: 100,
            position: "relative",
            background: hov ? C08 : "transparent",
            padding: hasPlotly ? "5px 6px 2px" : "11px 14px 7px",
            transition: "background 0.2s",
            overflow: "hidden",
          }}
        >
          {hasPlotly ? (
            <PlotlyMini chartConfig={graph.chartConfig} />
          ) : (
            <Sparkline
              data={graph.data ?? [10, 20, 15, 30, 25, 40, 35]}
              hover={hov}
            />
          )}
          <div style={{ position: "absolute", top: 9, left: 11 }}>
            <Chip>{graph.tag}</Chip>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStar((s: boolean) => !s);
            }}
            style={{
              position: "absolute",
              top: 9,
              right: 11,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Ico
              d={IC.star}
              size={13}
              fill={star ? CYAN : "none"}
              stroke={star ? CYAN : W20}
            />
          </button>
        </div>

        {/* body */}
        <div
          style={{
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: 1.3,
                }}
              >
                {graph.title}
              </div>
              <div
                style={{
                  color: W35,
                  fontSize: 12,
                  marginTop: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {graph.desc}
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 2,
                flexShrink: 0,
                color: graph.up ? CYAN : W55,
                background: graph.up ? C18 : W08,
                border: `1px solid ${graph.up ? C35 : W12}`,
              }}
            >
              {graph.trend}
            </span>
          </div>
          <Chip>{graph.category}</Chip>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${W08}`,
              paddingTop: 9,
            }}
          >
            <span style={{ color: W20, fontSize: 12 }}>{graph.updated}</span>
            <span
              style={{
                color: W20,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Ico d={IC.eye} size={11} />
              {graph.views}
            </span>
          </div>
        </div>

        {/* hover CTA */}
        <div
          style={{
            opacity: hov ? 1 : 0,
            transform: hov ? "none" : "translateY(5px)",
            transition: "all 0.17s",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasPlotly) setEditorOpen(true);
            }}
            style={{
              flex: 1,
              padding: "8px",
              background: CYAN,
              border: "none",
              color: "#111212",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {hasPlotly ? "Open in Editor →" : "Open →"}
          </button>
          <button
            style={{
              padding: "8px 12px",
              background: CYAN,
              border: "none",
              borderLeft: "1px solid rgba(255,255,255,0.18)",
              color: "#111212",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Ico d={IC.shared} size={12} stroke="#111212" />
          </button>
        </div>
      </div>

      {/* ChartEditor portal */}
      {hasPlotly && editorOpen && fakeMessage && (
        <ChartEditor
          message={fakeMessage}
          divRef={plotRef}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </>
  );
}
