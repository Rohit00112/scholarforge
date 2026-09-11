import { z } from "zod";
import { PROJECT_CATEGORIES, LICENSE_TYPES, PROJECT_STATUS } from "../constants";

export const projectCreateSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters").max(120),
  tagline: z.string().max(160).optional().default(""),
  description: z.string().min(20, "Description must be at least 20 characters").max(4000),
  problemStatement: z.string().max(2000).optional().default(""),
  category: z.enum(PROJECT_CATEGORIES),
  techStack: z.array(z.string().min(1).max(30)).min(1, "Add at least 1 technology").max(20),
  tags: z.array(z.string()).max(15).optional().default([]),
  originalSemester: z.string().min(3).max(40),
  originalYear: z.coerce.number().int().min(2000).max(2100),

  repositoryUrl: z.union([z.string().url(), z.literal(""), z.undefined()]).optional().transform(v => v === "" ? undefined : v),
  demoUrl: z.union([z.string().url(), z.literal(""), z.undefined()]).optional().transform(v => v === "" ? undefined : v),
  deploymentUrl: z.union([z.string().url(), z.literal(""), z.undefined()]).optional().transform(v => v === "" ? undefined : v),
  documentationUrl: z.union([z.string().url(), z.literal(""), z.undefined()]).optional().transform(v => v === "" ? undefined : v),
  researchPaperUrl: z.union([z.string().url(), z.literal(""), z.undefined()]).optional().transform(v => v === "" ? undefined : v),
  coverImageUrl: z.union([z.string().url(), z.literal(""), z.undefined()]).optional().transform(v => v === "" ? undefined : v),

  courseCode: z.string().max(20).optional().default(""),
  lookingForContributors: z.boolean().optional().default(false),
  requiredSkills: z.array(z.string()).max(15).optional().default([]),
  license: z.enum(LICENSE_TYPES).optional().default("MIT"),
  status: z.enum([PROJECT_STATUS[0], PROJECT_STATUS[1]]).optional().default("published"), // usually "draft" | "published"
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = projectCreateSchema.partial();
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
