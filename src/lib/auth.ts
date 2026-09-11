import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import User from "@/models/User";
import { loginSchema } from "./validators/auth";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectDB();
        const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("+passwordHash");
        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!passwordsMatch) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
});

export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function requireRole(role: string) {
  const user = await requireUser();
  if (user.role !== role && user.role !== "admin") throw new Error("Forbidden");
  return user;
}

export function canEditProject(
  user: { id: string; role: string },
  project: {
    ownerId: { toString(): string };
    teamMemberIds: Array<{ toString(): string }>;
  }
): boolean {
  if (user.role === "admin") return true;
  if (project.ownerId.toString() === user.id) return true;
  return project.teamMemberIds.some((id) => id.toString() === user.id);
}
