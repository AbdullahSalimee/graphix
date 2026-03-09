"use client";
import { useState } from "react";
import { CYAN, BORDER, NAV_GROUPS } from "@/lib/Data";
import type { Tab } from "@/lib/Data";

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  chart: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  layout: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
};

function Svg({ name, size = 15 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

interface SidebarProps {
  open: boolean;
  tab: Tab;
  onTab: (t: Tab) => void;
  userName: string;
  userAvatar: string;
  userPlan: string;
}

export default function Sidebar({
  open,
  tab,
  onTab,
  userName,
  userAvatar,
  userPlan,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const width = open ? (collapsed ? "56px" : "224px") : "0px";
  const inner = collapsed ? "56px" : "224px";

  return (
    <aside
      className="flex-shrink-0 border-r flex flex-col z-20 overflow-hidden transition-all duration-300 bg-cyan-600"
      style={{ width, borderColor: BORDER }}
    >
      <div className="flex flex-col h-full" style={{ width: inner }}>
        {/* Logo row */}
        <div
          className="px-4 py-5 border-b flex items-center justify-between min-h-[58px]"
          style={{ borderColor: BORDER }}
        >
          {!collapsed && (
            <span className="font-syne font-extrabold text-[1.05rem] text-white tracking-tight">
              Graphix
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex flex-col gap-[4px] p-1.5 opacity-30 hover:opacity-90 transition-opacity ml-auto"
          >
            <span className="w-3.5 h-[1.5px] bg-white block" />
            <span className="w-3.5 h-[1.5px] bg-white block" />
            <span className="w-2.5  h-[1.5px] bg-white block" />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 py-3 overflow-y-auto flex flex-col gap-0.5 px-2">
          {NAV_GROUPS.map((grp) => (
            <div key={grp.label} className="mb-1">
              {!collapsed && (
                <p
                  className="text-[0.55rem] uppercase tracking-[0.18em] px-3 mb-1.5 mt-2.5"
                  style={{ color: "rgba(255,255,255,0.16)" }}
                >
                  {grp.label}
                </p>
              )}
              {grp.items.map((item) =>
                collapsed ? (
                  <button
                    key={item.id}
                    onClick={() => onTab(item.id)}
                    title={item.label}
                    className="w-full flex items-center justify-center p-3 mb-0.5 transition-all"
                    style={{
                      color: tab === item.id ? CYAN : "rgba(255,255,255,0.32)",
                      background: tab === item.id ? `${CYAN}14` : "transparent",
                    }}
                  >
                    <Svg name={item.icon} />
                  </button>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => onTab(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 transition-all relative"
                    style={{
                      color:
                        tab === item.id ? "white" : "rgba(255,255,255,0.38)",
                      background: tab === item.id ? `${CYAN}12` : "transparent",
                    }}
                  >
                    {tab === item.id && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full"
                        style={{ background: CYAN }}
                      />
                    )}
                    <span
                      className="w-4 h-4 flex-shrink-0"
                      style={{
                        color: tab === item.id ? CYAN : "rgba(255,255,255,0.3)",
                      }}
                    >
                      <Svg name={item.icon} />
                    </span>
                    <span className="flex-1 text-left font-syne font-medium text-[0.8rem]">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className="text-[0.57rem] px-1.5 py-0.5 font-syne font-bold rounded-sm"
                        style={{
                          background:
                            tab === item.id
                              ? `${CYAN}28`
                              : "rgba(255,255,255,0.07)",
                          color:
                            tab === item.id ? CYAN : "rgba(255,255,255,0.35)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                ),
              )}
            </div>
          ))}
        </nav>

        {/* User block */}
        {!collapsed ? (
          <div
            className="border-t p-4 flex items-center gap-3"
            style={{ borderColor: BORDER }}
          >
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center font-syne font-bold text-[0.68rem] flex-shrink-0"
              style={{ background: `${CYAN}22`, color: CYAN }}
            >
              {userAvatar}
            </div>
            <div className="min-w-0">
              <p className="text-[0.78rem] font-syne font-semibold text-white truncate">
                {userName}
              </p>
              <p className="text-[0.61rem] truncate" style={{ color: CYAN }}>
                {userPlan} plan
              </p>
            </div>
          </div>
        ) : (
          <div
            className="border-t p-3 flex justify-center"
            style={{ borderColor: BORDER }}
          >
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center font-syne font-bold text-[0.68rem]"
              style={{ background: `${CYAN}22`, color: CYAN }}
            >
              {userAvatar}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
