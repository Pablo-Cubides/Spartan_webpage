
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  is_published: boolean;
  published_at: string | null;
  author: {
    name: string | null;
    email: string;
  };
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!auth) return;
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const res = await fetch("/api/admin/blog", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      if (!auth) return;
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const getStatus = (post: BlogPost) => {
    if (!post.is_published) return { label: "Draft", color: "bg-gray-700 text-gray-300" };
    if (post.published_at && new Date(post.published_at) > new Date()) {
      return { label: "Scheduled", color: "bg-purple-900 text-purple-200" };
    }
    return { label: "Published", color: "bg-green-900 text-green-200" };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Blog Management</h2>
        <Link 
          href="/admin/dashboard/blog/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + New Post
        </Link>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Author</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">Loading...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">No posts found.</td>
              </tr>
            ) : (
              posts.map((post) => {
                const status = getStatus(post);
                return (
                  <tr key={post.id} className="hover:bg-gray-750 transition">
                    <td className="px-6 py-4 text-white font-medium">{post.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {post.author.name || post.author.email}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/dashboard/blog/${post.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium mr-3"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
