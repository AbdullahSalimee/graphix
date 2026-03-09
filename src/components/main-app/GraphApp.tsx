"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./Sidebar";
import ChatArea from "./ChartArea";
import InputBar from "./InputBar";
import StarField from "./StarField";
import WaveHero from "./WaveHero";
import { createConversation } from "./conversations";

interface Message {
  id: string;
  from: "user" | "ai";
  content: string | any;
  status?: "loading" | "success" | "error";
  hasFile?: boolean;
  fileName?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

const INITIAL_CONV = createConversation();

export default function GraphApp() {
  const [conversations, setConversations] = useState<Conversation[]>([
    INITIAL_CONV,
  ]);
  const [activeId, setActiveId] = useState<string>(INITIAL_CONV.id);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 640) {
      setSidebarOpen(true);
    }
  }, []);

  const activeConv = conversations.find((c) => c.id === activeId);
  const hasMessages = (activeConv?.messages?.length ?? 0) > 0;

  const updateMessages = useCallback(
    (convId: string, updater: Message[] | ((prev: Message[]) => Message[])) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const messages =
            typeof updater === "function" ? updater(c.messages) : updater;
          const firstUser = messages.find((m) => m.from === "user");
          const newTitle = firstUser
            ? firstUser.content.slice(0, 30) +
              (firstUser.content.length > 30 ? "…" : "")
            : c.title;
          return { ...c, messages, title: newTitle };
        }),
      );
    },
    [],
  );

  const newConversation = () => {
    const hasEmpty = conversations.some(
      (c) => c.title === "New conversation" && c.messages.length === 0,
    );
    if (hasEmpty) {
      const empty = conversations.find(
        (c) => c.title === "New conversation" && c.messages.length === 0,
      )!;
      setActiveId(empty.id);
    } else {
      const c = createConversation();
      setConversations((prev) => [c, ...prev]);
      setActiveId(c.id);
    }
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setSidebarOpen(false);
    }
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current?.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 80);
    }
  }, [activeConv?.messages?.length]);

  const handleSend = async (
    input: string,
    fileContent: string,
    fileName: string,
  ) => {
    if (!input.trim() || isLoading || !activeId) return;
    const convId = activeId;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      from: "user",
      content: input,
      status: "success",
      hasFile: !!fileContent,
      fileName,
    };
    const aiMsg: Message = {
      id: crypto.randomUUID(),
      from: "ai",
      content: "",
      status: "loading",
    };

    updateMessages(convId, (msgs) => [...msgs, userMsg, aiMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("https://graphy-server.vercel.app/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, fileContent }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const config = await res.json();
      updateMessages(convId, (msgs) =>
        msgs.map((m) =>
          m.id === aiMsg.id ? { ...m, content: config, status: "success" } : m,
        ),
      );
    } catch (err: any) {
      updateMessages(convId, (msgs) =>
        msgs.map((m) =>
          m.id === aiMsg.id
            ? {
                ...m,
                content: err.message || "Failed to generate chart",
                status: "error",
              }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="graph-app-root fixed inset-0 bg-white overflow-hidden">
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.27.0/plotly.min.js"
        async
      />
      <StarField />

      <div className="app-shell flex h-dvh relative z-10 font-sans">
        {sidebarOpen && (
          <div
            className="sidebar-backdrop fixed inset-0 z-[9] bg-black/55 backdrop-blur-sm sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {sidebarOpen && (
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onNew={newConversation}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <div className="main flex-1 flex flex-col min-w-0 relative">
          {/* Topbar */}
          <div className="topbar flex items-center gap-3 px-4 py-2 bg-white backdrop-blur-xl border-b border-[#111212]/20 ">
            {!sidebarOpen && (
              <button
                className="icon-btn p-2 rounded-lg text-[#111212] hover:text-slate-300 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <MenuIcon />
              </button>
            )}
            <span className="topbar-title text-black text-sm font-medium truncate flex-1">
              {activeConv?.title || "Graph AI"}
            </span>
          </div>

          {/* Chat / Hero area */}
          <div
            ref={chatRef}
            className="chat-area flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent"
          >
            {!hasMessages ? (
              // ── EMPTY STATE: centered hero WITH its own input ──
              <WaveHero onSend={handleSend} isLoading={isLoading} />
            ) : (
              // ── HAS MESSAGES: normal chat + sticky bottom InputBar ──
              <div className="py-5 px-4 md:px-6">
                <ChatArea messages={activeConv?.messages ?? []} />
              </div>
            )}
          </div>

          {/* InputBar only shown after first message */}
          {hasMessages && (
            <InputBar onSend={handleSend} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
