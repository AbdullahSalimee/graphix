"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Product" },
  { href: "/docs", label: "Docs" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 h-16 bg-[rgba(9,11,14,0.88)] backdrop-blur-lg border-b border-[#1e2227]">
      {/* Logo */}
      <span className="font-syne font-extrabold text-[1.05rem] border border-white px-3 py-1 tracking-wide text-white">
        Graphix
      </span>

      {/* Links */}
      <div className="hidden md:flex gap-10">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-[0.78rem] uppercase tracking-widest font-medium transition-colors duration-200 ${
              pathname === l.href ? "text-white" : "text-[#6b7280] hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <button className="border border-white px-4 py-[7px] text-[0.74rem] uppercase tracking-widest font-semibold text-white bg-transparent hover:bg-white hover:text-[#090b0e] transition-all duration-200">
        Install Now
      </button>
    </nav>
  );
}
