import React from "react";

export const metadata = {
  title: "Blog - Triarvon Club",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#0b0b0b]">{children}</div>;
}
