"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface ChartDef {
  query: string;
  badge: string;
  color: string;
  build: (Plotly: any, el: HTMLDivElement) => Promise<void>;
}

const CHARTS: ChartDef[] = [
  {
    query: "Show quarterly revenue by region as grouped bars",
    badge: "BAR CHART",
    color: "#10b981",
    build: async (Plotly, el) => {
      const quarters = ["Q1", "Q2", "Q3", "Q4"];
      await Plotly.react(
        el,
        [
          {
            x: quarters,
            y: [42, 58, 51, 67],
            name: "North",
            type: "bar",
            marker: { color: "#10b981", opacity: 0.9 },
          },
          {
            x: quarters,
            y: [31, 44, 39, 55],
            name: "South",
            type: "bar",
            marker: { color: "#06b6d4", opacity: 0.9 },
          },
          {
            x: quarters,
            y: [28, 36, 42, 61],
            name: "West",
            type: "bar",
            marker: { color: "#a855f7", opacity: 0.9 },
          },
        ],
        {
          barmode: "group",
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { color: "rgba(255,255,255,0.6)", size: 11, family: "DM Mono" },
          margin: { t: 20, b: 40, l: 40, r: 12 },
          showlegend: true,
          legend: { orientation: "h", y: -0.18, font: { size: 10 } },
          xaxis: {
            gridcolor: "rgba(255,255,255,0.05)",
            tickfont: { size: 11 },
          },
          yaxis: {
            gridcolor: "rgba(255,255,255,0.07)",
            tickfont: { size: 11 },
            title: { text: "Revenue ($k)", font: { size: 10 } },
          },
          bargap: 0.22,
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
  {
    query: "Visualize user growth over 12 months with trend line",
    badge: "LINE CHART",
    color: "#06b6d4",
    build: async (Plotly, el) => {
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
      const users = [
        1200, 1580, 1340, 2100, 2450, 2200, 2800, 3100, 2950, 3600, 4100, 4800,
      ];
      const trend = months.map((_, i) => Math.round(1100 + i * 310));
      await Plotly.react(
        el,
        [
          {
            x: months,
            y: users,
            type: "scatter",
            mode: "lines+markers",
            name: "Active Users",
            line: { color: "#06b6d4", width: 2.5, shape: "spline" },
            marker: { size: 5, color: "#06b6d4" },
            fill: "tozeroy",
            fillcolor: "rgba(6,182,212,0.08)",
          },
          {
            x: months,
            y: trend,
            type: "scatter",
            mode: "lines",
            name: "Trend",
            line: { color: "rgba(255,255,255,0.25)", width: 1.5, dash: "dot" },
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { color: "rgba(255,255,255,0.6)", size: 11, family: "DM Mono" },
          margin: { t: 20, b: 40, l: 50, r: 12 },
          showlegend: true,
          legend: { orientation: "h", y: -0.18, font: { size: 10 } },
          xaxis: {
            gridcolor: "rgba(255,255,255,0.05)",
            tickfont: { size: 10 },
          },
          yaxis: {
            gridcolor: "rgba(255,255,255,0.07)",
            tickfont: { size: 10 },
            title: { text: "Users", font: { size: 10 } },
          },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
  {
    query: "Market share breakdown for 5 product categories",
    badge: "DONUT CHART",
    color: "#a855f7",
    build: async (Plotly, el) => {
      await Plotly.react(
        el,
        [
          {
            type: "pie",
            hole: 0.52,
            labels: ["Analytics", "Reporting", "Dashboards", "APIs", "Export"],
            values: [31, 22, 19, 15, 13],
            marker: {
              colors: ["#a855f7", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"],
              line: { color: "rgba(0,0,0,0)", width: 0 },
            },
            textinfo: "label+percent",
            textfont: { size: 11, family: "DM Mono" },
            hoverinfo: "label+value+percent",
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "rgba(255,255,255,0.65)",
            size: 11,
            family: "DM Mono",
          },
          margin: { t: 16, b: 16, l: 16, r: 16 },
          showlegend: false,
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
  {
    query: "Correlation heatmap of 5 sales metrics",
    badge: "HEATMAP",
    color: "#f59e0b",
    build: async (Plotly, el) => {
      const labels = ["Revenue", "Units", "CAC", "LTV", "Churn"];
      const z = [
        [1.0, 0.87, -0.62, 0.71, -0.44],
        [0.87, 1.0, -0.55, 0.63, -0.38],
        [-0.62, -0.55, 1.0, -0.81, 0.72],
        [0.71, 0.63, -0.81, 1.0, -0.68],
        [-0.44, -0.38, 0.72, -0.68, 1.0],
      ];
      await Plotly.react(
        el,
        [
          {
            type: "heatmap",
            z,
            x: labels,
            y: labels,
            colorscale: "RdBu",
            zmid: 0,
            showscale: false,
            text: z.map((r) => r.map((v) => v.toFixed(2))),
            texttemplate: "%{text}",
            textfont: { size: 10, family: "DM Mono", color: "#fff" },
          },
        ],
        {
          paper_bgcolor: "#0f0f0f",
          plot_bgcolor: "#0f0f0f",
          font: { color: "rgba(255,255,255,0.6)", size: 10, family: "DM Mono" },
          margin: { t: 10, b: 40, l: 60, r: 10 },
          xaxis: { tickfont: { size: 10 } },
          yaxis: { tickfont: { size: 10 } },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
];

function PlotlyChart({
  chart,
  animating,
}: {
  chart: ChartDef;
  animating: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    import("plotly.js-dist-min").then(({ default: Plotly }) => {
      setLoaded(false);
      chart.build(Plotly, ref.current!).then(() => setLoaded(true));
    });
    return () => {
      import("plotly.js-dist-min").then(({ default: Plotly }) => {
        if (ref.current) Plotly.purge(ref.current);
      });
    };
  }, [chart]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        opacity: animating ? 0 : loaded ? 1 : 0,
        transform: animating
          ? "scale(0.98) translateY(6px)"
          : "scale(1) translateY(0)",
        transition:
          "opacity 0.4s ease, transform 0.4s cubic-bezier(.16,1,.3,1)",
      }}
    />
  );
}

const SECTION_CSS = `
  @keyframes bg-scrolling { 0%{background-position:0 0} 100%{background-position:50px 50px} }
  @keyframes hs-fade-up   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hs-scale-in  { from{opacity:0;transform:scale(0.96) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .hs-root [data-anim] { opacity: 0; }
  .hs-root.hs-go [data-anim="headline"] { animation: hs-fade-up .6s cubic-bezier(.22,1,.36,1) .05s forwards; }
  .hs-root.hs-go [data-anim="sub"]      { animation: hs-fade-up .6s cubic-bezier(.22,1,.36,1) .18s forwards; }
  .hs-root.hs-go [data-anim="card"]     { animation: hs-scale-in .75s cubic-bezier(.22,1,.36,1) .28s forwards; }
  .hs-root.hs-go [data-anim="tabs"]     { animation: hs-fade-up .5s cubic-bezier(.22,1,.36,1) .35s forwards; }
`;

export default function LiveDemoSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [go, setGo] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          requestAnimationFrame(() => requestAnimationFrame(() => setGo(true)));
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-rotate
  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActiveIdx((i) => (i + 1) % CHARTS.length);
        setAnimating(false);
      }, 420);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const switchTo = (i: number) => {
    if (i === activeIdx) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveIdx(i);
      setAnimating(false);
    }, 300);
  };

  const chart = CHARTS[activeIdx];

  return (
    <>
      <style>{SECTION_CSS}</style>
      <section
        id="demo"
        ref={sectionRef}
        className={`hs-root${go ? " hs-go" : ""}`}
        style={{
          backgroundColor: "#d4d4d4",
          backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC")`,
          backgroundRepeat: "repeat",
          backgroundPosition: "0 0",
          animation: "bg-scrolling 0.92s linear infinite",
          padding: "96px 0 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding:"",
            position: "relative",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                border: "1px solid rgba(6,182,212,0.4)",
                background: "rgba(6,182,212,0.1)",
                
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#06b6d4",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "#0891b2",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                Live demo
              </span>
            </div>
          
          </div>

          {/* Chart tabs */}
          <div
            data-anim="tabs"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            {CHARTS.map((c, i) => (
              <button
                key={i}
                onClick={() => switchTo(i)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border:
                    i === activeIdx
                      ? `1px solid ${c.color}`
                      : "1px solid rgba(0,0,0,0.12)",
                  background: i === activeIdx ? `${c.color}18` : "transparent",
                  color: i === activeIdx ? c.color : "rgba(0,0,0,0.4)",
                }}
              >
                {c.badge}
              </button>
            ))}
          </div>

          {/* Main card */}
          <div
            data-anim="card"
            style={{
              background: "#141515",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
            }}
          >
            {/* Mac-style header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                padding: "0 20px",
                height: 44,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "#111",
              }}
            >
              <div style={{ display: "flex", gap: 7, marginRight: 16 }}>
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div
                    key={c}
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: c,
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    height: 28,
                    flex: 1,
                    maxWidth: 320,
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 10px",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
                    ●
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    graphix.ai/app
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.2)",
                  letterSpacing: "0.05em",
                }}
              >
                Graphix — Chart Editor
              </div>
            </div>

            {/* Prompt bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(6,182,212,0.03)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: chart.color,
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.55)",
                  margin: 0,
                  flex: 1,
                  transition: "opacity 0.3s",
                  opacity: animating ? 0 : 1,
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.25)" }}>→ </span>
                {chart.query}
              </p>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: `${chart.color}18`,
                  border: `1px solid ${chart.color}40`,
                  color: chart.color,
                }}
              >
                {chart.badge}
              </span>
            </div>

            {/* Chart */}
            <div style={{ height: 380, padding: "16px 12px 12px" }}>
              <PlotlyChart chart={chart} animating={animating} />
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <div style={{ display: "flex", gap: 16 }}>
                {["PNG", "SVG", "CSV"].map((fmt) => (
                  <span
                    key={fmt}
                    style={{
                      fontSize: 9,
                      fontFamily: "monospace",
                      color: "rgba(255,255,255,0.2)",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                    }}
                  >
                    Export {fmt}
                  </span>
                ))}
              </div>
              <Link
                href="/signin"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#06b6d4",
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                Build yours free <span>→</span>
              </Link>
            </div>
          </div>

          {/* Below card — dot indicators */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 24,
            }}
          >
            {CHARTS.map((_, i) => (
              <button
                key={i}
                onClick={() => switchTo(i)}
                style={{
                  width: i === activeIdx ? 20 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === activeIdx ? "#06b6d4" : "rgba(0,0,0,0.18)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
