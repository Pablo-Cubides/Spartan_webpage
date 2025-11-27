"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ModalLogin from "@/components/ModalLogin";
import CommentModal from "@/components/CommentModal";
import { useAuth } from "@/lib/firebase";

const ShareButton = dynamic(() => import("@/components/ShareButton"), { ssr: false });

export default function PostInteractiveLoader({ slug, title }: { slug: string; title?: string }) {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // If user logs in while login modal open, close login modal and open comment modal
  useEffect(() => {
    if (user && showLogin) {
      setShowLogin(false);
      setShowCommentModal(true);
    }
  }, [user, showLogin]);

  const handleCommentClick = () => {
    if (loading) return;
    if (!user) {
      setShowLogin(true);
      return;
    }
    setShowCommentModal(true);
  };

  const userName = user?.displayName || user?.email?.split("@")[0] || "Usuario";

  return (
    <div className="flex items-center gap-4">
      <ShareButton title={title} />
      <button onClick={handleCommentClick} className="flex items-center gap-2 bg-[#111] border border-[#333] px-4 py-2 rounded hover:bg-[#1a1a1a] text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#D1D5DB]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        Comment
      </button>

      <ModalLogin open={showLogin} onClose={() => setShowLogin(false)} />
      <CommentModal open={showCommentModal} onClose={() => setShowCommentModal(false)} postSlug={slug} userName={userName} />
    </div>
  );
}
