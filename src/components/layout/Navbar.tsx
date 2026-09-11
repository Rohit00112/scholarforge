import Link from "next/link";
import { Hammer } from "lucide-react";
import { Button } from "../ui/Button";
import { auth, signOut } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

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
            {user && (
              <Link href="/dashboard" className="hover:text-[#E5E7EB]">
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/projects/new">
                <Button size="sm">Publish</Button>
              </Link>
              <div className="ml-2 flex items-center gap-3 border-l border-[#1F2937] pl-5">
                <Link href={`/students/${user.username}`} className="text-sm font-medium text-[#9CA3AF] hover:text-[#E5E7EB]">
                  {user.name}
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button type="submit" className="text-sm font-medium text-[#9CA3AF] hover:text-red-400">
                    Sign out
                  </button>
                </form>
              </div>
            </>
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
