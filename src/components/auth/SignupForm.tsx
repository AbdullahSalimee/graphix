"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signupSchema, type SignupInput } from "@/components/auth/authschema";
import AuthCard from "./ui/AuthCard";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";
import AuthDivider from "./ui/AuthDivider";
import PasswordStrength from "./ui/PasswordStrength";

export default function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { terms: false },
  });

  const password = watch("password", "");
  const termsVal = watch("terms");

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      console.log("Signup:", data);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <AuthCard
      title="Sign up now"
      subtitle="Join 12,000+ teams already seeing their data differently."
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkHref="/login"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <AuthInput
            label="First Name"
            type="text"
            placeholder="Alex"
            autoComplete="given-name"
            error={errors.name?.message}
            {...register("name")}
          />
          <AuthInput
            label="Last Name"
            type="text"
            placeholder="Chen"
            autoComplete="family-name"
          />
        </div>

        <AuthInput
          label="Email address"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-2">
          <AuthInput
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            right={
              <span className="text-[0.7rem] text-[#6b7280]">
                8+ chars, number & uppercase
              </span>
            }
            {...register("password")}
          />
          <PasswordStrength password={password} />
        </div>

        {/* Terms */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => {
                const current = termsVal;
                // manually toggle via setValue — using watch trick
              }}
              className="mt-0.5 flex-shrink-0"
            >
              <div
                className={`w-4 h-4 border transition-all duration-200 flex items-center justify-center ${
                  termsVal
                    ? "bg-white border-white"
                    : "border-[#3a3f47] bg-transparent"
                }`}
              >
                {termsVal && (
                  <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                    <path
                      d="M1.5 5L4 7.5L8.5 2.5"
                      stroke="#090b0e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
            </button>
            <input type="checkbox" className="sr-only" {...register("terms")} />
            <span className="text-[#6b7280] text-[0.8rem] leading-relaxed">
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-white underline underline-offset-2 hover:text-[#00d4c8] transition-colors"
              >
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-white underline underline-offset-2 hover:text-[#00d4c8] transition-colors"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="text-red-400 text-[0.72rem] ml-7">
              {errors.terms.message}
            </p>
          )}

          <label className="flex items-start gap-3 cursor-pointer mt-1">
            <div className="mt-0.5 w-4 h-4 border border-[#3a3f47] bg-transparent flex-shrink-0" />
            <span className="text-[#6b7280] text-[0.8rem] leading-relaxed">
              I consent to receive SMS and emails about product updates and
              marketing.
            </span>
          </label>
        </div>

        {serverError && (
          <p className="text-red-400 text-[0.78rem] bg-red-500/10 border border-red-500/20 px-3 py-2">
            {serverError}
          </p>
        )}

        {/* Submit row */}
        <div className="flex items-center justify-between mt-1">
          <AuthButton
            loading={isSubmitting}
            label="Sign up"
            loadingLabel="Creating account…"
          />
          <Link
            href="/auth/signin"
            className="text-[0.82rem] text-[#6b7280] hover:text-white transition-colors"
          >
            Already have an account?{" "}
            <span className="text-white font-medium">Log in</span>
          </Link>
        </div>
      </form>

      <AuthDivider showGithub />
    </AuthCard>
  );
}
