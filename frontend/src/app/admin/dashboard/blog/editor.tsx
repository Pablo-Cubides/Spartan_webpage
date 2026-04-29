
"use client";

import { useEffect, useState } from "react";
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

async function getAuthToken() {
  if (!auth?.currentUser) {
    throw new Error("Not authenticated");
  }

  const token = await auth.currentUser.getIdToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function BlogEditor({ initialData, isNew = false }: BlogEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [coverStatus, setCoverStatus] = useState<string>("");
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
        published_at: initialData.published_at
          ? new Date(initialData.published_at).toISOString().slice(0, 16)
          : null,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => {
      const next = { ...prev, title: value };
      if (isNew && !prev.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleCoverUpload = async () => {
    if (!selectedCover) {
      setCoverStatus("Selecciona una imagen primero.");
      return;
    }

    setUploadingCover(true);
    setCoverStatus("");

    try {
      const token = await getAuthToken();
      const payload = new FormData();
      payload.append("file", selectedCover);

      const response = await fetch("/api/admin/blog/media", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      if (!response.ok) {
        throw new Error("No se pudo subir la portada");
      }

      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        throw new Error("La subida no devolvió una URL");
      }

      setFormData((prev) => ({ ...prev, cover_image: data.url ?? "" }));
      setCoverStatus("Portada subida correctamente.");
      setSelectedCover(null);
    } catch (error) {
      console.error(error);
      setCoverStatus("No se pudo subir la imagen.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    publishStatus: "draft" | "publish" | "schedule",
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getAuthToken();
      const payload = { ...formData };

      if (publishStatus === "draft") {
        payload.is_published = false;
        payload.published_at = null;
      } else if (publishStatus === "publish") {
        payload.is_published = true;
        payload.published_at = new Date().toISOString();
      } else if (publishStatus === "schedule") {
        payload.is_published = true;
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
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
        <form className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Excerpt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Cover Image URL</label>
              <input
                type="text"
                name="cover_image"
                value={formData.cover_image}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900/50 p-4">
              <label className="mb-2 block text-sm font-medium text-gray-400">
                Upload cover image
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setSelectedCover(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
                />
                <button
                  type="button"
                  onClick={handleCoverUpload}
                  disabled={uploadingCover || !selectedCover}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {uploadingCover ? "Uploading..." : "Upload"}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Cloudinary/local fallback through the shared storage helper.
              </p>
              {coverStatus ? <p className="mt-2 text-xs text-gray-300">{coverStatus}</p> : null}
            </div>

            {formData.cover_image ? (
              <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
                <img
                  src={formData.cover_image}
                  alt="Cover preview"
                  className="h-56 w-full object-cover"
                />
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="mb-4 text-lg font-medium text-white">Publishing Options</h3>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-400">
                  Schedule Publication (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="published_at"
                  value={formData.published_at || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to publish immediately or save as draft.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "draft")}
                  disabled={loading}
                  className="rounded-lg bg-gray-700 px-4 py-2 font-medium text-white transition hover:bg-gray-600 disabled:opacity-50"
                >
                  Save Draft
                </button>

                {formData.published_at ? (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, "schedule")}
                    disabled={loading}
                    className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                  >
                    Schedule
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, "publish")}
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
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
