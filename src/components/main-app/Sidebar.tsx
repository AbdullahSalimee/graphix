// components/Sidebar.tsx
"use client";

import { useState } from "react";

interface Conversation {
  id: string;
  title: string;
  // add more fields if your conversations have more data (createdAt, preview, etc.)
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
    <aside
      className={`
        sidebar w-[240px] flex-shrink-0 h-dvh bg-gradient-to-b from-[#070d1a] to-[#050b14]
        border-r border-sky-500/10 flex flex-col relative z-10
        max-sm:fixed max-sm:left-0 max-sm:top-0 max-sm:w-[min(240px,80vw)]
        max-sm:shadow-2xl max-sm:shadow-black/60
      `}
    >
      {/* Header */}
      <div className="sidebar-header flex items-center justify-between px-4 py-4 border-b border-white/[0.04] pt-[max(1.1rem,env(safe-area-inset-top))]">
        <div className="sidebar-brand flex items-center gap-2">
          <span
            className={`
              brand-icon w-[26px] h-[26px] rounded-[7px] text-xs flex items-center justify-center
              bg-gradient-to-br from-sky-800 to-violet-700 text-white font-bold
            `}
          >
            📊
          </span>
          <span className="brand-name text-slate-300 font-semibold text-sm tracking-tight">
            Graph AI
          </span>
        </div>

        <button
          className={`
            icon-btn p-1.5 rounded-lg text-slate-600 hover:text-slate-300 transition-colors
            flex items-center justify-center min-w-11 min-h-11
          `}
          onClick={onClose}
          title="Close sidebar"
          aria-label="Close sidebar"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="6" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="sidebar-body flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-1">
        {/* New conversation button */}
        <button
          className={`
            new-chat-btn w-full px-4 py-2.5 rounded-lg text-sky-400 text-sm font-medium
            bg-sky-900/12 border border-sky-500/20 hover:bg-sky-900/22 transition-colors
            flex items-center gap-2 min-h-[44px] touch-manipulation
          `}
          onClick={onNew}
        >
          <span className="text-lg leading-none">+</span>
          New conversation
        </button>

        {/* History label */}
        <div className="conv-label text-sky-950/70 text-[0.68rem] font-semibold uppercase tracking-widest px-2 pt-3 pb-1">
          History
        </div>

        {/* Empty state */}
        {conversations.length === 0 && (
          <div className="conv-empty text-sky-950/70 text-sm px-2 py-1">
            No chats yet
          </div>
        )}

        {/* Conversation list */}
        {conversations.map((conv) => (
          <button
            key={conv.id}
            className={`
              conv-item w-full text-left px-3 py-2.5 min-h-[44px] rounded-r-lg
              flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap
              transition-all duration-150 touch-manipulation
              ${
                conv.id === activeId
                  ? "bg-sky-500/8 text-sky-300 border-l-2 border-l-sky-400"
                  : "text-slate-600 hover:text-slate-300 hover:bg-white/2 border-l-2 border-l-transparent"
              }
            `}
            onClick={() => onSelect(conv.id)}
          >
            <span
              className={`
                conv-dot w-1.5 h-1.5 rounded-full flex-shrink-0
                ${conv.id === activeId ? "bg-current opacity-90" : "bg-current opacity-40"}
              `}
            />
            <span className="truncate">{conv.title}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
