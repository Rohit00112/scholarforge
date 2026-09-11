"use server";

import { projectCreateSchema, projectUpdateSchema, ProjectCreateInput, ProjectUpdateInput } from "@/lib/validators/project";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { requireUser, canEditProject } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";

export async function createProjectAction(data: ProjectCreateInput) {
  try {
    const user = await requireUser();
    const parsed = projectCreateSchema.safeParse(data);

    if (!parsed.success) {
      return { error: "Validation failed", fields: parsed.error.flatten().fieldErrors };
    }

    await connectDB();

    // Generate unique slug
    let baseSlug = generateSlug(parsed.data.title);
    let isUnique = false;
    while (!isUnique) {
      const existing = await Project.exists({ slug: baseSlug });
      if (!existing) {
        isUnique = true;
      } else {
        baseSlug = generateSlug(parsed.data.title);
      }
    }

    const { status, ...rest } = parsed.data;
    const finalStatus = status === "published" && parsed.data.deploymentUrl ? "deployed" : status;

    const project = await Project.create({
      ...rest,
      slug: baseSlug,
      ownerId: user.id,
      teamMemberIds: [user.id],
      status: finalStatus,
      publishedAt: finalStatus !== "draft" ? new Date() : null,
      starsCount: 0,
      forksCount: 0,
      viewsCount: 0,
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true, slug: project.slug };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { error: "You must be logged in to create a project" };
    }
    console.error("Create project err:", error);
    return { error: "Something went wrong" };
  }
}

export async function updateProjectAction(slug: string, data: ProjectUpdateInput) {
  try {
    const user = await requireUser();
    const parsed = projectUpdateSchema.safeParse(data);

    if (!parsed.success) {
      return { error: "Validation failed", fields: parsed.error.flatten().fieldErrors };
    }

    await connectDB();

    const project = await Project.findOne({ slug });
    if (!project) return { error: "Project not found" };

    if (!canEditProject(user, project)) {
      return { error: "Forbidden: Not authorized to edit this project" };
    }

    const { status, ...rest } = parsed.data;
    let newStatus = project.status; // fallback
    let newPublishedAt = project.publishedAt;

    if (status !== undefined) {
      // Transition logic
      if (status === "published" && parsed.data.deploymentUrl) {
        newStatus = "deployed";
      } else {
        newStatus = status;
      }

      if (newStatus !== "draft" && !project.publishedAt) {
        newPublishedAt = new Date();
      }
    }

    Object.assign(project, rest, { status: newStatus, publishedAt: newPublishedAt });
    await project.save();

    revalidatePath(`/projects/${slug}`);
    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true, slug: project.slug };
  } catch (error) {
    console.error("Update project err:", error);
    return { error: "Something went wrong" };
  }
}
