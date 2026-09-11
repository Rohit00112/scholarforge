import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth, canEditProject } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Star from "@/models/Star";
import { ProjectDetail, type ProjectDetailProps } from "@/components/projects/ProjectDetail";

export const dynamic = "force-dynamic";

interface DetailParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DetailParams): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const project = await Project.findOne({
    slug,
    status: { $in: ["published", "deployed"] },
    deletedAt: null,
  })
    .select("title tagline description")
    .lean();

  if (!project) return {};

  return {
    title: `${project.title} | ScholarForge`,
    description: project.tagline || project.description.slice(0, 160),
    openGraph: {
      title: project.title,
      description: project.tagline || project.description.slice(0, 160),
    },
  };
}

export default async function ProjectDetailPage({ params }: DetailParams) {
  const { slug } = await params;
  const session = await auth();
  const user = session?.user ?? null;

  await connectDB();

  const project = await Project.findOne({ slug, deletedAt: null })
    .populate("ownerId", "username name avatarUrl branch")
    .populate("teamMemberIds", "username name avatarUrl")
    .populate("facultyMentorId", "username name")
    .lean();

  if (!project) notFound();

  const isDraft = project.status === "draft";
  if (isDraft && !(user && canEditProject(user, project))) notFound();

  let parent: ProjectDetailProps["parent"] = null;
  if (project.parentProjectId) {
    const doc = await Project.findById(project.parentProjectId)
      .select("slug title status deletedAt")
      .lean();
    if (doc && !doc.deletedAt && doc.status !== "draft") {
      parent = { slug: doc.slug, title: doc.title };
    }
  }

  let starredByMe = false;
  if (user) {
    starredByMe = Boolean(await Star.exists({ userId: user.id, projectId: project._id }));
  }

  void Project.updateOne({ _id: project._id }, { $inc: { viewsCount: 1 } }).catch(() => {});

  const canEdit = user ? canEditProject(user, project) : false;

  return (
    <ProjectDetail
      project={project}
      starredByMe={starredByMe}
      authenticated={Boolean(user)}
      canEdit={canEdit}
      parent={parent}
    />
  );
}