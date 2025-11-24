"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import type { IteratePayload } from '@/lib/asesor-estilo/types/ai';
import { getApiUrl, UPLOAD_CONFIG, UI_CONFIG } from '../../../lib/asesor-estilo/config/api';
import ModalLogin from '@/components/ModalLogin';
import BuyCredits from '@/components/BuyCredits';
import { useAuth } from '@/lib/firebase';
import { getTokenCookie } from '@/lib/api';

type UploadResponse = {
  imageUrl: string;
  sessionId: string;
  publicId: string;
  error?: string;
}

type Message = { from: "user" | "assistant" | "system"; text: string; image?: string; action?: { type: string; payload?: IteratePayload | undefined } };

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
  const [loadingPhase, setLoadingPhase] = useState<'idle' | 'uploading' | 'analyzing' | 'generating'>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
  async function performIterateWithRetries(payload: IteratePayload, maxAttempts = 3, baseDelay = 300) {
    let attempt = 0;
    const iterateUrl = getApiUrl('ITERATE');
    const token = getTokenCookie();
    
    while (attempt < maxAttempts) {
      attempt++;
      try {
        const res = await fetch(iterateUrl, {
          method: 'POST',
          headers: { 
            'content-type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
           return { success: false, error: 'Debes iniciar sesión', status: 401 };
        }
        if (res.status === 402 || res.status === 403) {
           // Check if it's a credit issue
           const data = await res.json();
           if (data.error === 'INSUFFICIENT_CREDITS' || data.message?.includes('créditos')) {
             setShowCreditsModal(true);
             return { success: false, error: 'Créditos insuficientes', status: 402 };
           }
           return { success: false, error: data.error || data.message || 'unknown', status: res.status };
        }

        const data = await res.json();
        if (res.ok) return { success: true, data, status: res.status };
        return { success: false, error: data.error || data.message || 'unknown', status: res.status };
      } catch (err: unknown) {
        // network or other error - retry
        if (attempt >= maxAttempts) {
          const msg = err && typeof err === 'object' && 'message' in err ? String((err as Record<string, unknown>).message) : String(err)
          return { success: false, error: msg };
        }
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    return { success: false, error: 'max_attempts_reached' };
  }

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Reset the conversation and state
  function handleReset() {
    // abort any ongoing upload
    if (xhrRef.current) {
      try { xhrRef.current.abort(); } catch {};
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
    setLoadingPhase('idle');
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
      if (msg.from === 'user') setPrompt(msg.text);
      // remove the message
      return m.filter((_, i) => i !== idx);
    });
    // focus textarea if present
    setTimeout(() => {
      const ta = document.querySelector('.input-textarea') as HTMLTextAreaElement | null;
      ta?.focus();
    }, 50);
  }

  // Keyboard accessibility: Enter to submit when in input, Esc to cancel loading or blur
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // cancel any ongoing XHR
        if (xhrRef.current) {
          try { xhrRef.current.abort(); } catch {}
          xhrRef.current = null;
          setLoading(false);
          setLoadingPhase('idle');
          setMessages((m) => [...m, { from: 'system', text: 'Operación cancelada.' }]);
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
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

    // client-side size validation before starting upload
    const maxBytes = UPLOAD_CONFIG.MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setMessages((m) => [...m, { from: 'system', text: `La imagen excede el límite de ${UPLOAD_CONFIG.MAX_SIZE_MB}MB. Reduce el tamaño o elige otra imagen.` }]);
      return;
    }

    setLoading(true);
    setLoadingPhase('uploading');
    // Keep user on the main chat UI and append a system message for analysis
    setMessages((m) => [...m, { from: "system", text: "Analizando tu foto... esto puede tardar unos segundos." }]);

    try {
      // Use XHR to obtain upload progress events (fetch has no upload progress in browsers)
      const fd = new FormData();
      fd.append("file", file);
      const token = getTokenCookie();
      
      const uploadData: UploadResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open('POST', getApiUrl('UPLOAD'));
        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setUploadProgress(pct);
          }
        };
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText || '{}');
            if (xhr.status >= 200 && xhr.status < 300) resolve(json);
            else reject({ status: xhr.status, ...json });
          } catch (e) { reject(e); }
        };
        xhr.onerror = () => reject(new Error('network_error'));
        xhr.send(fd);
      });

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
      setMessages((m) => [...m, { from: "user", text: "Imagen subida", image: uploadData.imageUrl }]);
      // switch to chat/ready view so the analysis message is visible in the conversation
      setStep("ready");

      setLoadingPhase('analyzing');
      // Hacer analyze primero para obtener el advisory
      const analyzeRes = await fetch(getApiUrl('ANALYZE'), {
        method: "POST",
        headers: { 
            "content-type": "application/json",
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
           if (data.error === 'INSUFFICIENT_CREDITS' || data.message?.includes('créditos')) {
             setShowCreditsModal(true);
             setMessages((m) => [...m, { from: "system", text: "No tienes suficientes créditos para analizar la imagen." }]);
             setLoading(false);
             return;
           }
      }

      const analyzeData = await analyzeRes.json();

      // Prefer bodyOk for the new flow, fall back to faceOk for legacy images
      const analysis = analyzeData.analysis || {};
      const analysisRec = analysis as Record<string, unknown>;
      const ok = (analysisRec['bodyOk'] as boolean | undefined) ?? (analysisRec['faceOk'] as boolean | undefined);
      if (analyzeData.error || !ok) {
        setMessages((m) => [...m, { from: "system", text: analysis.advisoryText || "No se pudo analizar la imagen correctamente." }]);
        setStep("upload");
        setLoading(false);
        return;
      }

      const advisory = analyzeData.analysis?.advisoryText || "";

      // Pequeño delay para evitar problemas de concurrencia con analyze
      await new Promise(resolve => setTimeout(resolve, 100));

      setLoadingPhase('generating');
      // Hacer iterate para generar la imagen con reintentos ante 503 transitorios
      const iteratePayload = {
        sessionId: uploadData.sessionId,
        originalImageUrl: uploadData.imageUrl,
        userText: analyzeData.analysis.suggestedText || advisory,
        prevPublicId: uploadData.publicId,
        analysis: analyzeData.analysis,
      };

      await new Promise((r) => setTimeout(r, 500));
      
      // We use the helper function here to handle retries and auth/credits
      const iterateResult = await performIterateWithRetries(iteratePayload);

      if (!iterateResult.success) {
          if (iterateResult.status === 503) {
            // Mostrar solo el análisis si no hay servicio de imágenes
            setMessages((m) => [...m, { from: 'assistant', text: advisory }]);
            setMessages((m) => [...m, {
              from: 'system',
              text: 'El servicio de edición de imágenes no está disponible por ahora.',
              action: {
                type: 'retry-iterate',
                payload: iteratePayload,
              }
            }]);
          } else if (iterateResult.status === 402) {
              // Already handled by helper (showCreditsModal)
              setMessages((m) => [...m, { from: 'assistant', text: advisory }]);
              setMessages((m) => [...m, { from: 'system', text: 'Necesitas créditos para generar la imagen.' }]);
          } else {
             setMessages((m) => [...m, { from: 'assistant', text: advisory }]);
             setMessages((m) => [...m, { from: 'system', text: `Error en edición: ${iterateResult.error}` }]);
          }
          setLoading(false);
          setLoadingPhase('idle');
          return;
      }

      const iterateData = iterateResult.data;

      setEditedUrl(iterateData.editedUrl);
      setPublicId(iterateData.publicId);

      // Agregar UN solo mensaje con el análisis completo (la imagen editada
      // se muestra a continuación en el BeforeAfterSlider usando el estado
      // `editedUrl` para evitar mostrar la misma imagen dos veces)
      setMessages((m) => [...m, { from: 'assistant', text: advisory }]);
      scrollToBottom();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as Record<string, unknown>).message) : String(err)
      // Check for 402/403 in the catch block if promise rejected with status
      if (typeof err === 'object' && err !== null && 'status' in err && ((err as { status: number }).status === 402 || (err as { status: number }).status === 403)) {
          setShowCreditsModal(true);
          setMessages((m) => [...m, { from: "system", text: "Créditos insuficientes." }]);
      } else {
          setMessages((m) => [...m, { from: "system", text: `Error: ${msg}` }]);
      }
      setStep("upload");
    } finally {
      setLoading(false);
      setLoadingPhase('idle');
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
      setMessages((m) => [...m, { from: 'system', text: 'Por favor espera un momento antes de generar otra edición.' }]);
      return;
    }
    lastGenerateAt.current = now;

    setLoading(true);
    setLoadingPhase('generating');
    setMessages((m) => [...m, { from: "user", text: userText }]);
    setPrompt("");
    scrollToBottom();

    try {
      // usar helper con reintentos
      const payload = { sessionId, originalImageUrl: originalUrl, userText, prevPublicId: publicId };
      const result = await performIterateWithRetries(payload);
      if (!result.success) {
        if (result.status === 503) {
          setMessages((m) => [...m, {
            from: "system",
            text: "El servicio de edición de imágenes no está disponible por ahora.",
            action: {
              type: "retry-iterate",
              payload,
            }
          }]);
        } else if (result.status === 402) {
             // Already handled
             setMessages((m) => [...m, { from: "system", text: "Créditos insuficientes." }]);
        } else {
            setMessages((m) => [...m, { from: "system", text: `Error: ${result.error || 'unknown'}` }]);
        }
        setLoading(false);
        return;
      }

      const iterateData2 = result.data;
      setEditedUrl(iterateData2.editedUrl);
      setPublicId(iterateData2.publicId);
      setMessages((m) => [...m, { from: "assistant", text: iterateData2.note || "Edición completada" }]);
      scrollToBottom();
    } catch (err) {
      setMessages((m) => [...m, { from: "system", text: `Error: ${err}` }]);
    } finally {
      setLoading(false);
      setLoadingPhase('idle');
    }
  }

  async function retryIterate(payload: IteratePayload | undefined) {
    if (!payload) return;
    if (!user) {
        setShowLoginModal(true);
        return;
    }

    setLoading(true);
    setLoadingPhase('generating');
    // show a small system message indicating retry started
    setMessages((m) => [...m, { from: "system", text: "Reintentando la edición..." }]);

    try {
      const result = await performIterateWithRetries(payload);

      if (!result.success) {
          if (result.status === 503) {
            setMessages((m) => [...m, { from: "system", text: "El servicio de edición sigue sin estar disponible. Intenta más tarde." }]);
          } else if (result.status === 402) {
             setMessages((m) => [...m, { from: "system", text: "Créditos insuficientes." }]);
          } else {
            setMessages((m) => [...m, { from: "system", text: `Error en edición: ${result.error}` }]);
          }
          return;
      }

      const data = result.data;
      setEditedUrl(data.editedUrl);
      setPublicId(data.publicId);
      setMessages((m) => [...m, { from: "assistant", text: data.note || "Edición completada" }]);
      scrollToBottom();
    } catch (err) {
      setMessages((m) => [...m, { from: "system", text: `Error al reintentar: ${err}` }]);
    } finally {
      setLoading(false);
       setLoadingPhase('idle');
    }
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
      <main className="app-center" role="main">
        <ModalLogin open={showLoginModal} onClose={() => setShowLoginModal(false)} />
        
        {showCreditsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="relative w-full max-w-4xl bg-white rounded-xl overflow-hidden">
                    <button 
                        onClick={() => setShowCreditsModal(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10"
                    >
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <div className="max-h-[90vh] overflow-y-auto">
                        <BuyCredits />
                    </div>
                </div>
            </div>
        )}

        <section className="chat-shell" aria-label="Asesor de estilo">
          {/* Progress bar (visible when loading) */}
          <div className={`progress-wrap ${loading ? 'active' : ''}`} aria-hidden={!loading}>
            <div
              className={`progress-bar phase-${loadingPhase} ${loadingPhase === 'analyzing' || loadingPhase === 'generating' ? 'indeterminate' : ''}`}
              style={loadingPhase === 'uploading' ? { width: `${uploadProgress}%` } : undefined}
            ></div>
            {/* ARIA live region for screen readers to announce progress/phase changes */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {loading ? (loadingPhase === 'uploading' ? `Subiendo ${uploadProgress}%` : loadingPhase === 'analyzing' ? 'Analizando la imagen...' : loadingPhase === 'generating' ? 'Generando la imagen...' : '') : ''}
            </div>
          </div>
          <header className="chat-header">
            {step === 'upload' ? (
              <div style={{textAlign: 'center'}}>
                <img src={encodeURI('/Logo spartan club - sin fondo.png')} alt="Spartan Club" className="mx-auto h-60 w-auto mb-4" />
                <h1 className="chat-title">{UI_CONFIG.APP_NAME}</h1>
                <p className="chat-sub">Recibe recomendaciones sobre prendas, combinaciones y cómo potenciar tu silueta.</p>
              </div>
            ) : (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'}}>
                <div style={{flex: '1 1 auto', textAlign: 'center'}}>
                  <img src={encodeURI('/Logo spartan club - sin fondo.png')} alt="Spartan Club" className="mx-auto h-60 w-auto mb-4" />
                  <h1 className="chat-title">{UI_CONFIG.APP_NAME}</h1>
                  <p className="chat-sub">Recibe recomendaciones sobre prendas, combinaciones y cómo potenciar tu silueta.</p>
                </div>
                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
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
              <h2 className="mb-2 text-lg font-semibold">Sube tu foto para una asesoría de outfit</h2>
              <p className="mb-4 text-sm text-muted-foreground">Recomendamos que sea una foto que muestre el cuerpo completo con buena iluminación para mejores recomendaciones.</p>
              <div className="flex items-center justify-start gap-4">
                <button aria-label="Seleccionar imagen" onClick={handleUploadClick} disabled={loading} className="btn-accent">{loading ? (loadingPhase === 'uploading' ? 'Subiendo...' : loadingPhase === 'analyzing' ? 'Analizando...' : 'Generando...') : 'Seleccionar Imagen'}</button>
                <input aria-label="Seleccionar archivo de imagen" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            </div>

            <div className="mt-6">
              {/* Suggestions are only shown after an edited image exists to avoid confusion */}
              {editedUrl ? (
                <>
                  <h3 className="mb-2 text-sm font-medium">Prueba estas ideas</h3>
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <button key={s} className="suggestion" onClick={() => handleSuggestionClick(s)} disabled={loading} aria-label={`Sugerencia: ${s}`}>{s}</button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </section>
      </main>
    );
  }

  // analysis runs inline as a system message inside the chat; no separate analyzing page

  // Ready/chat view
  return (
    <main className="app-center" role="main">
      <ModalLogin open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      {showCreditsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="relative w-full max-w-4xl bg-white rounded-xl overflow-hidden">
                    <button 
                        onClick={() => setShowCreditsModal(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10"
                    >
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <div className="max-h-[90vh] overflow-y-auto">
                        <BuyCredits />
                    </div>
                </div>
            </div>
        )}

      <section className="chat-shell" aria-label="Asesor de estilo">
        <header className="chat-header">
          <h1 className="chat-title">Tu Asesor de Estilo Personal</h1>
          <p className="chat-sub">Recibe recomendaciones sobre prendas, combinaciones y estilo personal.</p>
        </header>

        <section className="messages" role="log" aria-live="polite" aria-atomic="false">
          {messages.length === 0 && (
            <div className="py-12 text-center text-gray-400">Sube una imagen para comenzar la asesoría.</div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} message-wrap`}> 
              <div className={`bubble ${m.from === "user" ? "user" : m.from === "assistant" ? "assistant" : "system"} message-anim`}>
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.image && (
                    <div className="msg-image-container" aria-hidden={false}>
                    <Image 
                      src={m.image} 
                      alt={m.from === 'user' ? 'Imagen subida' : 'Imagen'} 
                      className="msg-image" 
                      width={0} 
                      height={0} 
                      sizes="100vw" 
                      style={{ width: '100%', height: 'auto' }} 
                    />
                  </div>
                )}
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  {m.from === 'user' && !m.image && (
                    <>
                      <button aria-label={`Editar mensaje ${i}`} className="btn-ghost" onClick={() => editMessage(i)}>Editar</button>
                      <button aria-label={`Eliminar mensaje ${i}`} className="btn-ghost" onClick={() => deleteMessage(i)}>Eliminar</button>
                    </>
                  )}
                </div>
                {m.action?.type === 'retry-iterate' && (
                  <div className="mt-2">
                    {(() => {
                      const payload = m.action?.payload;
                      return (
                        <button onClick={() => payload && retryIterate(payload)} disabled={loading} className="btn-ghost">{loading ? 'Procesando...' : 'Reintentar'}</button>
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
                <p className="whitespace-pre-wrap">¡Aquí está tu imagen editada! 🎨</p>
                <div className="msg-image-container">
                  <Image 
                    src={editedUrl} 
                    alt="Imagen editada" 
                    className="msg-image" 
                    width={0} 
                    height={0} 
                    sizes="100vw" 
                    style={{ width: '100%', height: 'auto' }} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* In-chat progress bubble: appears after image upload and follows the conversation */}
          {loading && loadingPhase !== 'idle' && (
            <div className="flex justify-start">
              <div className="bubble system" role="status" aria-live="polite">
                <p className="whitespace-pre-wrap mb-2">
                  {loadingPhase === 'uploading' ? `Subiendo imagen — ${uploadProgress}%` : loadingPhase === 'analyzing' ? 'Analizando la imagen…' : 'Generando la imagen…'}
                </p>
                <div className="progress-inline" aria-hidden="false">
                  <div
                    className={`progress-inline-bar ${loadingPhase === 'analyzing' || loadingPhase === 'generating' ? 'indeterminate' : ''}`}
                    style={loadingPhase === 'uploading' ? { width: `${uploadProgress}%` } : undefined}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </section>

        <form className="input-bar" onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} aria-label="Controles de entrada">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }} placeholder={originalUrl ? "Describe los cambios que quieres..." : "Sube una imagen primero"} aria-label="Descripción de los cambios a generar" className="input-textarea" />
          <div className="flex items-center gap-3">
            <button aria-label="Subir imagen" onClick={handleUploadClick} className="p-2">📤</button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button aria-label="Generar cambios" type="submit" disabled={!originalUrl || loading || !prompt.trim()} className="btn-accent">{loading ? "Procesando..." : "Generar Cambios"}</button>
          </div>
        </form>
        {/* suggestions area (also shown in upload state when edited image exists) */}
        {editedUrl && (
          <div className="suggestions" aria-hidden={!editedUrl}>
            <div style={{display:'flex', justifyContent:'flex-end', marginBottom: '0.5rem'}}> 
              <button aria-label="Reiniciar conversación" onClick={handleReset} className="btn-ghost">Empezar de nuevo</button>
            </div>
            {suggestions.map((s) => (
              <button key={s} onClick={() => handleSuggestionClick(s)} disabled={loading} className={`suggestion`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
