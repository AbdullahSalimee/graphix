"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signUpSchema, SignUpValues } from "@/components/auth/authschema";
import { AuthCard, AuthField, AuthButton } from "@/components/auth/authUI";

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpValues) => {
    // TODO: call your auth provider
    console.log(data);
  };

  return (
    <AuthCard
      title="Create an account"
      subtitle="Free forever. No credit card needed."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthField
          label="Full name"
          placeholder="Jane Smith"
          registration={register("name")}
          error={errors.name}
          autoComplete="name"
        />

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
          autoComplete="new-password"
        />

        <AuthField
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          registration={register("confirm")}
          error={errors.confirm}
          autoComplete="new-password"
        />

        <AuthButton loading={isSubmitting}>Create account</AuthButton>
      </form>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className="font-medium text-indigo-400 hover:text-indigo-300 transition"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
