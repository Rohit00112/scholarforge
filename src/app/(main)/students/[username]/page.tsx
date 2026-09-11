import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, AtSign, GraduationCap } from "lucide-react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import Star from "@/models/Star";
import { ProjectCard, type CardProject } from "@/components/projects/ProjectCard";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const VALID_TABS = ["created", "contributed", "starred"] as const;
type Tab = (typeof VALID_TABS)[number];

interface ProfileParams {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: ProfileParams): Promise<Metadata> {
  const { username } = await params;
  await connectDB();
  const user = await User.findOne({ username: username.toLowerCase() }).select("name bio").lean();
  if (!user) return {};
  return {
    title: `${user.name} (@${username}) | ScholarForge`,
    description: user.bio ? user.bio.slice(0, 160) : undefined,
  };
}

export default async function StudentProfilePage({ params, searchParams }: ProfileParams) {
  const { username } = await params;
  const sp = await searchParams;
  const tab = (toString(sp.tab) ?? "created") as Tab;
  const activeTab: Tab = VALID_TABS.includes(tab) ? tab : "created";

  await connectDB();
  const user = await User.findOne({ username: username.toLowerCase() }).lean();
  if (!user) notFound();

  const publicFilter = {
    status: { $ne: "draft" },
    deletedAt: null,
  };

  let projects: CardProject[] = [];

  if (activeTab === "created") {
    projects = await Project.find({ ...publicFilter, ownerId: user._id })
      .sort({ publishedAt: -1 })
      .limit(12)
      .populate("ownerId", "username name avatarUrl branch")
      .lean();
  } else if (activeTab === "contributed") {
    projects = await Project.find({
      ...publicFilter,
      teamMemberIds: user._id,
      ownerId: { $ne: user._id },
    })
      .sort({ publishedAt: -1 })
      .limit(12)
      .populate("ownerId", "username name avatarUrl branch")
      .lean();
  } else {
    const starred = await Star.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(12)
      .select("projectId")
      .lean();
    const ids = starred.map((s) => s.projectId);
    if (ids.length > 0) {
      projects = await Project.find({ ...publicFilter, _id: { $in: ids } })
        .sort({ publishedAt: -1 })
        .populate("ownerId", "username name avatarUrl branch")
        .lean();
    }
  }

  const tabLabels: Record<Tab, string> = {
    created: "Created",
    contributed: "Contributed",
    starred: "Starred",
  };

  const emptyCopy: Record<Tab, string> = {
    created: "No published projects yet.",
    contributed: "No projects contributed to yet.",
    starred: "Nothing starred yet.",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="flex flex-wrap items-start gap-6">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-20 w-20 rounded-full border border-brass/30 object-cover"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-brass/30 bg-brass/10 font-display text-2xl font-semibold text-brass">
            {user.name
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-medium tracking-tight text-paper">{user.name}</h1>
            <Badge variant={user.role === "student" ? "default" : "category"}>{user.role}</Badge>
          </div>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-sm text-muted">
            <AtSign className="h-3.5 w-3.5" />
            {user.username}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
            {user.role === "faculty" ? (
              user.department && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-brass" />
                  {user.department}
                </span>
              )
            ) : (
              <>
                {user.branch && <span>{user.branch}</span>}
                {user.batch && <span>Batch {user.batch}</span>}
                {user.semester && <span>Sem {user.semester}</span>}
              </>
            )}
            {user.reputationScore > 0 && <span className="text-brass">{user.reputationScore} rep</span>}
          </div>

          {user.bio && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{user.bio}</p>}

          {(user.skills?.length > 0 || user.researchAreas?.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(user.role === "faculty" ? user.researchAreas : user.skills)?.map((skill: string) => (
                <Badge key={skill} variant="tech">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {user.githubUsername && (
              <a
                href={`https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-xs font-medium text-muted transition-colors hover:border-brass/50 hover:text-paper"
              >
                GitHub
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
            {user.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-xs font-medium text-muted transition-colors hover:border-brass/50 hover:text-paper"
              >
                LinkedIn
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
            {user.portfolioUrl && (
              <a
                href={user.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-xs font-medium text-muted transition-colors hover:border-brass/50 hover:text-paper"
              >
                Portfolio
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mt-10 flex gap-1 border-b border-line">
        {VALID_TABS.map((t) => (
          <Link
            key={t}
            href={`/students/${user.username}?tab=${t}`}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === t
                ? "border-brass text-paper"
                : "border-transparent text-muted hover:border-line hover:text-paper"
            }`}
          >
            {tabLabels[t]}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line px-8 py-16 text-center">
            <p className="text-sm text-muted">{emptyCopy[activeTab]}</p>
            {activeTab === "created" && (
              <Link href="/projects/new" className="mt-4 inline-block text-sm font-medium text-brass hover:underline">
                Publish your first project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project._id.toString()} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}