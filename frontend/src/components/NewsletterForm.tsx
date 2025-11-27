"use client";

import React, { useState } from 'react';

export default function NewsletterForm(): JSX.Element {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    try {
      // Try to POST to /api/newsletter if available; fallback to a quick client-side success.
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        // If there's no API or it failed, still mark error
        throw new Error('Network error');
      }

      setStatus('sent');
      setEmail('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="flex-1 bg-black/50 border border-gray-700 text-white px-5 py-3 rounded-sm focus:outline-none focus:border-spartan-red transition-colors placeholder-gray-500"
        required
      />
      <button
        type="submit"
        disabled={status === 'sending' || !email}
        className="bg-spartan-red hover:bg-red-700 text-white font-display font-bold px-8 py-3 rounded-sm uppercase tracking-wide disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Thank you!' : 'Subscribe'}
      </button>
      {status === 'error' && <p className="text-red-400 mt-2 text-sm">An error occurred. Please try again.</p>}
    </form>
  );
}
