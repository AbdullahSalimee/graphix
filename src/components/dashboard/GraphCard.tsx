"use client";
import { useEffect, useRef, useState } from "react";
import { CYAN, BORDER } from "@/lib/Data";
import type { Graph } from "@/lib/Data";

function Sparkline({ data, hover }: { data: number[]; hover: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const w = (c.width = c.offsetWidth),
      h = (c.height = c.offsetHeight);
    const mn = Math.min(...data),
      mx = Math.max(...data),
      rng = mx - mn || 1;
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * w,
      y: h - ((v - mn) / rng) * (h - 14) - 7,
    }));
    ctx.clearRect(0, 0, w, h);
    const ag = ctx.createLinearGradient(0, 0, 0, h);
    ag.addColorStop(
      0,
      hover ? "rgba(8,145,178,0.22)" : "rgba(255,255,255,0.07)",
    );
    ag.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.moveTo(pts[0].x, h);
    ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cx, pts[i - 1].y, cx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.lineTo(pts[pts.length - 1].x, h);
    ctx.closePath();
    ctx.fillStyle = ag;
    ctx.fill();
    if (hover) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const cx = (pts[i - 1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(cx, pts[i - 1].y, cx, pts[i].y, pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = "rgba(8,145,178,0.3)";
      ctx.lineWidth = 8;
      ctx.filter = "blur(5px)";
      ctx.stroke();
      ctx.filter = "none";
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cx, pts[i - 1].y, cx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = hover ? CYAN : "rgba(255,255,255,0.6)";
    ctx.lineWidth = hover ? 2 : 1.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, hover ? 4 : 3, 0, Math.PI * 2);
    ctx.fillStyle = hover ? CYAN : "white";
    ctx.fill();
    if (hover) {
      ctx.beginPath();
      ctx.arc(last.x, last.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = `${CYAN}55`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [data, hover]);
  return <canvas ref={ref} className="w-full h-full" />;
}

export default function GraphCard({
  graph,
  index = 0,
}: {
  graph: Graph;
  index?: number;
}) {
  const [vis, setVis] = useState(false);
  const [hover, setHover] = useState(false);
  const [starred, setStar] = useState(graph.starred);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative flex flex-col overflow-hidden cursor-pointer"
      style={{
        background: "#0a0d10",
        border: "1px solid",
        borderColor: hover ? CYAN : BORDER,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.5s ease ${index * 0.055}s, transform 0.5s ease ${index * 0.055}s, border-color 0.2s`,
      }}
    >
      {/* Cyan top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-300"
        style={{
          background: hover
            ? `linear-gradient(90deg,${CYAN},transparent)`
            : "transparent",
        }}
      />

      {/* Sparkline area */}
      <div
        className="relative h-[110px] overflow-hidden transition-colors duration-200"
        style={{ background: hover ? `${CYAN}06` : "#090b0e" }}
      >
        <div className="absolute inset-0 px-4 pt-4 pb-1">
          <Sparkline data={graph.data} hover={hover} />
        </div>
        <div
          className="absolute top-3 left-3 px-2 py-0.5 text-[0.57rem] uppercase tracking-[0.12em] font-syne font-bold border transition-all duration-200"
          style={{
            color: hover ? CYAN : "rgba(255,255,255,0.32)",
            borderColor: hover ? `${CYAN}55` : BORDER,
            background: hover ? `${CYAN}12` : "transparent",
          }}
        >
          {graph.tag}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setStar((s) => !s);
          }}
          className="absolute top-3 right-3 hover:scale-110 transition-transform duration-150"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={starred ? CYAN : "none"}
            stroke={starred ? CYAN : "rgba(255,255,255,0.22)"}
            strokeWidth="1.8"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>

      {/* Animated separator */}
      <div
        className="h-[1px] relative overflow-hidden"
        style={{ background: BORDER }}
      >
        {hover && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(-45deg,transparent 0,transparent 3px,${CYAN}55 3px,${CYAN}55 6px)`,
              backgroundSize: "9px 9px",
              animation: "diagMove 1.2s linear infinite",
            }}
          />
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-syne font-bold text-[0.92rem] text-white leading-tight">
              {graph.title}
            </h3>
            <p
              className="text-[0.71rem] mt-0.5 leading-snug line-clamp-1"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              {graph.desc}
            </p>
          </div>
          <span
            className="text-[0.7rem] font-syne font-bold flex-shrink-0 px-1.5 py-0.5 border"
            style={{
              color: graph.trendUp ? CYAN : "rgba(255,90,90,0.75)",
              borderColor: graph.trendUp ? `${CYAN}44` : "rgba(255,90,90,0.25)",
              background: graph.trendUp ? `${CYAN}10` : "rgba(255,90,90,0.08)",
            }}
          >
            {graph.trend}
          </span>
        </div>
        <span
          className="text-[0.6rem] uppercase tracking-[0.1em] border px-2 py-0.5 self-start transition-all duration-200"
          style={{
            color: hover ? CYAN : "rgba(255,255,255,0.22)",
            borderColor: hover ? `${CYAN}44` : BORDER,
          }}
        >
          {graph.category}
        </span>
        <div
          className="flex items-center justify-between mt-auto pt-2.5 border-t"
          style={{ borderColor: BORDER }}
        >
          <span
            className="text-[0.67rem]"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            {graph.updated}
          </span>
          <span
            className="text-[0.67rem] flex items-center gap-1"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {graph.views}
          </span>
        </div>
      </div>

      {/* Hover CTA bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex transition-all duration-200"
        style={{
          opacity: hover ? 1 : 0,
          transform: hover ? "translateY(0)" : "translateY(6px)",
        }}
      >
        <button
          className="flex-1 py-2 text-[0.68rem] font-syne font-bold uppercase tracking-widest text-[#090b0e]"
          style={{ background: CYAN }}
        >
          Open →
        </button>
        <button
          className="px-3 py-2 border-l border-[#0a7a96] text-[rgba(255,255,255,0.75)] hover:text-white transition-colors"
          style={{ background: CYAN }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>
    </div>
  );
}
