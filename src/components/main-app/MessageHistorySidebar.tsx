"use client";
import { useState } from "react";

interface Message {
  id: string;
  from: "user" | "ai";
  content: any;
  status?: string;
}

export default function MessageHistorySidebar({
  messages,
}: {
  messages: Message[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const userMsgs = messages.filter((m) => m.from === "user");

  return (
    <aside
      className="flex flex-col flex-shrink-0 h-dvh transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        width: collapsed ? 44 : 220,
        background: "#09090b",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-2 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", height: 48 }}
      >
        {!collapsed && (
          <span
            className="text-[9px] uppercase tracking-widest font-semibold px-1 flex-1"
            style={{
              color: "rgba(255,255,255,0.25)",
              fontFamily: "DM Mono, monospace",
            }}
          >
            Messages
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-7 h-7 flex items-center justify-center rounded-lg ml-auto transition-colors"
          style={{
            color: "rgba(255,255,255,0.3)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              transform: collapsed ? "rotate(180deg)" : "none",
              transition: "transform 0.25s",
            }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Message list */}
      <div
        className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-1.5"
        style={{ scrollbarWidth: "none" }}
      >
        {collapsed ? (
          // Dots mode
          <div className="flex flex-col items-center gap-2 pt-2">
            {userMsgs.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === userMsgs.length - 1 ? 8 : 6,
                  height: i === userMsgs.length - 1 ? 8 : 6,
                  borderRadius: "50%",
                  background:
                    i === userMsgs.length - 1
                      ? "#06b6d4"
                      : "rgba(255,255,255,0.18)",
                  boxShadow:
                    i === userMsgs.length - 1
                      ? "0 0 6px rgba(6,182,212,0.5)"
                      : "none",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        ) : (
          userMsgs.map((msg, i) => {
            const isLatest = i === userMsgs.length - 1;
            return (
              <div
                key={msg.id}
                className="px-2.5 py-2 rounded-lg"
                style={{
                  background: isLatest
                    ? "rgba(6,182,212,0.07)"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isLatest ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-1 h-1 rounded-full flex-shrink-0"
                    style={{
                      background: isLatest
                        ? "#06b6d4"
                        : "rgba(255,255,255,0.2)",
                    }}
                  />
                  <span
                    className="text-[9px]"
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      fontFamily: "DM Mono, monospace",
                    }}
                  >
                    #{i + 1}
                  </span>
                </div>
                <p
                  className="text-[11px] leading-snug"
                  style={{
                    color: isLatest
                      ? "rgba(255,255,255,0.75)"
                      : "rgba(255,255,255,0.35)",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {typeof msg.content === "string" ? msg.content : ""}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Footer count */}
      {!collapsed && userMsgs.length > 0 && (
        <div
          className="px-3 py-2 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.18)",
              fontFamily: "DM Mono, monospace",
            }}
          >
            {userMsgs.length} message{userMsgs.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </aside>
  );
}
