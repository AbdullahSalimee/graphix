"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const feedbackSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters").max(60),
  email:    z.string().min(1, "Email is required").email("Enter a valid email"),
  thoughts: z.string().min(10, "Tell us a little more — at least 10 characters").max(1000),
});
type FeedbackInput = z.infer<typeof feedbackSchema>;

// ── Background canvas animation ──────────────────────────
function FeedbackCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const lines = [
      { base: 0.30, trend: 0.18, freq1: 0.04, freq2: 0.018, amp1: 22, amp2: 12, speed1: 0.003, speed2: 0.0015, phase: 0.0,  alpha: 0.55, lw: 1.8 },
      { base: 0.50, trend: 0.14, freq1: 0.05, freq2: 0.022, amp1: 18, amp2: 9,  speed1: 0.004, speed2: 0.002,  phase: 1.8,  alpha: 0.25, lw: 1.2 },
      { base: 0.68, trend: 0.10, freq1: 0.035,freq2: 0.016, amp1: 14, amp2: 7,  speed1: 0.0025,speed2: 0.0012, phase: 3.4,  alpha: 0.12, lw: 0.9 },
    ];

    const buildPts = (
      w: number, h: number,
      base: number, trend: number,
      freq1: number, freq2: number,
      amp1: number, amp2: number,
      speed1: number, speed2: number,
      phase: number,
      n = 90
    ) =>
      Array.from({ length: n }, (_, i) => ({
        x: (i / (n - 1)) * w,
        y: h * base
          - (i / (n - 1)) * h * trend
          + Math.sin(i * freq1 + t * speed1 + phase) * amp1
          + Math.sin(i * freq2 + t * speed2 + phase + 1) * amp2,
      }));

    const drawLine = (
      pts: { x: number; y: number }[],
      alpha: number, lw: number, h: number
    ) => {
      if (pts.length < 2) return;

      // Area
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.35})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.moveTo(pts[0].x, h);
      ctx.lineTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const cx = (pts[i-1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(cx, pts[i-1].y, cx, pts[i].y, pts[i].x, pts[i].y);
      }
      ctx.lineTo(pts[pts.length-1].x, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Glow for main line
      if (lw > 1.5) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const cx = (pts[i-1].x + pts[i].x) / 2;
          ctx.bezierCurveTo(cx, pts[i-1].y, cx, pts[i].y, pts[i].x, pts[i].y);
        }
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.12})`;
        ctx.lineWidth = lw + 10;
        ctx.filter = "blur(6px)";
        ctx.stroke();
        ctx.filter = "none";
        ctx.restore();
      }

      // Line
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const cx = (pts[i-1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(cx, pts[i-1].y, cx, pts[i].y, pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = lw;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();
    };

    const drawGrid = (w: number, h: number) => {
      ctx.save();
      for (let i = 1; i <= 5; i++) {
        const y = (h / 6) * i;
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(w, y);
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      for (let i = 1; i <= 9; i++) {
        const x = (w / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
        ctx.strokeStyle = "rgba(255,255,255,0.02)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      t++;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#090b0e";
      ctx.fillRect(0, 0, w, h);

      // Vignette
      const vig = ctx.createRadialGradient(w/2, h/2, h*0.05, w/2, h/2, h*0.9);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      drawGrid(w, h);

      lines.forEach((l) => {
        const pts = buildPts(w, h, l.base, l.trend, l.freq1, l.freq2, l.amp1, l.amp2, l.speed1, l.speed2, l.phase);
        drawLine(pts, l.alpha, l.lw, h);
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

// ── Animated counter ─────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 60;
      const id = setInterval(() => {
        start += step;
        if (start >= target) { setVal(target); clearInterval(id); return; }
        setVal(Math.floor(start));
      }, 16);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Reason card ──────────────────────────────────────────
function ReasonCard({ num, title, desc, delay }: {
  num: string; title: string; desc: string; delay: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="border border-[#1e2227] bg-[rgba(9,11,14,0.8)] backdrop-blur-sm p-6 transition-all duration-700"
      style={{
        opacity:   vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        transitionDelay: delay,
      }}
    >
      <span className="font-syne font-extrabold text-[2rem] text-white opacity-10 leading-none block mb-3">
        {num}
      </span>
      <h3 className="font-syne font-bold text-[0.95rem] text-white mb-2">{title}</h3>
      <p className="text-[#6b7280] text-[0.82rem] leading-[1.7]">{desc}</p>
    </div>
  );
}

// ── Testimonial ticker ────────────────────────────────────
const testimonials = [
  { quote: "I left a note about the export flow. Three weeks later it was redesigned. Never happened with any other tool.", author: "Arya S., Growth Lead" },
  { quote: "Mentioned a missing chart type in passing. It shipped in the next update. These people actually listen.", author: "James K., Data Analyst" },
  { quote: "Got a personal reply from the founder within a day. That's when I knew this team was different.", author: "Priya M., Startup Founder" },
  { quote: "My feedback turned into a feature that now saves our team 3 hours a week. Wildly worth two minutes.", author: "Tom R., Product Manager" },
];

function TestimonialTicker() {
  const [idx, setIdx]   = useState(0);
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setAnim(true);
      setTimeout(() => { setIdx((i) => (i + 1) % testimonials.length); setAnim(false); }, 400);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const t = testimonials[idx];

  return (
    <div className="mt-px border border-[#1e2227] bg-[rgba(9,11,14,0.85)] backdrop-blur-sm px-8 py-7 relative overflow-hidden">
      <div className="absolute left-0 top-6 bottom-6 w-[2px] bg-white opacity-15 rounded-full" />
      <div style={{
        opacity:   anim ? 0 : 1,
        transform: anim ? "translateY(-10px)" : "translateY(0)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}>
        <p className="text-white text-[0.9rem] leading-[1.75] mb-4 pl-5">"{t.quote}"</p>
        <p className="text-[rgba(255,255,255,0.45)] text-[0.75rem] font-syne font-semibold pl-5">— {t.author}</p>
      </div>
      <div className="flex gap-1.5 mt-4 pl-5">
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{ background: i === idx ? "white" : "#1e2227" }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────
export default function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const [heroVis, setHeroVis]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVis(true), 100);
    return () => clearTimeout(t);
  }, []);

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackInput>({ resolver: zodResolver(feedbackSchema) });

  const thoughts = watch("thoughts", "");

  const onSubmit = async (data: FeedbackInput) => {
    await new Promise((r) => setTimeout(r, 1400));
    console.log("Feedback:", data);
    setSubmitted(true);
  };

  const fieldCls = (hasError: boolean) =>
    `w-full bg-[rgba(9,11,14,0.7)] backdrop-blur-sm border text-white text-[0.95rem] font-light px-5 py-4 outline-none placeholder-[#3a3f47] transition-all duration-200 focus:shadow-[0_0_0_2px_rgba(255,255,255,0.06)] resize-none ${
      hasError
        ? "border-red-500/60 focus:border-red-500"
        : "border-[#1e2227] focus:border-white"
    }`;

  return (
    <div className="relative min-h-screen bg-[#090b0e] overflow-hidden">
      {/* ── FULL PAGE CANVAS ── */}
      <div className="fixed inset-0 z-0">
        <FeedbackCanvas />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset:30; }
          to   { stroke-dashoffset:0;  }
        }
        @keyframes pulseRing {
          0%,100% { transform:scale(1);    opacity:0.5; }
          50%     { transform:scale(1.08); opacity:1;   }
        }
        @keyframes diagMove {
          from { background-position: 0 0; }
          to   { background-position: 9px 0; }
        }
        .pulse-ring { animation: pulseRing 2.8s ease-in-out infinite; }
      `}</style>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-40 pb-28">
        {/* Pill */}
        <div
          className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.12)] rounded-full px-4 py-1.5 text-[0.68rem] uppercase tracking-[0.12em] text-[rgba(255,255,255,0.5)] mb-8"
          style={{
            opacity: heroVis ? 1 : 0,
            transform: heroVis ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-60 animate-pulse" />
          Your voice matters
        </div>

        {/* Headline */}
        <h1
          className="font-syne font-extrabold text-[clamp(2.4rem,6vw,4.8rem)] leading-[1.0] tracking-tight  text-cyan-600 mb-6 max-w-[780px]"
          style={{
            opacity: heroVis ? 1 : 0,
            transform: heroVis ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}
        >
          Tell us what's
          <br />
          <em
            className="not-italic"
            style={{
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.7)",
            }}
          >
            on your mind.
          </em>
        </h1>

        {/* Sub */}
        <p
          className="text-[rgba(255,255,255,0.4)] text-[1rem] leading-[1.85] max-w-[480px] mb-16"
          style={{
            opacity: heroVis ? 1 : 0,
            transform: heroVis ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
          }}
        >
          We're not asking out of habit. Every word you write lands in front of
          a real person and changes something real about this product.
        </p>

        {/* Stats */}
        <div
          className="flex flex-wrap justify-center gap-px border border-[#1e2227] bg-[#1e2227]"
          style={{
            opacity: heroVis ? 1 : 0,
            transition: "opacity 0.6s ease 0.35s",
          }}
        >
          {[
            { num: 12000, suffix: "+", label: "teams trust us" },
            { num: 847, suffix: "", label: "requests shipped" },
            { num: 96, suffix: "+", label: "chart types built" },
            { num: 48, suffix: "h", label: "avg response time" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[rgba(9,11,14,0.9)] backdrop-blur-sm px-10 py-6 flex flex-col items-center gap-1.5 min-w-[140px]"
            >
              <span className="font-syne font-extrabold text-[1.9rem] text-white leading-none">
                <Counter target={s.num} suffix={s.suffix} />
              </span>
              <span className="text-[0.72rem] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.08em]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHY YOUR FEEDBACK MATTERS
      ══════════════════════════════════════ */}
      <section className="relative z-10 px-6 pb-24 max-w-[900px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-syne font-extrabold text-[clamp(1.6rem,3vw,2.4rem)] text-white tracking-tight mb-3">
            Why your feedback
            <span
              className="not-italic ml-2"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px oklch(60.9% 0.126 221.723)",
              }}
            >
              actually matters.
            </span>
          </h2>
          <p className="text-[rgba(255,255,255,0.3)] text-[0.9rem] max-w-[440px] mx-auto leading-relaxed">
            Not a survey. Not a box to check. Here's what happens when you hit
            send.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1e2227] border border-[#1e2227]">
          <ReasonCard
            num="01"
            delay="0s"
            title="We read every word"
            desc="Not a bot. Not a weekly digest. Your message lands directly in front of someone on the product team within hours."
          />
          <ReasonCard
            num="02"
            delay="0.1s"
            title="Your pain becomes priority"
            desc="Every feature you see in Graphix today started as someone's frustration. Yours could be next."
          />
          <ReasonCard
            num="03"
            delay="0.2s"
            title="We reply — often"
            desc="Leave your email and there's a real chance you'll hear back personally. We've shipped features from one reply."
          />
          <ReasonCard
            num="04"
            delay="0.3s"
            title="You speak for many"
            desc="When you share a pain point, you're almost certainly voicing what dozens of others felt but never said."
          />
        </div>

        <TestimonialTicker />
      </section>

      {/* ══════════════════════════════════════
          FORM
      ══════════════════════════════════════ */}
      <section className="relative z-10 px-6 pb-32">
        <div className="max-w-[560px] mx-auto">
          {submitted ? (
            <div
              className="flex flex-col items-center gap-6 text-center py-12"
              style={{ animation: "fadeUp 0.5s ease both" }}
            >
              <div className="pulse-ring w-20 h-20 rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
                <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M5 14L11 20L23 8"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="30"
                    style={{ animation: "drawCheck 0.5s ease 0.2s both" }}
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-syne font-extrabold text-[2rem] text-white tracking-tight mb-3">
                  Thank you.
                </h2>
                <p className="text-[rgba(255,255,255,0.4)] text-[0.95rem] leading-[1.8] max-w-[380px]">
                  Your thoughts just landed in a real inbox, in front of a real
                  person who genuinely cares.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
              {/* Animated divider */}

              <div className="w-full my-5 h-6 bg-[repeating-linear-gradient(-45deg,black_0px,white_5px,transparent_5px,transparent_10px)]"></div>

              <div className="mb-8 text-center">
                <h2 className="font-syne font-extrabold text-[1.6rem] text-white tracking-tight mb-2">
                  Ready to share?
                </h2>
                <p className="text-[rgba(255,255,255,0.3)] text-[0.87rem]">
                  Three fields. Two minutes. Real impact.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.72rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.35)]">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Alex Chen"
                      autoComplete="name"
                      className={fieldCls(!!errors.name)}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-[0.72rem]">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.72rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.35)]">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      className={fieldCls(!!errors.email)}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-[0.72rem]">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[0.72rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.35)]">
                      Your Thoughts
                    </label>
                    <span className="text-[0.68rem] text-[#3a3f47]">
                      {thoughts.length} / 1000
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    maxLength={1000}
                    placeholder="What's working? What isn't? What do you wish Graphix could do? Every word helps."
                    className={fieldCls(!!errors.thoughts)}
                    {...register("thoughts")}
                  />
                  {errors.thoughts && (
                    <p className="text-red-400 text-[0.72rem]">
                      {errors.thoughts.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full bg-white text-[#090b0e] font-syne font-bold text-[0.82rem] uppercase tracking-widest py-4 hover:opacity-85 transition-opacity duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#090b0e] border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Feedback →"
                  )}
                </button>
              </form>

              <p className="text-[#3a3f47] text-[0.74rem] text-center mt-5 leading-relaxed">
                No spam. No follow-ups unless you want them.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}