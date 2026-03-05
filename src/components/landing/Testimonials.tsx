"use client";

import {
  CSSProperties,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import useReveal from "./useReveal";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Testimonial {
  name: string;
  role: string;
  text: string;
}

interface TestiCardProps {
  t: Testimonial;
  i: number;
}

type FadeUpReturn = [MutableRefObject<HTMLElement | null>, CSSProperties];
type RevealRef = MutableRefObject<HTMLElement | null>;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const TESTI: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Head of Analytics · Stripe",
    text: "I went from hours of Excel hell to a beautiful chart in 30 seconds. Absolute game changer.",
  },
  {
    name: "Marcus Reid",
    role: "CEO · Launchpad Ventures",
    text: "Our board presentations look like they came from a design agency. Nobody believes we made them ourselves.",
  },
  {
    name: "Aisha Kamara",
    role: "Data Lead · Shopify",
    text: "The AI understands my data intuitively. It picked the right chart type before I even had to ask.",
  },
  {
    name: "Tom Nguyen",
    role: "Founder · Clearpath",
    text: "5 days of reporting done in 4 hours. My team thought I'd hired a data scientist.",
  },
  {
    name: "Priya Sharma",
    role: "Product Manager · Linear",
    text: "Finally a tool that makes data beautiful without requiring a PhD in design.",
  },
  {
    name: "James Okafor",
    role: "CFO · Seedbank",
    text: "Our investors commented on how clear and beautiful our charts were. Never happened before.",
  },
];

const AVATAR_COLORS: string[] = [
  "bg-blue-500   border border-blue-400",
  "bg-violet-500 border border-violet-400",
  "bg-teal-500   border border-teal-400",
  "bg-indigo-500 border border-indigo-400",
  "bg-purple-500 border border-purple-400",
  "bg-cyan-500   border border-cyan-400",
];

// ─── FADE-UP HOOK ─────────────────────────────────────────────────────────────

function useFadeUp(delay: number = 0): FadeUpReturn {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px)" : "translateY(36px)",
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`,
  };

  return [ref, style];
}

// ─── TESTI CARD ───────────────────────────────────────────────────────────────

function TestiCard({ t, i }: TestiCardProps) {
  const revealRef = useReveal() as RevealRef;
  const [fadeRef, fadeStyle] = useFadeUp(i * 0.08);

  return (
    <div
      ref={(el: HTMLDivElement | null) => {
        revealRef.current = el;
        fadeRef.current = el;
      }}
      style={fadeStyle}
      className="relative bg-white border border-slate-200 rounded-2xl p-7 overflow-hidden transition-all duration-300 hover:border-sky-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(14,165,233,0.12)] group"
    >
      {/* Top shimmer on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300" />

      {/* Stars */}
      <div className="text-sky-400 text-[0.8rem] tracking-widest mb-4">
        ★★★★★
      </div>

      {/* Quote */}
      <p className="italic text-slate-600 leading-[1.7] mb-5">
        &ldquo;{t.text}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-[0.88rem] font-bold text-white shrink-0 ${AVATAR_COLORS[i]}`}
        >
          {t.name[0]}
        </div>
        <div>
          <div className="text-[0.84rem] font-semibold text-slate-800">
            {t.name}
          </div>
          <div className="font-mono text-[0.65rem] text-slate-400 tracking-wide">
            {t.role}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

export default function Testimonials() {
  const ref = useReveal() as RevealRef;
  const [headRef, headStyle] = useFadeUp(0);

  return (
    <section className="relative z-10 px-8 py-24">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-sky-100 rounded-full opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 bg-violet-100 rounded-full opacity-30 blur-3xl" />

      {/* Heading */}
      <div
        ref={(el: HTMLDivElement | null) => {
          ref.current = el;
          headRef.current = el;
        }}
        style={headStyle}
        className="text-center mb-16"
      >
        <div className="font-mono text-[0.63rem] tracking-[0.16em] uppercase text-sky-500/75 mb-5">
          Wall of love
        </div>
        <h2
          className="font-bold text-slate-800 tracking-tight leading-[1.1] mb-5"
          style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}
        >
          Loved by <em className="not-italic text-sky-500">data people</em>
        </h2>
        <p className="text-slate-500 leading-[1.8] max-w-[400px] mx-auto">
          Join thousands who've made data storytelling effortless.
        </p>
      </div>

      {/* Grid */}
      <div
        className="grid gap-5 max-w-[1100px] mx-auto"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}
      >
        {TESTI.map((t, i) => (
          <TestiCard key={i} t={t} i={i} />
        ))}
      </div>
    </section>
  );
}
