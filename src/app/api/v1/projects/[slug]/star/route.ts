import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Star from "@/models/Star";

export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { slug } = await params;

  await connectDB();
  const project = await Project.findOne({
    slug,
    status: { $in: ["published", "deployed"] },
    deletedAt: null,
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const userId = session.user.id;
  const existing = await Star.findOne({ userId, projectId: project._id });

  let starred: boolean;
  if (existing) {
    await Star.deleteOne({ _id: existing._id });
    await Project.updateOne({ _id: project._id }, { $inc: { starsCount: -1 } });
    starred = false;
  } else {
    try {
      await Star.create({ userId, projectId: project._id });
      await Project.updateOne({ _id: project._id }, { $inc: { starsCount: 1 } });
      starred = true;
    } catch (err: unknown) {
      const code = (err as { code?: number }).code;
      if (code === 11000) {
        const fresh = await Project.findById(project._id).select("starsCount").lean();
        return NextResponse.json({ starred: true, starsCount: fresh?.starsCount ?? 0 });
      }
      throw err;
    }
  }

  const fresh = await Project.findById(project._id).select("starsCount").lean();
  const starsCount = fresh?.starsCount ?? 0;

  revalidatePath(`/projects/${slug}`);
  revalidatePath("/projects");
  revalidatePath("/");

  return NextResponse.json({ starred, starsCount });
}