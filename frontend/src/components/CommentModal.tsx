"use client";
import React from "react";
import Comments from "@/components/Comments";

export default function CommentModal({ open, onClose, postSlug, userName }: { open: boolean; onClose: () => void; postSlug: string; userName: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0f0f0f] p-6 border border-[#333]">
        <button className="absolute right-4 top-4 text-[#ba9c9c] hover:text-white" onClick={onClose} aria-label="Cerrar">
          <svg width={24} height={24} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <h2 className="text-xl text-white font-bold mb-4">Comentar</h2>
        <Comments postSlug={postSlug} userName={userName} />
      </div>
    </div>
  );
}
