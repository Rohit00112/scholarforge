import Link from "next/link";
import { Code } from "lucide-react";
import { Logo } from "../ui/Logo";

const year = new Date().getFullYear();

export function Footer() {
  const collegeName = process.env.COLLEGE_NAME || "Your College";

  return (
    <footer className="border-t border-line bg-ink-950">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="h-5 w-5" />
              <span className="font-display text-lg tracking-tight text-paper">
                Scholar<span className="text-brass">Forge</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Built so student work outlives the semester at {collegeName}.
            </p>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-2">
              <p className="eyebrow">Platform</p>
              <Link href="/projects" className="text-sm text-muted transition-colors hover:text-paper">
                Explore projects
              </Link>
              <Link href="/about" className="text-sm text-muted transition-colors hover:text-paper">
                About ScholarForge
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="eyebrow">Community</p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-paper"
              >
                <Code className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted md:flex-row">
          <p>© {year} ScholarForge · {collegeName}</p>
          <p className="font-mono tracking-wide text-muted/70">The living archive of student innovation</p>
        </div>
      </div>
    </footer>
  );
}