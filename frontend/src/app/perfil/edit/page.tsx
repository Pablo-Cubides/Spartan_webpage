// app/perfil/edit/page.tsx
"use client";

// Force dynamic rendering to avoid Vercel lambda issues
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase";
import { setTokenCookie } from "@/lib/api";

interface UserProfile {
  name: string;
  alias: string;
  email: string;
  credits: number;
  avatar_url?: string;
  avatar_id?: string;
}

export default function EditProfilePage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    alias: '',
    email: '',
    credits: 0,
    avatar_url: '',
    avatar_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;

      if (!firebaseUser) {
        router.push("/");
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        setTokenCookie(token);

        const res = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setProfileLoaded(true);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [firebaseUser, authLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileLoaded || !firebaseUser) return;

    setSaving(true);
    setError(null);

    try {
      const token = await firebaseUser.getIdToken();

      // Solo enviar los campos permitidos por el schema
      const updateData = {
        name: profile.name,
        alias: profile.alias || undefined,
        email: profile.email,
      };

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        router.push("/perfil");
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Error al actualizar perfil');
        console.error('Error updating profile:', errorData);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#161313]">
        <div className="text-white text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto mb-4"></div>
          Cargando...
        </div>
      </div>
    );
  }

  if (!profileLoaded) return null;

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#161313] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div className="flex flex-col h-full layout-container grow">
        <div className="flex justify-center flex-1 px-40 py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <h1 className="text-white text-3xl font-bold mb-5">Editar Perfil</h1>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="name" className="text-white block mb-1">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={profile.name || ''}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-[#342d2d] text-white border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="alias" className="text-white block mb-1">Alias</label>
                  <input
                    type="text"
                    name="alias"
                    id="alias"
                    value={profile.alias || ''}
                    onChange={handleChange}
                    placeholder="Mi_Alias (letras, números, guión bajo)"
                    className="w-full p-2 rounded bg-[#342d2d] text-white border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                  <p className="text-gray-500 text-xs mt-1">Letras, números y guiones bajos (_)</p>
                </div>
                <div>
                  <label htmlFor="email" className="text-white block mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={profile.email || ''}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-[#342d2d] text-white border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => router.push("/perfil")}
                    className="flex-1 cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-[#342d2d] text-white text-sm font-bold hover:bg-[#4d4242] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-[#c20909] text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
