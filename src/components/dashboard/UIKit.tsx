import { useState } from "react";
import {
  CYAN,
  BG,
  W08,
  W12,
  W20,
  W35,
  W55,
  C08,
  C18,
  C35,
} from "@/lib/Tokens";

// ── Ico ──────────────────────────────────────────────────────
export function Ico({
  d,
  size = 16,
  stroke = "currentColor",
  fill = "none",
  sw = 1.75,
}: {
  d: string;
  size?: number;
  stroke?: string;
  fill?: string;
  sw?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

// ── Chip ─────────────────────────────────────────────────────
export function Chip({ children, cyan = false }: { children: React.ReactNode; cyan?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        background: cyan ? C18 : W08,
        color: cyan ? CYAN : W35,
        border: `1px solid ${cyan ? C35 : W12}`,
        borderRadius: 3,
      }}
    >
      {children}
    </span>
  );
}

// ── Btn ──────────────────────────────────────────────────────
export function Btn({
  children,
  onClick,
  variant = "fill",
  size = "md",
  style: sx = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "fill" | "ghost" | "outline";
  size?: "sm" | "md";
  style?: React.CSSProperties;
}) {
  const base = {
    cursor: "pointer",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    fontSize: size === "sm" ? 11 : 12,
    padding: size === "sm" ? "7px 14px" : "9px 20px",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.15s",
    borderRadius: 3,
    border: "none",
  };
  const v = {
    fill: { background: CYAN, color: BG, border: `1px solid ${CYAN}` },
    ghost: {
      background: "transparent",
      color: W35,
      border: `1px solid ${W12}`,
    },
    outline: {
      background: "transparent",
      color: CYAN,
      border: `1px solid ${C35}`,
    },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...v[variant], ...sx }}>
      {children}
    </button>
  );
}

// ── FieldInput ───────────────────────────────────────────────
export function FieldInput({ value, onChange, placeholder, mono = false }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; mono?: boolean }) {
  const [f, setF] = useState(false);
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
      style={{
        width: "100%",
        background: "transparent",
        outline: "none",
        border: `1px solid ${f ? CYAN : W12}`,
        borderRadius: 3,
        color: "#fff",
        padding: "10px 13px",
        fontSize: 13,
        fontFamily: mono ? "monospace" : "inherit",
        transition: "border-color 0.15s",
        boxSizing: "border-box",
      }}
    />
  );
}

// ── FieldTextarea ────────────────────────────────────────────
export function FieldTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  mono = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  mono?: boolean;
}) {
  const [f, setF] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
      style={{
        width: "100%",
        background: "transparent",
        outline: "none",
        resize: "vertical",
        border: `1px solid ${f ? CYAN : W12}`,
        borderRadius: 3,
        color: "#fff",
        padding: "10px 13px",
        fontSize: 13,
        lineHeight: 1.7,
        fontFamily: mono ? "monospace" : "inherit",
        transition: "border-color 0.15s",
        boxSizing: "border-box",
      }}
    />
  );
}

// ── FieldLabel ───────────────────────────────────────────────
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        color: W35,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

// ── SectionCard + SectionHead ────────────────────────────────
export function SectionCard({ children, style: sx = {} }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <div
      style={{
        border: `1px solid ${W12}`,
        borderRadius: 6,
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </div>
  );
}
export function SectionHead({ title, right }: { title: string, right?: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "14px 18px",
        borderBottom: `1px solid ${W08}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
        {title}
      </span>
      {right}
    </div>
  );
}

// ── StripeDivider ────────────────────────────────────────────
export function StripeDivider({ active = true }) {
  return (
    <div className="w-full my-5 h-2 bg-[repeating-linear-gradient(-45deg,black_0px,white_3px,transparent_3px,transparent_5px)]"></div>
  );
}

// ── BackBtn ──────────────────────────────────────────────────
export function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: CYAN,
        fontWeight: 600,
        fontSize: 11,
        marginBottom: 22,
        padding: 0,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      Back to Dashboard
    </button>
  );
}

// ── SuccessBanner ────────────────────────────────────────────
export function SuccessBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: C08,
        border: `1px solid ${C35}`,
        borderRadius: 6,
        padding: "11px 15px",
        display: "flex",
        alignItems: "center",
        gap: 9,
      }}
    >
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke={CYAN}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
      {children}
    </div>
  );
}

// ── DataTable ────────────────────────────────────────────────
export function DataTable({ rows }: { rows: (string | number)[][] }) {
  return (
    <div
      style={{
        border: `1px solid ${W12}`,
        borderRadius: 5,
        overflow: "hidden",
      }}
    >
      <table
        style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ background: W08 }}>
            {rows[0].map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  fontWeight: 700,
                  color: CYAN,
                  borderBottom: `1px solid ${W08}`,
                  borderRight:
                    i < rows[0].length - 1 ? `1px solid ${W08}` : "none",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, ri) => (
            <tr
              key={ri}
              style={{
                borderBottom:
                  ri < rows.length - 2 ? `1px solid ${W08}` : "none",
              }}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "9px 14px",
                    color: W55,
                    borderRight:
                      ci < row.length - 1 ? `1px solid ${W08}` : "none",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Stepper ──────────────────────────────────────────────────
export function Stepper({ steps, current }: { steps: [string, string][]; current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {steps.map(([n, l], i) => (
        <div key={n} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 4,
                border: `1.5px solid ${current >= Number(n) ? CYAN : W12}`,
                background: current >= Number(n) ? CYAN : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
                color: current >= Number(n) ? BG : W35,
                transition: "all 0.2s",
              }}
            >
              {n}
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: current >= Number(n) ? "#fff" : W35,
              }}
            >
              {l}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                width: 36,
                height: 1.5,
                margin: "0 10px",
                background: current > i + 1 ? CYAN : W08,
                borderRadius: 1,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── MiniStepper ──────────────────────────────────────────────
export function MiniStepper({ steps, current }: { steps: [string, string][]; current: string }) {
  const ci = steps.findIndex((s) => s[0] === current);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 26,
        fontSize: 12,
      }}
    >
      {steps.map(([id, label], i) => {
        const active = current === id,
          past = ci > i;
        return (
          <div
            key={id}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 3,
                  border: `1.5px solid ${active || past ? CYAN : W12}`,
                  background: active || past ? CYAN : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  color: active || past ? BG : W35,
                }}
              >
                {past ? "✓" : i + 1}
              </div>
              <span
                style={{
                  color: active ? "#fff" : W35,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 22,
                  height: 1.5,
                  background: past ? CYAN : W08,
                  borderRadius: 1,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── ActionCard ───────────────────────────────────────────────
export function ActionCard({
  icon,
  label,
  sub,
  cta,
  onClick,
  primary = false,
}: {
  icon: string;
  label: string;
  sub: string;
  cta: string;
  onClick: () => void;
  primary?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        background: hov && primary ? C08 : "transparent",
        border: `1px solid ${hov ? (primary ? CYAN : W20) : W08}`,
        borderRadius: 6,
        padding: "20px 14px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 9,
        textAlign: "center",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 6,
          background: primary ? C18 : W08,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: primary ? CYAN : W55,
          border: `1px solid ${primary ? C35 : W08}`,
        }}
      >
        <Ico d={icon} size={18} />
      </div>
      <div>
        <div
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 3,
          }}
        >
          {label}
        </div>
        <div style={{ color: W35, fontSize: 12 }}>{sub}</div>
      </div>
      <div
        style={{
          color: CYAN,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          opacity: hov ? 1 : 0,
          transition: "opacity 0.15s",
        }}
      >
        {cta} →
      </div>
    </button>
  );
}
