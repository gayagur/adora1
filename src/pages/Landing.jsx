import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';

export default function Landing() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  const go = (e) => {
    e.preventDefault();
    if (url.trim()) navigate(`/Onboarding?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1a1a1a] selection:bg-[#6c5ce7]/15">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-[56px] flex items-center justify-between px-8 bg-[#FAFAF9]/80 backdrop-blur-xl border-b border-black/[0.04]">
        <Link to="/Landing" className="flex items-center gap-2.5">
          <img src={logoImg} alt="Adora" className="w-8 h-8 object-contain" />
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#1a1a1a]">Adora</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/Dashboard" className="text-[13px] text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 font-medium transition-colors">
            Dashboard
          </Link>
          <Link to="/Onboarding"
            className="h-[36px] px-5 rounded-full bg-[#1a1a1a] text-white text-[13px] font-medium flex items-center hover:bg-[#333] transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(108,92,231,0.06) 0%, rgba(108,92,231,0.02) 40%, transparent 70%)' }} />
        <div className="absolute bottom-[20%] right-[15%] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(162,155,254,0.04) 0%, transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[600px] text-center relative z-10"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1a1a1a]/[0.06] bg-white/60 backdrop-blur-sm text-[11px] font-medium text-[#1a1a1a]/40 mb-10">
            <Sparkles className="w-3 h-3 text-[#6c5ce7]/60" />
            AI Creative Engine
          </div>

          {/* Headline */}
          <h1 className="text-[3.25rem] sm:text-[4rem] font-bold tracking-[-0.04em] leading-[1.06]">
            Brand to campaign
            <br />
            <span className="bg-gradient-to-r from-[#6c5ce7] via-[#a29bfe] to-[#6c5ce7] bg-clip-text text-transparent">
              in one click
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-[16px] text-[#1a1a1a]/35 max-w-[420px] mx-auto leading-[1.6]">
            Paste any URL. Get strategic campaigns and production-ready creatives — automatically.
          </p>

          {/* Input */}
          <form onSubmit={go} className="mt-10 max-w-[460px] mx-auto">
            <div className={`relative flex items-center p-1.5 rounded-2xl border transition-all duration-300 ${
              focused
                ? 'bg-white border-[#6c5ce7]/20 shadow-[0_0_0_4px_rgba(108,92,231,0.06)]'
                : 'bg-white/80 border-[#1a1a1a]/[0.08] shadow-sm'
            }`}>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="https://yourbrand.com"
                className="flex-1 bg-transparent pl-4 py-2.5 text-[14px] text-[#1a1a1a] placeholder-[#1a1a1a]/20 outline-none"
              />
              <button type="submit"
                className="flex items-center gap-2 h-[42px] px-6 rounded-xl bg-gradient-to-b from-[#7c6cf0] to-[#6c5ce7] hover:from-[#6c5ce7] hover:to-[#5f4dd6] text-white text-[14px] font-medium transition-all shrink-0 shadow-sm">
                Analyze
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Trust line */}
          <p className="mt-6 text-[11px] text-[#1a1a1a]/15 font-medium">
            Works with any website · No sign-up required
          </p>
        </motion.div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6c5ce7]/50 mb-3">How it works</p>
            <h2 className="text-[2rem] font-bold tracking-[-0.03em] text-[#1a1a1a]">From URL to campaign in minutes</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: '01', t: 'Paste a URL', d: 'We analyze colors, tone, audience, and visual style in seconds.' },
              { n: '02', t: 'Review brand', d: 'Confirm or refine the brand profile. Add your own assets.' },
              { n: '03', t: 'Get campaigns', d: '6 strategic directions generated — each a unique angle.' },
              { n: '04', t: 'Generate', d: 'Create posts, stories, reels, and ads — all on-brand.' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="p-6 rounded-2xl bg-white border border-[#1a1a1a]/[0.04] hover:border-[#1a1a1a]/[0.08] hover:shadow-sm transition-all"
              >
                <span className="text-[11px] font-mono font-bold text-[#6c5ce7]/40">{s.n}</span>
                <h3 className="text-[14px] font-semibold text-[#1a1a1a] mt-3 mb-1.5">{s.t}</h3>
                <p className="text-[12px] text-[#1a1a1a]/35 leading-[1.6]">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-[400px] mx-auto text-center">
          <h2 className="text-[1.75rem] font-bold tracking-[-0.03em] mb-4">Ready to start?</h2>
          <p className="text-[14px] text-[#1a1a1a]/30 mb-8 leading-relaxed">Paste a URL and get a full campaign system in seconds.</p>
          <Link to="/Onboarding"
            className="inline-flex items-center gap-2 h-[44px] px-7 rounded-full bg-[#1a1a1a] hover:bg-[#333] text-white text-[14px] font-medium transition-colors">
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-8 text-center text-[11px] text-[#1a1a1a]/12 border-t border-[#1a1a1a]/[0.04]">
        Adora · AI Creative Engine
      </footer>
    </div>
  );
}
