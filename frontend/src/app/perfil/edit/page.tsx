// app/perfil/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTokenCookie } from "@/lib/api";

interface UserProfile {
  name: string;
  alias: string;
  email: string;
  credits: number;
  avatar_url?: string;
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getTokenCookie();
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        } else {
            router.push("/login");
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
        const token = getTokenCookie();
        if (!token) {
            router.push("/login");
            return;
        }

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        router.push("/perfil");
      } else {
        console.error('Error updating profile:', await res.json());
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({
        ...profile,
        [e.target.name]: e.target.value
    });
    };

  if (loading) return <div className="text-white text-center py-20">Loading profile...</div>;
  if (!profile) return null;

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#161313] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div className="flex flex-col h-full layout-container grow">
        <div className="flex justify-center flex-1 px-40 py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <h1 className="text-white text-3xl font-bold mb-5">Edit Profile</h1>
            <form onSubmit={handleUpdate}>
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="name" className="text-white">Name</label>
                  <input type="text" name="name" id="name" value={profile.name} onChange={handleChange} className="w-full p-2 rounded bg-[#342d2d] text-white" />
                </div>
                <div>
                  <label htmlFor="alias" className="text-white">Alias</label>
                  <input type="text" name="alias" id="alias" value={profile.alias} onChange={handleChange} className="w-full p-2 rounded bg-[#342d2d] text-white" />
                </div>
                <div>
                  <label htmlFor="email" className="text-white">Email</label>
                  <input type="email" name="email" id="email" value={profile.email} onChange={handleChange} className="w-full p-2 rounded bg-[#342d2d] text-white" />
                </div>
                <button
                  type="submit"
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e8c9c9] text-[#161313] text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[480px] @[480px]:w-auto"
                >
                  <span className="truncate">Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
