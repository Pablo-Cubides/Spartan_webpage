
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogEditor from "../editor";
import { auth } from "@/lib/firebase";

export default function EditPostPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!auth) return;
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const res = await fetch(`/api/admin/blog/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setPost(data);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (!post) return <div className="text-white">Post not found</div>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Edit Post</h2>
        <p className="text-gray-400 mt-2">Update content and publishing settings.</p>
      </div>
      <BlogEditor initialData={post} />
    </div>
  );
}
