"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Comment = {
  commentId: string;
  text: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
};

export default function DiscussionForum({
  courseId,
  currentUserId,
  canPost,
  canDelete,
}: {
  courseId: string;
  currentUserId: string;
  canPost: boolean;
  canDelete: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf());
  }, [comments]);

  useEffect(() => {
    // Connect to Server-Sent Events
    const eventSource = new EventSource(`/api/courses/${courseId}/comments/events`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "initial") {
          setComments(data.comments);
        } else if (data.type === "new_comment") {
          setComments(prev => {
            // Avoid duplicates
            if (prev.some(c => c.commentId === data.comment.commentId)) {
              return prev;
            }
            return [...prev, data.comment];
          });
        } else if (data.type === "delete_comment") {
          setComments(prev => prev.filter(c => c.commentId !== data.commentId));
        } else if (data.type === "error") {
          setError(data.message);
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setError("Lost connection to discussion. Please refresh the page.");
    };

    return () => {
      eventSource.close();
    };
  }, [courseId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/courses/${courseId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText.trim() }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error || "Failed to post comment");
      }

      setNewText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`/api/courses/${courseId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error || "Failed to delete comment");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

      {canPost && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading || !newText.trim()}>
              {loading ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {sortedComments.length === 0 ? (
          <p className="text-sm text-slate-500">No comments.</p>
        ) : (
            <>
          <p className="text-sm text-slate-500">{sortedComments.length} comments.</p>
          {sortedComments.map((comment) => (
            <div key={comment.commentId} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{comment.authorName}</p>
                    {comment.authorRole === 'INSTRUCTOR' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Instructor
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
                {(canDelete || comment.authorId === currentUserId) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.commentId)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-3 text-sm text-slate-700 whitespace-pre-line">{comment.text}</p>
            </div>
          ))}
          </>
        )}
      </div>
    </div>
  );
}
