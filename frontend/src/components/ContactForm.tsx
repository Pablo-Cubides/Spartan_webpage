'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok && data.mailtoLink) {
        // Open user's email client
        window.location.href = data.mailtoLink;
        setStatus('sent');
        setMessage('');
        
        // Reset status after a few seconds
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h3 className="text-white text-3xl font-extrabold uppercase tracking-tight">Contáctanos</h3>
        <p className="text-[#9CA3AF]">Envíanos tu mensaje y te responderemos pronto</p>
      </div>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 p-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent transition-all resize-none"
          placeholder="Escribe tu mensaje aquí..."
          rows={6}
          required
        />
        <button
          type="submit"
          disabled={status === 'sending' || !message.trim()}
          className="flex items-center justify-center self-start rounded-xl px-8 py-4 bg-[#D32F2F] text-white font-bold uppercase tracking-wide hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {status === 'sending' ? 'Enviando...' : status === 'sent' ? '¡Enviado!' : 'Enviar Mensaje'}
        </button>
        {status === 'error' && (
          <p className="text-red-400 text-sm">Ocurrió un error. Por favor, intenta de nuevo.</p>
        )}
        {status === 'sent' && (
          <p className="text-green-400 text-sm">Se abrirá tu cliente de correo en un momento.</p>
        )}
      </form>
    </div>
  );
}
