"use server";

import { registerSchema, loginSchema, RegisterInput, LoginInput } from "@/lib/validators/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function registerAction(data: RegisterInput) {
  try {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Validation failed", fields: parsed.error.flatten().fieldErrors };
    }

    const { email, username, password, ...rest } = parsed.data;

    // Validate college email domain
    const domainArg = process.env.ALLOWED_EMAIL_DOMAINS || "college.edu";
    const allowedDomains = domainArg.split(",").map((d) => d.trim().toLowerCase());
    const emailDomain = email.split("@")[1].toLowerCase();

    if (!allowedDomains.includes(emailDomain)) {
      return {
        error: `Email must belong to one of these domains: ${allowedDomains.join(", ")}`,
      };
    }

    await connectDB();

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return { error: "Email already registered", fields: { email: ["Email already taken"] } };
      }
      return { error: "Username already taken", fields: { username: ["Username already taken"] } };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      ...rest,
      email,
      username,
      passwordHash,
      collegeEmailDomain: emailDomain,
      role: "student",
    });

    return { success: true };
  } catch (error) {
    console.error("Register err:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function loginAction(data: LoginInput, callbackUrl?: string | null) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed" };
  }

  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return { success: true, redirect: callbackUrl || "/dashboard" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}
