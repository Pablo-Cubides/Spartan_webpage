"use client";
import React, { useState } from "react";

export default function ShareButton({ title, url }: { title?: string; url?: string }) {
  const [msg, setMsg] = useState("");

  const handleShare = async () => {
    const shareData = { title: title || document.title, url: url || window.location.href };
    try {
      if ((navigator as Navigator & { share?: (data: { title?: string; url?: string }) => Promise<void> }).share) {
        await (navigator as Navigator & { share?: (data: { title?: string; url?: string }) => Promise<void> }).share(shareData);
        setMsg("Shared");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        setMsg("Link copied to clipboard");
      } else {
        // fallback: select and copy
        const input = document.createElement("input");
        input.value = shareData.url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setMsg("Link copied");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      setMsg("Could not share");
    }

    setTimeout(() => setMsg(""), 2500);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button onClick={handleShare} aria-label="Share" className="bg-[#E02626] text-white px-3 py-2 rounded-md text-sm">
        Share
      </button>
      {msg ? <span className="text-sm text-[#D1D5DB]">{msg}</span> : null}
    </div>
  );
}
