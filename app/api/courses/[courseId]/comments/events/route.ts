import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Store active connections per course
const courseConnections = new Map<string, Set<ReadableStreamDefaultController>>();

export async function GET(request: NextRequest, props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;

  const stream = new ReadableStream({
    start(controller) {
      if (!courseConnections.has(courseId)) {
        courseConnections.set(courseId, new Set());
      }
      courseConnections.get(courseId)!.add(controller);

      // Send initial data
      const sendData = (data: any) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
          // Connection might be closed
          cleanup();
        }
      };

      const cleanup = () => {
        const connections = courseConnections.get(courseId);
        if (connections) {
          connections.delete(controller);
          if (connections.size === 0) {
            courseConnections.delete(courseId);
          }
        }
      };

      // Send current comments
      prisma.comment.findMany({
        where: { courseId },
        orderBy: { createdAt: "desc" },
        include: { author: true }
      }).then(comments => {
        sendData({
          type: "initial",
          comments: comments.map(c => ({
            commentId: c.commentId,
            text: c.commentText,
            authorId: c.authorId,
            authorName: c.author.name,
            authorRole: c.authorRole,
            createdAt: c.createdAt.toISOString(),
          }))
        });
      }).catch(error => {
        console.error("Error fetching initial comments:", error);
        sendData({ type: "error", message: "Failed to load comments" });
      });

      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      // Clean up if the connection is closed by the client;
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// Function to broadcast updates to all connections for a course
export function broadcastCommentUpdate(courseId: string, update: any) {
  const connections = courseConnections.get(courseId);
  if (connections) {
    connections.forEach(controller => {
      try {
        controller.enqueue(`data: ${JSON.stringify(update)}\n\n`);
      } catch (error) {
        // Connection might be closed, will be cleaned up
      }
    });
  }
}