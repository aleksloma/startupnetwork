import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const tags = searchParams.getAll("tag");

    const startups = await prisma.startup.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                  { goal: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          tags.length > 0
            ? {
                startupFields: {
                  some: {
                    fieldTag: { slug: { in: tags } },
                  },
                },
              }
            : {},
        ],
      },
      include: {
        founders: { orderBy: { order: "asc" } },
        startupFields: {
          include: { fieldTag: true },
        },
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(startups);
  } catch (error) {
    console.error("Error fetching startups:", error);
    return NextResponse.json(
      { error: "Failed to fetch startups" },
      { status: 500 }
    );
  }
}
