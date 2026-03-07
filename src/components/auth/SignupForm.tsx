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

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);
    try {
      // Replace with your actual auth call e.g. createUser(data)
      await new Promise((r) => setTimeout(r, 1500));
      console.log("Signup:", data);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <AuthCard
      title="Start for free."
      subtitle="Join 12,000+ teams already seeing their data differently."
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkHref="/auth/signin"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <AuthInput
          label="Full Name"
          type="text"
          placeholder="Alex Chen"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />

        <AuthInput
          label="Work Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordStrength password={password} />

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              {...register("terms")}
            />
            <div className="w-4 h-4 border border-[#1e2227] bg-[#0d1014] peer-checked:bg-[#00d4c8] peer-checked:border-[#00d4c8] transition-all duration-200 flex items-center justify-center">
              <svg
                className="hidden peer-checked:block w-2.5 h-2.5"
                viewBox="0 0 10 10"
                fill="none"
              >
                <path
                  d="M1.5 5L4 7.5L8.5 2.5"
                  stroke="#090b0e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <span className="text-[#6b7280] text-[0.78rem] leading-relaxed">
            I agree to the{" "}
            <Link href="/terms" className="text-[#00d4c8] hover:opacity-75">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#00d4c8] hover:opacity-75">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.terms && (
          <p className="text-red-400 text-[0.72rem] -mt-2">
            {errors.terms.message}
          </p>
        )}

        {serverError && (
          <p className="text-red-400 text-[0.78rem] bg-red-500/10 border border-red-500/20 px-3 py-2">
            {serverError}
          </p>
        )}

        <AuthButton
          loading={isSubmitting}
          label="Create Account →"
          loadingLabel="Creating account…"
        />
      </form>

      <AuthDivider />
    </AuthCard>
  );
}
