"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/components/auth/authschema";
import AuthCard from "./ui/AuthCard";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";
import AuthDivider from "./ui/AuthDivider";

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      console.log("Login:", data);
    } catch {
      setServerError("Invalid email or password. Please try again.");
    }
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back. Pick up right where you left off."
      footerText="Don't have an account?"
      footerLinkLabel="Sign up"
      footerLinkHref="/signup"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        <AuthInput
          label="Email address"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          right={
            <Link
              href="/auth/forgotpassword"
              className="text-[0.72rem] text-[#6b7280] hover:text-[#00d4c8] transition-colors"
            >
              Forgot password?
            </Link>
          }
          {...register("password")}
        />

        {serverError && (
          <p className="text-red-400 text-[0.78rem] bg-red-500/10 border border-red-500/20 px-3 py-2">
            {serverError}
          </p>
        )}

        {/* Submit + inline link */}
        <div className="flex items-center gap-6 mt-1">
          <AuthButton
            loading={isSubmitting}
            label="Sign in"
            loadingLabel="Signing in…"
          />
          <Link
            href="/auth/signup"
            className="text-[0.82rem] text-[#6b7280] hover:text-white transition-colors whitespace-nowrap"
          >
            Don't have an account?{" "}
            <span className="text-white font-medium">Sign up</span>
          </Link>
        </div>
      </form>

      <AuthDivider showGithub />
    </AuthCard>
  );
}
