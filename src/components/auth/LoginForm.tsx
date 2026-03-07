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
      // Replace with your actual auth call e.g. signIn(data)
      await new Promise((r) => setTimeout(r, 1500));
      console.log("Login:", data);
    } catch {
      setServerError("Invalid email or password. Please try again.");
    }
  };

  return (
    <AuthCard
      title="Welcome back."
      subtitle="Sign in to your account and pick up right where you left off."
      footerText="Don't have an account?"
      footerLinkLabel="Sign up free"
      footerLinkHref="/auth/signup"
    >
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

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          right={
            <Link
              href="/auth/forgotpassword"
              className="text-[0.72rem] text-[#00d4c8] hover:opacity-75 transition-opacity"
            >
              Forgot?
            </Link>
          }
          {...register("password")}
        />

        {serverError && (
          <p className="text-red-400 text-[0.78rem] bg-red-500/10 border border-red-500/20 px-3 py-2">
            {serverError}
          </p>
        )}

        <AuthButton
          loading={isSubmitting}
          label="Sign In →"
          loadingLabel="Signing in…"
        />
      </form>

      <AuthDivider />
    </AuthCard>
  );
}
