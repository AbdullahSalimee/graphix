import Link from "next/link";
import GraphBackground from "../GraphBackground";

interface AuthCardProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  children,
}: AuthCardProps) {
  return (
    <main className="min-h-screen bg-[#111212] flex items-center justify-center relative px-4 py-12">
      <GraphBackground />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/">
            <span className="font-syne font-extrabold text-[1.1rem] border border-white px-3 py-1 text-white tracking-wide hover:bg-white hover:text-[#090b0e] transition-all duration-200">
              Graphix
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="border border-[#1e2227] bg-[rgba(13,16,20,0.85)] backdrop-blur-md p-8">
          <div className="mb-8">
            <h1 className="font-syne font-extrabold text-[1.7rem] text-white leading-tight tracking-tight mb-2">
              {title}
            </h1>
            <p className="text-[#6b7280] text-[0.88rem] leading-relaxed">
              {subtitle}
            </p>
          </div>
          {children}
        </div>

        {/* Footer link */}
        <p className="text-center text-[#6b7280] text-[0.8rem] mt-6">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="text-[#00d4c8] hover:opacity-75 transition-opacity"
          >
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
