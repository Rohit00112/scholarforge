"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validators/auth";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const justRegistered = searchParams.get("registered");

  const [globalError, setGlobalError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsPending(true);
    setGlobalError("");
    const res = await loginAction(data, callbackUrl);

    if (res.error) {
      setGlobalError(res.error);
      setIsPending(false);
      return;
    }

    if (res.success && res.redirect) {
      // Hard navigation to refresh root layout session state
      window.location.href = res.redirect;
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-sm text-[#9CA3AF]">Sign in to your account.</p>
      </div>

      {justRegistered && !globalError && (
        <div className="mb-4 rounded-md border border-emerald-900/40 bg-emerald-600/20 p-3 text-sm text-emerald-400">
          Account created! Please log in.
        </div>
      )}

      {globalError && (
        <div className="mb-4 rounded-md border border-red-900/40 bg-red-600/20 p-3 text-sm text-red-400">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="College Email" type="email" placeholder="student@college.edu" {...register("email")} error={errors.email?.message} />
        <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />

        <Button type="submit" disabled={isPending} className="mt-4">
          {isPending ? "Signing in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#9CA3AF]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-[#E5E7EB] hover:text-[#6366F1]">
          Sign up
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <Suspense fallback={<Card className="p-6 text-center text-[#9CA3AF]">Loading...</Card>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
