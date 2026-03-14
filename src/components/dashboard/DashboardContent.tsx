"use client";
import { useState, useEffect, use } from "react";
import { CYAN, BG, W08, W12, W20, W35, W55, C08, C18, C35 } from "@/lib/Tokens";
import { IC } from "@/lib/Tokens";
import {
  GRAPHS,
  STATS,
  ACTIVITY,
  TEMPLATES,
  USER,
  PAGE_TITLES,
} from "@/lib/Data";
import {
  Ico,
  Chip,
  Btn,
  FieldInput,
  FieldTextarea,
  FieldLabel,
  SectionCard,
  SectionHead,
  StripeDivider,
  BackBtn,
  SuccessBanner,
  DataTable,
  Stepper,
  MiniStepper,
  ActionCard,
} from "@/components/dashboard/UIKit";
import GraphCard from "@/components/dashboard/GraphCard";
import Sidebar from "@/components/dashboard/Sidebar";
import { useRouter } from "next/navigation";
import { ClippingGroup } from "three/webgpu";
import RouteGuard from "@/components/RouteGuard";

// ─────────────────────────────────────────────────────────────
// GRAPH GRID  (search + filter + card grid)
// ─────────────────────────────────────────────────────────────
function GraphGrid({
  graphs,
  emptyMsg = "No graphs found",
}: {
  graphs: any[];
  emptyMsg: string;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const list = graphs.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All" || g.tag === filter),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          display: "flex",
          gap: 9,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: 190,
            maxWidth: 290,
          }}
        >
          <svg
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill="none"
            stroke={W20}
            strokeWidth={2}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search graphs…"
            style={{
              width: "100%",
              paddingLeft: 30,
              paddingRight: 11,
              paddingTop: 8,
              paddingBottom: 8,
              background: "transparent",
              border: `1px solid ${search ? CYAN : W12}`,
              borderRadius: 3,
              color: "#fff",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["All", "Line", "Bar", "Area"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 13px",
                background: filter === f ? CYAN : "transparent",
                border: `1px solid ${filter === f ? CYAN : W12}`,
                color: filter === f ? "#111212" : W35,
                borderRadius: 3,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.05em",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.15s",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {list.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: 12,
          }}
        >
          {list.map((g, i) => (
            <GraphCard key={g.id} graph={g} index={i} />
          ))}
        </div>
      ) : (
        <div
          style={{
            border: `1px solid ${W08}`,
            borderRadius: 6,
            padding: "72px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 34, opacity: 0.12, marginBottom: 10 }}>
            📊
          </div>
          <p style={{ color: W35, fontWeight: 700, fontSize: 14 }}>
            {emptyMsg}
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD HOME
// ─────────────────────────────────────────────────────────────
function StatCard({ stat, index }: { stat: any; index: number }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), index * 90);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        border: `1px solid ${W08}`,
        borderRadius: 6,
        padding: "18px 20px",
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 60,
          height: 60,
          background: `radial-gradient(circle at top right,${C08},transparent)`,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            color: W35,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {stat.label}
        </span>
        <div
          style={{
            width: 29,
            height: 29,
            background: C08,
            border: `1px solid ${C35}`,
            borderRadius: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: CYAN,
          }}
        >
          <Ico d={stat.icon} size={13} />
        </div>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1,
          marginBottom: 5,
          letterSpacing: "-0.02em",
        }}
      >
        {stat.value}
      </div>
      <div style={{ fontSize: 12, color: CYAN }}>{stat.delta}</div>
    </div>
  );
}

