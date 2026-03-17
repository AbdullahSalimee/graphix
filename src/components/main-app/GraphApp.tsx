"use client";

import { useState, useEffect, useCallback } from "react";
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

const STORAGE_KEY = "graphix_conversations_v2";

function loadFromStorage(): {
  conversations: Conversation[];
  activeId: string;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.conversations?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(conversations: Conversation[], activeId: string) {
  try {
    const toSave = conversations.map((c) => ({
      ...c,
      messages: c.messages.filter((m) => m.status !== "loading"),
    }));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ conversations: toSave, activeId }),
    );
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export default function GraphApp() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window === "undefined") return [createConversation()];
    const stored = loadFromStorage();
    return stored?.conversations ?? [createConversation()];
  });
  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window === "undefined") return conversations[0]?.id ?? "";
    const stored = loadFromStorage();
    return stored?.activeId ?? conversations[0]?.id ?? "";
  });
  const [selectedAiId, setSelectedAiId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 640)
      setSidebarOpen(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") saveToStorage(conversations, activeId);
  }, [conversations, activeId]);

  // Auto-select latest AI chart whenever active conversation changes
  useEffect(() => {
    const conv = conversations.find((c) => c.id === activeId);
    const aiMsgs =
      conv?.messages.filter(
        (m) => m.from === "ai" && m.status === "success" && m.content?.data,
      ) ?? [];
    setSelectedAiId(aiMsgs.at(-1)?.id ?? null);
  }, [activeId]);

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
    setSelectedAiId(null);
    if (typeof window !== "undefined" && window.innerWidth < 640)
      setSidebarOpen(false);
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
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
    const newAiId = crypto.randomUUID();

    const userMsg: Message = {
      id: crypto.randomUUID(),
      from: "user",
      content: input,
      status: "success",
      hasFile: !!fileContent,
      fileName,
    };

    const loadingAiMsg: Message = {
      id: newAiId,
      from: "ai",
      content: "",
      status: "loading",
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CONTEXT MEMORY: Get the most recent successful AI chart as context
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const conv = conversations.find((c) => c.id === convId);
    const aiMessages =
      conv?.messages.filter(
        (m) => m.from === "ai" && m.status === "success" && m.content?.data,
      ) ?? [];
    const previousChart = aiMessages.at(-1)?.content ?? null;

    // Append both user + new loading AI slot
    updateMessages(convId, (msgs) => [...msgs, userMsg, loadingAiMsg]);
    setSelectedAiId(newAiId);
    setIsLoading(true);

    // If this is a prebuilt config from template, skip API
    if (prebuiltConfig) {
      updateMessages(convId, (msgs) =>
        msgs.map((m) =>
          m.id === newAiId
            ? { ...m, content: prebuiltConfig, status: "success" as const }
            : m,
        ),
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
          previousChart, // ← Send previous chart context
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
            m.id === newAiId
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

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SMART EDIT vs CREATE:
      // If action is "edit", REPLACE the previous chart instead of appending
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      if (config.action === "edit" && aiMessages.length > 0) {
        const prevAiId = aiMessages.at(-1)!.id;

        updateMessages(convId, (msgs) => {
          // Remove the loading message we just added
          const withoutLoading = msgs.filter((m) => m.id !== newAiId);

          // Replace the previous AI chart with the edited version
          return withoutLoading.map((m) =>
            m.id === prevAiId
              ? {
                  ...m,
                  content: { data: config.data, layout: config.layout },
                  status: "success" as const,
                }
              : m,
          );
        });

        // Keep selection on the edited chart
        setSelectedAiId(prevAiId);
      } else {
        // Normal "create" flow — add as new chart
        updateMessages(convId, (msgs) =>
          msgs.map((m) =>
            m.id === newAiId
              ? {
                  ...m,
                  content: { data: config.data, layout: config.layout },
                  status: "success" as const,
                }
              : m,
          ),
        );
      }
    } catch (err: any) {
      updateMessages(convId, (msgs) =>
        msgs.map((m) =>
          m.id === newAiId
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
                  <SingleChartArea
                    messages={activeConv?.messages ?? []}
                    selectedAiId={selectedAiId}
                  />
                </div>
              )}
              {hasMessages && (
                <InputBar onSend={handleSend} isLoading={isLoading} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — chart history sidebar */}
        {hasMessages && (
          <MessageHistorySidebar
            messages={activeConv?.messages ?? []}
            selectedAiId={selectedAiId}
            onSelectAiId={setSelectedAiId}
          />
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
