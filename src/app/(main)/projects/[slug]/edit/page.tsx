import { ProjectForm } from "@/components/projects/ProjectForm";
import { canEditProject, requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { notFound, redirect } from "next/navigation";

export default async function ProjectEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const { slug } = await params;

  await connectDB();
  const project = await Project.findOne({ slug }).lean();

  if (!project) {
    notFound();
  }

  if (!canEditProject(user, project)) {
    notFound();
  }

  const serialized = {
    ...project,
    _id: project._id.toString(),
    ownerId: project.ownerId.toString(),
    teamMemberIds: project.teamMemberIds.map((id: { toString(): string }) => id.toString()),
    facultyMentorId: project.facultyMentorId?.toString(),
    parentProjectId: project.parentProjectId?.toString(),
    repositoryUrl: project.repositoryUrl || undefined,
    demoUrl: project.demoUrl || undefined,
    deploymentUrl: project.deploymentUrl || undefined,
    documentationUrl: project.documentationUrl || undefined,
    researchPaperUrl: project.researchPaperUrl || undefined,
    coverImageUrl: project.coverImageUrl || undefined,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Edit Project</h1>
        <p className="mt-2 text-muted">
          Update details for <strong>{project.title}</strong>.
        </p>
      </div>

      <ProjectForm initialData={serialized} />
    </div>
  );
}
