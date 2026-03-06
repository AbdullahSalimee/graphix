"use client";

import Link from "next/link";
import { useState, useEffect, useRef, MouseEvent } from "react";

const NAV_LINKS = [
  "Features",
  "How it works",
  "Chart Types",
  "Pricing",
] as const;

type NavLink = (typeof NAV_LINKS)[number];

interface NavProps {
  onLaunch: (event: MouseEvent) => any; // ← flexible & fixes the error
  // Alternative (still good): React.MouseEventHandler<HTMLElement>
}

export default function Nav({ onLaunch }: NavProps) {
  const [stuck, setStuck] = useState<boolean>(false);
  const [active, setActive] = useState<number>(0);
  const [slider, setSlider] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setStuck(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = pillRefs.current[active];
    const wrap = wrapRef.current;

    if (el && wrap) {
      const wrapRect = wrap.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      setSlider({
        left: elRect.left - wrapRect.left,
        width: elRect.width,
      });
    }
  }, [active]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-8 flex items-center justify-between transition-all duration-300 p-4`}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={onLaunch}
      >
        <img src="/icon.png" alt="" className="h-8 contrast-100 invert" />
      </div>

      {/* Sliding pill nav */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <div
          ref={wrapRef}
          className={`relative flex items-center rounded-2xl px-3 py-2 gap-2 backdrop-blur-xl ${
            stuck ? "bg-cyan-900/10" : "bg-transparent"
          }`}
        >
          <div
            className="absolute h-[calc(100%-15px)] top-[6px] border-b border-black pointer-events-none transition-all duration-300"
            style={{ left: slider.left + 12, width: slider.width - 25 }}
          />

          {NAV_LINKS.map((link, index) => (
            <button
              key={link}
              ref={(el) => {
                pillRefs.current[index] = el;
              }}
              onClick={() => setActive(index)}
              className={`relative z-10 font-mono text-sm font-medium px-4 py-1.5 rounded-full whitespace-nowrap tracking-wide transition-colors duration-200 ${
                active === index
                  ? "text-cyan-900"
                  : "text-black hover:text-slate-400"
              }`}
            >
              {link}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/auth/signin"
        className={`
          relative overflow-hidden
          font-sans text-[0.82rem] font-semibold
          px-5 py-2 rounded-lg
          bg-gradient-to-r from-sky-700 to-sky-600
          text-white tracking-wide
          transition-all duration-200
          hover:-translate-y-0.5
          hover:shadow-[0_8px_32px_rgba(56,189,248,0.25)]
          before:absolute before:inset-0 before:rounded-[inherit]
          before:bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.25)_50%,transparent_60%)]
          before:translate-x-[-100%]
          before:transition-transform before:duration-500 before:ease-out
          hover:before:translate-x-[100%]
        `}
      >
        Sign in/ Sign up
      </Link>
    </nav>
  );
}
