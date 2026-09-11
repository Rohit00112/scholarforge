import Link from "next/link";
import { Hammer } from "lucide-react";
import { Button } from "../ui/Button";

// We will make auth dynamic later. For Phase 1.0 it's a structural shell.
export function Navbar() {
  const isSignedIn = false; // Mock for now

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#1F2937] bg-[#0B0F19]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-[#E5E7EB] hover:text-white">
            <Hammer className="h-5 w-5 text-[#6366F1]" />
            <span className="font-semibold tracking-tight">ScholarForge</span>
          </Link>

          <div className="hidden items-center gap-4 text-sm font-medium text-[#9CA3AF] md:flex">
            <Link href="/projects" className="hover:text-[#E5E7EB]">
              Explore
            </Link>
            {isSignedIn && (
              <Link href="/dashboard" className="hover:text-[#E5E7EB]">
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link href="/projects/new">
              <Button size="sm">Publish Project</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-[#9CA3AF] hover:text-[#E5E7EB]">
                Log in
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
