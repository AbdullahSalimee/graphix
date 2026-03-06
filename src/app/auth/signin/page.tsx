"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signInSchema, SignInValues } from "@/components/auth/authschema";
import { AuthCard, AuthField, AuthButton } from "@/components/auth/authUI";

export default function SignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInValues) => {
    // TODO: call your auth provider
    console.log(data);
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthField
          label="Email"
          type="email"
          placeholder="you@example.com"
          registration={register("email")}
          error={errors.email}
          autoComplete="email"
        />

        <AuthField
          label="Password"
          type="password"
          placeholder="••••••••"
          registration={register("password")}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="text-right">
          <Link
            href="/auth/forgetpassword"
            className="text-xs text-slate-400 hover:text-indigo-400 transition"
          >
            Forgot password?
          </Link>
        </div>

        <AuthButton loading={isSubmitting}>Sign in</AuthButton>
        <AuthButton loading={isSubmitting}>
          Sign in Google{" "}
          <img src="/google.png" alt="Google" className="w-4 h-4" />
        </AuthButton>
      </form>

      <p className="text-center text-sm text-slate-400">
        No account?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-indigo-400 hover:text-indigo-300 transition"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
