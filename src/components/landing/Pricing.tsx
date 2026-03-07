"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  badge: string;
  name: string;
  price: string;
  priceOld?: string;
  priceSuffix: string;
  note: string;
  noteLink?: { text: string; href: string };
  ctaLabel: string;
  description: string;
  features: PricingFeature[];
  includedBadge?: string;
  accent: string; // primary accent color
  accentRgb: string; // for rgba usage
  headerVisual: "scatter" | "wave" | "nodes" | "bars";
  highlight?: boolean; // most popular
  isNew?: boolean;
}

const PLANS: PricingPlan[] = [
  {
    badge: "STARTER",
    name: "BASIC",
    price: "$0",
    priceSuffix: "Free Forever",
    note: "No credit card needed",
    ctaLabel: "START FOR FREE",
    description:
      "Turn raw data into instant charts with AI-powered suggestions and beautiful defaults.",
    features: [
      { text: "Up to 10 charts / month" },
      { text: "CSV & JSON upload" },
      { text: "AI chart type selection" },
      { text: "PNG & SVG export" },
      { text: "10 chart categories" },
      { text: "Community support" },
    ],
    accent: "#06b6d4",
    accentRgb: "6,182,212",
    headerVisual: "scatter",
  },
  {
    badge: "GROWTH",
    name: "PRO",
    price: "$19",
    priceOld: "$39",
    priceSuffix: "Per Month",
    note: "First 14 days FREE",
    ctaLabel: "START FOR FREE",
    description:
      "Unlimited charts, advanced chart types, and team sharing for fast-moving teams.",
    features: [
      { text: "Unlimited charts" },
      { text: "All 96+ chart types" },
      { text: "Custom color themes" },
      { text: "Embed & share links" },
      { text: "Data connectors (Google Sheets, Airtable)" },
      { text: "Priority AI processing" },
      { text: "Email support" },
    ],
    includedBadge: "BASIC INCLUDED",
    accent: "#06b6d4",
    accentRgb: "6,182,212",
    headerVisual: "wave",
    highlight: true,
  },
  {
    badge: "SCALE",
    name: "TEAMS",
    price: "25%",
    priceSuffix: "Revenue Share",
    note: "No upfront cost",
    ctaLabel: "START FOR FREE",
    description:
      "Full white-label dashboards, API access, and automated reporting pipelines.",
    features: [
      { text: "Everything in Pro" },
      { text: "White-label export" },
      { text: "REST API access" },
      { text: "Automated reports (PDF)" },
      { text: "SSO & team permissions" },
      { text: "100+ integrations" },
      { text: "Dedicated onboarding" },
    ],
    includedBadge: "PRO INCLUDED",
    accent: "#a855f7",
    accentRgb: "168,85,247",
    headerVisual: "nodes",
  },
  {
    badge: "ENTERPRISE",
    name: "ALERTS",
    price: "$99",
    priceSuffix: "Per Month",
    note: "Over 5 seats?",
    noteLink: { text: "Get better price", href: "#" },
    ctaLabel: "CONTACT SALES",
    description:
      "Real-time anomaly alerts, AI-driven insight digests, and SLA-backed uptime.",
    features: [
      { text: "Everything in Teams" },
      { text: "Real-time data alerts" },
      { text: "AI insight digests" },
      { text: "99.9% uptime SLA" },
      { text: "Custom model fine-tuning" },
      { text: "Dedicated infrastructure" },
      { text: "24/7 enterprise support" },
    ],
    includedBadge: "TEAMS INCLUDED",
    accent: "#f59e0b",
    accentRgb: "245,158,11",
    headerVisual: "bars",
    isNew: true,
  },
];

// ─── Header Visuals (SVG canvas art per plan) ─────────────────────────────────

function ScatterVisual({ accent }: { accent: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 280 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sg1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="140" cy="60" rx="100" ry="55" fill="url(#sg1)" />
      {[
        [40, 90],
        [55, 70],
        [70, 85],
        [90, 55],
        [105, 72],
        [120, 40],
        [135, 58],
        [150, 35],
        [165, 50],
        [180, 30],
        [195, 48],
        [210, 25],
        [225, 42],
        [240, 20],
        [80, 95],
        [160, 80],
        [200, 70],
        [100, 30],
        [130, 75],
        [175, 65],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 4 === 0 ? 3.5 : i % 3 === 0 ? 2.5 : 1.8}
          fill={accent}
          opacity={0.15 + (i % 5) * 0.12}
        />
      ))}
      {/* trend line */}
      <path
        d="M40 88 Q140 45 240 18"
        stroke={accent}
        strokeWidth="1"
        strokeOpacity="0.25"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

