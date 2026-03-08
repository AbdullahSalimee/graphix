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
        /* ── Sidebar slide + fade ── */
        .sb-aside {
          transition:
            width 0.32s cubic-bezier(0.4, 0, 0.2, 1),
            min-width 0.32s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.32s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.22s ease;
        }

        /* Labels + non-icon content fade out when collapsing */
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

        /* Tooltip on collapsed icons */
        .sb-tip {
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%) translateX(-4px);
          background: #171717;
          color: #fff;
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
        }
        .sb-aside.collapsed .sb-tip-trigger:hover .sb-tip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        /* Collapse toggle button */
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
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .sb-toggle:hover {
          background: #171717;
          border-color: #171717;
          color: white;
        }
        .sb-toggle svg {
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .sb-aside.collapsed .sb-toggle svg {
          transform: rotate(180deg);
        }

        /* Nav item pulse dot */
        @keyframes pulseDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(23,23,23,0.4); }
          50%       { opacity: 0.5; box-shadow: 0 0 0 3px rgba(23,23,23,0); }
        }
        .pulse-dot { animation: pulseDot 2.4s ease infinite; }

        /* Slide-in on mount */
        @keyframes sbSlideIn {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .sb-mount { animation: sbSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }

        /* Conversation item hover bar */
        .conv-item::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 2px;
          border-radius: 2px;
          background: #171717;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .conv-item:hover::before,
        .conv-item.active::before { opacity: 1; }
      `}</style>

      <aside
        className={`sb-mount sb-aside${collapsed ? " collapsed" : ""} relative flex flex-col flex-shrink-0 h-dvh bg-neutral-50 border-r border-[#111212]/20  z-10 max-sm:fixed max-sm:left-0 max-sm:top-0 max-sm:shadow-2xl`}
        style={{ width: collapsed ? 64 : 256, minWidth: collapsed ? 64 : 256 }}
      >
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #a8a29e 1px, transparent 1px)",
            backgroundSize: "18px 18px",
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

        {/* Content layer */}
        <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* ── Header ── */}
          <div
            className="bg-white border-b border-neutral-200 px-3 pb-3"
            style={{ paddingTop: "max(1.2rem, env(safe-area-inset-top))" }}
          >
            <div className="flex items-center justify-between mb-3">
              {/* Logo */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-9 h-9 rounded-[9px] bg-neutral-900 flex items-end justify-center pb-1.5 flex-shrink-0 shadow-md overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  <div className="flex items-end gap-[2.5px] h-3.5">
                    <span
                      className="w-[3px] rounded-t-sm bg-white/50"
                      style={{ height: "6px" }}
                    />
                    <span
                      className="w-[3px] rounded-t-sm bg-white/75"
                      style={{ height: "10px" }}
                    />
                    <span
                      className="w-[3px] rounded-t-sm bg-white"
                      style={{ height: "14px" }}
                    />
                    <span
                      className="w-[3px] rounded-t-sm bg-white/60"
                      style={{ height: "8px" }}
                    />
                  </div>
                </div>

                <div className="sb-label min-w-0">
                  <p className="text-[15px] font-black tracking-[-0.03em] text-neutral-900 leading-none">
                    Graph AI
                  </p>
                  <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mt-0.5 block">
                    v2.0 · Studio
                  </span>
                </div>
              </div>

              {/* Close button — hidden when collapsed */}
              <button
                onClick={onClose}
                aria-label="Close sidebar"
                className={`sb-label min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:bg-neutral-100 hover:border-neutral-300 hover:text-neutral-700 transition-all duration-150 flex-shrink-0`}
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

            {/* Stats strip — hidden when collapsed */}
            
          </div>

          {/* ── Body ── */}
          <div
            className="flex-1  py-3 flex flex-col gap-px overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#e5e7eb transparent",
              padding: collapsed ? "12px 8px" : "12px 10px",
            }}
          >
            {/* New conversation */}
            <div className="relative sb-tip-trigger mb-2 ">
              <button
                onClick={onNew}
                className={`new-btn w-full flex items-center min-h-[44px] rounded-lg border border-neutral-300 bg-white text-neutral-600 text-[12.5px] font-semibold tracking-tight shadow-sm hover:bg-neutral-900 hover:border-neutral-900 hover:text-white hover:shadow-lg hover:-translate-y-px transition-all duration-150 touch-manipulation ${collapsed ? "justify-center px-0" : "gap-2.5 px-3.5"}`}
              >
                <span className="new-btn-icon w-[22px] h-[22px] rounded-md bg-neutral-100 text-neutral-500 flex items-center justify-center flex-shrink-0">
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
                  <span className="new-btn-arrow text-sm ml-auto">→</span>
                )}
              </button>
             
            </div>

            {/* Section divider */}
            {!collapsed && (
              <div className="flex items-center gap-2 px-2 pt-1 pb-1.5">
                <span className="flex-1 h-px bg-neutral-200" />
                <span className="font-mono text-[9px] tracking-widest uppercase text-neutral-300">
                  Recent
                </span>
                <span className="flex-1 h-px bg-neutral-200" />
              </div>
            )}
            {collapsed && <div className="h-px bg-neutral-200 my-1 mx-1" />}

            {/* Empty state */}
            {conversations.length === 0 && !collapsed && (
              <div className="anim-fadeup flex flex-col items-center gap-1.5 py-5">
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
                      className="rounded-sm bg-neutral-200"
                      style={{
                        opacity: i % 3 === 0 ? 1 : i % 2 === 0 ? 0.45 : 0.7,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[11.5px] text-neutral-400 font-medium">
                  No conversations yet
                </span>
              </div>
            )}

            {/* Conversation list */}
            {conversations.map((conv, i) => {
              const isActive = conv.id === activeId;
              const delayClass = `anim-delay-${Math.min(i + 1, 5)}`;
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
                    className={`conv-item anim-fadeup ${delayClass} relative w-full text-left flex items-center min-h-[44px] rounded-lg border text-[12.5px] font-medium tracking-tight transition-all duration-100 touch-manipulation
                      ${collapsed ? "justify-center px-0 gap-0" : "gap-2.5 px-2.5"}
                      ${
                        isActive
                          ? "bg-white border-neutral-200 text-neutral-900 shadow-sm"
                          : "bg-transparent border-transparent text-neutral-400 hover:bg-neutral-100 hover:border-neutral-200 hover:text-neutral-600 active"
                      }`}
                  >
                    {collapsed ? (
                      /* Collapsed: show initials avatar */
                      <span
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black tracking-tight flex-shrink-0 ${isActive ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"}`}
                      >
                        {initials || String(i + 1).padStart(2, "0")}
                      </span>
                    ) : (
                      <>
                        <span
                          className={`w-[5px] h-[5px] rounded-full flex-shrink-0 transition-colors duration-150 ${isActive ? "bg-neutral-800 pulse-dot" : "bg-neutral-300"}`}
                        />
                        <span className="flex-1 truncate">{conv.title}</span>
                        <span className="font-mono text-[9px] text-neutral-300 flex-shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Footer ── */}
          <div
            className="border-t border-neutral-200 bg-white"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <div
              className={`flex items-center py-3 ${collapsed ? "justify-center px-2" : "gap-2.5 px-3.5"}`}
            >
              <div className="relative sb-tip-trigger">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
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
                <span className="block text-[12px] font-bold text-neutral-900 leading-none tracking-tight">
                  Workspace
                </span>
                <span className="block font-mono text-[9.5px] text-neutral-400 uppercase tracking-widest mt-0.5">
                  Free plan
                </span>
              </div>

              {!collapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-green-500 flex-shrink-0 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]" />
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
