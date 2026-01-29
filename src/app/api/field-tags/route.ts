import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tags = await prisma.fieldTag.findMany({
      orderBy: [
        { isPredefined: "desc" },
        { name: "asc" },
      ],
      include: {
        _count: { select: { startupFields: true } },
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching field tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch field tags" },
      { status: 500 }
    );
  }
}
