import { z } from "zod";
import { BRANCHES } from "../constants";

export const registerSchema = z
  .object({
    name: z.string().min(2).max(80),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-z0-9-]{3,30}$/, "Only lowercase letters, numbers, and hyphens allowed"),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    confirmPassword: z.string(),
    branch: z.enum(BRANCHES),
    batch: z.string().min(4).max(20),
    rollNumber: z.string().min(3).max(30),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
