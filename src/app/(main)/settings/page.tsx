import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { SettingsForm, type SettingsInitialData } from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();
  if (!user) {
    redirect("/login");
  }

  const initialData: SettingsInitialData = {
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    skills: user.skills,
    githubUsername: user.githubUsername,
    linkedinUrl: user.linkedinUrl,
    portfolioUrl: user.portfolioUrl,
    branch: user.branch,
    semester: user.semester,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="mb-8">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-paper">Settings</h1>
        <p className="mt-2 text-sm text-muted">
          Email and username can&apos;t be changed in Phase 1.
        </p>
      </div>

      <SettingsForm initialData={initialData} />
    </div>
  );
}