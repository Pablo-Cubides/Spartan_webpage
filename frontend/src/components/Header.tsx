// components/Header.tsx
'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ModalLogin from "@/components/ModalLogin";
import { useAuth, signOut } from "@/lib/firebase";
import { removeTokenCookie, setTokenCookie } from "@/lib/api";

interface UserProfile {
  role?: string;
}

export default function Header() {
  const [modalOpen, setModalOpen] = useState(false);
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Prevent hydration mismatch by only rendering auth-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile to get role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const token = await user.getIdToken();
        setTokenCookie(token);
        
        const res = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    };

    if (mounted && !loading && user) {
      fetchUserRole();
    }
  }, [user, loading, mounted]);

  const handleSignOut = async () => {
    await signOut();
    removeTokenCookie();
    setUserProfile(null);
    setMenuOpen(false);
  };

  // Skeleton button that matches the "Iniciar Sesión" button exactly
  const AuthSkeleton = () => (
    <button
      disabled
      className="flex min-w-[84px] max-w-[480px] cursor-default items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#303030] text-transparent text-sm font-bold leading-normal tracking-[0.015em] animate-pulse"
    >
      <span className="truncate">Cargando...</span>
    </button>
  );

  return (
    <>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#303030] px-10 py-3">
        <div className="flex items-center gap-4 text-white">
          <Link href="/" className="flex items-center gap-3 text-white">
            <Image width={32} height={32} src="/Icono spartan club.png" alt="Spartan helmet" className="object-contain" />
            <span className="hidden sm:inline-block font-display font-bold tracking-wider">SPARTAN CLUB</span>
          </Link>
        </div>
        <div className="flex justify-end flex-1 gap-8">
          <div className="flex items-center gap-9">
            <Link href="/blog" className="text-sm font-medium leading-normal text-white">
              Blog
            </Link>
            <Link href="/herramientas" className="text-sm font-medium leading-normal text-white">
              Herramientas
            </Link>
            <Link href="/nosotros" className="text-sm font-medium leading-normal text-white">
              Nosotros
            </Link>
          </div>
          <div className="flex gap-2">
            {!mounted || loading ? (
              <AuthSkeleton />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-[#303030] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#404040] transition-colors"
                >
                  <span className="truncate max-w-[150px]">{user.displayName || user.email?.split('@')[0] || 'Usuario'}</span>
                  <svg className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#303030] rounded-lg shadow-lg z-50">
                    <Link
                      href="/perfil"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-white hover:bg-[#303030] transition-colors"
                    >
                      Mi Perfil
                    </Link>
                    {userProfile?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amber-400 hover:bg-[#303030] transition-colors"
                      >
                        ⚙️ Panel Admin
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#303030] transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#303030] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#404040] transition-colors"
              >
                <span className="truncate">Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </header>
      <ModalLogin open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
