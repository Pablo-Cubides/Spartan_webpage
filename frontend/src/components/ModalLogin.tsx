"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ModalLogin({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Limpiar mensaje al cambiar de tab
  useEffect(() => {
    setMsg(null);
  }, [tab]);

  if (!open) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (!auth) {
        setMsg("Error: servicio de autenticación no inicializado.");
        setLoading(false);
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      setMsg("¡Bienvenido!");
      setTimeout(onClose, 800);
    } catch (error) {
      if (error instanceof Error) {
        setMsg(error.message || "Error al iniciar sesión.");
      } else {
        setMsg("Error al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (!auth) {
        setMsg("Error: servicio de autenticación no inicializado.");
        setLoading(false);
        return;
      }
      await createUserWithEmailAndPassword(auth, email, password);
      setMsg("¡Registro exitoso!");
      setTimeout(onClose, 1000);
    } catch (error) {
      if (error instanceof Error) {
        setMsg(error.message || "Error al registrar.");
      } else {
        setMsg("Error al registrar.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      if (!auth) {
        setMsg("Error: servicio de autenticación no inicializado.");
        setLoading(false);
        return;
      }
      await signInWithPopup(auth, provider);
      setMsg("¡Bienvenido con Google!");
      setTimeout(onClose, 800);
    } catch (error: unknown) {
      // Manejo seguro sin usar `any`
      if (typeof error === 'object' && error !== null) {
        const maybe = error as { code?: unknown };
        if (typeof maybe.code === 'string' && maybe.code === 'auth/popup-closed-by-user') {
          setMsg("");
        } else if (error instanceof Error) {
          setMsg(error.message || "Error al iniciar sesión con Google.");
        } else {
          setMsg("Error al iniciar sesión con Google.");
        }
      } else if (error instanceof Error) {
        setMsg(error.message || "Error al iniciar sesión con Google.");
      } else {
        setMsg("Error al iniciar sesión con Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-[#181111] p-8 border border-[#392828] shadow-2xl">
        {/* Cerrar */}
        <button
          className="absolute right-5 top-5 text-[#ba9c9c] hover:text-white"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <svg width={24} height={24} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            width={160}
            height={160}
            src="/Logo spartan club - sin fondo.png"
            alt="Spartan Club"
            className="object-contain drop-shadow-2xl"
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`pb-2 font-bold text-base ${
              tab === "login"
                ? "text-[#c20909] border-b-2 border-[#c20909]"
                : "text-[#ba9c9c] hover:text-white"
            }`}
            onClick={() => setTab("login")}
          >
            Iniciar Sesión
          </button>
          <button
            className={`pb-2 font-bold text-base ${
              tab === "register"
                ? "text-[#c20909] border-b-2 border-[#c20909]"
                : "text-[#ba9c9c] hover:text-white"
            }`}
            onClick={() => setTab("register")}
          >
            Registrarse
          </button>
        </div>

        {/* Login con Google */}
        <div className="mb-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full rounded-lg h-11 font-bold text-base transition flex items-center justify-center gap-2 ${
              loading
                ? "bg-[#392828] cursor-not-allowed text-[#ba9c9c]"
                : "bg-white text-gray-800 hover:bg-gray-100 cursor-pointer"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? "Cargando..." : "Continuar con Google"}
          </button>
        </div>

        {/* Separador */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#392828]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#181111] text-[#ba9c9c]">o</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={tab === "login" ? handleLogin : handleRegister} className="flex flex-col gap-5">
          <input
            type="email"
            required
            autoFocus
            placeholder="Correo electrónico"
            className="rounded-lg bg-[#222] border border-[#392828] px-3 py-2 text-sm text-white placeholder-[#888] focus:outline-none focus:border-[#c20909]"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            minLength={6}
            className="rounded-lg bg-[#222] border border-[#392828] px-3 py-2 text-sm text-white placeholder-[#888] focus:outline-none focus:border-[#c20909]"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={`rounded-lg h-11 font-bold text-base transition ${
              loading
                ? "bg-[#392828] cursor-not-allowed text-[#ba9c9c]"
                : "bg-[#c20909] text-white hover:bg-[#a21d1d] cursor-pointer"
            }`}
          >
            {loading ? "Cargando..." : tab === "login" ? "Entrar" : "Registrarse"}
          </button>
          {msg && (
            <div className={`text-center text-sm ${
              msg.includes("Error") ? "text-[#c20909]" : "text-green-500"
            }`}>
              {msg}
            </div>
          )}
        </form>

        {/* Información adicional */}
        <div className="mt-6 text-center text-xs text-[#ba9c9c]">
          {tab === "login" ? (
            <p>¿No tienes cuenta? <button onClick={() => setTab("register")} className="text-[#c20909] hover:underline">Regístrate aquí</button></p>
          ) : (
            <p>¿Ya tienes cuenta? <button onClick={() => setTab("login")} className="text-[#c20909] hover:underline">Inicia sesión aquí</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
