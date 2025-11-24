// components/Header.tsx
'use client';
import { useState } from "react";
import Link from "next/link";
import ModalLogin from "@/components/ModalLogin";

export default function Header() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#303030] px-10 py-3">
        <div className="flex items-center gap-4 text-white">
          <Link href="/" className="flex items-center gap-2 text-white">
            <div className="flex items-center">
              <img
                src={encodeURI('/Texto Spartan.png')}
                alt="Spartan"
                className="h-8 w-auto object-contain"
              />
            </div>
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
              Sobre Nosotros
            </Link>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#303030] text-white text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">Iniciar Sesión</span>
            </button>
          </div>
        </div>
      </header>
      <ModalLogin open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
