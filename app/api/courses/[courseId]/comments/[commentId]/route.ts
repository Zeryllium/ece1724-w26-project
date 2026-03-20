import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, isManaging } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastCommentUpdate } from "../events/route";

export async function DELETE(request: NextRequest, props: { params: Promise<{ courseId: string; commentId: string }> }) {
  const { courseId, commentId } = await props.params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { commentId },
    });

    if (!comment || comment.courseId !== courseId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const canManage = await isManaging(session.user.id, courseId);
    const isAuthor = comment.authorId === session.user.id;

    if (!canManage && !isAuthor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { commentId },
    });

    // Broadcast the comment deletion to all connected clients
    broadcastCommentUpdate(courseId, {
      type: "delete_comment",
      commentId,
    });

    return NextResponse.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Failed to delete comment", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
