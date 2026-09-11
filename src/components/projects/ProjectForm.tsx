"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { projectCreateSchema, ProjectCreateInput, ProjectUpdateInput } from "@/lib/validators/project";
import { createProjectAction, updateProjectAction } from "@/actions/project";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { PROJECT_CATEGORIES, LICENSE_TYPES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface ProjectFormProps {
  initialData?: ProjectUpdateInput & { slug?: string }; // Note: some fields might be null from db, zod expects undefined/defaults
}

type ProjectFormValues = z.input<typeof projectCreateSchema>;
type ProjectFormOutput = z.output<typeof projectCreateSchema>;

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [globalError, setGlobalError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const draftRef = useRef(false);
  const isEditing = !!initialData?.slug;

  const defaultValues: Partial<ProjectCreateInput> = {
    title: initialData?.title || "",
    tagline: initialData?.tagline || "",
    description: initialData?.description || "",
    problemStatement: initialData?.problemStatement || "",
    category: (initialData?.category as never) || "web",
    techStack: initialData?.techStack || [],
    tags: initialData?.tags || [],
    originalSemester: initialData?.originalSemester || "",
    originalYear: initialData?.originalYear || new Date().getFullYear(),
    repositoryUrl: initialData?.repositoryUrl || "",
    demoUrl: initialData?.demoUrl || "",
    deploymentUrl: initialData?.deploymentUrl || "",
    documentationUrl: initialData?.documentationUrl || "",
    researchPaperUrl: initialData?.researchPaperUrl || "",
    coverImageUrl: initialData?.coverImageUrl || "",
    courseCode: initialData?.courseCode || "",
    lookingForContributors: initialData?.lookingForContributors || false,
    requiredSkills: initialData?.requiredSkills || [],
    license: (initialData?.license as never) || "MIT",
    status: (initialData?.status as never) || "published",
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ProjectFormValues, unknown, ProjectFormOutput>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues,
  });

  const techStack = watch("techStack");
  const [techInput, setTechInput] = useState("");

  const requiredSkills = watch("requiredSkills");
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = skillInput.trim().toLowerCase();
      const skills = requiredSkills ?? [];
      if (val && !skills.includes(val) && skills.length < 15) {
        setValue("requiredSkills", [...skills, val], { shouldValidate: true });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setValue(
      "requiredSkills",
      (requiredSkills ?? []).filter((s) => s !== skill),
      { shouldValidate: true }
    );
  };

  const commitTechInput = () => {
    const val = techInput.trim().toLowerCase();
    if (val && !techStack.includes(val) && techStack.length < 20) {
      setValue("techStack", [...techStack, val], { shouldValidate: true });
    }
    setTechInput("");
  };

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTechInput();
    }
  };

  const removeTech = (tech: string) => {
    setValue(
      "techStack",
      techStack.filter((t) => t !== tech),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (data: ProjectCreateInput) => {
    if (draftRef.current) {
      data.status = "draft";
      draftRef.current = false;
    } else if (isEditing) {
      data.status = "published";
    }

    setIsPending(true);
    setGlobalError("");

    let res;
    if (isEditing && initialData?.slug) {
      res = await updateProjectAction(initialData.slug, data);
    } else {
      res = await createProjectAction(data);
    }

    if (res.error) {
      setGlobalError(res.error);
      if (res.fields) {
        Object.entries(res.fields).forEach(([field, msgs]) => {
          setError(field as never, { message: (msgs as string[])[0] });
        });
      }
      setIsPending(false);
      return;
    }

    if (res.success && res.slug) {
      router.push(`/projects/${res.slug}`);
      router.refresh();
    }
  };

  return (
    <Card className="p-6">
      {globalError && (
        <div className="mb-6 rounded-md border border-red-900/40 bg-red-600/20 p-3 text-sm text-red-400">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {/* Core Info */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-paper border-b border-line pb-2">Core Info</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4 md:col-span-2">
              <Input label="Project Title *" placeholder="Traffic Prediction Model" {...register("title")} error={errors.title?.message} />
              <Input label="Tagline" placeholder="AI-driven traffic optimization for college campus" {...register("tagline")} error={errors.tagline?.message} />
            </div>

            <div className="md:col-span-2">
              <Textarea label="Description (Markdown) *" placeholder="What does this project do?" rows={6} {...register("description")} error={errors.description?.message} />
            </div>

            <div className="md:col-span-2">
              <Textarea label="Problem Statement" placeholder="What problem were you solving?" rows={3} {...register("problemStatement")} error={errors.problemStatement?.message} />
            </div>
          </div>
        </section>

        {/* Technical */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-paper border-b border-line pb-2">Technical</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Category *" {...register("category")} error={errors.category?.message}>
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>

            {/* Custom Tag Input for Tech Stack */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-paper">Tech Stack *</label>
              <div className="flex flex-wrap gap-2 rounded-lg border border-line bg-surface p-2 focus-within:border-brass/60">
                {techStack.map((tech) => (
                  <span key={tech} className="inline-flex items-center gap-1 rounded bg-ink-700 px-2 py-1 text-xs text-paper">
                    {tech}
                    <button type="button" onClick={() => removeTech(tech)} className="text-muted hover:text-clay">&times;</button>
                  </span>
                ))}
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleAddTech}
                  onBlur={() => commitTechInput()}
                  className="flex-1 bg-transparent text-sm text-paper placeholder:text-muted focus:outline-none min-w-[120px]"
                  placeholder="e.g. react, nextjs, python (press Enter)"
                />
              </div>
              {errors.techStack && <p className="text-xs text-red-400">{errors.techStack.message}</p>}
            </div>

            <Input label="Repository URL" placeholder="https://github.com/..." {...register("repositoryUrl")} error={errors.repositoryUrl?.message} />
            <Input label="Demo URL" placeholder="https://youtube.com/..." {...register("demoUrl")} error={errors.demoUrl?.message} />
            <Input label="Live Deployment URL" placeholder="https://my-app.vercel.app" {...register("deploymentUrl")} error={errors.deploymentUrl?.message} />
            <Input label="Cover Image URL" placeholder="https://picsum.photos/800/400" {...register("coverImageUrl")} error={errors.coverImageUrl?.message} />
          </div>
        </section>

        {/* Academic Details */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-paper border-b border-line pb-2">Academic Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Original Semester *" placeholder="Fall 2026" {...register("originalSemester")} error={errors.originalSemester?.message} />
            <Input label="Original Year *" type="number" {...register("originalYear")} error={errors.originalYear?.message} />
            <Input label="Course Code" placeholder="CS401" {...register("courseCode")} error={errors.courseCode?.message} />
            <Input label="Research Paper URL" placeholder="https://link.to/paper.pdf" {...register("researchPaperUrl")} error={errors.researchPaperUrl?.message} />
            <Select label="License" {...register("license")} error={errors.license?.message}>
              {LICENSE_TYPES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </div>
        </section>

        {/* Collaboration */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-paper border-b border-line pb-2">Collaboration</h2>
          <div className="flex items-center gap-2">
            <Controller
              name="lookingForContributors"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="looking"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-line bg-surface text-brass focus:ring-brass"
                />
              )}
            />
            <label htmlFor="looking" className="text-sm font-medium text-paper">
              Looking for contributors
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-paper">Required Skills</label>
            <div className="flex flex-wrap gap-2 rounded-lg border border-line bg-surface p-2 focus-within:border-brass/60">
              {(requiredSkills ?? []).map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 rounded bg-ink-700 px-2 py-1 text-xs text-paper">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="text-muted hover:text-clay">&times;</button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="flex-1 bg-transparent text-sm text-paper placeholder:text-muted focus:outline-none min-w-[120px]"
                placeholder="e.g. python, tensorflow (press Enter)"
              />
            </div>
          </div>
        </section>

        <div className="flex gap-4 pt-4 border-t border-line">
          <Button type="submit" disabled={isPending} className="flex-1 md:flex-none" onClick={() => (draftRef.current = false)}>
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Publish Project"}
          </Button>
          <Button type="submit" variant="secondary" disabled={isPending} className="flex-1 md:flex-none" onClick={() => (draftRef.current = true)}>
            Save as Draft
          </Button>
        </div>
      </form>
    </Card>
  );
}
