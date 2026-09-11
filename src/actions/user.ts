"use server";

import { settingsSchema, type SettingsInput } from "@/lib/validators/user";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireUser, unstable_update } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSettingsAction(data: SettingsInput) {
  try {
    const user = await requireUser();

    const parsed = settingsSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Validation failed", fields: parsed.error.flatten().fieldErrors };
    }

    const patch = parsed.data;

    if (!patch || Object.keys(patch).length === 0) {
      return { success: true };
    }

    await connectDB();
    const userDoc = await User.findById(user.id);
    if (!userDoc) {
      return { error: "You must be logged in to update settings" };
    }

    Object.assign(userDoc, patch);
    await userDoc.save();

    if (patch.name !== undefined) {
      await unstable_update({ user: { name: patch.name } });
    }

    revalidatePath(`/students/${userDoc.username}`);
    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    console.error("Update settings err:", error);
    return { error: "Something went wrong" };
  }
}