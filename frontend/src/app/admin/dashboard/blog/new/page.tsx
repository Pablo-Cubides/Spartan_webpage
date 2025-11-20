
"use client";

import BlogEditor from "../editor";

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Create New Post</h2>
        <p className="text-gray-400 mt-2">Write and publish a new article for the blog.</p>
      </div>
      <BlogEditor isNew={true} />
    </div>
  );
}
