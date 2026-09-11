import { ProjectForm } from "@/components/projects/ProjectForm";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProjectNewPage() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Publish a Project</h1>
        <p className="mt-2 text-muted">
          Share your work with the campus. Fill out the details below so others can discover and learn from it.
        </p>
      </div>

      <ProjectForm />
    </div>
  );
}
