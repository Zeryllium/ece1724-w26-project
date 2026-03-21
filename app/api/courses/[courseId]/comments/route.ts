import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, isEnrolled, isManaging } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { broadcastCommentUpdate } from "./events/route";

export async function GET(request: NextRequest, props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      include: { author: true }
    });

    return NextResponse.json(
      comments.map((c) => ({
        commentId: c.commentId,
        text: c.commentText,
        authorId: c.authorId,
        authorName: c.author.name,
        authorRole: c.authorRole || c.author.role,
        createdAt: c.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Failed to load comments", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized - please log in again." }, { status: 401 });
  }

  const enrolled = await isEnrolled(session.user.id, courseId);
  const managing = await isManaging(session.user.id, courseId);
  if (!enrolled && !managing) {
    return NextResponse.json({ error: "Please enroll to post a comment." }, { status: 403 });
  }

  const authorRole: UserRole = managing ? UserRole.INSTRUCTOR : UserRole.STUDENT;

  const body = await request.json();
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        commentText: text,
        courseId,
        authorId: session.user.id,
        authorRole,
      }
    });

    // Broadcast the new comment to all connected clients
    broadcastCommentUpdate(courseId, {
      type: "new_comment",
      comment: {
        commentId: comment.commentId,
        text: comment.commentText,
        authorId: comment.authorId,
        authorName: session.user.name,
        authorRole,
        createdAt: comment.createdAt.toISOString(),
      }
    });

    return NextResponse.json({
      commentId: comment.commentId,
      text: comment.commentText,
      authorId: comment.authorId,
      authorName: session.user.name,
      authorRole,
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to create comment", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