function DashboardHome({ setTab }: { setTab: (tab: string) => void }) {
  const [vis, setVis] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => setVis(true), 80);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 28,
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(8px)",
        transition: "all 0.4s ease",
      }}
    >
      {/* Welcome */}
      <div>
        <div
          style={{
            color: CYAN,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 7,
          }}
        >
          Good morning
        </div>
        <h1
          style={{
            color: "#fff",
            fontSize: "clamp(1.8rem,4vw,2.5rem)",
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
          }}
        >
          <span style={{ color: CYAN }}>{USER.name.split(" ")[0]}'s</span>{" "}
          workspace
        </h1>
        <p style={{ color: W35, fontSize: 14, marginTop: 7 }}>
          Here's what's happening with your data today.
        </p>
      </div>

      <div className="w-full h-4 bg-[repeating-linear-gradient(-45deg,black_0px,white_3px,transparent_3px,transparent_6px)]"></div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))",
          gap: 11,
        }}
      >
        {STATS.map((s, i) => (
          <StatCard key={s.label} stat={s} index={i} />
        ))}
      </div>
      {/* Quick Actions */}
      <div>
        <h2
          style={{
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          Quick Actions
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
            gap: 9,
          }}
        >
          <ActionCard
            icon={IC.plus}
            label="New Graph"
            sub="Build from scratch"
            cta="Create"
            onClick={() => router.push("/app")}
            primary
          />
          <ActionCard
            icon={IC.sheet}
            label="Google Sheets"
            sub="Connect live data"
            cta="Connect"
            onClick={() => setTab("import-google")}
          />
          <ActionCard
            icon={IC.upload}
            label="Upload Excel"
            sub="XLS / XLSX / CSV"
            cta="Upload"
            onClick={() => setTab("import-excel")}
          />
          <ActionCard
            icon={IC.paste}
            label="Paste Data"
            sub="Tabular text / JSON"
            cta="Paste"
            onClick={() => setTab("import-paste")}
          />
        </div>
      </div>

      {/* Recent */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h2 style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
            Recent Graphs
          </h2>
          <button
            onClick={() => setTab("graphs")}
            style={{
              color: CYAN,
              background: "none",
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            View all →
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: 12,
          }}
        >
          {GRAPHS.slice(0, 6).map((g, i) => (
            <GraphCard key={g.id} graph={g} index={i} />
          ))}
        </div>
      </div>
      {/* Activity + Starred */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))",
          gap: 12,
        }}
      >
        <SectionCard>
          <SectionHead title="Activity" right={<Chip>Last 7 days</Chip>} />
          {ACTIVITY.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 17px",
                borderBottom:
                  i < ACTIVITY.length - 1 ? `1px solid ${W08}` : "none",
              }}
            >
              <div
                style={{
                  width: 29,
                  height: 29,
                  borderRadius: 5,
                  background: a.own ? C18 : W08,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  color: a.own ? CYAN : W55,
                  flexShrink: 0,
                }}
              >
                {a.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: W35, fontSize: 13 }}>{a.action} </span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
                  {a.graph}
                </span>
              </div>
              <span style={{ color: W20, fontSize: 11, flexShrink: 0 }}>
                {a.time}
              </span>
            </div>
          ))}
        </SectionCard>
        <SectionCard>
          <SectionHead
            title="Starred"
            right={
              <button
                onClick={() => setTab("favourites")}
                style={{
                  color: CYAN,
                  background: "none",
                  border: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                See all →
              </button>
            }
          />
          {GRAPHS.filter((g) => g.starred).map((g, i, arr) => (
            <div
              key={g.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 17px",
                borderBottom: i < arr.length - 1 ? `1px solid ${W08}` : "none",
                cursor: "pointer",
              }}
            >
              <Ico d={IC.star} size={12} fill={CYAN} stroke={CYAN} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {g.title}
                </div>
                <div style={{ color: W35, fontSize: 11 }}>{g.category}</div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: g.up ? CYAN : W55,
                  flexShrink: 0,
                }}
              >
                {g.trend}
              </span>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NEW GRAPH PAGE
// ─────────────────────────────────────────────────────────────
function NewGraphPage({ setTab }: { setTab: (tab: string) => void }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("Line");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const types = [
    { id: "Line", label: "Line Chart", sub: "Trends over time" },
    { id: "Bar", label: "Bar Chart", sub: "Compare values" },
    { id: "Area", label: "Area Chart", sub: "Volume & fill" },
    { id: "Pie", label: "Pie / Donut", sub: "Proportions" },
    { id: "Scatter", label: "Scatter", sub: "Correlation" },
    { id: "Table", label: "Data Table", sub: "Raw records" },
  ];
  return (
    <div style={{ maxWidth: 650 }}>
      <BackBtn onClick={() => setTab("dashboard")} />
      <h2
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        New Graph
      </h2>
      <p style={{ color: W35, fontSize: 13, marginBottom: 26 }}>
        Choose a chart type and configure your visualization
      </p>
      <Stepper
        steps={[
          ["1", "Type"],
          ["2", "Details"],
          ["3", "Data"],
        ]}
        current={step}
      />
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 9,
            }}
          >
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                style={{
                  background: type === t.id ? C18 : "transparent",
                  border: `1.5px solid ${type === t.id ? CYAN : W12}`,
                  borderRadius: 6,
                  padding: "17px 11px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 5,
                    background: type === t.id ? C35 : W08,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: type === t.id ? CYAN : W35,
                  }}
                >
                  <Ico d={IC.graphs} size={16} />
                </div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>
                  {t.label}
                </div>
                <div style={{ color: W35, fontSize: 11 }}>{t.sub}</div>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={() => setStep(2)}>Next: Details →</Btn>
          </div>
        </div>
      )}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FieldLabel>Graph Title *</FieldLabel>
              <FieldInput
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. Monthly Revenue Q1"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FieldLabel>Description</FieldLabel>
              <FieldTextarea
                value={desc}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDesc(e.target.value)
                }
                placeholder="What does this graph show?"
                rows={3}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FieldLabel>Category</FieldLabel>
              <select
                style={{
                  background: "transparent",
                  border: `1px solid ${W12}`,
                  color: "#fff",
                  padding: "10px 13px",
                  fontSize: 13,
                  outline: "none",
                  borderRadius: 3,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {[
                  "Finance",
                  "Growth",
                  "Retention",
                  "Product",
                  "Operations",
                ].map((c) => (
                  <option key={c} value={c} style={{ background: BG }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Btn variant="ghost" onClick={() => setStep(1)}>
              ← Back
            </Btn>
            <Btn onClick={() => setStep(3)}>Next: Add Data →</Btn>
          </div>
        </div>
      )}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
          <p style={{ color: W35, fontSize: 13 }}>
            Add data to your <strong style={{ color: "#fff" }}>{type}</strong>{" "}
            graph
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 9,
            }}
          >
            <ActionCard
              icon={IC.upload}
              label="Upload File"
              sub="CSV / XLSX"
              cta="Select"
              onClick={() => setTab("import-excel")}
            />
            <ActionCard
              icon={IC.sheet}
              label="Google Sheets"
              sub="Connect live"
              cta="Select"
              onClick={() => setTab("import-google")}
            />
            <ActionCard
              icon={IC.paste}
              label="Paste Data"
              sub="Manual entry"
              cta="Select"
              onClick={() => setTab("import-paste")}
            />
          </div>
          <Btn
            variant="ghost"
            onClick={() => setStep(2)}
            style={{ alignSelf: "flex-start" }}
          >
            ← Back
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// IMPORT: GOOGLE SHEETS
// ─────────────────────────────────────────────────────────────
function ImportGooglePage({ setTab }: { setTab: (tab: string) => void }) {
  const [step, setStep] = useState("connect");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [sheetName, setSheetName] = useState("");

  const connect = async () => {
    if (!url.trim()) return;
    setError("");
    setBusy(true);

    const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch) {
      setError(
        "Invalid Google Sheets URL. Please paste the full URL from your browser.",
      );
      setBusy(false);
      return;
    }

    const sheetId = idMatch[1];
    const gid = url.match(/gid=(\d+)/)?.[1] ?? "0";
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

    try {
      const res = await fetch(csvUrl);
      if (!res.ok)
        throw new Error(
          "Could not fetch sheet. Make sure sharing is set to 'Anyone with link can view'.",
        );
      const text = await res.text();
      const rows = text.split("\n").map((r) => r.split(","));
      setSheetData(rows);
      console.log("Fetched sheet data:", rows); // Log first 5 rows for debugging
      // derive a readable name from URL or fallback
      setSheetName(`Sheet (${sheetId.slice(0, 8)}…)`);
      setStep("done");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 550 }}>
      <BackBtn onClick={() => setTab("dashboard")} />
      <h2
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Connect Google Sheets
      </h2>
      <p style={{ color: W35, fontSize: 13, marginBottom: 26 }}>
        Paste the URL of the exact tab you want — no sign-in needed
      </p>

      <MiniStepper
        steps={[
          ["connect", "Paste URL"],
          ["done", "Done"],
        ]}
        current={step}
      />

      {step === "connect" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              border: `1px solid ${W12}`,
              borderRadius: 6,
              padding: 17,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>
              Sheet URL
            </div>

            {/* How-to hint */}
            <div
              style={{
                background: C08,
                border: `1px solid ${W12}`,
                borderRadius: 5,
                padding: "10px 13px",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <div style={{ color: CYAN, fontSize: 12, fontWeight: 700 }}>
                HOW TO GET YOUR URL
              </div>
              {[
                "1. Open your Google Sheet",
                "2. Navigate to the exact tab you want",
                "3. Set sharing → Anyone with link can view",
                "4. Copy the URL from your browser bar and paste below",
              ].map((tip) => (
                <div key={tip} style={{ color: W35, fontSize: 12 }}>
                  {tip}
                </div>
              ))}
            </div>

            <FieldInput
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUrl(e.target.value);
                setError("");
              }}
              placeholder="https://docs.google.com/spreadsheets/d/…"
            />

            {error && (
              <div
                style={{
                  color: "#f87171",
                  fontSize: 12,
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  borderRadius: 4,
                  padding: "8px 12px",
                }}
              >
                ⚠ {error}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={connect}>
              {busy ? "Connecting…" : "Connect Sheet →"}
            </Btn>
          </div>
        </div>
      )}

      {step === "done" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            padding: "44px 0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 12,
              background: C18,
              border: `1.5px solid ${C35}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ico d={IC.check} size={24} stroke={CYAN} sw={2.5} />
          </div>
          <div>
            <h3
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 18,
                marginBottom: 7,
              }}
            >
              Sheet connected!
            </h3>
            <p style={{ color: W35, fontSize: 13 }}>
              <strong style={{ color: "#fff" }}>{sheetName}</strong> is linked.{" "}
              {sheetData.length} rows imported. Graphs update automatically.
            </p>
          </div>

          {/* Preview first few rows */}
          {sheetData.length > 0 && (
            <div
              style={{
                width: "100%",
                background: C08,
                border: `1px solid ${W12}`,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr>
                      {sheetData[0].map((col, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "8px 12px",
                            color: CYAN,
                            fontWeight: 700,
                            textAlign: "left",
                            borderBottom: `1px solid ${W12}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sheetData.slice(1, 10).map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            style={{
                              padding: "7px 12px",
                              color: W35,
                              borderBottom: `1px solid ${W12}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "7px 12px", color: W35, fontSize: 11 }}>
                Showing 3 of {sheetData.length - 1} rows
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 9 }}>
            <Btn
              variant="ghost"
              onClick={() => {
                setStep("connect");
                setUrl("");
                setSheetData([]);
              }}
            >
              Connect Another
            </Btn>
            <Btn onClick={() => setTab("new-graph")}>Create Graph →</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// IMPORT: EXCEL UPLOAD
// ─────────────────────────────────────────────────────────────
const XL_ROWS = [
  ["Month", "Revenue", "Users", "Churn"],
  ["Jan 2024", "84,200", "1,240", "2.1%"],
  ["Feb 2024", "91,500", "1,380", "1.9%"],
  ["Mar 2024", "88,300", "1,310", "2.3%"],
  ["Apr 2024", "96,800", "1,520", "1.7%"],
];

function ImportExcelPage({ setTab }: { setTab: (tab: string) => void }) {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState(false);
  const handle = (f: any) => {
    setFile(f);
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      setPreview(true);
    }, 1400);
  };
  const reset = () => {
    setFile(null);
    setParsing(false);
    setPreview(false);
  };
  return (
    <div style={{ maxWidth: 620 }}>
      <BackBtn onClick={() => setTab("dashboard")} />
      <h2
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Upload Excel Sheet
      </h2>
      <p style={{ color: W35, fontSize: 13, marginBottom: 26 }}>
        Supports .xlsx, .xls and .csv files up to 50 MB
      </p>
      {!file && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById("xl-in")?.click()}
          style={{
            border: `2px dashed ${drag ? CYAN : W12}`,
            borderRadius: 8,
            padding: "52px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 13,
            textAlign: "center",
            cursor: "pointer",
            background: drag ? C08 : "transparent",
            transition: "all 0.2s",
          }}
        >
          <input
            id="xl-in"
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.[0]) handle(e.target.files[0]);
            }}
          />
          <div
            style={{
              width: 54,
              height: 54,
              border: `1.5px solid ${drag ? CYAN : W12}`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: drag ? CYAN : W35,
              background: drag ? C08 : "transparent",
            }}
          >
            <Ico d={IC.upload} size={22} />
          </div>
          <div>
            <div
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 5,
              }}
            >
              Drop your file here
            </div>
            <div style={{ color: W35, fontSize: 13 }}>or click to browse</div>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {[".xlsx", ".xls", ".csv"].map((e) => (
              <Chip key={e}>{e}</Chip>
            ))}
          </div>
        </div>
      )}
      {parsing && (
        <div
          style={{
            border: `1px solid ${W08}`,
            borderRadius: 8,
            padding: "52px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 13,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `2.5px solid ${W08}`,
              borderTopColor: CYAN,
              animation: "spin 0.7s linear infinite",
            }}
          />
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
            Parsing {file?.name}…
          </div>
        </div>
      )}
      {preview && (
        <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
          <SuccessBanner>
            <p style={{ color: "#fff", fontSize: 13, flex: 1 }}>
              <strong>{file?.name}</strong> — {XL_ROWS.length - 1} rows
            </p>
            <button
              onClick={reset}
              style={{
                background: "none",
                border: "none",
                color: W35,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Change
            </button>
          </SuccessBanner>
          <div>
            <FieldLabel>Data Preview</FieldLabel>
            <div style={{ marginTop: 9 }}>
              <DataTable rows={XL_ROWS} />
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}
          >
            {[
              ["X Axis", "Month"],
              ["Y Axis", "Revenue"],
            ].map(([l, v]) => (
              <div
                key={l}
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <FieldLabel>{l}</FieldLabel>
                <select
                  defaultValue={v}
                  style={{
                    background: "transparent",
                    border: `1px solid ${W12}`,
                    color: "#fff",
                    padding: "9px 12px",
                    fontSize: 13,
                    outline: "none",
                    borderRadius: 3,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {XL_ROWS[0].map((h) => (
                    <option key={h} value={h} style={{ background: BG }}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Btn variant="ghost" onClick={reset}>
              Start Over
            </Btn>
            <Btn onClick={() => setTab("new-graph")}>Create Graph →</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// IMPORT: PASTE DATA
// ─────────────────────────────────────────────────────────────
const PH = {
  csv: "Month,Revenue,Users\nJan,84200,1240",
  json: '[{"Month":"Jan","Revenue":84200}]',
  tsv: "Month\tRevenue\nJan\t84200",
};
const PASTE_PREV = [
  ["Month", "Revenue", "Users"],
  ["Jan", "84,200", "1,240"],
  ["Feb", "91,500", "1,380"],
  ["Mar", "88,300", "1,310"],
];

function ImportPastePage({ setTab }: { setTab: (tab: string) => void }) {
  const [raw, setRaw] = useState("");
  const [fmt, setFmt] = useState<"csv" | "json" | "tsv">("csv");
  const [parsed, setParsed] = useState(false);

  return (
    <div style={{ maxWidth: 620 }}>
      <BackBtn onClick={() => setTab("dashboard")} />
      <h2
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Paste Data
      </h2>
      <p style={{ color: W35, fontSize: 13, marginBottom: 26 }}>
        Paste CSV, JSON or tab-separated data directly
      </p>
      {!parsed ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["csv", "json", "tsv"].map((f) => (
              <button
                key={f}
                onClick={() => setFmt(f as "csv" | "json" | "tsv")}
                style={{
                  padding: "6px 14px",
                  background: fmt === f ? CYAN : "transparent",
                  border: `1px solid ${fmt === f ? CYAN : W12}`,
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: fmt === f ? "#111212" : W35,
                  cursor: "pointer",
                }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={PH[fmt]}
              rows={9}
              style={{
                width: "100%",
                background: "transparent",
                border: `1.5px solid ${raw ? C35 : W12}`,
                color: "#fff",
                padding: "12px 14px",
                fontSize: 12,
                outline: "none",
                resize: "vertical",
                fontFamily: "monospace",
                lineHeight: 1.75,
                borderRadius: 5,
                boxSizing: "border-box",
              }}
            />
            {raw && (
              <button
                onClick={() => setRaw("")}
                style={{
                  position: "absolute",
                  top: 9,
                  right: 11,
                  background: "none",
                  border: "none",
                  color: W35,
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                Clear
              </button>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: W20, fontSize: 12 }}>
              {raw.split("\n").filter(Boolean).length} lines
            </span>
            <Btn onClick={() => raw.trim() && setParsed(true)}>
              Parse Data →
            </Btn>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
          <SuccessBanner>
            <p style={{ color: "#fff", fontSize: 13, flex: 1 }}>
              Parsed — {PASTE_PREV.length - 1} rows detected
            </p>
            <button
              onClick={() => setParsed(false)}
              style={{
                background: "none",
                border: "none",
                color: W35,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          </SuccessBanner>
          <div>
            <FieldLabel>Preview</FieldLabel>
            <div style={{ marginTop: 9 }}>
              <DataTable rows={PASTE_PREV} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Btn variant="ghost" onClick={() => setParsed(false)}>
              ← Edit Data
            </Btn>
            <Btn onClick={() => setTab("new-graph")}>Create Graph →</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────
function TemplatesPage({ setTab }: { setTab: (tab: string) => void }) {
  return (
    <div style={{ maxWidth: 800 }}>
      <h2
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Templates
      </h2>
      <p style={{ color: W35, fontSize: 13, marginBottom: 26 }}>
        Start faster with pre-built chart collections
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))",
          gap: 12,
        }}
      >
        {TEMPLATES.map((t, i) => {
          const [hov, setHov] = useState(false);
          return (
            <div
              key={t.title}
              onMouseEnter={() => setHov(true)}
              onMouseLeave={() => setHov(false)}
              style={{
                border: `1px solid ${hov ? W20 : W08}`,
                borderRadius: 7,
                padding: "21px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "all 0.2s",
                opacity: 0,
                animation: `fadeUp 0.4s ease ${i * 0.07}s forwards`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>
                  {t.title}
                </span>
                <Chip cyan>{t.tag}</Chip>
              </div>
              <p style={{ color: W35, fontSize: 13, lineHeight: 1.6 }}>
                {t.desc}
              </p>
              <p style={{ color: W20, fontSize: 12 }}>
                {t.count} pre-built charts
              </p>
              <Btn
                variant="outline"
                size="sm"
                onClick={() => setTab("new-graph")}
                style={{ alignSelf: "flex-start" }}
              >
                Use Template →
              </Btn>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────
function SettingsPage() {
  const [name, setName] = useState(USER.name);
  const [email, setEmail] = useState(USER.email);
  return (
    <div style={{ maxWidth: 480 }}>
      <h2
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Settings
      </h2>
      <p style={{ color: W35, fontSize: 13, marginBottom: 26 }}>
        Manage your account preferences
      </p>
      <SectionCard style={{ marginBottom: 13 }}>
        <SectionHead title="Profile" />
        <div
          style={{
            padding: 17,
            display: "flex",
            flexDirection: "column",
            gap: 13,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <FieldLabel>Full Name</FieldLabel>
            <FieldInput
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Full name"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <FieldLabel>Email</FieldLabel>
            <FieldInput
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="Email"
            />
          </div>
          <Btn size="sm" style={{ alignSelf: "flex-start" }}>
            Save Changes
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BILLING
// ─────────────────────────────────────────────────────────────
function BillingPage() {
  return (
    <div style={{ maxWidth: 540 }}>
      <h2
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Billing
      </h2>
      <p style={{ color: W35, fontSize: 13, marginBottom: 26 }}>
        Manage your plan and payment
      </p>
      <div
        style={{
          border: `1px solid ${C35}`,
          borderRadius: 7,
          padding: "20px 22px",
          marginBottom: 11,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 13,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 4,
            }}
          >
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>
              Pro Plan
            </span>
            <Chip cyan>Active</Chip>
          </div>
          <p style={{ color: W35, fontSize: 13 }}>
            $29 / month · Renews Feb 1, 2026
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 8,
              fontSize: 12,
              color: CYAN,
            }}
          >
            <span>✓ Unlimited graphs</span>
            <span>✓ 10GB storage</span>
            <span>✓ Priority support</span>
          </div>
        </div>
        <Btn variant="ghost" size="sm">
          Manage
        </Btn>
      </div>
      <div
        style={{
          border: `1px solid ${W08}`,
          borderRadius: 7,
          padding: "15px 17px",
          marginBottom: 11,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          <span style={{ color: W35 }}>Storage Used</span>
          <span style={{ color: "#fff", fontWeight: 700 }}>2.1 / 10 GB</span>
        </div>
        <div
          style={{
            height: 4,
            background: W08,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "21%",
              height: "100%",
              background: CYAN,
              borderRadius: 2,
            }}
          />
        </div>
      </div>
      <SectionCard>
        <SectionHead title="Invoice History" />
        {[
          ["Jan 2026", "$29.00"],
          ["Dec 2025", "$29.00"],
          ["Nov 2025", "$29.00"],
        ].map(([date, amt], i, arr) => (
          <div
            key={date}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 17px",
              borderBottom: i < arr.length - 1 ? `1px solid ${W08}` : "none",
            }}
          >
            <span
              style={{ flex: 1, color: "#fff", fontWeight: 600, fontSize: 13 }}
            >
              {date}
            </span>
            <span style={{ color: W35, fontSize: 13, marginRight: 16 }}>
              {amt}
            </span>
            <Chip cyan>Paid</Chip>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELP
// ─────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How do I share a graph?",
    a: "Open any graph and click Share. You'll get a public link instantly with optional expiry or password protection.",
  },
  {
    q: "Can I import from Google Sheets?",
    a: "Yes — click Connect Google Sheets on the Dashboard. Authentication takes about 30 seconds.",
  },
  {
    q: "How do I change my plan?",
    a: "Go to Billing in the sidebar. You can upgrade, downgrade, or cancel at any time.",
  },
  {
    q: "Is my data encrypted?",
    a: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never sell your data.",
  },
  {
    q: "What file formats can I import?",
    a: "We support .xlsx, .xls, .csv, JSON arrays, tab-separated values, plus live Google Sheets connections.",
  },
];

function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ maxWidth: 540 }}>
      <h2
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Help & Support
      </h2>
      <p style={{ color: W35, fontSize: 13, marginBottom: 26 }}>
        Answers and a real human if you need one
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          marginBottom: 16,
        }}
      >
        {FAQS.map((f, i) => (
          <div
            key={i}
            style={{
              border: `1px solid ${open === i ? W20 : W08}`,
              borderRadius: 6,
              overflow: "hidden",
              transition: "border-color 0.15s",
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "14px 17px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: "left",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
                {f.q}
              </span>
              <span
                style={{
                  color: CYAN,
                  fontSize: 16,
                  display: "inline-block",
                  transition: "transform 0.18s",
                  transform: open === i ? "rotate(45deg)" : "none",
                  flexShrink: 0,
                  marginLeft: 11,
                }}
              >
                +
              </span>
            </button>
            {open === i && (
              <div
                style={{
                  padding: "12px 17px 14px",
                  color: W35,
                  fontSize: 13,
                  lineHeight: 1.7,
                  borderTop: `1px solid ${W08}`,
                }}
              >
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          border: `1px solid ${W08}`,
          borderRadius: 7,
          padding: "17px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            Still stuck?
          </div>
          <div style={{ color: W35, fontSize: 13 }}>
            Our team replies within 24 hours on business days.
          </div>
        </div>
        <Btn size="sm">Contact Us</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [sideOpen, setSide] = useState(true);
  const [collapsed, setCol] = useState(false);

  const pages = {
    dashboard: <DashboardHome setTab={setTab} />,
    graphs: <GraphGrid graphs={GRAPHS} emptyMsg="No graphs yet" />,
    shared: (
      <GraphGrid
        graphs={GRAPHS.slice(0, 3)}
        emptyMsg="Nothing shared with you yet"
      />
    ),
    favourites: (
      <GraphGrid
        graphs={GRAPHS.filter((g) => g.starred)}
        emptyMsg="Star graphs to save them here"
      />
    ),
    templates: <TemplatesPage setTab={setTab} />,
    settings: <SettingsPage />,
    billing: <BillingPage />,
    help: <HelpPage />,
    "new-graph": <NewGraphPage setTab={setTab} />,
    "import-google": <ImportGooglePage setTab={setTab} />,
    "import-excel": <ImportExcelPage setTab={setTab} />,
    "import-paste": <ImportPastePage setTab={setTab} />,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: "#fff",
        display: "flex",
        overflow: "hidden",
        fontFamily:
          "'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.20); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(8,145,178,0.35); }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes stpMove { to { background-position: 18px 0; } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(11px); } to { opacity:1; transform:none; } }
      `}</style>

      <Sidebar
        open={sideOpen}
        collapsed={collapsed}
        setCollapsed={setCol}
        tab={tab}
        onTab={setTab}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* Topbar */}
        <header
          style={{
            background: BG,
            borderBottom: `1px solid ${W08}`,
            padding: "0 19px",
            height: 50,
            display: "flex",
            alignItems: "center",
            gap: 11,
            flexShrink: 0,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setSide((s) => !s)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: W35,
              display: "flex",
              flexDirection: "column",
              gap: 3.5,
              padding: 5,
            }}
          >
            <span
              style={{
                width: 14,
                height: 1.5,
                background: "currentColor",
                display: "block",
              }}
            />
            <span
              style={{
                width: 14,
                height: 1.5,
                background: "currentColor",
                display: "block",
              }}
            />
            <span
              style={{
                width: 10,
                height: 1.5,
                background: "currentColor",
                display: "block",
              }}
            />
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 13,
            }}
          >
            <span style={{ color: W20 }}>Graphix</span>
            <span style={{ color: W20 }}>/</span>
            <span style={{ color: "#fff", fontWeight: 600 }}>
              {PAGE_TITLES[tab as keyof typeof PAGE_TITLES] ?? tab}
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              width: 31,
              height: 31,
              borderRadius: 6,
              background: C18,
              border: `1px solid ${C35}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              color: CYAN,
              cursor: "pointer",
            }}
          >
            {USER.avatar}
          </div>
        </header>

        <main
          style={{
            flex: 1,
            padding: "24px 24px 48px",
            overflowY: "auto",
            background: BG,
          }}
        >
          {pages[tab as keyof typeof pages] ?? null}
        </main>
      </div>
    </div>
  );
}
