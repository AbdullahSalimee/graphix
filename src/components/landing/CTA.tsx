"use client";

import { MutableRefObject, useEffect, useRef } from "react";
import useReveal from "./useReveal";
import {
  Bars3DChart,
  GlowAreaChart,
  RichDonut,
  BeautifulHeatmap,
} from "./Section";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface CTAProps {
  onLaunch: () => void;
}

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  speed: number;
  offset: number;
}

type RevealRef = MutableRefObject<HTMLDivElement | null>;

// ─── STAR CANVAS ──────────────────────────────────────────────────────────────

function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = 0,
      H = 0;

    const stars: Star[] = Array.from({ length: 160 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.004 + 0.001,
      offset: Math.random() * Math.PI * 2,
    }));

    function resize() {
      if (!canvas) return;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, W, H);
      for (const s of stars) {
        const pulse =
          s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.offset));
        ctx!.beginPath();
        ctx!.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(180,220,255,${pulse})`;
        ctx!.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
    />
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

export default function CTA({ onLaunch }: CTAProps) {
  const ref = useReveal() as RevealRef;

  return (
    <section
      className="relative z-10 px-8 py-36 text-center overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0a1628 0%, #0d1f3c 50%, #081220 100%)",
      }}
    >
      {/* Starfield */}
      <StarCanvas />
      {/* Horizon glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[180px] bg-[radial-gradient(ellipse_at_50%_100%,rgba(56,189,248,0.07),transparent_70%)]" />
      {/* Radial glow */}
      <div className="pointer-events-none absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(56,189,248,0.06),transparent_70%)]" />
      {/* Floating charts */}
      {/* chart-3: top 13% left 5%, rotate 13deg, floatA */}
      <Bars3DChart
        className="[--r:13deg] top-[13%] left-[5%] [animation:floatA_4.3s_ease-in-out_infinite_0.8s]"
        style={{ background: "black" }}
      />
      <GlowAreaChart
        className="[--r:40deg] top-[50%] left-[11%] [animation:floatA_4.3s_ease-in-out_infinite_0.8s]"
        style={{ background: "black" }}
      />
      <RichDonut
        className="[--r:10deg] top-[51%] right-[10%] [animation:floatB_5s_ease-in-out_infinite_0.3s]"
        style={{ background: "black" }}
      />
      <BeautifulHeatmap
        className="[--r:13deg] top-[10%] right-[5%] [animation:floatA_4.3s_ease-in-out_infinite_0.8s]"
        style={{ background: "black" }}
      />{" "}
      {/* Content */}
      <div ref={ref} className="relative z-10">
        <div className="font-mono text-[0.63rem] tracking-[0.16em] uppercase text-sky-400/75 mb-8">
          Get started today
        </div>

        <h2
          className="font-bold text-slate-200 tracking-tight leading-[0.97] mb-6"
          style={{ fontSize: "clamp(3rem,7vw,6.5rem)" }}
        >
          Start making
          <br />
          <em className="not-italic text-sky-400">beautiful charts</em>
          <br />
          right now.
        </h2>

        <p className="text-slate-400 leading-[1.8] mb-10">
          Free to use. No signup. 87 chart types. Instant results.
        </p>

        <button
          onClick={onLaunch}
          className="
            relative overflow-hidden
            px-11 py-4 text-[1.05rem]
            bg-gradient-to-r from-sky-700 to-sky-600
            text-white font-semibold rounded-xl tracking-wide
            shadow-[0_4px_32px_rgba(56,189,248,0.25)]
            transition-all duration-200
            hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(56,189,248,0.35)]
            after:content-[''] after:absolute after:inset-0
            after:bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.18)_50%,transparent_60%)]
            after:-translate-x-full after:transition-transform after:duration-500
            hover:after:translate-x-full
          "
        >
          Launch Graphy AI →
        </button>
      </div>
      {/* Keyframes needed for float animations */}
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px)   rotate(var(--r, 0deg)); }
          50%       { transform: translateY(-12px) rotate(var(--r, 0deg)); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px)  rotate(var(--r, 0deg)); }
          50%       { transform: translateY(-8px) rotate(var(--r, 0deg)); }
        }
      `}</style>
    </section>
  );
}
