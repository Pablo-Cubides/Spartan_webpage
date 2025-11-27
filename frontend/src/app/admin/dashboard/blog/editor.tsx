
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

interface BlogPost {
  id?: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  is_published: boolean;
  published_at: string | null;
}

interface BlogEditorProps {
  initialData?: BlogPost;
  isNew?: boolean;
}

export default function BlogEditor({ initialData, isNew = false }: BlogEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BlogPost>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image: "",
    is_published: false,
    published_at: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        published_at: initialData.published_at ? new Date(initialData.published_at).toISOString().slice(0, 16) : null,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({ ...prev, slug: value }));
  };

  const handleSubmit = async (e: React.FormEvent, publishStatus: 'draft' | 'publish' | 'schedule') => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!auth || !auth.currentUser) throw new Error("Not authenticated");
      const token = await auth.currentUser.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const payload = { ...formData };

      if (publishStatus === 'draft') {
        payload.is_published = false;
        payload.published_at = null;
      } else if (publishStatus === 'publish') {
        payload.is_published = true;
        payload.published_at = new Date().toISOString();
      } else if (publishStatus === 'schedule') {
        payload.is_published = true;
        // published_at is already set in formData from the date input
      }

      const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${initialData?.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save post");

      router.push("/admin/dashboard/blog");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error saving post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => {
                handleChange(e);
                if (isNew && !formData.slug) {
                   setFormData(prev => ({...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}));
                }
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Excerpt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Cover Image URL</label>
            <input
              type="text"
              name="cover_image"
              value={formData.cover_image}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              required
            />
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">Publishing Options</h3>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">Schedule Publication (Optional)</label>
                <input
                  type="datetime-local"
                  name="published_at"
                  value={formData.published_at || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to publish immediately or save as draft.</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'draft')}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  Save Draft
                </button>
                
                {formData.published_at ? (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'schedule')}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    Schedule
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'publish')}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    Publish Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
