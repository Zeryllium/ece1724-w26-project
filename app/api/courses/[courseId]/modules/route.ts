import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, ROLES } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if the user is authorized to add modules (needs to be an instructor or admin)
    const role = (session.user as any).role;
    const isManaging = await prisma.managing.findUnique({
      where: {
        instructorId_courseId: {
          instructorId: session.user.id,
          courseId: courseId,
        },
      },
    });

    if (!isManaging && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Forbidden: You do not manage this course" }, { status: 403 });
    }

    // Grab the module details from the request body
    const body = await request.json();
    const { moduleTitle, moduleDescription, moduleType, moduleResourceUri } = body;

    if (!moduleTitle || typeof moduleTitle !== "string" || moduleTitle.trim() === "") {
      return NextResponse.json({ error: "moduleTitle is required" }, { status: 400 });
    }
    if (!moduleType || !["LECTURE", "ASSIGNMENT", "QUIZ"].includes(moduleType)) {
      return NextResponse.json({ error: "moduleType must be LECTURE, ASSIGNMENT, or QUIZ" }, { status: 400 });
    }
    if (!moduleResourceUri || typeof moduleResourceUri !== "string" || moduleResourceUri.trim() === "") {
      return NextResponse.json({ error: "moduleResourceUri is required" }, { status: 400 });
    }

    const sanitizedTitle = moduleTitle.trim();
    const sanitizedDescription = typeof moduleDescription === "string" ? moduleDescription.trim() : "";
    const sanitizedUri = moduleResourceUri.trim();

    // We need to assign a sequential index to the new module. We'll find the highest current index and just add 1. Doing this inside a transaction keeps it safe from race conditions.
    const newModule = await prisma.$transaction(async (tx) => {
      // Find the highest current index for this course
      const maxModule = await tx.module.findFirst({
        where: { courseId },
        orderBy: { moduleIndex: "desc" },
        select: { moduleIndex: true },
      });

      const nextIndex = maxModule ? maxModule.moduleIndex + 1 : 1;

      return await tx.module.create({
        data: {
          courseId: courseId,
          moduleIndex: nextIndex,
          moduleTitle: sanitizedTitle,
          moduleDescription: sanitizedDescription,
          moduleType: moduleType as "LECTURE" | "ASSIGNMENT" | "QUIZ",
          moduleResourceUri: sanitizedUri,
        },
      });
    });

    return NextResponse.json(newModule, { status: 201 });

  } catch (error) {
    console.error("Failed to create module:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
