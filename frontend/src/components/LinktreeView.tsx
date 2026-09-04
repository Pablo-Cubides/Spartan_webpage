"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Globe,
  Share2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ArrowUpRight,
  Shield,
  BookOpen,
  UserCheck,
  Bot,
  X as CloseIcon,
} from "lucide-react";

// Official Logos SVG definitions
const InstagramLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${className} fill-current`}
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${className} fill-current`}
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${className} fill-current`}
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SocialLink {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
  icon: React.ReactNode;
  iconBgClass: string;
  borderClass: string;
  hoverGlowClass: string;
  isExternal?: boolean;
  featured?: boolean;
}

export default function LinktreeView() {
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";
  const linktreeUrl = `${siteUrl}/links`;

  const socialLinks: SocialLink[] = [
    {
      id: "website",
      title: "Página Web Oficial",
      subtitle: "triarvon.com • Plataforma de Alto Rendimiento",
      url: "/",
      badge: "SITIO PRINCIPAL",
      icon: (
        <Image
          src="/Triarvon/triarvon-mark-one-color-transparent.png"
          alt="Triarvon Logo"
          width={28}
          height={28}
          className="object-contain filter drop-shadow"
        />
      ),
      iconBgClass:
        "bg-gradient-to-br from-[#C62828] to-[#800A0A] text-white shadow-lg shadow-red-900/40",
      borderClass: "border-red-600/40 hover:border-red-500",
      hoverGlowClass: "hover:shadow-[0_0_25px_rgba(198,40,40,0.35)]",
      isExternal: false,
      featured: true,
    },
    {
      id: "instagram",
      title: "Instagram",
      subtitle: "@triarvon • Comunidad, Mentalidad & Estilo",
      url: "https://instagram.com/triarvon",
      badge: "OFICIAL",
      icon: <InstagramLogo className="w-6 h-6 text-white" />,
      iconBgClass:
        "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-lg shadow-pink-900/30",
      borderClass: "border-pink-500/30 hover:border-pink-400",
      hoverGlowClass: "hover:shadow-[0_0_25px_rgba(220,39,67,0.3)]",
      isExternal: true,
      featured: true,
    },
    {
      id: "facebook",
      title: "Facebook",
      subtitle: "Triarvon Oficial • Noticias, Artículos & Comunidad",
      url: "https://facebook.com/triarvon",
      badge: "OFICIAL",
      icon: <FacebookLogo className="w-6 h-6 text-white" />,
      iconBgClass: "bg-[#1877F2] shadow-lg shadow-blue-900/30",
      borderClass: "border-blue-500/30 hover:border-blue-400",
      hoverGlowClass: "hover:shadow-[0_0_25px_rgba(24,119,242,0.3)]",
      isExternal: true,
      featured: true,
    },
    {
      id: "x-twitter",
      title: "X (Twitter)",
      subtitle: "@triarvon • Reflexiones, Disciplina & Consejos",
      url: "https://x.com/triarvon",
      badge: "OFICIAL",
      icon: <XLogo className="w-5 h-5 text-white" />,
      iconBgClass:
        "bg-black border border-neutral-700 shadow-lg shadow-neutral-900/50",
      borderClass: "border-neutral-700/60 hover:border-neutral-400",
      hoverGlowClass: "hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]",
      isExternal: true,
      featured: true,
    },
  ];

  const toolsAndContent: SocialLink[] = [
    {
      id: "coach-triarvono",
      title: "Coach Triarvono (IA)",
      subtitle: "Tu mentor virtual de disciplina, entrenamiento y metas",
      url: "/herramientas/couch_triarvono",
      badge: "HERRAMIENTA IA",
      icon: <Bot className="w-6 h-6 text-amber-400" />,
      iconBgClass: "bg-neutral-900 border border-amber-500/30 shadow-md",
      borderClass: "border-amber-500/30 hover:border-amber-400",
      hoverGlowClass: "hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]",
      isExternal: false,
    },
    {
      id: "asesor-estilo",
      title: "Asesor de Estilo (IA)",
      subtitle:
        "Recomendaciones personalizadas de código de vestimenta masculino",
      url: "/herramientas/asesor-estilo",
      badge: "HERRAMIENTA IA",
      icon: <UserCheck className="w-6 h-6 text-emerald-400" />,
      iconBgClass: "bg-neutral-900 border border-emerald-500/30 shadow-md",
      borderClass: "border-emerald-500/30 hover:border-emerald-400",
      hoverGlowClass: "hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]",
      isExternal: false,
    },
    {
      id: "blog",
      title: "Blog & Publicaciones",
      subtitle: "Artículos sobre mentalidad, acondicionamiento y liderazgo",
      url: "/blog",
      badge: "ARTÍCULOS",
      icon: <BookOpen className="w-6 h-6 text-red-400" />,
      iconBgClass: "bg-neutral-900 border border-red-500/30 shadow-md",
      borderClass: "border-red-500/30 hover:border-red-400",
      hoverGlowClass: "hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]",
      isExternal: false,
    },
  ];

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(linktreeUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = linktreeUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Error al copiar enlace", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Triarvon - Enlaces Oficiales",
          text: "Accede a la página oficial, redes y herramientas de Triarvon.",
          url: linktreeUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080808] text-white py-12 px-4 sm:px-6 overflow-hidden select-none">
      {/* Background Decorative Ambient Glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-900/15 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-900/10 blur-[100px] rounded-full" />

      {/* Grid Pattern Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-xl mx-auto flex flex-col items-center">
        {/* Top Control Bar */}
        <div className="w-full flex justify-end items-center gap-2 mb-6">
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition"
            title="Ver Código QR"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Código QR</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition"
            title="Compartir enlaces"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition"
            title="Copiar Enlace"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">
                  ¡Copiado!
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4 group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 to-amber-600 opacity-75 blur transition duration-500 group-hover:opacity-100" />
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-red-600 bg-neutral-950 p-1">
              <Image
                src="/Triarvon/triarvon-avatar-circle.png"
                alt="Triarvon"
                width={110}
                height={110}
                className="w-full h-full object-cover rounded-full"
                priority
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-red-600 text-white rounded-full p-1 border-2 border-neutral-950 shadow">
              <Shield className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display uppercase">
              TRIARVON
            </h1>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold shadow-sm">
              ✓
            </span>
          </div>

          <p className="text-neutral-400 text-sm mt-2 max-w-sm leading-relaxed">
            Forjando hombres, moldeando destinos.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <span className="px-3 py-1 rounded-full bg-red-950/60 border border-red-800/50 text-[11px] font-semibold uppercase tracking-widest text-red-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Disciplina • Coraje • Excelencia
            </span>
          </div>
        </div>

        {/* SECTION 1: REDES Y PÁGINA WEB OFICIAL */}
        <div className="w-full flex flex-col gap-3.5 mb-8">
          <div className="flex items-center justify-between px-1 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              Enlaces Principales
            </h2>
            <span className="text-[11px] text-neutral-500 font-mono">
              Oficiales
            </span>
          </div>

          {socialLinks.map((link) => {
            const Component = link.isExternal ? "a" : Link;
            const extraProps = link.isExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};

            return (
              <Component
                key={link.id}
                href={link.url}
                {...extraProps}
                className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-neutral-900/90 border ${link.borderClass} ${link.hoverGlowClass} transition-all duration-300 active:scale-[0.98] shadow-md`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${link.iconBgClass} transition-transform duration-300 group-hover:scale-105`}
                  >
                    {link.icon}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base group-hover:text-red-400 transition-colors truncate">
                        {link.title}
                      </span>
                      {link.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 tracking-wider uppercase">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-neutral-400 text-xs truncate mt-0.5">
                      {link.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center pl-2 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-red-600 group-hover:border-red-500 transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Component>
            );
          })}
        </div>

        {/* SECTION 2: HERRAMIENTAS Y CONTENIDO */}
        <div className="w-full flex flex-col gap-3.5 mb-10">
          <div className="flex items-center justify-between px-1 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Herramientas & Contenido Destacado
            </h2>
          </div>

          {toolsAndContent.map((link) => (
            <Link
              key={link.id}
              href={link.url}
              className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-neutral-900/60 border ${link.borderClass} ${link.hoverGlowClass} transition-all duration-300 active:scale-[0.98]`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${link.iconBgClass}`}
                >
                  {link.icon}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                      {link.title}
                    </span>
                    {link.badge && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-neutral-800/80 text-neutral-400 border border-neutral-700">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-neutral-400 text-xs truncate mt-0.5">
                    {link.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center pl-2 flex-shrink-0">
                <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* RESUMEN COMUNIDAD TRIARVON */}
        <div className="w-full bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5 mb-8 text-neutral-300 text-xs leading-relaxed text-center space-y-2">
          <p className="font-semibold text-white text-sm">
            Directorio Oficial de Canales & Recursos de Triarvon
          </p>
          <p>
            Bienvenido al portal centralizado de Triarvon. Desde aquí puedes conectar con nuestra comunidad en redes sociales, acceder a las herramientas asistidas por Inteligencia Artificial para análisis de estilo y rostro, o interactuar directamente con nuestro equipo de coaching 24/7.
          </p>
        </div>

        {/* FOOTER BADGE */}
        <div className="flex flex-col items-center gap-2 text-center pt-4 border-t border-neutral-900 w-full">
          <div className="flex items-center gap-4 text-neutral-400">
            <a
              href="https://www.instagram.com/triarvon_club/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-neutral-900 hover:text-white transition"
              title="Instagram"
            >
              <InstagramLogo className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61569420803657"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-neutral-900 hover:text-white transition"
              title="Facebook"
            >
              <FacebookLogo className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/triarvon_club"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-neutral-900 hover:text-white transition"
              title="X (Twitter)"
            >
              <XLogo className="w-4 h-4" />
            </a>
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-neutral-900 hover:text-white transition"
              title="Página Web"
            >
              <Globe className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-neutral-400 text-xs">
            © {new Date().getFullYear()} Triarvon • Todos los derechos
            reservados.
          </p>
        </div>
      </div>

      {/* Toast Confirmation notification */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 z-50 animate-bounce">
          <Check className="w-4 h-4" />
          <span>¡Enlace copiado para la descripción de tus redes!</span>
        </div>
      )}

      {/* QR CODE MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full relative flex flex-col items-center text-center shadow-2xl">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800/50 flex items-center justify-center text-red-500 mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">
              Escanea el Código QR
            </h3>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              Escanea con la cámara de tu móvil para abrir el Linktree de
              Triarvon.
            </p>

            <div className="bg-white p-4 rounded-2xl border-4 border-neutral-800 shadow-inner">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  linktreeUrl,
                )}&color=000000&bgcolor=ffffff`}
                alt="Código QR Triarvon Linktree"
                width={180}
                height={180}
                className="object-contain"
              />
            </div>

            <p className="text-[11px] text-neutral-500 font-mono mt-4 truncate max-w-full px-2">
              {linktreeUrl}
            </p>

            <button
              onClick={handleCopyLink}
              className="mt-4 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar Enlace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