function WaveVisual({ accent }: { accent: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 280 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 80 C40 60 80 95 120 65 C160 35 200 75 240 50 C260 38 270 45 280 40 L280 120 L0 120Z"
        fill="url(#wg1)"
      />
      <path
        d="M0 80 C40 60 80 95 120 65 C160 35 200 75 240 50 C260 38 270 45 280 40"
        stroke={accent}
        strokeWidth="2"
        strokeOpacity="0.6"
      />
      <path
        d="M0 95 C50 75 90 105 140 80 C190 55 230 90 280 65"
        stroke={accent}
        strokeWidth="1"
        strokeOpacity="0.2"
        strokeDasharray="3 4"
      />
    </svg>
  );
}

function NodesVisual({ accent }: { accent: string }) {
  const nodes = [
    [60, 35],
    [140, 25],
    [220, 40],
    [100, 75],
    [180, 70],
    [60, 95],
    [220, 90],
    [140, 60],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 3],
    [1, 7],
    [2, 4],
    [3, 7],
    [4, 7],
    [3, 5],
    [4, 6],
    [7, 5],
    [7, 6],
  ];
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 280 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="ng1" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.1" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="140" cy="60" rx="120" ry="55" fill="url(#ng1)" />
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke={accent}
          strokeOpacity="0.2"
          strokeWidth="1"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === 7 ? 6 : 3.5}
          fill={accent}
          opacity={i === 7 ? 0.7 : 0.3}
        />
      ))}
    </svg>
  );
}

function BarsVisual({ accent }: { accent: string }) {
  const bars = [30, 55, 40, 75, 50, 90, 60, 80, 45, 70];
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 280 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.7" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={10 + i * 27}
          y={115 - h}
          width="18"
          height={h}
          rx="3"
          fill="url(#bg1)"
          opacity={0.5 + (i % 3) * 0.15}
        />
      ))}
      {/* sparkle dots on top bars */}
      {[5, 7].map((i) => (
        <circle
          key={i}
          cx={10 + i * 27 + 9}
          cy={115 - bars[i] - 5}
          r="2.5"
          fill={accent}
          opacity="0.9"
        />
      ))}
    </svg>
  );
}

// ─── Single Card ──────────────────────────────────────────────────────────────

function PlanCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const [hovered, setHovered] = useState(false);

  const Visual = {
    scatter: ScatterVisual,
    wave: WaveVisual,
    nodes: NodesVisual,
    bars: BarsVisual,
  }[plan.headerVisual];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: plan.highlight
          ? `linear-gradient(160deg, rgba(${plan.accentRgb},0.1) 0%, #0d1117 40%)`
          : "#0d1117",
        border:
          hovered || plan.highlight
            ? `1px solid rgba(${plan.accentRgb},0.4)`
            : "1px solid rgba(255,255,255,0.07)",
        boxShadow: hovered
          ? `0 0 40px rgba(${plan.accentRgb},0.15), 0 24px 48px rgba(0,0,0,0.6)`
          : plan.highlight
            ? `0 0 30px rgba(${plan.accentRgb},0.1), 0 16px 40px rgba(0,0,0,0.5)`
            : "0 8px 32px rgba(0,0,0,0.4)",
        transform: hovered ? "translateY(-4px)" : "none",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* MOST POPULAR ribbon */}
      {plan.highlight && (
        <div
          className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase z-10"
          style={{
            background: `rgba(${plan.accentRgb},0.15)`,
            border: `1px solid rgba(${plan.accentRgb},0.35)`,
            color: plan.accent,
          }}
        >
          Most Popular
        </div>
      )}

      {/* ── Header art area */}
      <div
        className="relative h-28 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(${plan.accentRgb},0.08) 0%, transparent 100%)`,
          borderBottom: `1px solid rgba(${plan.accentRgb},0.1)`,
        }}
      >
        <div className="absolute inset-0">
          <Visual accent={plan.accent} />
        </div>
        {/* Badge */}
        <div className="absolute top-3.5 left-4">
          <span
            className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: `1px solid rgba(${plan.accentRgb},0.25)`,
              color: `rgba(${plan.accentRgb},0.9)`,
              backdropFilter: "blur(4px)",
            }}
          >
            {plan.badge}
          </span>
        </div>
      </div>

      {/* ── Body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Plan name */}
        <h3
          className="text-[42px] font-black leading-none tracking-tight"
          style={{
            color: "#fff",
            fontFamily: "'Bricolage Grotesque', sans-serif",
          }}
        >
          {plan.name}
        </h3>

        {/* Price */}
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            {plan.priceOld && (
              <span
                className="text-lg font-bold line-through"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                {plan.priceOld}
              </span>
            )}
            <span
              className="text-3xl font-black"
              style={{
                color: "#fff",
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            >
              {plan.price}
            </span>
            {plan.isNew && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
                style={{ background: plan.accent, color: "#000" }}
              >
                NEW
              </span>
            )}
          </div>
          <p
            className="text-xs mt-0.5"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            {plan.priceSuffix}
          </p>
        </div>

        {/* CTA button */}
        <button
          className="w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            background: plan.highlight
              ? plan.accent
              : `rgba(${plan.accentRgb},0.12)`,
            color: plan.highlight ? "#000" : plan.accent,
            border: plan.highlight
              ? "none"
              : `1px solid rgba(${plan.accentRgb},0.3)`,
            boxShadow: plan.highlight
              ? `0 0 24px rgba(${plan.accentRgb},0.35)`
              : "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              plan.accent;
            (e.currentTarget as HTMLButtonElement).style.color = "#000";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              `0 0 28px rgba(${plan.accentRgb},0.45)`;
          }}
          onMouseLeave={(e) => {
            if (!plan.highlight) {
              (e.currentTarget as HTMLButtonElement).style.background =
                `rgba(${plan.accentRgb},0.12)`;
              (e.currentTarget as HTMLButtonElement).style.color = plan.accent;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }
          }}
        >
          {plan.ctaLabel}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7h10M8 3l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Note */}
        <p
          className="text-center text-[11px]"
          style={{ color: `rgba(${plan.accentRgb},0.6)` }}
        >
          {plan.note}
          {plan.noteLink && (
            <>
              {" "}
              <a
                href={plan.noteLink.href}
                className="underline underline-offset-2 hover:opacity-100 transition-opacity"
                style={{ color: plan.accent }}
              >
                {plan.noteLink.text}
              </a>
            </>
          )}
        </p>

        {/* Divider */}
        <div
          style={{ height: "1px", background: `rgba(${plan.accentRgb},0.1)` }}
        />

        {/* Description */}
        <p
          className="text-sm leading-relaxed font-medium"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {plan.description}
        </p>

        {/* Features */}
        <ul className="flex flex-col gap-2.5 flex-1">
          {plan.features.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              <span
                className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center mt-0.5"
                style={{ background: `rgba(${plan.accentRgb},0.12)` }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path
                    d="M1 4.5l2 2 4-4"
                    stroke={plan.accent}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {f.text}
            </li>
          ))}
        </ul>

        {/* Included badge */}
        {plan.includedBadge && (
          <div
            className="flex items-center gap-2.5 mt-2 px-3 py-2.5 rounded-xl"
            style={{
              background: `rgba(${plan.accentRgb},0.07)`,
              border: `1px solid rgba(${plan.accentRgb},0.15)`,
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: plan.accent }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1.5 5l2.5 2.5 4.5-4"
                  stroke="#000"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className="text-[11px] font-bold tracking-widest uppercase"
              style={{ color: plan.accent }}
            >
              FREE · {plan.includedBadge}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function PricingSection() {
  return (
    <>
      <section
        className="pricing-root relative overflow-hidden bg-neutral-100"
        style={{
          backgroundImage: `
              linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)
            `,
          backgroundSize: "40px 40px",
        }}  
      >
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{
                border: "1px solid rgba(6,182,212,0.25)",
                background: "rgba(6,182,212,0.06)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="pricing-mono text-[10px] text-cyan-400/80 tracking-[0.2em] uppercase">
                Pricing
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-cyan-400 tracking-tighter bg-black w-fit mx-auto p-2 rounded-lg leading-none mb-4">
              Plans that scale
             
                with your data.
            </h2>
            <p
              className="pricing-mono text-sm max-w-sm mx-auto"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Start free. Upgrade when you need it.
              <br />
              No hidden fees, ever.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className="pricing-card-enter"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <PlanCard plan={plan} index={i} />
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p
            className="pricing-mono text-center text-[11px] mt-10"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            All plans include SSL encryption · GDPR compliant · Cancel anytime
          </p>
        </div>
      </section>
    </>
  );
}
