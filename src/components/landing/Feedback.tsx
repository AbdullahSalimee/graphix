"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getStoredToken, submitFeedback } from "@/lib/api";

// ── Schema ────────────────────────────────────────────────────
const feedbackSchema = z.object({
  name: z.string().min(2, "At least 2 characters").max(60),
  email: z.string().min(1, "Required").email("Enter a valid email"),
  thoughts: z.string().min(10, "At least 10 characters").max(1000),
});
type FeedbackInput = z.infer<typeof feedbackSchema>;

// ── Testimonials ──────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      "I left a note about the export flow. Three weeks later it was redesigned. Never happened with any other tool.",
    author: "Arya S.",
    role: "Growth Lead",
    stars: 5,
  },
  {
    quote:
      "Mentioned a missing chart type in passing. It shipped in the next update. These people actually listen.",
    author: "James K.",
    role: "Data Analyst",
    stars: 5,
  },
  {
    quote:
      "Got a personal reply from the founder within a day. Your message lands directly in front of someone who cares.",
    author: "Priya M.",
    role: "Startup Founder",
    stars: 5,
  },
  {
    quote:
      "The 3D charts work in the browser. No plugins, no crashes. That alone sold me.",
    author: "Chen W.",
    role: "Data Scientist",
    stars: 5,
  },
  {
    quote:
      "Went from raw CSV to a board-ready chart in under 2 minutes. Nothing else comes close.",
    author: "Sarah O.",
    role: "Product Manager",
    stars: 5,
  },
  {
    quote:
      "The visual editor is what makes it. I can match our brand colors without touching a config file.",
    author: "Marcus T.",
    role: "Marketing Lead",
    stars: 5,
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ color: "#f59e0b", fontSize: 11 }}>
          ★
        </span>
      ))}
    </div>
  );
}

