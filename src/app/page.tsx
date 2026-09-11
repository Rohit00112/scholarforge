import Link from "next/link";
import { Compass, Flame, GitFork, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CATEGORY_LABELS, PROJECT_CATEGORIES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { ProjectCard } from "@/components/projects/ProjectCard";

export const dynamic = "force-dynamic";

const steps = [
  {
    n: "01",
    icon: Flame,
    title: "Publish once",
    body: "Turn graded coursework into a discoverable, permanent asset — not a zip file that dies after the demo.",
  },
  {
    n: "02",
    icon: Compass,
    title: "Discover the archive",
    body: "Find past projects by tech, branch, or semester. Stop rebuilding what the previous batch already solved.",
  },
  {
    n: "03",
    icon: GitFork,
    title: "Evolve every cohort",
    body: "Fork what works, add what's missing, and pass it forward. Each semester makes the work better, not just new.",
  },
];

export default async function Home() {
  await connectDB();
  const publicFilter = { status: { $in: ["published", "deployed"] }, deletedAt: null };

  let featured = await Project.find({ ...publicFilter, featured: true })
    .sort({ publishedAt: -1 })
    .limit(4)
    .populate("ownerId", "username name avatarUrl branch")
    .lean();

  if (featured.length === 0) {
    featured = await Project.find(publicFilter)
      .sort({ starsCount: -1 })
      .limit(4)
      .populate("ownerId", "username name avatarUrl branch")
      .lean();
  }

  const latest = await Project.find(publicFilter)
    .sort({ publishedAt: -1 })
    .limit(8)
    .populate("ownerId", "username name avatarUrl branch")
    .lean();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-grid" aria-hidden />
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brass/10 blur-[130px]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 text-center sm:pt-24">
          <p className="eyebrow">The living archive of student innovation</p>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-[2.6rem] font-medium leading-[1.05] tracking-tight text-paper sm:text-6xl">
            Don&apos;t let your project die <em className="italic text-brass">after the demo.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Publish once. Let the next semester make it better. ScholarForge is your college&apos;s living project archive.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/projects/new">
              <Button size="lg">Publish a project</Button>
            </Link>
            <Link href="/projects">
              <Button variant="secondary" size="lg">
                Explore projects
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-12 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-muted/50">
            Publish · Discover · Fork · Evolve
          </p>
        </div>
      </section>

      {/* The forge cycle */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="eyebrow">The forge cycle</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-medium tracking-tight text-paper sm:text-4xl">
          Student work that compounds across years.
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="group rounded-lg border border-line bg-surface p-6 transition-colors hover:border-brass/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs tracking-[0.2em] text-brass">{step.n}</span>
                <step.icon className="h-4 w-4 text-muted transition-colors group-hover:text-brass" />
              </div>
              <h3 className="mt-4 font-display text-xl font-medium text-paper">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured builds */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Featured builds</p>
              <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-paper">Spotlight</h2>
            </div>
            <Link href="/projects" className="text-sm font-medium text-muted transition-colors hover:text-paper">
              View all
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((project) => (
              <ProjectCard key={project._id.toString()} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Latest projects */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Recently published</p>
              <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-paper">Latest</h2>
            </div>
            <Link href="/projects" className="text-sm font-medium text-muted transition-colors hover:text-paper">
              View all
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((project) => (
              <ProjectCard key={project._id.toString()} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by category */}
      <section className="border-t border-line bg-ink-950 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="eyebrow">Browse by discipline</p>
          <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-paper">Start with a category</h2>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {PROJECT_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/projects?category=${category}`}
                className="rounded-md border border-line bg-ink-800 px-3 py-1.5 font-mono text-xs transition-colors hover:border-brass/50 hover:text-brass"
              >
                {CATEGORY_LABELS[category] ?? category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-lg border border-line bg-surface px-8 py-14 text-center md:px-14">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/50 to-transparent" aria-hidden />
          <h2 className="font-display text-3xl font-medium tracking-tight text-paper sm:text-4xl">
            Build the project <em className="italic text-brass">everyone forks.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
            The next batch is looking for work to build on. Put a name to what you made.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/projects/new">
              <Button size="lg">Publish a project</Button>
            </Link>
            <Link href="/register" className="text-sm font-medium text-muted transition-colors hover:text-paper">
              Sign up with your college email
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}