import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startup = await prisma.startup.findUnique({
      where: { id: params.id },
      include: {
        founders: { orderBy: { order: "asc" } },
        startupFields: {
          include: { fieldTag: true },
        },
        user: { select: { id: true, name: true, image: true } },
      },
    });

    if (!startup) {
      return NextResponse.json(
        { error: "Startup not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(startup);
  } catch (error) {
    console.error("Error fetching startup:", error);
    return NextResponse.json(
      { error: "Failed to fetch startup" },
      { status: 500 }
    );
  }
}
