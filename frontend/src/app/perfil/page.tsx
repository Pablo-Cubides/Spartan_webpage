// app/perfil/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTokenCookie } from "@/lib/api";

interface UserProfile {
  name: string;
  alias: string;
  email: string;
  credits: number;
  avatar_url?: string;
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getTokenCookie();
        if (!token) {
          setLoading(false);
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
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="text-white text-center py-20">Cargando perfil...</div>;
  if (!profile) return <div className="text-white text-center py-20">Por favor inicia sesión para ver tu perfil.</div>;

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#161313] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div className="flex flex-col h-full layout-container grow">
        {/* SIN HEADER, ya es global */}
        <div className="flex justify-center flex-1 px-40 py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Perfil principal */}
            <div className="flex p-4 @container">
              <div className="flex flex-col items-center w-full gap-4">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="w-32 bg-center bg-no-repeat bg-cover rounded-full aspect-square min-h-32 bg-gray-700"
                    style={{
                      backgroundImage: profile.avatar_url ? `url("${profile.avatar_url}")` : undefined,
                    }}
                  >
                    {!profile.avatar_url && <span className="flex items-center justify-center h-full text-4xl">👤</span>}
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                      {profile.name || 'Guerrero Espartano'}
                    </p>
                    <p className="text-[#b2a4a4] text-base font-normal leading-normal text-center">
                      Alias: {profile.alias || 'Sin alias'}
                    </p>
                    <p className="text-[#b2a4a4] text-base font-normal leading-normal text-center">
                      Email: {profile.email}
                    </p>
                  </div>
                </div>
                <button
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#342d2d] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[480px] @[480px]:w-auto"
                >
                  <span className="truncate">Editar Perfil</span>
                </button>
              </div>
            </div>
            
            {/* Créditos */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Créditos
            </h2>
            <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#4d4242] py-5">
                <p className="text-[#b2a4a4] text-sm font-normal leading-normal">Créditos Restantes</p>
                <p className="text-sm font-normal leading-normal text-white">{profile.credits}</p>
              </div>
            </div>
            <div className="flex justify-start px-4 py-3">
              <Link href="/credits">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e8c9c9] text-[#161313] text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Comprar Créditos</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
