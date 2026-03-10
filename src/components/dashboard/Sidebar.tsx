import { CYAN, BG, W08, W20, W35, W55, C18, C35 } from "@/lib/Tokens";
import { IC } from "@/lib/Tokens";
import { NAV as NAV_DATA, USER as USER_DATA } from "@/lib/Data";
import { Ico } from "./UIKit";

/**
 * Sidebar
 * Props: open, collapsed, setCollapsed, tab, onTab
 */
export default function Sidebar({ open, collapsed, setCollapsed, tab, onTab }: { open: boolean, collapsed: boolean, setCollapsed: (collapsed: boolean) => void, tab: string, onTab: (tab: string) => void }) {
  const w = open ? (collapsed ? 52 : 215) : 0;

  return (
    <aside
      style={{
        width: w,
        minWidth: w,
        background: BG,
        borderRight: `1px solid ${W08}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "all 0.27s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: collapsed ? 52 : 215,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "15px 12px",
            borderBottom: `1px solid ${W08}`,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            minHeight: 52,
          }}
        >
          {!collapsed && (
            <span
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: "-0.02em",
              }}
            >
              Graphix
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: W35,
              display: "flex",
              flexDirection: "column",
              gap: 3.5,
              padding: 4,
            }}
          >
            <span
              style={{
                width: 13,
                height: 1.5,
                background: "currentColor",
                display: "block",
              }}
            />
            <span
              style={{
                width: 13,
                height: 1.5,
                background: "currentColor",
                display: "block",
              }}
            />
            <span
              style={{
                width: 9,
                height: 1.5,
                background: "currentColor",
                display: "block",
              }}
            />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "5px 6px", overflowY: "auto" }}>
          {NAV_DATA.map((grp: any) => (
            <div key={grp.group} style={{ marginBottom: 2 }}>
              {!collapsed && (
                <div
                  style={{
                    color: W20,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "10px 8px 5px",
                  }}
                >
                  {grp.group}
                </div>
              )}
              {grp.items.map((item: { id: keyof typeof IC; label: string; badge?: string }) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      width: "100%",
                      background: active ? C18 : "transparent",
                      border: `1px solid ${active ? C35 : "transparent"}`,
                      borderRadius: 5,
                      padding: collapsed ? "9px" : "8px 9px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      justifyContent: collapsed ? "center" : "flex-start",
                      transition: "all 0.15s",
                      marginBottom: 1.5,
                      position: "relative",
                    }}
                  >
                    {active && !collapsed && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 5,
                          bottom: 5,
                          width: 2.5,
                          background: CYAN,
                          borderRadius: "0 2px 2px 0",
                        }}
                      />
                    )}
                    <span style={{ color: active ? CYAN : W35, flexShrink: 0 }}>
                      <Ico d={IC[item.id] || IC.graphs} size={14} />
                    </span>
                    {!collapsed && (
                      <>
                        <span
                          style={{
                            flex: 1,
                            textAlign: "left",
                            color: active ? "#fff" : W55,
                            fontWeight: active ? 700 : 500,
                            fontSize: 13,
                          }}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            style={{
                              background: active ? C18 : W08,
                              color: active ? CYAN : W35,
                              borderRadius: 3,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "1px 5px",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div
          style={{
            borderTop: `1px solid ${W08}`,
            padding: collapsed ? "9px 6px" : "12px 13px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <div
            style={{
              width: 29,
              height: 29,
              borderRadius: 6,
              background: C18,
              border: `1px solid ${C35}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 800,
              color: CYAN,
              flexShrink: 0,
            }}
          >
            {USER_DATA.avatar}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
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
                {USER_DATA.name}
              </div>
              <div style={{ color: CYAN, fontSize: 11 }}>
                {USER_DATA.plan} plan
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
