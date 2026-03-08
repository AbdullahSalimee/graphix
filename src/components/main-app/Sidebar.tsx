// components/Sidebar.tsx
"use client";

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
  return (
    <>
     

      <aside className="anim-slidein relative flex flex-col w-64 flex-shrink-0 h-dvh bg-neutral-50 border-r border-neutral-200 z-10 max-sm:fixed max-sm:left-0 max-sm:top-0 max-sm:w-[min(256px,84vw)] max-sm:shadow-2xl">
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #a8a29e 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        {/* Content layer */}
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          {/* ── Header ── */}
          <div
            className="bg-white border-b border-neutral-200 px-4 pb-3.5"
            style={{ paddingTop: "max(1.2rem, env(safe-area-inset-top))" }}
          >
            <div className="flex items-start justify-between mb-3.5">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
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
                <div>
                  <p className="text-[15px] font-black tracking-[-0.03em] text-neutral-900 leading-none">
                    Graph AI
                  </p>
                  <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mt-0.5 block">
                    v2.0 · Studio
                  </span>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close sidebar"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:bg-neutral-100 hover:border-neutral-300 hover:text-neutral-700 transition-all duration-150"
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

            {/* Stats strip */}
            <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
              {[
                { val: String(conversations.length), key: "Chats" },
                { val: "∞", key: "Charts" },
                { val: "AI", key: "Engine" },
              ].map((s, i) => (
                <div
                  key={s.key}
                  className={`flex-1 py-1.5 text-center bg-neutral-50 ${i > 0 ? "border-l border-neutral-200" : ""}`}
                >
                  <span className="block font-mono text-[13px] font-medium text-neutral-800 leading-none">
                    {s.val}
                  </span>
                  <span className="block font-mono text-[9px] font-semibold uppercase tracking-widest text-neutral-400 mt-0.5">
                    {s.key}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Body ── */}
          <div
            className="flex-1 overflow-y-auto px-2.5 py-3 flex flex-col gap-px"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#e5e7eb transparent",
            }}
          >
            {/* New conversation */}
            <button
              onClick={onNew}
              className="new-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] mb-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-600 text-[12.5px] font-semibold tracking-tight shadow-sm hover:bg-neutral-900 hover:border-neutral-900 hover:text-white hover:shadow-lg hover:-translate-y-px transition-all duration-150 touch-manipulation"
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
              New conversation
              <span className="new-btn-arrow text-sm">→</span>
            </button>

            {/* Section divider */}
            <div className="flex items-center gap-2 px-2 pt-1 pb-1.5">
              <span className="flex-1 h-px bg-neutral-200" />
              <span className="font-mono text-[9px] tracking-widest uppercase text-neutral-300">
                Recent
              </span>
              <span className="flex-1 h-px bg-neutral-200" />
            </div>

            {/* Empty state */}
            {conversations.length === 0 && (
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
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`anim-fadeup ${delayClass} w-full text-left flex items-center gap-2.5 px-2.5 py-2.5 min-h-[44px] rounded-lg border text-[12.5px] font-medium tracking-tight transition-all duration-100 touch-manipulation
                    ${
                      isActive
                        ? "bg-white border-neutral-200 text-neutral-900 shadow-sm"
                        : "bg-transparent border-transparent text-neutral-400 hover:bg-neutral-100 hover:border-neutral-200 hover:text-neutral-600"
                    }`}
                >
                  <span
                    className={`w-[5px] h-[5px] rounded-full flex-shrink-0 transition-colors duration-150
                      ${isActive ? "bg-neutral-800 anim-pulse-dot" : "bg-neutral-300"}`}
                  />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <span className="font-mono text-[9px] text-neutral-300 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Footer ── */}
          <div
            className="border-t border-neutral-200 bg-white"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center gap-2.5 px-3.5 py-3">
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
              <div className="min-w-0">
                <span className="block text-[12px] font-bold text-neutral-900 leading-none tracking-tight">
                  Workspace
                </span>
                <span className="block font-mono text-[9.5px] text-neutral-400 uppercase tracking-widest mt-0.5">
                  Free plan
                </span>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-500 flex-shrink-0 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
