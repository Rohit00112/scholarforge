import Link from "next/link";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";
import { auth, signOut } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-line bg-ink-900/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-7">
          <Link href="/" className="group flex items-center gap-2.5">
            <Logo />
            <span className="font-display text-[1.125rem] tracking-tight text-paper">
              Scholar<span className="text-brass">Forge</span>
            </span>
          </Link>

          <div className="hidden items-center gap-5 text-sm text-muted md:flex">
            <Link href="/projects" className="transition-colors hover:text-paper">
              Explore
            </Link>
            <Link href="/about" className="transition-colors hover:text-paper">
              About
            </Link>
            {user && (
              <Link href="/dashboard" className="transition-colors hover:text-paper">
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
              <div className="ml-2 flex items-center gap-3 border-l border-line pl-5">
                <Link
                  href={`/students/${user.username}`}
                  className="flex items-center gap-2.5 text-sm font-medium text-muted transition-colors hover:text-paper"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-ink-700 text-[0.6875rem] font-semibold tracking-wider text-brass">
                    {initials}
                  </span>
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button type="submit" className="text-sm font-medium text-muted transition-colors hover:text-clay">
                    Sign out
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted transition-colors hover:text-paper">
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