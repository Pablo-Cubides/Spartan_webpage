"use client";

// Force dynamic rendering to avoid Vercel lambda issues with large client components
export const dynamic = "force-dynamic";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Upload, X, SwitchCamera } from "lucide-react";
import type { IteratePayload } from "@/lib/asesor-estilo/types/ai";
import {
  getApiUrl,
  UPLOAD_CONFIG,
  UI_CONFIG,
} from "../../../lib/asesor-estilo/config/api";
import ModalLogin from "@/components/ModalLogin";
import BuyCredits from "@/components/BuyCredits";
import { useAuth } from "@/lib/firebase";
import { getTokenCookie } from "@/lib/api";

// Compress image to reduce file size before upload (Vercel has 4.5MB limit)
async function compressImage(
  file: File,
  maxSizeMB: number = 2,
  maxWidth: number = 1600,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // fallback to original
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Start with quality 0.9 and reduce until under maxSize
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const sizeMB = blob.size / (1024 * 1024);
              if (sizeMB > maxSizeMB && quality > 0.3) {
                quality -= 0.1;
                tryCompress();
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                console.log(
                  `[Compress] Original: ${(file.size / (1024 * 1024)).toFixed(2)}MB -> Compressed: ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`,
                );
                resolve(compressedFile);
              }
            },
            "image/jpeg",
            quality,
          );
        };
        tryCompress();
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

type UploadResponse = {
  imageUrl: string;
  sessionId: string;
  publicId: string;
  error?: string;
};

type Message = {
  from: "user" | "assistant" | "system";
  text: string;
  image?: string;
  action?: { type: string; payload?: IteratePayload | undefined };
};

