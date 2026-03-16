/**
 * Zustand Global Store
 *
 * Single source of truth for the entire app.
 * Hydrated ONCE after login via /api/user/bootstrap.
 * All components read from here — no duplicate DB calls.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ── Types ──────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  createdAt: string;
}

export interface Subscription {
  plan: "free" | "pro" | "enterprise";
  status: "active" | "cancelled" | "expired";
  startedAt: string | null;
  expiresAt: string | null;
}

export interface SavedChart {
  id: string;
  title: string;
  prompt: string;
  chartConfig: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  // ── Dashboard display fields (populated by bootstrap) ──
  tag: string; // "Line" | "Bar" | "Area"
  category: string;
  views: number;
  trend: string; // "+18.4%"
  up: boolean;
  starred: boolean;
  desc: string;
  data: number[]; // sparkline points
  updated: string; // "2h ago"
}

export interface GraphTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  trend: string;
  isTrending: boolean;
  template: Record<string, any>;
  // ── Dashboard display fields ──
  tag: string;
  count: number;
  desc: string;
}

export interface Feedback {
  id: string;
  authorName: string;
  message: string;
  rating: number;
  createdAt: string;
}

// ── ADDED: Stat card ───────────────────────────────────────────
export interface DashboardStat {
  label: string; // "Total Graphs"
  value: string; // "24"
  delta: string; // "+3 this week"
  icon: string; // SVG path d=""
}

// ── ADDED: Activity feed item ──────────────────────────────────
export interface ActivityItem {
  id: string;
  action: string; // "Edited" | "Shared" | "Created" | "Starred"
  graph: string; // chart title
  time: string; // "2h ago"
  avatar: string; // initials "AC"
  own: boolean; // true = current user's action
}

interface AppState {
  // ── Auth ──────────────────────────────────────────────────
  token: string | null;
  isAuthenticated: boolean;

  // ── User-specific data (private) ──────────────────────────
  user: User | null;
  subscription: Subscription | null;
  savedCharts: SavedChart[];

  // ── ADDED: Dashboard data ──────────────────────────────────
  dashboardStats: DashboardStat[];
  activityFeed: ActivityItem[];

  // ── Global data (shared across all users) ─────────────────
  graphTemplates: GraphTemplate[];
  feedbacks: Feedback[];

  // ── UI state ──────────────────────────────────────────────
  isBootstrapped: boolean;
  isBootstrapping: boolean;
  bootstrapError: string | null;

  // ── Actions ───────────────────────────────────────────────
  setToken: (token: string) => void;
  bootstrap: () => Promise<void>;
  logout: () => void;

  addSavedChart: (chart: SavedChart) => void;
  removeSavedChart: (id: string) => void;
  updateChartTitle: (id: string, title: string) => void;
  toggleStarChart: (id: string) => void; // ADDED
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      subscription: null,
      savedCharts: [],
      dashboardStats: [], // ADDED
      activityFeed: [], // ADDED
      graphTemplates: [],
      feedbacks: [],
      isBootstrapped: false,
      isBootstrapping: false,
      bootstrapError: null,

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      bootstrap: async () => {
        const { token, isBootstrapping } = get();
        if (!token || isBootstrapping) return;

        set({ isBootstrapping: true, bootstrapError: null });

        try {
          const res = await fetch(`${API}/api/user/bootstrap`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.status === 401) {
            get().logout();
            return;
          }

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to load user data.");
          }

          const data = await res.json();

          set({
            user: data.user,
            subscription: data.subscription,
            savedCharts: data.savedCharts ?? [],
            dashboardStats: data.dashboardStats ?? [], // ADDED — backend sends this
            activityFeed: data.activityFeed ?? [], // ADDED — backend sends this
            graphTemplates: data.globalData?.graphTemplates ?? [],
            feedbacks: data.globalData?.feedbacks ?? [],
            isBootstrapped: true,
            isBootstrapping: false,
            bootstrapError: null,
          });
        } catch (err: any) {
          set({
            isBootstrapping: false,
            bootstrapError: err.message || "Failed to load data.",
          });
        }
      },

      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          user: null,
          subscription: null,
          savedCharts: [],
          dashboardStats: [],
          activityFeed: [],
          graphTemplates: [],
          feedbacks: [],
          isBootstrapped: false,
          isBootstrapping: false,
          bootstrapError: null,
        });
      },

      addSavedChart: (chart: SavedChart) => {
        set((s) => ({ savedCharts: [chart, ...s.savedCharts] }));
      },

      removeSavedChart: (id: string) => {
        set((s) => ({ savedCharts: s.savedCharts.filter((c) => c.id !== id) }));
      },

      updateChartTitle: (id: string, title: string) => {
        set((s) => ({
          savedCharts: s.savedCharts.map((c) =>
            c.id === id ? { ...c, title } : c,
          ),
        }));
      },

      // ADDED
      toggleStarChart: (id: string) => {
        set((s) => ({
          savedCharts: s.savedCharts.map((c) =>
            c.id === id ? { ...c, starred: !c.starred } : c,
          ),
        }));
      },
    }),
    {
      name: "graphix-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
