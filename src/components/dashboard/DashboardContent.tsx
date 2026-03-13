"use client";

/**
 * DashboardContent
 *
 * All data comes from Zustand — already loaded by AppBootstrapper.
 * Zero extra API calls on this page.
 */

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { apiDeleteChart } from "@/lib/api";

// ── Color constants (matching your existing design) ───────────
const BG = "#09090f";
const C18 = "#18181f";
const C22 = "#22222b";
const CYAN = "#00d4c8";
const W55 = "rgba(255,255,255,0.55)";
const W35 = "rgba(255,255,255,0.35)";
const W08 = "rgba(255,255,255,0.08)";

export default function DashboardContent() {
  const router = useRouter();
  const {
    user,
    subscription,
    savedCharts,
    graphTemplates,
    feedbacks,
    logout,
    removeSavedChart,
    token,
  } = useAppStore();

  const handleDeleteChart = async (id: string) => {
    if (!token) return;
    // Optimistic: remove from store immediately
    removeSavedChart(id);
    try {
      await apiDeleteChart(token, id);
    } catch (err) {
      console.error("Delete failed:", err);
      // Could re-add on error, but for simplicity we leave it removed
    }
  };

  const handleLogout = () => {
    // Clear cookie too
    document.cookie = "graphix_token=; path=/; max-age=0";
    logout();
    router.push("/signin");
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "inherit" }}>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: `1px solid ${W08}`,
          background: "rgba(9,9,15,0.9)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <path d="M8 22L14 10L20 18L24 13" stroke={CYAN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="13" r="2" fill={CYAN} />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>Graphix</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Subscription badge */}
          <span
            style={{
              background: subscription?.plan === "pro" ? "rgba(0,212,200,0.15)" : W08,
              color: subscription?.plan === "pro" ? CYAN : W55,
              border: `1px solid ${subscription?.plan === "pro" ? "rgba(0,212,200,0.3)" : W08}`,
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {subscription?.plan || "free"}
          </span>

          {/* Avatar */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: C22,
              border: `1px solid ${W08}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              color: CYAN,
            }}
          >
            {user?.avatar || "U"}
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: `1px solid ${W08}`,
              color: W55,
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────── */}
      <main style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Welcome section */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            Welcome back, {user?.firstName} 👋
          </h1>
          <p style={{ color: W35, fontSize: 14 }}>{user?.email}</p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}>
          {[
            { label: "Saved Charts", value: savedCharts.length },
            { label: "Plan", value: (subscription?.plan || "free").toUpperCase() },
            { label: "Templates Available", value: graphTemplates.length },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ background: C18, border: `1px solid ${W08}`, borderRadius: 12, padding: "20px 24px" }}
            >
              <div style={{ color: W35, fontSize: 12, marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: CYAN }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Saved Charts */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Saved Charts</h2>
              <button
                onClick={() => router.push("/app")}
                style={{ background: CYAN, color: "#09090f", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                + New Chart
              </button>
            </div>

            {savedCharts.length === 0 ? (
              <div style={{ background: C18, border: `1px solid ${W08}`, borderRadius: 12, padding: 32, textAlign: "center" }}>
                <p style={{ color: W35, fontSize: 13 }}>No saved charts yet. Create your first one!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
                {savedCharts.map((chart) => (
                  <div
                    key={chart.id}
                    style={{ background: C18, border: `1px solid ${W08}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{chart.title}</div>
                      <div style={{ color: W35, fontSize: 11 }}>
                        {new Date(chart.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteChart(chart.id)}
                      style={{ background: "transparent", border: "none", color: W35, cursor: "pointer", fontSize: 18, lineHeight: 1 }}
                      title="Delete chart"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Graph Templates */}
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Graph Templates</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 440, overflowY: "auto" }}>
              {graphTemplates.map((t) => (
                <div
                  key={t.id}
                  style={{ background: C18, border: `1px solid ${W08}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  onClick={() => router.push("/app")}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{t.title}</div>
                    <div style={{ color: W35, fontSize: 11 }}>{t.category}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.isTrending ? CYAN : W55 }}>
                    {t.trend}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Subscription info */}
        {subscription && (
          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Subscription</h2>
            <div style={{ background: C18, border: `1px solid ${W08}`, borderRadius: 12, padding: "20px 24px", display: "flex", gap: 32 }}>
              <div>
                <div style={{ color: W35, fontSize: 12, marginBottom: 4 }}>Plan</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: CYAN, textTransform: "capitalize" }}>{subscription.plan}</div>
              </div>
              <div>
                <div style={{ color: W35, fontSize: 12, marginBottom: 4 }}>Status</div>
                <div style={{ fontWeight: 700, fontSize: 16, textTransform: "capitalize" }}>{subscription.status}</div>
              </div>
              {subscription.startedAt && (
                <div>
                  <div style={{ color: W35, fontSize: 12, marginBottom: 4 }}>Started</div>
                  <div style={{ fontSize: 14 }}>{new Date(subscription.startedAt).toLocaleDateString()}</div>
                </div>
              )}
              {subscription.expiresAt && (
                <div>
                  <div style={{ color: W35, fontSize: 12, marginBottom: 4 }}>Expires</div>
                  <div style={{ fontSize: 14 }}>{new Date(subscription.expiresAt).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
