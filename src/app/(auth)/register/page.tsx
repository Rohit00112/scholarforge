"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validators/auth";
import { registerAction, loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { BRANCHES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsPending(true);
    setGlobalError("");
    const res = await registerAction(data);

    if (res.error) {
      setGlobalError(res.error);
      if (res.fields) {
        Object.entries(res.fields).forEach(([field, messages]) => {
          setError(field as keyof RegisterInput, { message: messages![0] });
        });
      }
      setIsPending(false);
      return;
    }

    // Auto sign-in
    const loginRes = await loginAction({ email: data.email, password: data.password });
    if (loginRes.success) {
      router.push("/dashboard");
      router.refresh(); // refresh navbar state
    } else {
      router.push("/login?registered=true");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="font-display text-lg tracking-tight text-paper">
              Scholar<span className="text-brass">Forge</span>
            </span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-medium text-paper">Create an account</h1>
          <p className="mt-1 text-sm text-muted">Use your college email address.</p>
        </div>

        {globalError && (
          <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" placeholder="Sujan" {...register("name")} error={errors.name?.message} />
            <Input label="Username" placeholder="sujan-99" {...register("username")} error={errors.username?.message} />
          </div>

          <Input label="College Email" type="email" placeholder="sujan@college.edu" {...register("email")} error={errors.email?.message} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
            <Input label="Confirm Password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select label="Branch" {...register("branch")} error={errors.branch?.message}>
              <option value="">Select</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
            <Input label="Batch" placeholder="2022-2026" {...register("batch")} error={errors.batch?.message} />
            <Input label="Roll Number" placeholder="CS001" {...register("rollNumber")} error={errors.rollNumber?.message} />
          </div>

          <Button type="submit" disabled={isPending} className="mt-4">
            {isPending ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-paper hover:text-brass">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
