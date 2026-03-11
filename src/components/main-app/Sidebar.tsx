// components/Sidebar.tsx
"use client";

import { useState } from "react";

interface Conversation {
  id: string;
  title: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      <style>{`
        .sb-aside {
          transition:
            width 0.32s cubic-bezier(0.4, 0, 0.2, 1),
            min-width 0.32s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.32s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.22s ease;
        }
        .sb-label {
          transition: opacity 0.18s ease, max-width 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.22s ease;
          overflow: hidden;
          white-space: nowrap;
        }
        .sb-aside.collapsed .sb-label {
          opacity: 0;
          max-width: 0 !important;
          transform: translateX(-6px);
          pointer-events: none;
        }
        .sb-aside:not(.collapsed) .sb-label {
          opacity: 1;
          max-width: 200px;
          transform: translateX(0);
        }
        .sb-tip {
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%) translateX(-4px);
          background: #0f172a;
          color: #e2e8f0;
          font-size: 11px;
          font-family: monospace;
          letter-spacing: 0.06em;
          padding: 4px 8px;
          border-radius: 5px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease;
          z-index: 50;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        .sb-aside.collapsed .sb-tip-trigger:hover .sb-tip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
        .sb-toggle {
          position: absolute;
          top: 50%;
          right: -12px;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 1.5px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          transition: background 0.15s, border-color 0.15s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        .sb-toggle:hover {
          background: #0f172a;
          border-color: #0f172a;
          color: white;
        }
        .sb-toggle svg {
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .sb-aside.collapsed .sb-toggle svg {
          transform: rotate(180deg);
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .pulse-dot { animation: pulseDot 2.4s ease infinite; }
        @keyframes sbSlideIn {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .sb-mount { animation: sbSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .conv-item::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 2px;
          border-radius: 2px;
          background: #22d3ee;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .conv-item:hover::before { opacity: 0.5; }
        .conv-item.conv-active::before { opacity: 1; }
      `}</style>

