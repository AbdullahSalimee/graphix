"use client";

import React, { useState, useEffect, useRef } from "react";

function RibbonCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    let t = 0,
      raf;
    const r = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    r();
    window.addEventListener("resize", r);
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
    const d = () => {
      const w = canvas.width,
        h = canvas.height;
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
      raf = requestAnimationFrame(d);
    };
    d();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", r);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-l from-blue-400 via-slate-300 to-blue-400 px-4">
      <RibbonCanvas />

      <div className="relative z-10 w-full max-w-sm">
        {/* Glow ring behind card */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-300 via-blue-300 to-blue-300 opacity-20 blur-xl" />

        <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl shadow-blue-100/60 px-8 py-9 space-y-6">
          {/* Logo */}
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

          {/* Heading */}
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

export function AuthField({
  label,
  error,
  registration,
  type = "text",
  placeholder,
  autocomplete,
}: {
  label: string;
  error?: { message: string };
  registration: any;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}): React.ReactNode {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === "password";
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "#64748b",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          {...registration}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "10px 14px",
            paddingRight: isPassword ? 40 : 14,
            fontSize: 14,
            color: "#1e1b4b",
            background: focused ? "#fff" : "#f8f9ff",
            border: `1.5px solid ${error ? "#f87171" : focused ? "#6378ff" : "#e2e8f0"}`,
            borderRadius: 10,
            outline: "none",
            transition: "all 0.18s",
            boxSizing: "border-box",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              padding: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {show ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
      {error && (
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#f87171" }}>
          {error.message}
        </p>
      )}
    </div>
  );
}

export function AuthButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}): React.ReactNode {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full mt-2 px-3 py-[11px] text-sm font-semibold text-white 
  bg-gradient-to-r from-[#6378ff] to-[#a855f7]
  rounded-[10px] border-none
  flex gap-2 items-center justify-center
  shadow-[0_4px_16px_rgba(99,120,255,0.25)]
  transition-opacity duration-200
  disabled:opacity-70 disabled:cursor-not-allowed
  hover:cursor-pointer
  "
    >
      {loading ? (
        <svg
          style={{ animation: "spin 1s linear infinite" }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}

// Demo
export default function Demo() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const reg = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account">
      <AuthField
        label="Email"
        type="email"
        registration={reg("email")}
        placeholder="you@example.com"
      />
      <AuthField
        label="Password"
        type="password"
        registration={reg("password")}
        placeholder="••••••••"
      />
      <div style={{ textAlign: "right", marginTop: -8, marginBottom: 8 }}>
        <a
          href="#"
          style={{ fontSize: 12, color: "#6378ff", textDecoration: "none" }}
        >
          Forgot password?
        </a>
      </div>
      <AuthButton loading={loading}>Sign In</AuthButton>
      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "#94a3b8",
          marginTop: 20,
          marginBottom: 0,
        }}
      >
        No account?{" "}
        <a
          href="#"
          style={{ color: "#6378ff", textDecoration: "none", fontWeight: 600 }}
        >
          Sign up
        </a>
      </p>
    </AuthCard>
  );
}
