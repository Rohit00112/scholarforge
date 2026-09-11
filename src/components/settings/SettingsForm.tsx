"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { settingsSchema, type SettingsInput } from "@/lib/validators/user";
import { updateSettingsAction } from "@/actions/user";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { TagInput } from "@/components/ui/TagInput";
import { BRANCHES } from "@/lib/constants";

export interface SettingsInitialData {
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string | null;
  skills?: string[];
  githubUsername?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  branch?: string | null;
  semester?: number | null;
}

type SettingsFormValues = z.input<typeof settingsSchema>;
type SettingsFormOutput = z.output<typeof settingsSchema>;

export function SettingsForm({ initialData }: { initialData: SettingsInitialData }) {
  const router = useRouter();
  const [globalError, setGlobalError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const defaultValues: Partial<SettingsFormValues> = {
    name: initialData.name,
    bio: initialData.bio ?? "",
    avatarUrl: initialData.avatarUrl ?? "",
    skills: initialData.skills ?? [],
    githubUsername: initialData.githubUsername ?? "",
    linkedinUrl: initialData.linkedinUrl ?? "",
    portfolioUrl: initialData.portfolioUrl ?? "",
    branch: (initialData.branch as never) || "",
    semester: initialData.semester ?? undefined,
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SettingsFormValues, unknown, SettingsFormOutput>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const onSubmit = async (data: SettingsFormOutput) => {
    setIsPending(true);
    setGlobalError("");
    setSaved(false);

    const res = await updateSettingsAction(data as SettingsInput);

    if (res.error) {
      setGlobalError(res.error);
      setIsPending(false);
      return;
    }

    setSaved(true);
    setIsPending(false);
    window.setTimeout(() => setSaved(false), 2500);
    router.refresh();
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">Account</p>
        <div className="flex gap-2 rounded-md border border-line bg-ink-800 px-3 py-1.5 text-xs text-muted">
          <span>@{initialData.username}</span>
          <span aria-hidden>·</span>
          <span>{initialData.email}</span>
        </div>
      </div>

      {globalError && (
        <div className="mb-6 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {globalError}
        </div>
      )}
      {saved && (
        <div className="mb-6 rounded-md border border-live/30 bg-live/10 p-3 text-sm text-live">
          Settings saved.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <section className="space-y-4">
          <h2 className="border-b border-line pb-2 font-display text-lg font-medium text-paper">Profile</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Name *" {...register("name")} error={errors.name?.message} />
            <Input label="Avatar URL" placeholder="https://..." {...register("avatarUrl")} error={errors.avatarUrl?.message} />
            <div className="md:col-span-2">
              <Textarea label="Bio" placeholder="A short line about you." rows={3} {...register("bio")} error={errors.bio?.message} />
            </div>
            <div className="md:col-span-2">
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <TagInput
                    label="Skills"
                    values={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="e.g. python, react (press Enter)"
                  />
                )}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-line pb-2 font-display text-lg font-medium text-paper">Academic</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Branch" {...register("branch")} error={errors.branch?.message}>
              <option value="">Select</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
            <Input label="Semester" type="number" min={1} max={10} {...register("semester")} error={errors.semester?.message} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-line pb-2 font-display text-lg font-medium text-paper">Social</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="GitHub Username" placeholder="sujan-99" {...register("githubUsername")} error={errors.githubUsername?.message} />
            <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/..." {...register("linkedinUrl")} error={errors.linkedinUrl?.message} />
            <Input label="Portfolio URL" placeholder="https://..." {...register("portfolioUrl")} error={errors.portfolioUrl?.message} />
          </div>
        </section>

        <div className="border-t border-line pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}