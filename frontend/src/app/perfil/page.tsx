// app/perfil/page.tsx
"use client";

// Force dynamic rendering to avoid Vercel lambda issues
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/firebase";
import { setTokenCookie } from "@/lib/api";

interface UserProfile {
  name: string;
  alias: string;
  email: string;
  credits: number;
  avatar_url?: string;
}

export default function PerfilPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Esperar a que Firebase termine de cargar
      if (authLoading) return;

      // Si no hay usuario de Firebase, no hay sesión
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      try {
        // Obtener token fresco de Firebase
        const token = await firebaseUser.getIdToken();
        setTokenCookie(token);

        // Primero sincronizar el usuario
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Luego obtener el perfil
        const res = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        } else {
          const errorData = await res.json();
          setError(errorData.message || 'Error al cargar perfil');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [firebaseUser, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#161313]">
        <div className="text-white text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto mb-4"></div>
          Cargando perfil...
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#161313]">
        <div className="text-center py-20">
          <p className="text-white text-xl mb-4">Por favor inicia sesión para ver tu perfil.</p>
          <Link href="/" className="text-[#c20909] hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#161313]">
        <div className="text-center py-20">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[#c20909] hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si tenemos usuario de Firebase pero no perfil de BD, mostrar datos básicos
  const displayProfile = profile || {
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
    email: firebaseUser.email || '',
    alias: null,
    credits: 0,
    avatar_url: firebaseUser.photoURL || '/icono triarvon club - sin fondo.png'
  };

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
                  <div className="w-32 h-32 relative">
                    <Image
                      src={displayProfile.avatar_url || '/icono triarvon club - sin fondo.png'}
                      alt={displayProfile.name || 'User Avatar'}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                      {displayProfile.name || 'Triarvon Warrior'}
                    </p>
                    <p className="text-[#b2a4a4] text-base font-normal leading-normal text-center">
                      Alias: {displayProfile.alias || 'No alias'}
                    </p>
                    <p className="text-[#b2a4a4] text-base font-normal leading-normal text-center">
                      Email: {displayProfile.email}
                    </p>
                  </div>
                </div>
                <Link href="/perfil/edit">
                  <button
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#342d2d] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[480px] @[480px]:w-auto"
                  >
                    <span className="truncate">Editar Perfil</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Créditos */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Créditos
            </h2>
            <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#4d4242] py-5">
                <p className="text-[#b2a4a4] text-sm font-normal leading-normal">Créditos Disponibles</p>
                <p className="text-sm font-normal leading-normal text-white">{displayProfile.credits}</p>
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
