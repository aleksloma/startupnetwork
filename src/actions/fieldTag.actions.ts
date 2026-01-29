"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createFieldTagSchema } from "@/schemas/startup.schema";
import { normalizeTagName, slugify, generateTagColor } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createFieldTag(name: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Validate
  const validated = createFieldTagSchema.safeParse({ name });
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors.name?.[0] || "Invalid tag name" };
  }

  const normalizedName = normalizeTagName(validated.data.name);
  const slug = slugify(normalizedName);

  // Check for existing tag (case-insensitive)
  const existing = await prisma.fieldTag.findFirst({
    where: {
      OR: [
        { slug },
        { name: { equals: normalizedName, mode: "insensitive" } },
      ],
    },
  });

  if (existing) {
    return { error: "A tag with this name already exists" };
  }

  try {
    const tag = await prisma.fieldTag.create({
      data: {
        name: normalizedName,
        slug,
        color: generateTagColor(),
        isPredefined: false,
      },
    });

    revalidatePath("/startup/new");
    revalidatePath("/profile");
    return { data: tag };
  } catch (error) {
    console.error("Error creating field tag:", error);
    return { error: "Failed to create tag" };
  }
}

export async function getFieldTags() {
  return prisma.fieldTag.findMany({
    orderBy: [
      { isPredefined: "desc" },
      { name: "asc" },
    ],
    include: {
      _count: { select: { startupFields: true } },
    },
  });
}
