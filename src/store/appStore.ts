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
}

export interface GraphTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  trend: string;
  isTrending: boolean;
  template: Record<string, any>;
}

export interface Feedback {
  id: string;
  authorName: string;
  message: string;
  rating: number;
  createdAt: string;
}

interface AppState {
  // ── Auth ──────────────────────────────────────────────────
  token: string | null;
  isAuthenticated: boolean;

  // ── User-specific data (private) ──────────────────────────
  user: User | null;
  subscription: Subscription | null;
  savedCharts: SavedChart[];

  // ── Global data (shared across all users) ─────────────────
  graphTemplates: GraphTemplate[];
  feedbacks: Feedback[];

  // ── UI state ──────────────────────────────────────────────
  isBootstrapped: boolean;   // true once /bootstrap has resolved
  isBootstrapping: boolean;  // true while /bootstrap is in-flight
  bootstrapError: string | null;

  // ── Actions ───────────────────────────────────────────────
  setToken: (token: string) => void;
  bootstrap: () => Promise<void>;
  logout: () => void;

  // Chart actions (optimistic UI — update store then call API)
  addSavedChart: (chart: SavedChart) => void;
  removeSavedChart: (id: string) => void;
  updateChartTitle: (id: string, title: string) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────
      token: null,
      isAuthenticated: false,
      user: null,
      subscription: null,
      savedCharts: [],
      graphTemplates: [],
      feedbacks: [],
      isBootstrapped: false,
      isBootstrapping: false,
      bootstrapError: null,

      // ── setToken ───────────────────────────────────────────
      // Called after login/signup to store token and trigger bootstrap
      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      // ── bootstrap ─────────────────────────────────────────
      // Single API call that loads ALL data for the logged-in user.
      // Run once per session (or once per page reload if already logged in).
      bootstrap: async () => {
        const { token, isBootstrapping } = get();
        if (!token || isBootstrapping) return;

        set({ isBootstrapping: true, bootstrapError: null });

        try {
          const res = await fetch(`${API}/api/user/bootstrap`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.status === 401) {
            // Token expired or invalid — force logout
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
            savedCharts: data.savedCharts,
            graphTemplates: data.globalData.graphTemplates,
            feedbacks: data.globalData.feedbacks,
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

      // ── logout ─────────────────────────────────────────────
      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          user: null,
          subscription: null,
          savedCharts: [],
          graphTemplates: [],
          feedbacks: [],
          isBootstrapped: false,
          isBootstrapping: false,
          bootstrapError: null,
        });
      },

      // ── Chart actions (optimistic) ─────────────────────────
      addSavedChart: (chart: SavedChart) => {
        set((s) => ({ savedCharts: [chart, ...s.savedCharts] }));
      },

      removeSavedChart: (id: string) => {
        set((s) => ({ savedCharts: s.savedCharts.filter((c) => c.id !== id) }));
      },

      updateChartTitle: (id: string, title: string) => {
        set((s) => ({
          savedCharts: s.savedCharts.map((c) => (c.id === id ? { ...c, title } : c)),
        }));
      },
    }),
    {
      name: "graphix-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist auth token — everything else re-fetched via bootstrap
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
