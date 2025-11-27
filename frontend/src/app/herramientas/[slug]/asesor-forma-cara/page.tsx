"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import type { IteratePayload } from '@/lib/asesor-estilo/types/ai'
import { uploadImage } from '@/lib/asesor-estilo/api-client'
import { getTokenCookie } from '@/lib/api';
import ModalLogin from '@/components/ModalLogin';
import BuyCredits from '@/components/BuyCredits';

type ProcessingPhase = 'upload' | 'analyze' | 'generate';
type Message = { from: "user" | "assistant" | "system"; text: string; image?: string; processingPhase?: ProcessingPhase; progress?: number; action?: { type: string; payload?: IteratePayload | undefined } };

export default function Page() {
  const [step, setStep] = useState<"upload" | "ready">("upload");
  const [prompt, setPrompt] = useState("");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const suggestions = [
    "Create a beard style that elongates my face",
    "Suggest low-maintenance hairstyles for wavy hair",
    "What products do I need for a healthy and well-groomed beard?",
  ];

  // Helper: perform /api/asesor-estilo/iterate with retries for transient 503 errors
  async function performIterateWithRetries(payload: IteratePayload, maxAttempts = 3, baseDelay = 300) {
    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
      try {
        const res = await fetch('/api/asesor-estilo/iterate', {
          method: 'POST',
          headers: { 
            'content-type': 'application/json',
            'Authorization': `Bearer ${getTokenCookie()}`
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

  // When an edited image is produced, ensure the chat scrolls so the user sees it
  useEffect(() => {
    if (editedUrl) scrollToBottom();
  }, [editedUrl]);

  function handleSuggestionClick(text: string) {
    if (!originalUrl) return;
    setPrompt(text);
    // auto-send the suggestion into the chat
    handleGenerate(text);
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await processUpload(file);
  }

  async function processUpload(file: File) {
    setLoading(true);

    // helper to upsert a single processing message and update its phase/progress
    const upsertProcessing = (phase: ProcessingPhase, progress?: number, text?: string) => {
      setMessages(prev => {
        const idx = prev.findIndex(x => x.processingPhase);
        if (idx === -1) {
          const msg = { from: 'system' as const, text: text || (phase === 'upload' ? 'Uploading...' : phase === 'analyze' ? 'Analyzing...' : 'Generating...'), processingPhase: phase, progress };
          return [...prev, msg];
        }
        const copy = [...prev];
        copy[idx] = { ...copy[idx], processingPhase: phase, progress, text: text || (phase === 'upload' ? 'Uploading...' : phase === 'analyze' ? 'Analyzing...' : 'Generating...') };
        return copy;
      });
    };

    // start with upload phase so users see immediate feedback
    upsertProcessing('upload', 0, 'Uploading...');

    try {
      type UploadResult = { imageUrl: string; sessionId?: string; publicId?: string; error?: string };
      // Use XHR-based uploader so we can show progress updates
      const uploadData = await uploadImage(file, (p) => {
        // update processing message progress
        setMessages(prev => {
          const idx = prev.findIndex(x => x.processingPhase === 'upload');
          if (idx === -1) return prev;
          const copy = [...prev];
          copy[idx] = { ...copy[idx], progress: p, text: `Uploading... ${p}%` };
          return copy;
        });
      });

      const u = uploadData as UploadResult;
      if (u.error) {
        setMessages([{ from: "system", text: `Error: ${u.error}` }]);
        setStep("upload");
        setLoading(false);
        return;
      }

      // uploadData.imageUrl is now the optimized Cloudinary URL (1024px max width)
      // This ensures consistent dimensions for both display and AI processing
  setOriginalUrl(u.imageUrl);
  setSessionId(u.sessionId ?? null);
  setPublicId(u.publicId ?? null);
  // add uploaded image into the chat and a processing indicator in a single update to avoid duplicates
  setMessages((m) => [...m, { from: "user", text: "Image uploaded", image: u.imageUrl }, { from: 'system', text: 'Loading edit...', processingPhase: 'analyze' }]);
  // switch to chat/ready view so the analysis message is visible in the conversation
  setStep('ready');

      // Perform analyze first to get the advisory
      const analyzeRes = await fetch("/api/asesor-estilo/analyze", {
        method: "POST",
        headers: { 
          "content-type": "application/json",
          "Authorization": `Bearer ${getTokenCookie()}`
        },
        body: JSON.stringify({ imageUrl: u.imageUrl, locale: "es" }),
      });
      const analyzeData = await analyzeRes.json();

      if (analyzeData.error || !analyzeData.analysis?.faceOk) {
  // remove processing indicator and append advisory in a single update
  setMessages((m) => {
    const filtered = m.filter(msg => !msg.processingPhase);
    return [...filtered, { from: "system", text: analyzeData.analysis?.advisoryText || "Could not analyze the image correctly." }];
  });
        setStep("upload");
        setLoading(false);
        return;
      }

  const advisory = analyzeData.analysis.advisoryText || "";

      // Small delay to avoid concurrency issues with analyze
      await new Promise(resolve => setTimeout(resolve, 100));

      // Perform iterate to generate the image with retries for transient 503 errors
      const iteratePayload2 = {
        sessionId: u.sessionId,
        originalImageUrl: u.imageUrl,
        userText: analyzeData.analysis.suggestedText || advisory,
        prevPublicId: u.publicId,
        analysis: analyzeData.analysis,
      };

      // Perform iterate to generate the image (single request with small delay
      // to mitigate race conditions in the external service)
      const iteratePayload = {
        sessionId: u.sessionId,
        originalImageUrl: u.imageUrl,
        userText: analyzeData.analysis.suggestedText || advisory,
        prevPublicId: u.publicId,
        analysis: analyzeData.analysis,
      };

      await new Promise((r) => setTimeout(r, 500));
      const iterateRes = await fetch('/api/asesor-estilo/iterate', {
        method: 'POST',
        headers: { 
          'content-type': 'application/json',
          'Authorization': `Bearer ${getTokenCookie()}`
        },
        body: JSON.stringify(iteratePayload2),
      });

      if (iterateRes.status === 503) {
        // remove processing indicator and append assistant advisory + system retry message in one update
        setMessages((m) => {
          const filtered = m.filter(msg => !msg.processingPhase);
          return [...filtered, { from: 'assistant', text: advisory }, { from: 'system', text: 'The image editing service is not available for now.', action: { type: 'retry-iterate', payload: iteratePayload } }];
        });
        setLoading(false);
        return;
      }

      const iterateData = await iterateRes.json();

      if (iterateData.error) {
        // remove processing indicator and append advisory + error in single update
        setMessages((m) => {
          const filtered = m.filter(msg => !msg.processingPhase);
          return [...filtered, { from: 'assistant', text: advisory }, { from: 'system', text: `Editing error: ${iterateData.error}` }];
        });
        setLoading(false);
        return;
      }

    setEditedUrl(iterateData.editedUrl);
    setPublicId(iterateData.publicId);

  // remove processing indicator now that editing is complete and append edited image + advisory in one update
  setMessages((m) => {
    const filtered = m.filter(msg => !msg.processingPhase);
    return [...filtered, { from: 'assistant', text: iterateData.note || 'Editing completed', image: iterateData.editedUrl }, { from: 'assistant', text: advisory }];
  });
      scrollToBottom();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as Record<string, unknown>).message) : String(err)
      setMessages((m) => [...m, { from: "system", text: `Error: ${msg}` }]);
      setStep("upload");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(text?: string) {
    const userText = text || prompt;
    if (!userText || !originalUrl || step !== "ready") return;

    setLoading(true);
    setMessages((m) => [...m, { from: "user", text: userText }]);
    setPrompt("");
    scrollToBottom();

    try {
      // use helper with retries
      const payload = { sessionId, originalImageUrl: originalUrl, userText, prevPublicId: publicId };
      const result = await performIterateWithRetries(payload);
      if (!result.success) {
        if (result.status === 503) {
          setMessages((m) => [...m, {
            from: "system",
            text: "The image editing service is not available for now.",
            action: {
              type: "retry-iterate",
              payload,
            }
          }]);
          setLoading(false);
          return;
        }
        setMessages((m) => [...m, { from: "system", text: `Error: ${result.error || 'unknown'}` }]);
        setLoading(false);
        return;
      }

      const iterateData2 = result.data;
  setEditedUrl(iterateData2.editedUrl);
  setPublicId(iterateData2.publicId);
  setMessages((m) => [...m, { from: "assistant", text: iterateData2.note || "Editing completed", image: iterateData2.editedUrl }]);
      scrollToBottom();
    } catch (err) {
      setMessages((m) => [...m, { from: "system", text: `Error: ${err}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function retryIterate(payload: IteratePayload | undefined) {
    if (!payload) return;
    setLoading(true);
    // show a small system message indicating retry started
    setMessages((m) => [...m, { from: "system", text: "Retrying the edit..." }]);

    try {
      const res = await fetch("/api/asesor-estilo/iterate", {
        method: "POST",
        headers: { 
          "content-type": "application/json",
          "Authorization": `Bearer ${getTokenCookie()}`
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 503) {
        setMessages((m) => [...m, { from: "system", text: "The editing service is still unavailable. Please try again later." }]);
        return;
      }

      const data = await res.json();
      if (data.error) {
        setMessages((m) => [...m, { from: "system", text: `Editing error: ${data.error}` }]);
        return;
      }

  setEditedUrl(data.editedUrl);
  setPublicId(data.publicId);
  setMessages((m) => [...m, { from: "assistant", text: data.note || "Editing completed", image: data.editedUrl }]);
      scrollToBottom();
    } catch (err) {
      setMessages((m) => [...m, { from: "system", text: `Error when retrying: ${err}` }]);
    } finally {
      setLoading(false);
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
      <div className="app-center">
        <div className="chat-shell">
          <div className="chat-header text-center">
            <h1 className="chat-title">Face Shape Advisor</h1>
            <p className="chat-sub">Get advice on beard styles, hairstyles and more tailored to your face shape.</p>
          </div>

          <div className="p-6">
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-8 rounded-lg text-center dropzone-visible ${isDragging ? "border-dashed border-indigo-400 bg-indigo-800/5" : "border-dashed border-transparent"}`}
            >
              <h2 className="mb-2 text-lg font-semibold">Upload your photo for an advisory</h2>
              <p className="mb-4 text-sm text-muted-foreground">We recommend a frontal photo with good lighting.</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={handleUploadClick} disabled={loading} className="btn-accent">{loading ? "Processing..." : "Select Image"}</button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            </div>

            {/* suggestions are hidden during initial upload; they'll appear in the chat area after the first edit */}
          </div>
        </div>
      </div>
    );
  }

  // analysis runs inline as a system message inside the chat; no separate analyzing page

  // Ready/chat view
  return (
    <div className="app-center">
      <div className="chat-shell">
        <div className="chat-header text-center">
          <div className="relative mx-auto mb-4 h-20 md:h-24 lg:h-28 w-auto">
            <Image fill src="/Logo spartan club - sin fondo.png" alt="Spartan Club" className="object-contain" />
          </div>
          <h1 className="chat-title">Face Shape Advisor</h1>
          <p className="chat-sub">Get advice on beard styles, hairstyles and more tailored to your face shape.</p>
        </div>

        <div className="messages">
          {messages.length === 0 && (
            <div className="py-12 text-center text-gray-400">Upload an image to start the advisory.</div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`bubble ${m.from === "user" ? "user" : m.from === "assistant" ? "assistant" : "system"}`}>
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.processingPhase && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="spinner w-5 h-5 border-2" aria-hidden />
                    <small className="text-xs text-[var(--color-text-secondary)]">
                      {m.progress ? `${m.text} (${m.progress}%)` : m.text}
                    </small>
                  </div>
                )}
                {m.image && (
                  <div className="msg-image-container">
                    <img src={m.image} alt="uploaded" className="msg-image" />
                  </div>
                )}
                {m.action?.type === 'retry-iterate' && (
                  <div className="mt-2">
                    {(() => {
                      const payload = m.action?.payload;
                      return (
                        <button onClick={() => payload && retryIterate(payload)} disabled={loading} className="btn-ghost">{loading ? 'Processing...' : 'Retry'}</button>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* edited images are appended as assistant messages in the messages array so history persists */}

          <div ref={chatEndRef} />
        </div>

        <div className="input-bar">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={originalUrl ? "Describe the changes you want..." : "Upload an image first"} className="input-textarea" />
          <div className="flex items-center gap-3">
            <button onClick={handleUploadClick} className="p-2">📤</button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button onClick={() => handleGenerate()} disabled={!originalUrl || loading || !prompt.trim()} className="btn-accent">{loading ? "Processing..." : "Generate Changes"}</button>
          </div>
        </div>

        <div className="suggestions">
          {/* Show suggestions once an original image is present to avoid early noise */}
          {originalUrl ? (
            suggestions.map((s) => (
              <button key={s} onClick={() => handleSuggestionClick(s)} disabled={loading} className={`suggestion ${loading ? 'disabled' : ''}`}>
                {s}
              </button>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">Upload an image to see suggestions.</div>
          )}
        </div>
      </div>

      <ModalLogin open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {showCreditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#181111] border border-[#392828] shadow-2xl">
            <button
              className="absolute right-5 top-5 z-10 text-[#ba9c9c] hover:text-white bg-black/20 rounded-full p-1"
              onClick={() => setShowCreditsModal(false)}
            >
              <svg width={24} height={24} fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="p-4">
              <BuyCredits />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