export default function Page() {
  const { user } = useAuth();
  const [step, setStep] = useState<"upload" | "ready">("upload");
  const [prompt, setPrompt] = useState("");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<
    "idle" | "uploading" | "analyzing" | "generating"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const lastGenerateAt = useRef<number>(0);

  // Auth & Credits State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const suggestions = [
    "Sugerir un outfit casual para un cuerpo tipo rectángulo",
    "Recomendar combinaciones de colores para un look de oficina",
    "Qué tipo de corte de ropa favorece mi silueta y proporciones?",
  ];

  // Helper: perform /api/iterate with retries for transient 503 errors
  async function performIterateWithRetries(
    payload: IteratePayload,
    maxAttempts = 3,
    baseDelay = 300,
  ) {
    let attempt = 0;
    const iterateUrl = getApiUrl("ITERATE");
    const token = getTokenCookie();

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const res = await fetch(iterateUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (res.status === 503) {
          // transient - retry
          if (attempt >= maxAttempts) return { success: false, status: 503 };
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        // Handle Auth/Credits errors
        if (res.status === 401) {
          setShowLoginModal(true);
          return { success: false, error: "Debes iniciar sesión", status: 401 };
        }
        if (res.status === 402 || res.status === 403) {
          // Check if it's a credit issue
          const data = await res.json();
          if (
            data.error === "INSUFFICIENT_CREDITS" ||
            data.message?.includes("credits")
          ) {
            setShowCreditsModal(true);
            return {
              success: false,
              error: "Créditos insuficientes",
              status: 402,
            };
          }
          return {
            success: false,
            error: data.error || data.message || "unknown",
            status: res.status,
          };
        }

        const data = await res.json();
        if (res.ok) return { success: true, data, status: res.status };
        return {
          success: false,
          error: data.error || data.message || "unknown",
          status: res.status,
        };
      } catch (err: unknown) {
        // network or other error - retry
        if (attempt >= maxAttempts) {
          const msg =
            err && typeof err === "object" && "message" in err
              ? String((err as Record<string, unknown>).message)
              : String(err);
          return { success: false, error: msg };
        }
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    return { success: false, error: "max_attempts_reached" };
  }

  const scrollToBottom = () => {
    setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  // Reset the conversation and state
  function handleReset() {
    // abort any ongoing upload
    if (xhrRef.current) {
      try {
        xhrRef.current.abort();
      } catch {}
      xhrRef.current = null;
    }
    setStep("upload");
    setPrompt("");
    setOriginalUrl(null);
    setEditedUrl(null);
    setPublicId(null);
    setSessionId(null);
    setMessages([]);
    setLoading(false);
    setLoadingPhase("idle");
    setUploadProgress(0);
  }

  // Delete a message by index
  function deleteMessage(idx: number) {
    setMessages((m) => m.filter((_, i) => i !== idx));
  }

  // Edit a user message: populate prompt and remove the message
  function editMessage(idx: number) {
    setMessages((m) => {
      const msg = m[idx];
      if (!msg) return m;
      if (msg.from === "user") setPrompt(msg.text);
      // remove the message
      return m.filter((_, i) => i !== idx);
    });
    // focus textarea if present
    setTimeout(() => {
      const ta = document.querySelector(
        ".input-textarea",
      ) as HTMLTextAreaElement | null;
      ta?.focus();
    }, 50);
  }

  // Keyboard accessibility: Enter to submit when in input, Esc to cancel loading or blur
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        // cancel any ongoing XHR
        if (xhrRef.current) {
          try {
            xhrRef.current.abort();
          } catch {}
          xhrRef.current = null;
          setLoading(false);
          setLoadingPhase("idle");
          setMessages((m) => [
            ...m,
            { from: "system", text: "Operación cancelada." },
          ]);
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function handleSuggestionClick(text: string) {
    if (step !== "ready") return;
    setPrompt(text);
    handleGenerate(text);
  }

  function handleUploadClick() {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await processUpload(file);
  }

  async function processUpload(file: File) {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Check credits BEFORE upload (so users don't waste time uploading if they can't use the tool)
    const token = getTokenCookie();
    try {
      const profileRes = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.credits < 1) {
          setShowCreditsModal(true);
          setMessages((m) => [
            ...m,
            {
              from: "system",
              text: "Necesitas al menos 1 crédito para usar esta herramienta.",
            },
          ]);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not check credits before upload:", e);
      // Continue anyway, server will validate
    }

    // Compress image before upload (Vercel has 4.5MB limit)
    let processedFile = file;
    try {
      processedFile = await compressImage(file, 2, 1600);
    } catch (e) {
      console.warn("Image compression failed, using original:", e);
    }

    // client-side size validation before starting upload
    const maxBytes = UPLOAD_CONFIG.MAX_SIZE_MB * 1024 * 1024;
    if (processedFile.size > maxBytes) {
      setMessages((m) => [
        ...m,
        {
          from: "system",
          text: `La imagen excede el límite de ${UPLOAD_CONFIG.MAX_SIZE_MB}MB. Reduce el tamaño o elige otra imagen.`,
        },
      ]);
      return;
    }

    setLoading(true);
    setLoadingPhase("uploading");
    // Keep user on the main chat UI and append a system message for analysis
    setMessages((m) => [
      ...m,
      {
        from: "system",
        text: "Analizando tu foto... esto puede tomar unos segundos.",
      },
    ]);

    try {
      // Use XHR to obtain upload progress events (fetch has no upload progress in browsers)
      const fd = new FormData();
      fd.append("file", processedFile);

      const uploadData: UploadResponse = await new Promise(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;
          xhr.open("POST", getApiUrl("UPLOAD"));
          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const pct = Math.round((ev.loaded / ev.total) * 100);
              setUploadProgress(pct);
            }
          };
          xhr.onload = () => {
            try {
              const json = JSON.parse(xhr.responseText || "{}");
              if (xhr.status >= 200 && xhr.status < 300) resolve(json);
              else reject({ status: xhr.status, ...json });
            } catch (e) {
              reject(e);
            }
          };
          xhr.onerror = () => reject(new Error("network_error"));
          xhr.send(fd);
        },
      );

      if (uploadData.error) {
        setMessages([{ from: "system", text: `Error: ${uploadData.error}` }]);
        setStep("upload");
        setLoading(false);
        return;
      }

      // uploadData.imageUrl is now the optimized Cloudinary URL (1024px max width)
      // This ensures consistent dimensions for both display and AI processing
      setOriginalUrl(uploadData.imageUrl);
      setSessionId(uploadData.sessionId);
      setPublicId(uploadData.publicId);

      // add uploaded image into the chat as a user message so it's always visible
      setMessages((m) => [
        ...m,
        { from: "user", text: "Imagen cargada", image: uploadData.imageUrl },
      ]);
      // switch to chat/ready view so the analysis message is visible in the conversation
      setStep("ready");

      setLoadingPhase("analyzing");
      // Perform CLOTHING analysis to get style recommendations
      const analyzeRes = await fetch(getApiUrl("ANALYZE_CLOTHING"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ imageUrl: uploadData.imageUrl, locale: "es" }),
      });

      if (analyzeRes.status === 401) {
        setShowLoginModal(true);
        setLoading(false);
        return;
      }
      if (analyzeRes.status === 402 || analyzeRes.status === 403) {
        const data = await analyzeRes.json();
        if (
          data.error === "INSUFFICIENT_CREDITS" ||
          data.message?.includes("credits")
        ) {
          setShowCreditsModal(true);
          setMessages((m) => [
            ...m,
            {
              from: "system",
              text: "No tienes suficientes créditos para analizar la imagen.",
            },
          ]);
          setLoading(false);
          return;
        }
      }

      // Handle 500 or other server errors explicitly
      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}));
        const errorMessage =
          errData.message ||
          errData.error ||
          `Error del servidor (${analyzeRes.status})`;
        console.error("[Analyze] Server error:", analyzeRes.status, errData);
        setMessages((m) => [
          ...m,
          {
            from: "system",
            text: `Error al analizar: ${errorMessage}. Por favor intenta de nuevo.`,
          },
        ]);
        setLoading(false);
        return;
      }

      const analyzeData = await analyzeRes.json();

      // Prefer bodyOk for the new flow, fall back to faceOk for legacy images
      const analysis = analyzeData.analysis || {};
      const analysisRec = analysis as Record<string, unknown>;
      const ok =
        (analysisRec["bodyOk"] as boolean | undefined) ??
        (analysisRec["faceOk"] as boolean | undefined);
      if (analyzeData.error || !ok) {
        setMessages((m) => [
          ...m,
          {
            from: "system",
            text:
              analysis.advisoryText ||
              "No se pudo analizar la imagen correctamente.",
          },
        ]);
        setStep("upload");
        setLoading(false);
        return;
      }

      const advisory = analyzeData.analysis?.advisoryText || "";

      // Small delay to avoid concurrency issues with analyze
      await new Promise((resolve) => setTimeout(resolve, 100));

      setLoadingPhase("generating");
      // Perform iterate to generate the image with retries for transient 503 errors
      // IMPORTANT: analysisType tells nanobanana this is CLOTHING only - never touch face/hair
      const iteratePayload = {
        sessionId: uploadData.sessionId,
        originalImageUrl: uploadData.imageUrl,
        userText: analyzeData.analysis.suggestedText || advisory,
        prevPublicId: uploadData.publicId,
        analysis: analyzeData.analysis,
        analysisType: "clothing" as const, // This ensures only clothing is edited, NEVER face/hair
      };

      await new Promise((r) => setTimeout(r, 500));

      // We use the helper function here to handle retries and auth/credits
      const iterateResult = await performIterateWithRetries(iteratePayload);

      if (!iterateResult.success) {
        if (iterateResult.status === 503) {
          // Mostrar solo el análisis si no hay servicio de imágenes
          setMessages((m) => [...m, { from: "assistant", text: advisory }]);
          setMessages((m) => [
            ...m,
            {
              from: "system",
              text: "El servicio de edición de imágenes no está disponible en este momento.",
              action: {
                type: "retry-iterate",
                payload: iteratePayload,
              },
            },
          ]);
        } else if (iterateResult.status === 402) {
          // Already handled by helper (showCreditsModal)
          setMessages((m) => [...m, { from: "assistant", text: advisory }]);
          setMessages((m) => [
            ...m,
            {
              from: "system",
              text: "Necesitas créditos para generar la imagen.",
            },
          ]);
        } else {
          setMessages((m) => [...m, { from: "assistant", text: advisory }]);
          setMessages((m) => [
            ...m,
            {
              from: "system",
              text: `Error de edición: ${iterateResult.error}`,
            },
          ]);
        }
        setLoading(false);
        setLoadingPhase("idle");
        return;
      }

      const iterateData = iterateResult.data;

      setEditedUrl(iterateData.editedUrl);
      setPublicId(iterateData.publicId);

      // Add ONE message with the complete analysis (the edited image
      // is shown below in the BeforeAfterSlider using the state
      // `editedUrl` to avoid showing the same image twice)
      setMessages((m) => [...m, { from: "assistant", text: advisory }]);
      scrollToBottom();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as Record<string, unknown>).message)
          : String(err);
      // Check for 402/403 in the catch block if promise rejected with status
      if (
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        ((err as { status: number }).status === 402 ||
          (err as { status: number }).status === 403)
      ) {
        setShowCreditsModal(true);
        setMessages((m) => [
          ...m,
          { from: "system", text: "Insufficient credits." },
        ]);
      } else {
        setMessages((m) => [...m, { from: "system", text: `Error: ${msg}` }]);
      }
      setStep("upload");
    } finally {
      setLoading(false);
      setLoadingPhase("idle");
    }
  }

  async function handleGenerate(text?: string) {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const userText = text || prompt;
    if (!userText || !originalUrl || step !== "ready") return;
    // simple client-side rate limit: ignore repeated clicks within 2s
    const now = Date.now();
    if (now - lastGenerateAt.current < 2000) {
      setMessages((m) => [
        ...m,
        {
          from: "system",
          text: "Por favor espera un momento antes de generar otra edición.",
        },
      ]);
      return;
    }
    lastGenerateAt.current = now;

    setLoading(true);
    setLoadingPhase("generating");
    setMessages((m) => [...m, { from: "user", text: userText }]);
    setPrompt("");
    scrollToBottom();

    try {
      // usar helper con reintentos
      const payload = {
        sessionId,
        originalImageUrl: originalUrl,
        userText,
        prevPublicId: publicId,
      };
      const result = await performIterateWithRetries(payload);
      if (!result.success) {
        if (result.status === 503) {
          setMessages((m) => [
            ...m,
            {
              from: "system",
              text: "The image editing service is not available for now.",
              action: {
                type: "retry-iterate",
                payload,
              },
            },
          ]);
        } else if (result.status === 402) {
          // Already handled
          setMessages((m) => [
            ...m,
            { from: "system", text: "Insufficient credits." },
          ]);
        } else {
          setMessages((m) => [
            ...m,
            { from: "system", text: `Error: ${result.error || "unknown"}` },
          ]);
        }
        setLoading(false);
        return;
      }

      const iterateData2 = result.data;
      setEditedUrl(iterateData2.editedUrl);
      setPublicId(iterateData2.publicId);
      setMessages((m) => [
        ...m,
        { from: "assistant", text: iterateData2.note || "Editing completed" },
      ]);
      scrollToBottom();
    } catch (err) {
      setMessages((m) => [...m, { from: "system", text: `Error: ${err}` }]);
    } finally {
      setLoading(false);
      setLoadingPhase("idle");
    }
  }

  async function retryIterate(payload: IteratePayload | undefined) {
    if (!payload) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setLoadingPhase("generating");
    // show a small system message indicating retry started
    setMessages((m) => [
      ...m,
      { from: "system", text: "Retrying the edit..." },
    ]);

    try {
      const result = await performIterateWithRetries(payload);

      if (!result.success) {
        if (result.status === 503) {
          setMessages((m) => [
            ...m,
            {
              from: "system",
              text: "The editing service is still unavailable. Please try again later.",
            },
          ]);
        } else if (result.status === 402) {
          setMessages((m) => [
            ...m,
            { from: "system", text: "Insufficient credits." },
          ]);
        } else {
          setMessages((m) => [
            ...m,
            { from: "system", text: `Editing error: ${result.error}` },
          ]);
        }
        return;
      }

      const data = result.data;
      setEditedUrl(data.editedUrl);
      setPublicId(data.publicId);
      setMessages((m) => [
        ...m,
        { from: "assistant", text: data.note || "Editing completed" },
      ]);
      scrollToBottom();
    } catch (err) {
      setMessages((m) => [
        ...m,
        { from: "system", text: `Error when retrying: ${err}` },
      ]);
    } finally {
      setLoading(false);
      setLoadingPhase("idle");
    }
  }

  async function handleCameraCapture(file: File) {
    setShowCamera(false);
    await processUpload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) await processUpload(file);
  }

  if (step === "upload") {
    return (
      <div className="app-center">
        <ModalLogin
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
        {showCamera && (
          <CameraModal
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}

        {showCreditsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-white rounded-xl overflow-hidden">
              <button
                onClick={() => setShowCreditsModal(false)}
                className="absolute top-4 right-4 text-gray-700 hover:text-black z-10"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
              <div className="max-h-[90vh] overflow-y-auto">
                <BuyCredits />
              </div>
            </div>
          </div>
        )}

        <section className="chat-shell" aria-label="Asesor de estilo">
          {/* Progress bar (visible when loading) */}
          <div
            className={`progress-wrap ${loading ? "active" : ""}`}
            aria-hidden={!loading}
          >
            <div
              className={`progress-bar phase-${loadingPhase} ${loadingPhase === "analyzing" || loadingPhase === "generating" ? "indeterminate" : ""}`}
              style={
                loadingPhase === "uploading"
                  ? { width: `${uploadProgress}%` }
                  : undefined
              }
            ></div>
            {/* ARIA live region for screen readers to announce progress/phase changes */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {loading
                ? loadingPhase === "uploading"
                  ? `Cargando ${uploadProgress}%`
                  : loadingPhase === "analyzing"
                    ? "Analizando la imagen..."
                    : loadingPhase === "generating"
                      ? "Generando la imagen..."
                      : ""
                : ""}
            </div>
          </div>
          <header className="chat-header">
            {step === "upload" ? (
              <div style={{ textAlign: "center" }}>
                <div className="relative h-60 w-auto mx-auto mb-4">
                  <Image
                    fill
                    src="/Logo triarvon club - sin fondo.webp"
                    alt="Emblema oficial Asesor de Estilo Triarvon"
                    className="object-contain"
                  />
                </div>
                <h1 className="chat-title">{UI_CONFIG.APP_NAME}</h1>
                <p className="chat-sub">
                  Get recommendations on garments, combinations, and how to
                  enhance your silhouette.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div style={{ flex: "1 1 auto", textAlign: "center" }}>
                  <div className="relative h-60 w-auto mx-auto mb-4">
                    <Image
                      fill
                      src="/Logo triarvon club - sin fondo.webp"
                      alt="Emblema oficial Asesor de Estilo Triarvon"
                      className="object-contain"
                    />
                  </div>
                  <h1 className="chat-title">{UI_CONFIG.APP_NAME}</h1>
                  <p className="chat-sub">
                    Get recommendations on garments, combinations, and how to
                    enhance your silhouette.
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  {/* reset button appears later after edited image */}
                </div>
              </div>
            )}
          </header>

          <section className="p-6 upload-container" aria-label="Subir imagen">
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`drop-zone ${isDragging ? "dragging" : ""}`}
            >
              <h2 className="mb-2 text-lg font-semibold">
                Sube tu foto para recibir asesoría de estilo
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Recomendamos una foto de cuerpo completo con buena iluminación
                para mejores recomendaciones.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <button
                  aria-label="Select image"
                  onClick={handleUploadClick}
                  disabled={loading}
                  className="btn-accent flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3"
                >
                  <Upload size={20} />
                  {loading
                    ? loadingPhase === "uploading"
                      ? "Cargando..."
                      : loadingPhase === "analyzing"
                        ? "Analizando..."
                        : "Generando..."
                    : "Cargar Foto"}
                </button>

                <button
                  aria-label="Take photo"
                  onClick={() => setShowCamera(true)}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
                >
                  <Camera size={20} />
                  Tomar Foto
                </button>

                <input
                  aria-label="Select image file"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Guía Explicativa de Estilo y Colorimetría Masculina */}
            <div className="mt-10 border-t border-gray-800/80 pt-8 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Los 4 Pilares del Estilo Masculino Inteligente
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  El Asesor de Estilo de Triarvon analiza tu silueta, contraste
                  tonal y contextura física para construir combinaciones
                  armónicas que transmitan autoridad, presencia y seguridad sin
                  necesidad de gastar de más.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-[#141416] p-4 rounded-xl border border-gray-800">
                  <h4 className="font-bold text-white mb-1 text-emerald-400">
                    1. Ajuste (Fit)
                  </h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    La ropa que mejor sienta es la que respeta tus medidas
                    exactas. Ni excesivamente holgada ni restrictiva.
                  </p>
                </div>
                <div className="bg-[#141416] p-4 rounded-xl border border-gray-800">
                  <h4 className="font-bold text-white mb-1 text-emerald-400">
                    2. Colorimetría
                  </h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Paletas neutras como base (azul marino, blanco, gris, verde
                    oliva, negro) para crear hasta 30 combinaciones con solo 8
                    prendas.
                  </p>
                </div>
                <div className="bg-[#141416] p-4 rounded-xl border border-gray-800">
                  <h4 className="font-bold text-white mb-1 text-emerald-400">
                    3. Proporciones
                  </h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Uso estratégico de capas, tiro de pantalón y longitud de
                    chaquetas para estilizar la silueta en torso y piernas.
                  </p>
                </div>
                <div className="bg-[#141416] p-4 rounded-xl border border-gray-800">
                  <h4 className="font-bold text-white mb-1 text-emerald-400">
                    4. Versatilidad
                  </h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Transición natural del estilo casual a formal (&ldquo;Smart
                    Casual&rdquo;) con blazers desestructurados y calzado de
                    calidad.
                  </p>
                </div>
              </div>

              {/* Guía Morfológica y Armario Cápsula Inteligente */}
              <div className="bg-[#111113] p-6 rounded-xl border border-gray-800/80 space-y-4 text-gray-300 text-sm">
                <h3 className="text-lg font-bold text-white">
                  Morfología Masculina y Reglas de Proporción Anatómica
                </h3>
                <p className="leading-relaxed">
                  Cada estructura corporal responde a leyes ópticas específicas
                  de geometría y líneas de corte. Nuestra tecnología evalúa la
                  relación entre la anchura biacromial (hombros), el perímetro
                  torácico y la cintura para identificar tu tipología y
                  equilibrar visualmente tu silueta:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                    <span className="font-semibold text-white block mb-1">
                      Silueta Trapecio / V:
                    </span>
                    Hombros anchos con cintura estrecha. Admite prendas
                    entalladas y patrones estructurados sin recargar hombreras.
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                    <span className="font-semibold text-white block mb-1">
                      Silueta Rectángulo:
                    </span>
                    Hombros y cadera alineados. Se busca generar volumen en la
                    parte superior mediante solapas anchas y capas superpuestas.
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                    <span className="font-semibold text-white block mb-1">
                      Silueta Óvalo:
                    </span>
                    Mayor peso visual en la zona media. Favorece líneas
                    verticales, tonos oscuros monocromáticos y tejidos de caída
                    limpia.
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                    <span className="font-semibold text-white block mb-1">
                      Silueta Triángulo Invertido:
                    </span>
                    Espalda muy desarrollada por entrenamiento. Requiere
                    pantalones de corte recto o relajado para equilibrar el tren
                    inferior.
                  </div>
                </div>
                <div className="pt-2 text-xs text-gray-400 border-t border-white/5">
                  Aprende más sobre las bases de la antropometría aplicada al
                  diseño y la colorimetría textil en{" "}
                  <a
                    href="https://es.wikipedia.org/wiki/Indumentaria"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 underline"
                  >
                    Wikipedia: Indumentaria Masculina
                  </a>{" "}
                  y referencias científicas de ergonomía y percepción visual en{" "}
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 underline"
                  >
                    NCBI / PubMed
                  </a>
                  .
                </div>
              </div>
            </div>

            <div className="mt-6">
              {/* Suggestions are only shown after an edited image exists to avoid confusion */}
              {editedUrl ? (
                <>
                  <h3 className="mb-2 text-sm font-medium">Try these ideas</h3>
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        className="suggestion"
                        onClick={() => handleSuggestionClick(s)}
                        disabled={loading}
                        aria-label={`Suggestion: ${s}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </section>
      </div>
    );
  }

  // analysis runs inline as a system message inside the chat; no separate analyzing page

  // Ready/chat view
  return (
    <div className="app-center">
      <ModalLogin
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {showCreditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-xl overflow-hidden">
            <button
              onClick={() => setShowCreditsModal(false)}
              className="absolute top-4 right-4 text-gray-700 hover:text-black z-10"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <div className="max-h-[90vh] overflow-y-auto">
              <BuyCredits />
            </div>
          </div>
        </div>
      )}

      <section className="chat-shell" aria-label="Style advisor">
        <header className="chat-header">
          <h1 className="text-3xl font-bold mt-4 tracking-tight">
            Tu Asesor Personal de Estilo
          </h1>
          <p className="chat-sub">
            Recibe recomendaciones sobre prendas, combinaciones y estilo
            personal.
          </p>
        </header>

        <section
          className="messages"
          role="log"
          aria-live="polite"
          aria-atomic="false"
        >
          {messages.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              Carga una imagen para iniciar el asesoramiento.
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} message-wrap`}
            >
              <div
                className={`bubble ${m.from === "user" ? "user" : m.from === "assistant" ? "assistant" : "system"} message-anim`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.image && (
                  <div className="msg-image-container" aria-hidden={false}>
                    <Image
                      src={m.image}
                      alt={
                        m.from === "user"
                          ? "Fotografía cargada por el usuario para análisis"
                          : "Propuesta de estilo generada por el asesor"
                      }
                      className="msg-image"
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {m.from === "user" && !m.image && (
                    <>
                      <button
                        aria-label={`Editar mensaje ${i}`}
                        className="btn-ghost"
                        onClick={() => editMessage(i)}
                      >
                        Editar
                      </button>
                      <button
                        aria-label={`Eliminar mensaje ${i}`}
                        className="btn-ghost"
                        onClick={() => deleteMessage(i)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
                {m.action?.type === "retry-iterate" && (
                  <div className="mt-2">
                    {(() => {
                      const payload = m.action?.payload;
                      return (
                        <button
                          onClick={() => payload && retryIterate(payload)}
                          disabled={loading}
                          className="btn-ghost"
                        >
                          {loading ? "Procesando..." : "Reintentar"}
                        </button>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))}

          {editedUrl && (
            <div className="flex justify-start">
              <div className="bubble assistant">
                <p className="whitespace-pre-wrap">
                  ¡Aquí está tu imagen editada! 🎨
                </p>
                <div className="msg-image-container">
                  <Image
                    src={editedUrl}
                    alt="Propuesta de estilo generada por el asesor"
                    className="msg-image"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* In-chat progress bubble: appears after image upload and follows the conversation */}
          {loading && loadingPhase !== "idle" && (
            <div className="flex justify-start">
              <div className="bubble system" role="status" aria-live="polite">
                <p className="whitespace-pre-wrap mb-2">
                  {loadingPhase === "uploading"
                    ? `Cargando imagen — ${uploadProgress}%`
                    : loadingPhase === "analyzing"
                      ? "Analizando la imagen…"
                      : "Generando la imagen…"}
                </p>
                <div className="progress-inline" aria-hidden="false">
                  <div
                    className={`progress-inline-bar ${loadingPhase === "analyzing" || loadingPhase === "generating" ? "indeterminate" : ""}`}
                    style={
                      loadingPhase === "uploading"
                        ? { width: `${uploadProgress}%` }
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </section>

        <form
          className="input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          aria-label="Input controls"
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder={
              originalUrl
                ? "Describe los cambios que quieres..."
                : "Carga una imagen primero"
            }
            aria-label="Descripción de cambios a generar"
            className="input-textarea"
          />
          <div className="flex items-center gap-2">
            <button
              aria-label="Cargar imagen"
              onClick={handleUploadClick}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Cargar imagen"
            >
              <Upload size={20} />
            </button>
            <button
              aria-label="Tomar foto"
              onClick={() => setShowCamera(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Tomar foto"
            >
              <Camera size={20} />
            </button>
            <input
              aria-label="Subir foto para análisis de estilo"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              aria-label="Generar cambios"
              type="submit"
              disabled={!originalUrl || loading || !prompt.trim()}
              className="btn-accent ml-2"
            >
              {loading ? "Procesando..." : "Generar"}
            </button>
          </div>
        </form>
        {/* suggestions area (also shown in upload state when edited image exists) */}
        {editedUrl && (
          <div className="suggestions" aria-hidden={!editedUrl}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "0.5rem",
              }}
            >
              <button
                aria-label="Reiniciar conversación"
                onClick={handleReset}
                className="btn-ghost"
              >
                Comenzar de nuevo
              </button>
            </div>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestionClick(s)}
                disabled={loading}
                className={`suggestion`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CameraModal({
  onCapture,
  onClose,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null); // Ref for reliable cleanup
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initCamera() {
      try {
        // Clear previous stream if exists
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        setError(null);

        // Check API availability
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error(
            "Tu navegador no soporta acceso a cámara. Actualiza tu navegador o usa Chrome/Edge.",
          );
        }

        console.log("[Camera] Checking existing permissions...");

        // Check current permission status (if available)
        let permissionStatus = "prompt";
        try {
          if (navigator.permissions && navigator.permissions.query) {
            const result = await navigator.permissions.query({
              name: "camera" as PermissionName,
            });
            permissionStatus = result.state;
            console.log(
              "[Camera] Current permission status:",
              permissionStatus,
            );

            if (permissionStatus === "denied") {
              throw Object.assign(new Error("Permission previously denied"), {
                name: "NotAllowedError",
              });
            }
          }
        } catch (permErr) {
          console.warn(
            "[Camera] Could not verify permissions (may be normal):",
            permErr,
          );
        }

        console.log("[Camera] Requesting camera access...");

        // Strategy 1: Try with specific configuration
        let newStream: MediaStream;
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
          console.log("[Camera] ✓ Camera opened with facingMode:", facingMode);
        } catch (err1) {
          console.warn(
            "[Camera] Failed with facingMode, trying without restrictions...",
            err1,
          );

          // Strategy 2: Minimum configuration
          try {
            newStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            console.log("[Camera] ✓ Camera opened with video:true");
          } catch (err2) {
            console.error("[Camera] Both attempts failed");
            throw err2;
          }
        }

        if (!mounted) {
          console.log("[Camera] Component unmounted, closing stream");
          newStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = newStream;
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          console.log("[Camera] ✓ Stream assigned to video element");
        }
      } catch (err: unknown) {
        if (!mounted) return;
        console.error("[Camera] ❌ Final error:", err);

        const error = err instanceof Error ? err : new Error(String(err));
        let msg = "";
        const code = error.name || "Unknown";

        if (code === "NotAllowedError" || code === "PermissionDeniedError") {
          msg =
            "🚫 **Permiso Denegado**\n\nEL NAVEGADOR BLOQUEÓ LA CÁMARA.\n\n**Pasos para corregir:**\n\n1. Cierra este modal\n2. Haz clic en el ícono 🔒 o ⓘ junto a la URL\n3. En 'Cámara', selecciona 'Permitir'\n4. Recarga la página (F5)\n5. Haz clic en 'Tomar Foto' nuevamente\n\nSi el problema persiste, tu antivirus podría estar bloqueando la cámara.";
        } else if (
          code === "NotFoundError" ||
          code === "DevicesNotFoundError"
        ) {
          msg =
            "📷 **Sin Cámara**\n\nNo se detectó ninguna cámara conectada.\n\nVerifica que:\n• La cámara esté conectada\n• Los drivers estén instalados\n• Windows la reconozca (Configuración > Cámara)";
        } else if (code === "NotReadableError" || code === "TrackStartError") {
          msg =
            "⚠️ **Cámara en Uso**\n\nOtra aplicación está usando la cámara.\n\nCierra estas aplicaciones si están abiertas:\n• Zoom\n• Teams\n• Meet\n• Skype\n• OBS Studio";
        } else if (
          code === "OverconstrainedError" ||
          code === "ConstraintNotSatisfiedError"
        ) {
          msg =
            "⚙️ **Configuración Incompatible**\n\nLa cámara no admite la configuración solicitada.\n\nEsto es raro - intenta con otro navegador.";
        } else {
          msg = `❌ **Error Desconocido**\n\n${error.message || String(err)}\n\nIntenta:\n• Reiniciar el navegador\n• Actualizar el navegador\n• Usar Chrome o Edge`;
        }

        msg += `\n\n**Technical Code:** ${code}`;
        setError(msg);
      }
    }

    // Small delay to avoid race conditions in Strict Mode
    const timer = setTimeout(initCamera, 100);

    return () => {
      clearTimeout(timer);
      mounted = false;
      if (streamRef.current) {
        console.log("[Camera] Cleaning up stream on cleanup");
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  function handleCapture() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip if user facing mode to mirror like a selfie
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", {
            type: "image/jpeg",
          });
          onCapture(file);
          onClose();
        }
      },
      "image/jpeg",
      0.9,
    );
  }

  function toggleCamera() {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-black rounded-xl overflow-hidden flex flex-col items-center border border-white/10 shadow-2xl">
        {error ? (
          <div className="p-8 text-white text-center max-w-md mx-4">
            <div className="mb-6 bg-red-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-red-500">
              <Camera size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Camera problem</h3>
            <p className="mb-6 text-gray-300 whitespace-pre-wrap">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setFacingMode((prev) => prev)}
                className="btn-accent px-6 py-2 rounded-lg"
              >
                Try again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-auto max-h-[70vh] object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            />

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-between items-center">
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all"
              >
                <X size={24} />
              </button>

              <button
                onClick={handleCapture}
                className="p-1 rounded-full border-4 border-white/30 hover:border-white/50 transition-all transform hover:scale-105"
              >
                <div className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 transition-colors"></div>
              </button>

              <button
                onClick={toggleCamera}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all"
              >
                <SwitchCamera size={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
