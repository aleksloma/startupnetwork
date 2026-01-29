"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startupSchema, type StartupFormData } from "@/schemas/startup.schema";
import { revalidatePath } from "next/cache";

export async function createStartup(data: StartupFormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Check if user already has a startup
  const existing = await prisma.startup.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return { error: "You already have a startup registered" };
  }

  // Validate with Zod
  const validated = startupSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    // Verify field tags exist
    const tags = await prisma.fieldTag.findMany({
      where: { id: { in: validated.data.fieldTagIds } },
    });
    if (tags.length !== validated.data.fieldTagIds.length) {
      return { error: "One or more selected tags do not exist" };
    }

    const startup = await prisma.startup.create({
      data: {
        name: validated.data.name,
        goal: validated.data.goal,
        websiteUrl: validated.data.websiteUrl || null,
        description: validated.data.description,
        userId: session.user.id,
        founders: {
          create: validated.data.founders.map((f, i) => ({
            name: f.name,
            linkedInUrl: f.linkedInUrl,
            isPrimary: i === 0,
            order: i,
          })),
        },
        startupFields: {
          create: validated.data.fieldTagIds.map((tagId) => ({
            fieldTagId: tagId,
          })),
        },
      },
      include: {
        founders: true,
        startupFields: { include: { fieldTag: true } },
      },
    });

    revalidatePath("/");
    revalidatePath("/explore");
    return { data: startup };
  } catch (error) {
    console.error("Error creating startup:", error);
    return { error: "Failed to create startup" };
  }
}

export async function updateStartup(startupId: string, data: StartupFormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Check ownership
  const existing = await prisma.startup.findUnique({
    where: { id: startupId },
    include: { founders: true, startupFields: true },
  });

  if (!existing) {
    return { error: "Startup not found" };
  }

  if (existing.userId !== session.user.id) {
    return { error: "You can only edit your own startup" };
  }

  // Validate with Zod
  const validated = startupSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    // Verify field tags exist
    const tags = await prisma.fieldTag.findMany({
      where: { id: { in: validated.data.fieldTagIds } },
    });
    if (tags.length !== validated.data.fieldTagIds.length) {
      return { error: "One or more selected tags do not exist" };
    }

    // Delete existing founders and fields, then recreate
    await prisma.founder.deleteMany({ where: { startupId } });
    await prisma.startupField.deleteMany({ where: { startupId } });

    const startup = await prisma.startup.update({
      where: { id: startupId },
      data: {
        name: validated.data.name,
        goal: validated.data.goal,
        websiteUrl: validated.data.websiteUrl || null,
        description: validated.data.description,
        founders: {
          create: validated.data.founders.map((f, i) => ({
            name: f.name,
            linkedInUrl: f.linkedInUrl,
            isPrimary: i === 0,
            order: i,
          })),
        },
        startupFields: {
          create: validated.data.fieldTagIds.map((tagId) => ({
            fieldTagId: tagId,
          })),
        },
      },
      include: {
        founders: true,
        startupFields: { include: { fieldTag: true } },
      },
    });

    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath(`/startup/${startupId}`);
    return { data: startup };
  } catch (error) {
    console.error("Error updating startup:", error);
    return { error: "Failed to update startup" };
  }
}

export async function deleteStartup(startupId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Check ownership
  const existing = await prisma.startup.findUnique({
    where: { id: startupId },
  });

  if (!existing) {
    return { error: "Startup not found" };
  }

  if (existing.userId !== session.user.id) {
    return { error: "You can only delete your own startup" };
  }

  try {
    await prisma.startup.delete({ where: { id: startupId } });

    revalidatePath("/");
    revalidatePath("/explore");
    return { success: true };
  } catch (error) {
    console.error("Error deleting startup:", error);
    return { error: "Failed to delete startup" };
  }
}

export async function getUserStartup() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return prisma.startup.findUnique({
    where: { userId: session.user.id },
    include: {
      founders: { orderBy: { order: "asc" } },
      startupFields: { include: { fieldTag: true } },
    },
  });
}
