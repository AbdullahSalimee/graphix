"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import AuthCard from "./ui/AuthCard";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type ForgotInput = z.infer<typeof forgotSchema>;

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotInput) => {
    setServerError(null);
    try {
      // Replace with your actual call e.g. sendResetEmail(data.email)
      await new Promise((r) => setTimeout(r, 1500));
      console.log("Reset requested for:", data.email);
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <AuthCard
      title={submitted ? "Check your inbox." : "Forgot password?"}
      subtitle={
        submitted
          ? `We sent a reset link to ${getValues("email")}. It expires in 15 minutes.`
          : "No worries. Enter your email and we'll send you a reset link right away."
      }
      footerText="Remembered it?"
      footerLinkLabel="Back to sign in"
      footerLinkHref="/login"
    >
      {submitted ? (
        /* ── SUCCESS STATE ── */
        <div className="flex flex-col gap-5">
          {/* Animated check */}
          <div className="flex justify-center py-4">
            <div className="w-16 h-16 rounded-full border border-[#00d4c8] bg-[rgba(0,212,200,0.06)] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M5 14L11 20L23 8"
                  stroke="#00d4c8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="30"
                  strokeDashoffset="0"
                  style={{
                    animation: "drawCheck 0.5s ease 0.1s both",
                  }}
                />
                <style>{`
                  @keyframes drawCheck {
                    from { stroke-dashoffset: 30; }
                    to   { stroke-dashoffset: 0;  }
                  }
                `}</style>
              </svg>
            </div>
          </div>

          {/* Hints */}
          <div className="border border-[#1e2227] bg-[#0d1014] divide-y divide-[#1e2227]">
            {[
              {
                icon: "📬",
                text: "Check your spam folder if you don't see it.",
              },
              { icon: "⏱", text: "The link expires in 15 minutes." },
              {
                icon: "🔁",
                text: "You can request a new link after 60 seconds.",
              },
            ].map((h) => (
              <div key={h.text} className="flex items-start gap-3 px-4 py-3">
                <span className="text-[0.9rem] mt-px">{h.icon}</span>
                <p className="text-[#6b7280] text-[0.8rem] leading-relaxed">
                  {h.text}
                </p>
              </div>
            ))}
          </div>

          {/* Resend */}
          <ResendButton email={getValues("email")} />
        </div>
      ) : (
        /* ── FORM STATE ── */
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <AuthInput
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          {serverError && (
            <p className="text-red-400 text-[0.78rem] bg-red-500/10 border border-red-500/20 px-3 py-2">
              {serverError}
            </p>
          )}

          <AuthButton
            loading={isSubmitting}
            label="Send Reset Link →"
            loadingLabel="Sending…"
          />

          <Link
            href="/login"
            className="text-center text-[#6b7280] text-[0.8rem] hover:text-white transition-colors duration-200"
          >
            ← Back to sign in
          </Link>
        </form>
      )}
    </AuthCard>
  );
}

// Add this component at the bottom of ForgotPasswordForm.tsx

function ResendButton({ email }: { email: string }) {
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [done, setDone] = useState(false);

  // Start countdown on mount
  useState(() => {
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    // Replace with your actual resend call
    await new Promise((r) => setTimeout(r, 1200));
    setResending(false);
    setDone(true);
    setCooldown(60);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={cooldown > 0 || resending}
      className="w-full border border-[#1e2227] text-[0.82rem] py-3.5 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#6b7280] text-white"
    >
      {resending ? (
        <>
          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Resending…
        </>
      ) : done ? (
        <span className="text-[#00d4c8]">✓ Sent again</span>
      ) : cooldown > 0 ? (
        <span className="text-[#6b7280]">Resend in {cooldown}s</span>
      ) : (
        "Resend email"
      )}
    </button>
  );
}