function TestimonialCard({
  t,
  index,
  visible,
}: {
  t: (typeof TESTIMONIALS)[0];
  index: number;
  visible: boolean;
}) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(20px)",
        transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s cubic-bezier(.22,1,.36,1) ${index * 0.08}s`,
        background: "#141515",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        padding: "22px 22px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <Stars n={t.stars} />
      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.7,
          margin: 0,
          fontStyle: "italic",
        }}
      >
        "{t.quote}"
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: "auto",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #06b6d4, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {t.author[0]}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
            {t.author}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              fontFamily: "monospace",
            }}
          >
            {t.role}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feedback Form ──────────────────────────────────────────────
function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackInput>({ resolver: zodResolver(feedbackSchema) });
  const thoughts = watch("thoughts", "");

  const onSubmit = async (data: FeedbackInput) => {
    setServerError(null);
    const token = getStoredToken() ?? undefined;
    try {
      await submitFeedback(
        { name: data.name, email: data.email, thoughts: data.thoughts },
        token,
      );
      setSubmitted(true);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  const fieldStyle = (hasErr: boolean): React.CSSProperties => ({
    width: "100%",
    background: "#0e0f0f",
    border: `1.5px solid ${hasErr ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: 7,
    color: "#fff",
    fontSize: 13,
    padding: "11px 14px",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  });

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8,
          }}
        >
          Thank you.
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.7,
          }}
        >
          Your thoughts just landed in a real inbox. We'll read every word.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.4)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Name
          </label>
          <input
            type="text"
            placeholder="Alex Chen"
            style={fieldStyle(!!errors.name)}
            {...register("name")}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(6,182,212,0.5)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = errors.name
                ? "rgba(239,68,68,0.5)"
                : "rgba(255,255,255,0.08)")
            }
          />
          {errors.name && (
            <p style={{ color: "#f87171", fontSize: 10, marginTop: 4 }}>
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.4)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <input
            type="email"
            placeholder="you@company.com"
            style={fieldStyle(!!errors.email)}
            {...register("email")}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(6,182,212,0.5)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = errors.email
                ? "rgba(239,68,68,0.5)"
                : "rgba(255,255,255,0.08)")
            }
          />
          {errors.email && (
            <p style={{ color: "#f87171", fontSize: 10, marginTop: 4 }}>
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <label
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Your thoughts
          </label>
          <span
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            {thoughts.length}/1000
          </span>
        </div>
        <textarea
          rows={4}
          maxLength={1000}
          placeholder="What's working? What isn't? What do you wish Graphix could do?"
          style={{ ...fieldStyle(!!errors.thoughts), resize: "none" }}
          {...register("thoughts")}
          onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.5)")}
          onBlur={(e) =>
            (e.target.style.borderColor = errors.thoughts
              ? "rgba(239,68,68,0.5)"
              : "rgba(255,255,255,0.08)")
          }
        />
        {errors.thoughts && (
          <p style={{ color: "#f87171", fontSize: 10, marginTop: 4 }}>
            {errors.thoughts.message}
          </p>
        )}
      </div>

      {serverError && (
        <p
          style={{
            color: "#f87171",
            fontSize: 11,
            padding: "8px 12px",
            background: "rgba(239,68,68,0.08)",
            borderRadius: 6,
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          height: 46,
          background: "#06b6d4",
          color: "#fff",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          border: "none",
          borderRadius: 7,
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "opacity 0.2s",
        }}
      >
        {isSubmitting ? (
          <>
            <span
              style={{
                width: 14,
                height: 14,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "fb-spin 0.8s linear infinite",
              }}
            />
            Sending…
          </>
        ) : (
          "Send Feedback →"
        )}
      </button>

      <p
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.2)",
          textAlign: "center",
          fontFamily: "monospace",
        }}
      >
        No spam. No follow-ups unless you want them.
      </p>
    </form>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function Feedback() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`@keyframes fb-spin { to { transform: rotate(360deg); } }`}</style>

      <section
        style={{
          background: "#0d0e0e",
          padding: "96px 0 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
            backgroundSize: "52px 52px",
            pointerEvents: "none",
          }}
        />

        <div
          ref={sectionRef}
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 56,
              opacity: vis ? 1 : 0,
              transform: vis ? "none" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                border: "1px solid rgba(6,182,212,0.2)",
                background: "rgba(6,182,212,0.05)",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#06b6d4",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "rgba(6,182,212,0.8)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                What users say
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "0 0 14px",
              }}
            >
              Real feedback. Real impact.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.35)",
                maxWidth: 420,
                margin: "0 auto",
                lineHeight: 1.7,
                fontFamily: "monospace",
              }}
            >
              Every feature in Graphix started as someone's frustration. Here's
              what they said after.
            </p>
          </div>

          {/* Two-column: testimonials + form */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 400px",
              gap: 40,
              alignItems: "start",
            }}
          >
            {/* Testimonial grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {TESTIMONIALS.map((t, i) => (
                <TestimonialCard key={i} t={t} index={i} visible={vis} />
              ))}
            </div>

            {/* Feedback form */}
            <div
              style={{
                opacity: vis ? 1 : 0,
                transform: vis ? "none" : "translateY(20px)",
                transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s",
                position: "sticky",
                top: 80,
              }}
            >
              <div
                style={{
                  background: "#141515",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "22px 24px 18px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 5,
                    }}
                  >
                    Share your feedback
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.35)",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    Three fields. Two minutes. Your words shape the next
                    release.
                  </p>
                </div>
                <div style={{ padding: "22px 24px" }}>
                  <FeedbackForm />
                </div>
              </div>

              {/* Mini why-it-matters */}
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {[
                  [
                    "We read every word",
                    "No bot. A real person reads your message within hours.",
                  ],
                  [
                    "We reply — often",
                    "Leave your email. There's a real chance you'll hear back.",
                  ],
                  [
                    "Features ship from feedback",
                    "Every chart type you see today started as someone's request.",
                  ],
                ].map(([title, desc]) => (
                  <div
                    key={title}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px 12px",
                      background: "#141515",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <span
                      style={{
                        color: "#06b6d4",
                        fontSize: 14,
                        flexShrink: 0,
                        lineHeight: 1,
                      }}
                    >
                      ✦
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.7)",
                          marginBottom: 2,
                        }}
                      >
                        {title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.3)",
                          lineHeight: 1.5,
                        }}
                      >
                        {desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
