"use client";

import React, { useState, useEffect, useRef } from "react";

function RibbonCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let t = 0;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const ribbons = [
      {
        color: "20,20,30",
        amp: 0.1,
        freq: 0.009,
        phase: 0,
        speed: 0.012,
        y: 0.3,
        thickness: 0,
      },
      {
        color: "60,130,255",
        amp: 0.08,
        freq: 0.011,
        phase: 1.5,
        speed: 0.009,
        y: 0.52,
        thickness: 0,
      },
      {
        color: "230,240,255",
        amp: 0.07,
        freq: 0.013,
        phase: 3,
        speed: 0.015,
        y: 0.72,
        thickness: 0,
      },
    ];

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      t += 0.01;

      ribbons.forEach((rb) => {
        const thickness = h * rb.thickness;

        for (let layer = 3; layer >= 0; layer--) {
          ctx.beginPath();

          for (let x = 0; x <= w; x += 3) {
            const y =
              h * rb.y +
              Math.sin(x * rb.freq + t * rb.speed * 60 + rb.phase) *
                h *
                rb.amp +
              layer * 3;

            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }

          for (let x = w; x >= 0; x -= 3) {
            const y =
              h * rb.y +
              Math.sin(x * rb.freq + t * rb.speed * 60 + rb.phase) *
                h *
                rb.amp +
              layer * 3 +
              thickness;

            ctx.lineTo(x, y);
          }

          ctx.closePath();
          ctx.fillStyle = `rgba(${rb.color},${0.06 - layer * 0.012})`;
          ctx.fill();
        }

        ctx.beginPath();

        for (let x = 0; x <= w; x += 3) {
          const y =
            h * rb.y +
            Math.sin(x * rb.freq + t * rb.speed * 60 + rb.phase) * h * rb.amp;

          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(${rb.color},0.28)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-l from-blue-400 via-slate-300 to-blue-400 px-4">
      <RibbonCanvas />

      <div className="relative z-10 w-full max-w-sm">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-300 via-blue-300 to-blue-300 opacity-20 blur-xl" />

        <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl shadow-blue-100/60 px-8 py-9 space-y-6">
          <div className="flex justify-center">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-200">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <polyline
                  points="22 12 18 12 15 21 9 3 6 12 2 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

type AuthFieldProps = {
  label: string;
  error?: { message?: string };
  registration: any;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
};

export function AuthField({
  label,
  error,
  registration,
  type = "text",
  placeholder,
  autoComplete,
}: AuthFieldProps) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-500 mb-1">
        {label}
      </label>

      <div className="relative">
        <input
          {...registration}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-3 py-[10px] text-sm rounded-lg outline-none transition 
          ${focused ? "bg-white" : "bg-[#f8f9ff]"} 
          ${error ? "border-red-400 border" : "border border-slate-200"} 
          focus:border-indigo-400`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            👁
          </button>
        )}
      </div>

      {error?.message && (
        <p className="text-xs text-red-400 mt-1">{error.message}</p>
      )}
    </div>
  );
}

type AuthButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
};

export function AuthButton({ children, loading }: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full mt-2 px-3 py-[11px] text-sm font-semibold text-white 
      bg-gradient-to-r from-[#6378ff] to-[#a855f7]
      rounded-[10px] flex gap-2 items-center justify-center
      shadow-[0_4px_16px_rgba(99,120,255,0.25)]
      disabled:opacity-70"
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
