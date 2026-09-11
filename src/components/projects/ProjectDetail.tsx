import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  Bot,
  CheckCircle2,
  Eye,
  FileText,
  GitFork,
  Globe,
  Play,
  Star,
  Users,
} from "lucide-react";
import { StarButton } from "@/components/projects/StarButton";
import { ShareButton } from "@/components/projects/ShareButton";
import { Markdown } from "@/components/projects/Markdown";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { CATEGORY_LABELS } from "@/lib/constants";

type PersonRef = {
  username: string;
  name: string;
  avatarUrl?: string | null;
  branch?: string | null;
};

interface ParentRef {
  slug: string;
  title: string;
}

export interface ProjectDetailProps {
  project: {
    slug: string;
    title: string;
    tagline?: string;
    description: string;
    problemStatement?: string;
    readme?: string;
    status: string;
    category: string;
    techStack: string[];
    originalSemester: string;
    originalYear: number;
    license?: string;
    starsCount: number;
    viewsCount: number;
    forksCount: number;
    lookingForContributors: boolean;
    requiredSkills: string[];
    contributorNotes?: string;
    repositoryUrl?: string | null;
    demoUrl?: string | null;
    deploymentUrl?: string | null;
    documentationUrl?: string | null;
    researchPaperUrl?: string | null;
    publishedAt?: Date | null;
    ownerId: PersonRef;
    teamMemberIds: PersonRef[];
    facultyMentorId?: PersonRef | null;
  };
  starredByMe: boolean;
  authenticated: boolean;
  canEdit: boolean;
  parent?: ParentRef | null;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

export function ProjectDetail({ project, starredByMe, authenticated, canEdit, parent }: ProjectDetailProps) {
  const links = [
    { label: "Repo", href: project.repositoryUrl, icon: GitFork },
    { label: "Demo", href: project.demoUrl, icon: Play },
    { label: "Live", href: project.deploymentUrl, icon: Globe },
    { label: "Paper", href: project.researchPaperUrl, icon: FileText },
    { label: "Docs", href: project.documentationUrl, icon: BookOpen },
  ].filter((l): l is { label: string; href: string; icon: typeof GitFork } => Boolean(l.href));

  const team = [project.ownerId, ...project.teamMemberIds.filter((m) => m.username !== project.ownerId.username)];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={project.status} />
          <Badge variant="category">{CATEGORY_LABELS[project.category] ?? project.category}</Badge>
          <span className="font-mono text-xs tracking-[0.14em] text-muted">
            {project.originalSemester} {project.originalYear}
          </span>
        </div>

        <h1 className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight text-paper sm:text-5xl">
          {project.title}
        </h1>
        {project.tagline && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{project.tagline}</p>}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <StarButton
            slug={project.slug}
            initialStarred={starredByMe}
            initialCount={project.starsCount}
            authenticated={authenticated}
          />
          <ShareButton />
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-medium text-muted transition-colors hover:border-brass/50 hover:text-paper"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
            </a>
          ))}
          {canEdit && (
            <Link
              href={`/projects/${project.slug}/edit`}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-brass/30 bg-brass/10 px-4 text-sm font-medium text-brass transition-colors hover:bg-brass/20"
            >
              Edit
            </Link>
          )}
        </div>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-12">
          <section>
            <h2 className="eyebrow">About</h2>
            <div className="mt-4">
              <Markdown>{project.description}</Markdown>
            </div>
            {project.problemStatement && (
              <div className="mt-8">
                <h3 className="eyebrow">The problem</h3>
                <div className="mt-4">
                  <Markdown>{project.problemStatement}</Markdown>
                </div>
              </div>
            )}
          </section>

          {"techStack" in project && project.techStack.length > 0 && (
            <section>
              <h2 className="eyebrow">Tech stack</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="tech">
                    {tech}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="eyebrow">Team</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {team.map((member) => (
                <Link
                  key={member.username}
                  href={`/students/${member.username}`}
                  className="group flex items-center gap-2.5 rounded-md border border-line bg-surface px-3 py-2 transition-colors hover:border-brass/40"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brass/30 bg-brass/10 text-xs font-semibold text-brass">
                    {initials(member.name)}
                  </span>
                  <span className="text-sm text-paper transition-colors group-hover:text-brass">{member.name}</span>
                </Link>
              ))}
            </div>
            {project.facultyMentorId && (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                <Bot className="h-4 w-4 text-brass" />
                Mentored by{" "}
                <Link href={`/students/${project.facultyMentorId.username}`} className="text-brass hover:underline">
                  {project.facultyMentorId.name}
                </Link>
              </p>
            )}
          </section>

          {project.readme && (
            <section>
              <h2 className="eyebrow">README</h2>
              <div className="mt-4 rounded-lg border border-line bg-surface p-6">
                <Markdown>{project.readme}</Markdown>
              </div>
            </section>
          )}

          {parent && (
            <section>
              <h2 className="eyebrow">Lineage</h2>
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-line bg-surface p-5">
                <Boxes className="h-5 w-5 shrink-0 text-brass" />
                <div className="min-w-0">
                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted">
                    Improved from · forked {project.forksCount} time{project.forksCount === 1 ? "" : "s"}
                  </p>
                  <Link
                    href={`/projects/${parent.slug}`}
                    className="mt-1 block truncate font-display text-base font-medium text-paper transition-colors hover:text-brass"
                  >
                    {parent.title}
                  </Link>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted" />
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">Stats</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-line bg-ink-900 px-2 py-3">
                <Star className="mx-auto h-4 w-4 text-brass" />
                <p className="mt-1.5 font-display text-xl font-medium text-paper">{project.starsCount}</p>
                <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted">Stars</p>
              </div>
              <div className="rounded-md border border-line bg-ink-900 px-2 py-3">
                <Eye className="mx-auto h-4 w-4 text-muted" />
                <p className="mt-1.5 font-display text-xl font-medium text-paper">{project.viewsCount}</p>
                <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted">Views</p>
              </div>
              <div className="rounded-md border border-line bg-ink-900 px-2 py-3">
                <GitFork className="mx-auto h-4 w-4 text-muted" />
                <p className="mt-1.5 font-display text-xl font-medium text-paper">{project.forksCount}</p>
                <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted">Forks</p>
              </div>
            </div>

            {project.lookingForContributors && (
              <>
                <div className="mt-4 border-t border-line pt-4">
                  <p className="flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-live">
                    <Users className="h-3.5 w-3.5" /> Seeking contributors
                  </p>
                  {project.requiredSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="tech">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {project.contributorNotes && (
                    <p className="mt-3 text-sm leading-relaxed text-muted">{project.contributorNotes}</p>
                  )}
                </div>
                <button
                  type="button"
                  disabled
                  title="Coming in Phase 2"
                  className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-line bg-ink-800 px-4 py-2.5 text-sm font-medium text-muted/60"
                >
                  Request to contribute
                  <CheckCircle2 className="h-4 w-4 opacity-40" />
                </button>
              </>
            )}

            {project.publishedAt && (
              <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
                Published {formatDate(project.publishedAt)} · {project.license}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}