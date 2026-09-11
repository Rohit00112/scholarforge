import { z } from "zod";
import { BRANCHES } from "../constants";

const urlOrEmpty = (label: string) =>
  z.union([z.string().trim().url({ message: `${label} must be a valid URL` }), z.literal("")]);

export const settingsSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: urlOrEmpty("Avatar URL").optional(),
  skills: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(15).optional(),
  githubUsername: z.string().trim().max(39).optional(),
  linkedinUrl: urlOrEmpty("LinkedIn URL").optional(),
  portfolioUrl: urlOrEmpty("Portfolio URL").optional(),
  branch: z.enum(BRANCHES).optional(),
  semester: z.coerce.number().int().min(1).max(10).optional(),
});

export type SettingsInput = z.input<typeof settingsSchema>;
export type SettingsOutput = z.output<typeof settingsSchema>;