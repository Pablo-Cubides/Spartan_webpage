"use client";
import React, { useEffect, useState, useCallback } from "react";

type Comment = {
  id: string;
  postSlug: string;
  name?: string;
  content: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

export default function Comments({ postSlug, userName }: { postSlug: string; userName?: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?post=${encodeURIComponent(postSlug)}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (e) {
      console.error(e);
    }
  }, [postSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return setMessage("Write a comment");
    if (!userName) return setMessage("You must log in to comment.");
    setLoading(true);
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, name: userName, content }),
      });
      if (res.ok) {
        setMessage("Comment submitted and awaiting moderation");
        setContent("");
        fetchComments();
      } else {
        setMessage("Could not submit comment");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      setMessage("Error submitting");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="mt-4">
      <div className="rounded-xl bg-[#222222] p-6 max-h-[60vh] overflow-auto">
        <h3 className="text-xl text-white font-bold">Comments</h3>
        <div className="mt-4">
          {comments.length === 0 ? <p className="text-[#D1D5DB]">Be the first to comment.</p> : null}
          <ul className="space-y-4 mt-4">
            {comments.map((c) => (
              <li key={c.id} className="border-b border-neutral-800 pb-3">
                <div className="text-sm text-[#D1D5DB]">{c.name || "Anonymous"} · <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span></div>
                <div className="mt-1 text-white">{c.content}</div>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {!userName ? (
            <div className="text-sm text-[#D1D5DB]">You must log in to comment.</div>
          ) : null}
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your comment" className="w-full p-3 bg-[#111111] rounded h-28" />
          <div className="flex items-center gap-3">
            <button disabled={loading || !userName} className="bg-[#E02626] text-white px-4 py-2 rounded">Submit</button>
            {message ? <span className="text-sm text-[#D1D5DB]">{message}</span> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
