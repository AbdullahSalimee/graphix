"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./Sidebar";
import SingleChartArea from "./SingleChartArea";
import ChartTemplatePanel from "./ChartTemplatePanel";
import MessageHistorySidebar from "./MessageHistorySidebar";
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
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 640)
      setSidebarOpen(true);
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
      setChatHistory([]);
    }
    if (typeof window !== "undefined" && window.innerWidth < 640)
      setSidebarOpen(false);
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    setChatHistory([]);
    if (typeof window !== "undefined" && window.innerWidth < 640)
      setSidebarOpen(false);
  };

  const handleSend = async (
    input: string,
    fileContent: string,
    fileName: string,
    prebuiltConfig?: any,
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

    // Keep only one AI message slot — update in place
    updateMessages(convId, (msgs) => {
      const withUser = [...msgs, userMsg];
      const hasAi = withUser.some((m) => m.from === "ai");
      if (hasAi) {
        return withUser.map((m) =>
          m.from === "ai"
            ? { ...m, status: "loading" as const, content: "" }
            : m,
        );
      }
      return [
        ...withUser,
        {
          id: "ai-chart",
          from: "ai" as const,
          content: "",
          status: "loading" as const,
        },
      ];
    });

    setIsLoading(true);

    if (prebuiltConfig) {
      updateMessages(convId, (msgs) =>
        msgs.map((m) =>
          m.from === "ai"
            ? { ...m, content: prebuiltConfig, status: "success" as const }
            : m,
        ),
      );
      setChatHistory((h) =>
        [
          ...h,
          { role: "user", content: input },
          {
            role: "assistant",
            content: JSON.stringify(prebuiltConfig).slice(0, 300),
          },
        ].slice(-6),
      );
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("https://graphy-server.vercel.app/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          fileContent,
          history: chatHistory,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const config = await res.json();

      if (config.error) {
        updateMessages(convId, (msgs) =>
          msgs.map((m) =>
            m.from === "ai"
              ? {
                  ...m,
                  content: { error: config.error },
                  status: "success" as const,
                }
              : m,
          ),
        );
        setIsLoading(false);
        return;
      }

      updateMessages(convId, (msgs) =>
        msgs.map((m) =>
          m.from === "ai"
            ? { ...m, content: config, status: "success" as const }
            : m,
        ),
      );

      setChatHistory((h) =>
        [
          ...h,
          { role: "user", content: input },
          { role: "assistant", content: JSON.stringify(config).slice(0, 300) },
        ].slice(-6),
      );
    } catch (err: any) {
      updateMessages(convId, (msgs) =>
        msgs.map((m) =>
          m.from === "ai"
            ? {
                ...m,
                content: err.message || "Failed to generate chart",
                status: "error" as const,
              }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="graph-app-root fixed inset-0 overflow-hidden"
      style={{ background: "#09090f" }}
    >
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.27.0/plotly.min.js"
        async
      />
      <StarField />

      <div className="flex h-dvh relative z-10">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[9] sm:hidden"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* LEFT — conversations sidebar */}
        {sidebarOpen && (
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onNew={newConversation}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* CENTER — main area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Topbar */}
          <div
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 flex-shrink-0"
            style={{
              background: "rgba(9,9,15,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {!sidebarOpen && (
              <button
                className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <MenuIcon />
              </button>
            )}
            <span
              className="text-sm font-medium truncate flex-1 min-w-0"
              style={{
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "-0.01em",
              }}
            >
              {activeConv?.title || "Graphix"}
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 flex min-h-0">
            {/* Template panel — left, only when chart exists */}
            {hasMessages && <ChartTemplatePanel />}

            {/* Chart or Hero */}
            <div className="flex-1 flex flex-col min-w-0">
              {!hasMessages ? (
                <WaveHero onSend={handleSend} isLoading={isLoading} />
              ) : (
                <div className="flex-1 min-h-0 flex">
                  <SingleChartArea messages={activeConv?.messages ?? []} />
                </div>
              )}
              {hasMessages && (
                <InputBar onSend={handleSend} isLoading={isLoading} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — message history sidebar */}
        {hasMessages && (
          <MessageHistorySidebar messages={activeConv?.messages ?? []} />
        )}
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
