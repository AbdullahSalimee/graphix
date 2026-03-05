import Image from "next/image";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const LINKS: string[] = ["Terms", "Privacy", "Blog"];

// ─── FOOTER ───────────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 px-10 py-10 flex items-center justify-between flex-wrap gap-4 bg-gradient-to-b from-transparent to-white/[0.03]">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <Image
          src="/icon.png"
          alt="GraphAI logo"
          width={40}
          height={40}
          className="h-10 w-auto"
        />
        <span className="font-bold text-[0.95rem] text-slate-400">
          Graph<span className="text-sky-400">AI</span>
        </span>
      </div>

      {/* Credits */}
      <div className="font-mono text-[0.65rem] text-slate-700 tracking-wide">
        Powered by Groq · Llama 3.3-70B · Plotly.js · React · © 2026
      </div>

      {/* Nav links */}
      <nav className="flex gap-6">
        {LINKS.map((l) => (
          <span
            key={l}
            className="font-mono text-[0.65rem] text-slate-700 tracking-wide cursor-pointer hover:text-slate-400 transition-colors duration-200"
          >
            {l}
          </span>
        ))}
      </nav>
    </footer>
  );
}
