import Link from "next/link";
import { ArrowUpRight, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_LABELS } from "@/lib/constants";

type CardOwner = {
  name?: string;
  username?: string;
} | null;

export interface CardProject {
  _id: { toString(): string };
  slug: string;
  title: string;
  tagline?: string;
  category: string;
  status: string;
  techStack?: string[];
  coverImageUrl?: string | null;
  starsCount?: number;
  lookingForContributors?: boolean;
  ownerId?: CardOwner;
}

const coverGradients = [
  "from-ink-700 via-ink-800 to-ink-900",
  "from-brass/25 via-ink-800 to-ink-900",
  "from-live/15 via-ink-800 to-ink-900",
  "from-clay/25 via-ink-800 to-ink-900",
];

function gradientFor(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return coverGradients[hash % coverGradients.length];
}

function ownerInitials(owner: CardOwner | undefined) {
  const name = owner?.name?.trim();
  if (name) {
    const parts = name.split(/\s+/);
    return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
  }
  return (owner?.username ?? "?").slice(0, 2).toUpperCase();
}

export function ProjectCard({ project }: { project: CardProject }) {
  const visibleTech = project.techStack?.slice(0, 3) ?? [];
  const hiddenTech = (project.techStack?.length ?? 0) - visibleTech.length;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-brass/40 hover:shadow-[0_14px_36px_-18px_rgba(201,164,92,0.35)]"
    >
      <div className={`relative h-32 bg-gradient-to-br ${gradientFor(project.slug)}`}>
        {project.coverImageUrl ? (
          <img
            src={project.coverImageUrl}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        )}
        <div className="absolute left-3 top-3">
          <Badge variant="category">{CATEGORY_LABELS[project.category] ?? project.category}</Badge>
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5">
          {project.status === "deployed" && <Badge variant="status-deployed">Live</Badge>}
          {project.lookingForContributors && (
            <Badge className="border-brass bg-brass/15 text-brass">
              <Users className="mr-1 h-3 w-3" /> Contributors wanted
            </Badge>
          )}
        </div>
        <ArrowUpRight className="absolute bottom-3 right-3 h-4 w-4 text-paper/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-medium leading-snug text-paper transition-colors group-hover:text-brass">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{project.tagline}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTech.map((tech) => (
            <Badge key={tech} variant="tech">
              {tech}
            </Badge>
          ))}
          {hiddenTech > 0 && <Badge variant="tech">+{hiddenTech}</Badge>}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-line pt-3.5 [margin-top:auto]">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-brass/30 bg-brass/10 text-[0.625rem] font-semibold text-brass">
              {ownerInitials(project.ownerId)}
            </span>
            <span className="text-xs text-muted">{project.ownerId?.name?.split(" ")[0] ?? project.ownerId?.username}</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Star className="h-3.5 w-3.5 text-brass" />
            {project.starsCount ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}