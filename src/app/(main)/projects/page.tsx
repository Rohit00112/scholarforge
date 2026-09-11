import { Suspense } from "react";
import { CatalogFilters } from "@/components/projects/CatalogFilters";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Pagination } from "@/components/projects/Pagination";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

function toString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toInt(value: string | string[] | undefined, fallback: number) {
  const parsed = parseInt(toString(value) ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const spSafe: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(sp)) spSafe[key] = toString(value);
  const category = toString(sp.category) ?? "";
  const tech = toString(sp.tech) ?? "";
  const status = toString(sp.status) ?? "";
  const looking = toString(sp.looking) ?? "";
  const sort = toString(sp.sort) ?? "newest";
  const page = toInt(sp.page, 1);
  const q = toString(sp.q)?.trim() ?? "";

  await connectDB();

  const filter: Record<string, unknown> = {
    status: { $in: ["published", "deployed"] },
    deletedAt: null,
  };

  if (category) filter.category = category;
  if (status === "published" || status === "deployed") filter.status = status;
  if (looking === "1") filter.lookingForContributors = true;

  if (q) {
    filter.$text = { $search: q };
  }

  if (tech) {
    const techList = tech.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (techList.length > 0) filter.techStack = { $all: techList };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { publishedAt: -1 },
    stars: { starsCount: -1 },
    forks: { forksCount: -1 },
  };
  const sortOpt = sortMap[sort] ?? sortMap.newest;

  const countPromise = Project.countDocuments(filter);
  const pagePromise = Project.find(filter)
    .sort(sortOpt)
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .populate("ownerId", "username name avatarUrl branch")
    .lean();

  const [total, projects] = await Promise.all([countPromise, pagePromise]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-10">
        <p className="eyebrow">The archive</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-paper sm:text-4xl">
          Browse projects
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Every project here was built by a student, for the record. Search it, copy it, fork it, ship it.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Suspense fallback={null}>
            <CatalogFilters />
          </Suspense>
        </aside>

        <div className="min-w-0">
          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line px-8 py-20 text-center">
              <h2 className="font-display text-xl font-medium text-paper">No projects yet.</h2>
              <p className="mt-2 text-sm text-muted">Be the first to publish.</p>
            </div>
          ) : (
            <>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-muted">
                {total} {total === 1 ? "project" : "projects"}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project._id.toString()} project={project} />
                ))}
              </div>
            </>
          )}

          <div className="mt-10">
            <Suspense fallback={null}>
              <Pagination currentPage={safePage} totalPages={totalPages} searchParams={spSafe} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}