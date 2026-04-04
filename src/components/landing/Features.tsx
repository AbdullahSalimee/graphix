"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Feature definitions ───────────────────────────────────────
const FEATURES = [
  {
    tag: "Core",
    accent: "#06b6d4",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    headline: "Plain-English Prompts",
    body: "Just describe what you want. No SQL, no formulas, no learning curve. Type 'show monthly revenue by region as a stacked bar' and watch it appear.",
    pills: ["Natural language", "CSV upload", "JSON paste", "AI auto-selects"],
  },
  {
    tag: "Chart Types",
    accent: "#a855f7",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="7" width="4" height="14" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    ),
    headline: "80+ Chart Types",
    body: "Line, bar, scatter, heatmap, contour, 3D surface, violin, candlestick, funnel, waterfall — every major chart type across 10 categories, all rendered with full interactivity.",
    pills: ["10 categories", "3D charts", "Statistical", "Financial"],
    stat: { num: "80+", label: "types" },
  },
  {
    tag: "Editor",
    accent: "#10b981",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    headline: "Full Visual Editor",
    body: "A complete design studio built into every chart. Tweak palettes, fonts, backgrounds, axes, legends, line widths, and export dimensions — no design skills needed.",
    pills: [
      "12 color palettes",
      "15 fonts",
      "8 bg presets",
      "Custom export size",
    ],
  },
  {
    tag: "Dashboard",
    accent: "#f59e0b",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    headline: "Personal Dashboard",
    body: "Every chart you build is saved with a live mini-preview. Star favorites, re-open in the editor anytime, and update charts in place — your work never disappears.",
    pills: [
      "Live previews",
      "Star favorites",
      "Re-open & edit",
      "Auto-updates",
    ],
  },
  {
    tag: "3D",
    accent: "#6366f1",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    headline: "3D WebGL Charts",
    body: "Full 3D scatter, surface, mesh, ribbon, and spiral charts with WebGL rendering. Rotate, zoom, orbit — all in the browser. No plugins, no downloads.",
    pills: ["3D Scatter", "Surface plot", "Mesh 3D", "Line spiral"],
  },
  {
    tag: "Export",
    accent: "#ec4899",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    headline: "One-Click Export",
    body: "Download as PNG, SVG, or JPEG at any resolution. Set custom dimensions or pick from presets — Twitter card, Instagram square, 4K UHD, presentation slides.",
    pills: ["PNG · SVG · JPEG", "Custom dimensions", "4K UHD", "Slide presets"],
  },
];

// ─── Helpers ───────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

function FeatureCard({ f, index }: { f: (typeof FEATURES)[0]; index: number }) {
  const { ref, vis } = useInView(0.08);
  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(22px)",
        transition: `opacity 0.5s ease ${index * 0.07}s, transform 0.5s cubic-bezier(.22,1,.36,1) ${index * 0.07}s`,
        background: "#141515",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding: "26px 26px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: -50,
          left: -30,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: f.accent,
          opacity: 0.06,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div style={{ color: f.accent, opacity: 0.85 }}>{f.icon}</div>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 99,
            background: f.accent + "12",
            border: `1px solid ${f.accent}30`,
            color: f.accent,
          }}
        >
          {f.tag}
        </span>
      </div>

      {/* Text */}
      <div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 7,
            lineHeight: 1.3,
          }}
        >
          {f.headline}
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.38)",
            lineHeight: 1.75,
            margin: 0,
          }}
        >
          {f.body}
        </p>
      </div>

      {/* Pills */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}
      >
        {f.pills.map((p) => (
          <span
            key={p}
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              fontWeight: 600,
              color: "rgba(255,255,255,0.35)",
              padding: "3px 7px",
              borderRadius: 4,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const { ref: hRef, vis: hVis } = useInView(0.2);
  // bg-scrolling keyframe injected via global.css or parent
  const { ref: panelRef, vis: panelVis } = useInView(0.15);

  return (
    <>
      <style>{`@keyframes bg-scrolling { 0%{background-position:0 0} 100%{background-position:50px 50px} }`}</style>
      <section
        id="features"
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
            maxWidth: 1160,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            ref={hRef}
            style={{
              textAlign: "center",
              marginBottom: 60,
              opacity: hVis ? 1 : 0,
              transform: hVis ? "none" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                border: "1px solid rgba(6,182,212,0.4)",
                background: "rgba(6,182,212,0.1)",
                marginBottom: 18,
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
                Everything included
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "0 0 14px",
              }}
            >
              Built for the full workflow.
              <br />
              <span style={{ color: "#0891b2" }}>Not just the first step.</span>
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.35)",
                maxWidth: 460,
                margin: "0 auto",
                lineHeight: 1.7,
                fontFamily: "monospace",
              }}
            >
              From raw data to polished, shareable chart — every tool is already
              here, free during beta.
            </p>
          </div>

          {/* Feature grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: 14,
              marginBottom: 48,
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.tag} f={f} index={i} />
            ))}
          </div>

          {/* Stat bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 48,
            }}
          >
            {[
              ["80+", "Chart types"],
              ["12", "Color palettes"],
              ["15", "Font options"],
              ["4", "Export formats"],
            ].map(([num, label], i) => (
              <div
                key={label}
                style={{
                  padding: "24px 0",
                  textAlign: "center",
                  background:
                    i % 2 === 0
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(6,182,212,0.03)",
                  borderRight:
                    i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: "#06b6d4",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#6b7280",
                    marginTop: 5,
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Excel / Panel callout card */}
          <div
            ref={panelRef}
            style={{
              opacity: panelVis ? 1 : 0,
              transform: panelVis ? "none" : "translateY(20px)",
              transition: "opacity 0.9s ease 0.2s, transform 0.6s ease 0.2s",
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(6,182,212,0.05) 100%)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 14,
              padding: "36px 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 32,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "white",
                  }}
                >
                  Also included — Excel-Style Editor
                </span>
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "white",
                  marginBottom: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                Spreadsheet + Chart in one panel
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "white",
                  lineHeight: 1.7,
                  margin: 0,
                  maxWidth: 440,
                }}
              >
                A full spreadsheet editor with formula support, conditional
                formatting, column sorting, and instant chart generation — all
                in a split-pane interface. Perfect for editing data and
                visualizing it side by side.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 16,
                  flexWrap: "wrap",
                }}
              >
                {[
                  "Formula bar",
                  "Conditional formatting",
                  "CSV import/export",
                  "Live chart sync",
                ].map((p) => (
                  <span
                    key={p}
                    style={{
                      fontSize: 9,
                      fontFamily: "monospace",
                      color: "#10b981",
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "white",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href="/panel"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                background: "#10b981",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: 8,
                flexShrink: 0,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Open Excel Editor
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
