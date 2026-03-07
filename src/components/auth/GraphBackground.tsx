"use client";

export default function GraphBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes drawMain {
          from { stroke-dashoffset: 1200; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes drawSec {
          from { stroke-dashoffset: 1200; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes areaReveal {
          0%,40% { opacity: 0; }
          100%   { opacity: 1; }
        }
        @keyframes barRise {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }
        @keyframes ringDraw {
          from { stroke-dashoffset: 175; }
          to   { stroke-dashoffset: 44;  }
        }
        @keyframes pulseRing {
          0%,100% { opacity: 0.6; transform: scale(1);    }
          50%     { opacity: 1;   transform: scale(1.04); }
        }
        @keyframes dotFloat {
          0%,100% { transform: translateY(0);    opacity: 0.4; }
          50%     { transform: translateY(-10px); opacity: 0.9; }
        }
        @keyframes scanX {
          0%   { transform: translateX(-300px); opacity: 0;   }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(110vw);  opacity: 0;   }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .draw-main {
          stroke-dasharray: 1200;
          animation: drawMain 2.8s cubic-bezier(0.4,0,0.2,1) 0.4s both;
        }
        .draw-sec {
          stroke-dasharray: 1200;
          animation: drawSec 2.8s cubic-bezier(0.4,0,0.2,1) 0.9s both;
        }
        .area-main { animation: areaReveal 3.2s ease 0.4s both; }
        .area-sec  { animation: areaReveal 3.2s ease 0.9s both; }
        .ring-draw {
          stroke-dasharray: 175;
          animation: ringDraw 1.8s cubic-bezier(0.4,0,0.2,1) 1.2s both;
        }
        .ring-pulse { animation: pulseRing 3s ease-in-out infinite; }
        .bar-rise {
          transform-origin: bottom;
          animation: barRise 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        .scan { animation: scanX 5s ease-in-out 1s infinite; }
      `}</style>

      {/* ── BASE GRID ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* ── SCAN SHIMMER ── */}
      <div
        className="scan absolute top-0 bottom-0 w-40"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,212,200,0.06) 50%, transparent 100%)",
        }}
      />

      {/* ── GLOW ORBS ── */}
      <div
        className="absolute top-[-120px] right-[-80px] w-[520px] h-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,200,0.1) 0%, rgba(0,212,200,0.03) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-80px] left-[-60px] w-[380px] h-[380px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,200,0.07) 0%, transparent 65%)",
        }}
      />

      {/* ════════════════════════════════
          MAIN LINE CHART — full width
          Anchored to bottom half
      ════════════════════════════════ */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="gMain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4c8" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#00d4c8" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#00d4c8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gSec" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4c8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#00d4c8" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter for main line */}
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Axis lines */}
        {[150, 250, 350, 450].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="1000"
            y2={y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}

        {/* Secondary line — area */}
        <path
          className="area-sec"
          d="M0,480 C120,460 220,430 340,410 S500,380 600,360 S750,330 880,310 L1000,300 L1000,600 L0,600 Z"
          fill="url(#gSec)"
        />

        {/* Main line — area */}
        <path
          className="area-main"
          d="M0,420 C100,390 200,340 320,300 S460,240 580,210 S720,170 860,140 L1000,120 L1000,600 L0,600 Z"
          fill="url(#gMain)"
        />

        {/* Secondary line — dashed */}
        <path
          className="draw-sec"
          d="M0,480 C120,460 220,430 340,410 S500,380 600,360 S750,330 880,310 L1000,300"
          fill="none"
          stroke="#00d4c8"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          strokeDasharray="8 5"
          strokeLinecap="round"
        />

        {/* Main line — solid with glow */}
        <path
          className="draw-main"
          d="M0,420 C100,390 200,340 320,300 S460,240 580,210 S720,170 860,140 L1000,120"
          fill="none"
          stroke="#00d4c8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineGlow)"
        />

        {/* Data point dots — main line */}
        {[
          [0, 420],
          [320, 300],
          [580, 210],
          [860, 140],
          [1000, 120],
        ].map(([cx, cy], i) => (
          <g
            key={i}
            style={{ animation: `fadeUp 0.4s ease ${1.6 + i * 0.15}s both` }}
          >
            {/* Outer ring */}
            <circle
              cx={cx}
              cy={cy}
              r="6"
              fill="none"
              stroke="#00d4c8"
              strokeWidth="1"
              strokeOpacity="0.4"
            >
              <animate
                attributeName="r"
                values="6;10;6"
                dur="3s"
                begin={`${i * 0.5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.4;0;0.4"
                dur="3s"
                begin={`${i * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
            {/* Inner dot */}
            <circle cx={cx} cy={cy} r="3" fill="#00d4c8">
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="3s"
                begin={`${i * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Value labels on 2 key points */}
        {[
          { x: 580, y: 196, label: "+42%" },
          { x: 860, y: 125, label: "+78%" },
        ].map((p) => (
          <g key={p.label} style={{ animation: `fadeUp 0.5s ease 2.2s both` }}>
            <rect
              x={p.x - 18}
              y={p.y - 16}
              width="38"
              height="14"
              fill="#0d1014"
              stroke="#1e2227"
              strokeWidth="1"
              rx="1"
            />
            <text
              x={p.x + 1}
              y={p.y - 6}
              fill="#00d4c8"
              fontSize="8"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontWeight="600"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {/* ════════════════════════════════
          BAR CHART — bottom left
          More bars, better proportioned
      ════════════════════════════════ */}
      <div
        className="absolute bottom-6 left-8 flex items-end gap-[5px]"
        style={{ opacity: 0.28, animation: "fadeUp 0.6s ease 1s both" }}
      >
        {[
          { h: 32, d: "1.0s" },
          { h: 48, d: "1.1s" },
          { h: 38, d: "1.2s" },
          { h: 62, d: "1.3s" },
          { h: 44, d: "1.4s" },
          { h: 75, d: "1.5s" },
          { h: 55, d: "1.6s" },
          { h: 88, d: "1.7s" },
          { h: 66, d: "1.8s" },
          { h: 95, d: "1.9s" },
        ].map((b, i) => (
          <div
            key={i}
            className="bar-rise w-3.5 rounded-t-sm"
            style={{
              height: `${b.h}px`,
              animationDelay: b.d,
              background:
                "linear-gradient(180deg, #00d4c8 0%, rgba(0,212,200,0.4) 100%)",
            }}
          />
        ))}
        {/* X-axis base line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#00d4c8] opacity-30" />
      </div>

      {/* ════════════════════════════════
          DONUT RING — top right
          Clean, prominent
      ════════════════════════════════ */}
      <div
        className="absolute top-10 right-14 ring-pulse"
        style={{
          animation:
            "fadeUp 0.5s ease 1.4s both, pulseRing 3s ease-in-out 2.5s infinite",
        }}
      >
        <svg width="72" height="72" viewBox="0 0 72 72">
          {/* Track */}
          <circle
            cx="36"
            cy="36"
            r="28"
            fill="none"
            stroke="#1e2227"
            strokeWidth="6"
          />
          {/* Main arc — 75% */}
          <circle
            className="ring-draw"
            cx="36"
            cy="36"
            r="28"
            fill="none"
            stroke="#00d4c8"
            strokeWidth="6"
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
          />
          {/* Center label */}
          <text
            x="36"
            y="40"
            fill="#00d4c8"
            fontSize="10"
            textAnchor="middle"
            fontFamily="sans-serif"
            fontWeight="700"
          >
            75%
          </text>
        </svg>
      </div>

      {/* ════════════════════════════════
          MINI SPARKLINE — top left
          Cleaner, better sized
      ════════════════════════════════ */}
      <svg
        className="absolute top-10 left-10"
        width="160"
        height="55"
        viewBox="0 0 160 55"
        style={{ opacity: 0.35, animation: "fadeUp 0.5s ease 1.2s both" }}
      >
        {/* Area */}
        <path
          d="M0,48 C20,42 38,22 58,26 S98,36 118,22 S142,10 160,12 L160,55 L0,55 Z"
          fill="rgba(0,212,200,0.12)"
          style={{ animation: "areaReveal 2s ease 1.4s both" }}
        />
        {/* Line */}
        <path
          className="draw-sec"
          d="M0,48 C20,42 38,22 58,26 S98,36 118,22 S142,10 160,12"
          fill="none"
          stroke="#00d4c8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* End dot */}
        <circle cx="160" cy="12" r="3" fill="#00d4c8">
          <animate
            attributeName="r"
            values="3;5;3"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* ════════════════════════════════
          FLOATING DOTS — scattered
      ════════════════════════════════ */}
      {[
        { l: "22%", t: "38%", delay: "0s", dur: "4s", size: "w-1.5 h-1.5" },
        { l: "78%", t: "42%", delay: "1.3s", dur: "5s", size: "w-1 h-1" },
        { l: "48%", t: "22%", delay: "0.7s", dur: "3.5s", size: "w-1 h-1" },
        { l: "62%", t: "68%", delay: "2.1s", dur: "4.5s", size: "w-1.5 h-1.5" },
        { l: "88%", t: "58%", delay: "0.4s", dur: "3.8s", size: "w-1 h-1" },
      ].map((d, i) => (
        <div
          key={i}
          className={`absolute ${d.size} rounded-full bg-[#00d4c8]`}
          style={{
            left: d.l,
            top: d.t,
            animation: `dotFloat ${d.dur} ease-in-out ${d.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
