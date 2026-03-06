"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotSchema, ForgotValues } from "@/components/auth/authschema";
import { AuthCard, AuthField, AuthButton } from "@/components/auth/authUI";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (_data: ForgotValues) => {
    // TODO: call your reset endpoint
    setSent(true);
  };

  return (
    <AuthCard
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent
          ? "We sent a reset link to your email."
          : "We'll email you a link to reset it."
      }
    >
      {sent ? (
        <p className="text-center text-sm text-slate-400">
          <Link
            href="/auth/signin"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition"
          >
            ← Back to sign in
          </Link>
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthField
            label="Email"
            type="email"
            placeholder="you@example.com"
            registration={register("email")}
            error={errors.email}
            autoComplete="email"
          />

          <AuthButton loading={isSubmitting}>Send reset link</AuthButton>

          <p className="text-center text-sm text-slate-400">
            <Link
              href="/auth/signin"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition"
            >
              ← Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