      <aside
        className={`sb-mount sb-aside${collapsed ? " collapsed" : ""} relative flex flex-col flex-shrink-0 h-dvh z-10 max-sm:fixed max-sm:left-0 max-sm:top-0 max-sm:shadow-2xl`}
        style={{
          width: collapsed ? 64 : 256,
          minWidth: collapsed ? 64 : 256,
          /* ✅ Deep ink — no more flat cyan */
          background:
            "linear-gradient(180deg, #0d1117 0%, #111827 60%, #0d1117 100%)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] z-10"
          style={{
            background:
              "linear-gradient(90deg, transparent, #22d3ee 40%, #818cf8 80%, transparent)",
          }}
        />

        {/* Collapse toggle */}
        <button
          className="sb-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header */}
          <div
            className="px-3 pb-3"
            style={{
              paddingTop: "max(1.2rem, env(safe-area-inset-top))",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="relative w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #164e63 0%, #0e7490 100%)",
                    border: "1px solid rgba(34,211,238,0.2)",
                    boxShadow: "0 0 0 3px rgba(34,211,238,0.06)",
                  }}
                >
                  <img src="/logo.png" alt="" className="h-6 invert" />
                </div>
                <div className="sb-label min-w-0">
                  <p className="text-[15px] font-black tracking-[-0.03em] text-white leading-none">
                    Graph AI
                  </p>
                  <span
                    className="font-mono text-[9px] uppercase tracking-widest mt-0.5 block"
                    style={{ color: "#22d3ee" }}
                  >
                    v2.0 · Studio
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close sidebar"
                className="sb-label min-w-[30px] min-h-[30px] flex items-center justify-center rounded-lg transition-all duration-150 flex-shrink-0"
                style={{
                  color: "rgba(255,255,255,0.25)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,0.75)";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,0.25)";
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div
            className="flex-1 flex flex-col gap-px overflow-y-auto"
            style={{
              padding: collapsed ? "12px 8px" : "12px 10px",
              scrollbarWidth: "none",
            }}
          >
            {/* New conversation */}
            <div className="relative sb-tip-trigger mb-2">
              <button
                onClick={onNew}
                className={`w-full flex items-center min-h-[40px] rounded-lg text-[12.5px] font-semibold tracking-tight touch-manipulation transition-all duration-150 ${collapsed ? "justify-center px-0" : "gap-2.5 px-3"}`}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.6)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.09)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.16)";
                  (e.currentTarget as HTMLElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.09)";
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,0.6)";
                }}
              >
                <span
                  className="w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(34,211,238,0.12)",
                    color: "#22d3ee",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                <span className="sb-label">New conversation</span>
                {!collapsed && (
                  <span
                    className="ml-auto text-xs"
                    style={{ color: "rgba(255,255,255,0.18)" }}
                  >
                    ↵
                  </span>
                )}
              </button>
              {collapsed && <span className="sb-tip">New conversation</span>}
            </div>

            {/* Divider */}
            {!collapsed && (
              <div className="flex items-center gap-2 px-2 pt-1 pb-1.5">
                <span
                  className="flex-1 h-px"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <span
                  className="font-mono text-[9px] tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.15)" }}
                >
                  Recent
                </span>
                <span
                  className="flex-1 h-px"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            )}
            {collapsed && (
              <div
                className="h-px my-1 mx-1"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            )}

            {conversations.length === 0 && !collapsed && (
              <div className="flex flex-col items-center gap-1.5 py-6">
                <div
                  className="grid gap-[3px] mb-1"
                  style={{
                    gridTemplateColumns: "repeat(3, 8px)",
                    gridTemplateRows: "repeat(3, 8px)",
                  }}
                >
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-sm"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        opacity: i % 3 === 0 ? 1 : i % 2 === 0 ? 0.4 : 0.65,
                      }}
                    />
                  ))}
                </div>
                <span
                  className="text-[11.5px] font-medium"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  No conversations yet
                </span>
              </div>
            )}

            {conversations.map((conv, i) => {
              const isActive = conv.id === activeId;
              const initials = conv.title
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div key={conv.id} className="relative sb-tip-trigger">
                  <button
                    onClick={() => onSelect(conv.id)}
                    className={`conv-item ${isActive ? "conv-active" : ""} relative w-full text-left flex items-center min-h-[40px] rounded-lg text-[12.5px] font-medium tracking-tight transition-all duration-100 touch-manipulation ${collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"}`}
                    style={{
                      background: isActive
                        ? "rgba(255,255,255,0.07)"
                        : "transparent",
                      border: `1px solid ${isActive ? "rgba(255,255,255,0.1)" : "transparent"}`,
                      color: isActive
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.35)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.05)";
                        (e.currentTarget as HTMLElement).style.color =
                          "rgba(255,255,255,0.65)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                        (e.currentTarget as HTMLElement).style.color =
                          "rgba(255,255,255,0.35)";
                      }
                    }}
                  >
                    {collapsed ? (
                      <span
                        className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0"
                        style={{
                          background: isActive
                            ? "rgba(34,211,238,0.14)"
                            : "rgba(255,255,255,0.05)",
                          color: isActive ? "#22d3ee" : "rgba(255,255,255,0.3)",
                          border: isActive
                            ? "1px solid rgba(34,211,238,0.22)"
                            : "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {initials || String(i + 1).padStart(2, "0")}
                      </span>
                    ) : (
                      <>
                        <span
                          className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                          style={{
                            background: isActive
                              ? "#22d3ee"
                              : "rgba(255,255,255,0.15)",
                          }}
                        />
                        <span className="flex-1 truncate">{conv.title}</span>
                        <span
                          className="font-mono text-[9px] flex-shrink-0"
                          style={{ color: "rgba(255,255,255,0.12)" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </>
                    )}
                  </button>
                  {collapsed && <span className="sb-tip">{conv.title}</span>}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="py-3"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              paddingBottom: "max(12px, env(safe-area-inset-bottom))",
            }}
          >
            <div
              className={`flex items-center ${collapsed ? "justify-center px-2" : "gap-2.5 px-3.5"}`}
            >
              <div className="relative sb-tip-trigger">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
                {collapsed && (
                  <span className="sb-tip">Workspace · Free plan</span>
                )}
              </div>
              <div className="sb-label min-w-0">
                <span
                  className="block text-[12px] font-bold leading-none tracking-tight"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Workspace
                </span>
                <span
                  className="block font-mono text-[9.5px] uppercase tracking-widest mt-0.5"
                  style={{ color: "rgba(255,255,255,0.22)" }}
                >
                  Free plan
                </span>
              </div>
              {!collapsed && (
                <div
                  className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: "#10b981",
                    boxShadow: "0 0 0 3px rgba(16,185,129,0.18)",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
