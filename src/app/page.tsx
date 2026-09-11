import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
        Don&apos;t let your project die after the demo.
      </h1>
      <p className="mx-auto mb-10 max-w-2xl text-lg text-[#9CA3AF]">
        Publish once. Let the next semester make it better. ScholarForge is your college&apos;s living project archive.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/projects/new">
          <Button size="lg">Publish a project</Button>
        </Link>
        <Link href="/projects">
          <Button variant="secondary" size="lg">Explore projects</Button>
        </Link>
      </div>
    </div>
  );
}
