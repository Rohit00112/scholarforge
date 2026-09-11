import Link from "next/link";
import { ArrowUpRight, GitFork, PencilRuler, Star } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import StarDoc from "@/models/Star";
import { ProjectCard, type CardProject } from "@/components/projects/ProjectCard";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  await connectDB();
  const user = await User.findById(userId).lean();
  if (!user) {
    redirect("/login");
  }

  const publicFilter = { status: { $ne: "draft" }, deletedAt: null };

  const [myProjects, publishedCount, starsGiven, starAgg] = await Promise.all([
    Project.find({ ownerId: userId, deletedAt: null })
      .sort({ publishedAt: -1 })
      .lean(),
    Project.countDocuments({ ...publicFilter, ownerId: userId }),
    StarDoc.countDocuments({ userId }),
    Project.aggregate<{ total: number }>([
      { $match: { ownerId: user._id, deletedAt: null, status: { $ne: "draft" } } },
      { $group: { _id: null, total: { $sum: "$starsCount" } } },
    ]),
  ]);

  const starsReceived = starAgg[0]?.total ?? 0;

  const starredDocs = await StarDoc.find({ userId }).sort({ createdAt: -1 }).limit(12).select("projectId").lean();
  const starredIds = starredDocs.map((s) => s.projectId);
  let starredProjects: CardProject[] = [];
  if (starredIds.length > 0) {
    starredProjects = (await Project.find({ ...publicFilter, _id: { $in: starredIds } })
      .sort({ publishedAt: -1 })
      .populate("ownerId", "username name avatarUrl branch")
      .lean()) as unknown as CardProject[];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-10">
        <p className="eyebrow">Hi, {user.name.split(" ")[0]}</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-paper sm:text-4xl">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">
            <PencilRuler className="h-3.5 w-3.5 text-brass" /> Published
          </p>
          <p className="mt-3 font-display text-3xl font-medium text-paper">{publishedCount}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">
            <Star className="h-3.5 w-3.5 text-brass" /> Stars received
          </p>
          <p className="mt-3 font-display text-3xl font-medium text-paper">{starsReceived}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">
            <GitFork className="h-3.5 w-3.5 text-brass" /> Stars given
          </p>
          <p className="mt-3 font-display text-3xl font-medium text-paper">{starsGiven}</p>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Your work</p>
            <h2 className="mt-2 font-display text-2xl font-medium tracking-tight text-paper">My projects</h2>
          </div>
          <Link href="/projects/new" className="text-sm font-medium text-brass transition-colors hover:underline">
            Publish a project
          </Link>
        </div>

        <div className="mt-6">
          {myProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line px-8 py-16 text-center">
              <p className="text-sm text-muted">
                You haven&apos;t published yet. Your future teammates can&apos;t star what they can&apos;t find.
              </p>
              <Link href="/projects/new" className="mt-6 inline-block">
                <Button>Publish a project</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
              {myProjects.map((project) => (
                <div key={project._id.toString()} className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-ink-800">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="truncate font-display text-base font-medium text-paper transition-colors hover:text-brass"
                    >
                      {project.title}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <Star className="h-3 w-3 text-brass" />
                      {project.starsCount}
                      <span aria-hidden>·</span>
                      {project.forksCount} forks
                    </div>
                  </div>
                  <StatusBadge status={project.status} />
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/projects/${project.slug}/edit`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-paper"
                    >
                      Edit
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-12 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Saved for later</p>
            <h2 className="mt-2 font-display text-2xl font-medium tracking-tight text-paper">Starred</h2>
          </div>
        </div>

        <div className="mt-6">
          {starredProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line px-8 py-12 text-center">
              <p className="text-sm text-muted">Nothing starred yet. Browse the catalog and star what you want to build on.</p>
              <Link href="/projects" className="mt-5 inline-block text-sm font-medium text-brass hover:underline">
                Explore projects
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {starredProjects.map((project) => (
                <ProjectCard key={project._id.toString()} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}