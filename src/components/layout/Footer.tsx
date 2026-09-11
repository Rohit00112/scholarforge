import Link from "next/link";
import { Code } from "lucide-react";

export function Footer() {
  const collegeName = process.env.COLLEGE_NAME || "Your College";

  return (
    <footer className="border-t border-[#1F2937] bg-[#0B0F19] py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <p className="font-medium text-[#E5E7EB]">ScholarForge</p>
          <p className="text-sm text-[#9CA3AF]">
            Built so student work outlives the semester at {collegeName}.
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-[#9CA3AF]">
          <Link href="/about" className="hover:text-[#E5E7EB]">
            About
          </Link>
          <Link href="/projects" className="hover:text-[#E5E7EB]">
            Explore
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9CA3AF] hover:text-[#E5E7EB]"
            aria-label="GitHub Repository"
          >
            <Code className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
