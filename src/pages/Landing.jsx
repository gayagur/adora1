import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Layers, Target, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CAMPAIGN_THEMES = [
  { label: 'Product Launch', color: 'from-violet-500 to-indigo-600' },
  { label: 'Problem / Solution', color: 'from-rose-500 to-pink-600' },
  { label: 'Social Proof', color: 'from-amber-500 to-orange-600' },
  { label: 'Feature Highlight', color: 'from-cyan-500 to-blue-600' },
  { label: 'Brand Awareness', color: 'from-emerald-500 to-teal-600' },
  { label: 'Emotional Story', color: 'from-purple-500 to-violet-700' },
];

const ASSET_TYPES = [
  { icon: '📸', label: 'Instagram Post', sub: '1:1 feed' },
  { icon: '📱', label: 'Instagram Story', sub: '9:16 full-screen' },
  { icon: '🎬', label: 'Reel Concept', sub: 'Short-form video' },
  { icon: '💼', label: 'LinkedIn Post', sub: 'Professional' },
  { icon: '🎠', label: 'Carousel', sub: 'Multi-slide' },
  { icon: '🖼', label: 'Banner Ad', sub: 'Display' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Analyze a website', desc: 'Paste any URL. Our AI extracts brand voice, colors, audience, and messaging in seconds.' },
  { step: '02', title: 'Review brand profile', desc: 'Confirm or edit what was extracted. Add your own images and color overrides.' },
  { step: '03', title: 'Get campaign themes', desc: 'AI generates 6 strategic campaign directions — each a different angle for your brand.' },
  { step: '04', title: 'Build inside campaigns', desc: 'Open any campaign and generate posts, stories, reels, and banners for every platform.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    navigate(`/Onboarding?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-[#09090B]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight">AdForge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/Dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Campaigns</Link>
          <Link to="/Onboarding" className="h-8 px-4 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors flex items-center">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 md:px-16 relative overflow-hidden">
        {/* bg glow */}
        <div className="absolute top-0 left-1/3 w-[700px] h-[500px] bg-violet-600/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex items-center gap-16 min-h-[520px] relative z-10">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-medium text-violet-300 mb-10 w-fit tracking-wide">
              <Zap className="w-3 h-3" />
              AI Marketing Studio
            </div>

            <h1
              className="text-[56px] md:text-[68px] font-semibold leading-[1.12] tracking-[-0.035em] text-white mb-6"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Design your space<br />
              <span className="text-white/40">your way.</span>
            </h1>

            <p
              className="text-[17px] text-white/50 leading-relaxed mb-10 max-w-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontWeight: 400 }}
            >
              From idea to reality &mdash; with DEXO.
            </p>

            {/* URL form */}
            <form onSubmit={handleSubmit} className="max-w-md">
              <div className="relative flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-sm">
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://yourbrand.com"
                  className="flex-1 bg-transparent pl-4 pr-2 py-2.5 text-sm text-white placeholder-white/25 outline-none"
                  style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 h-10 px-5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shrink-0"
                >
                  Analyze
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>

          {/* Right — visual */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="hidden md:flex flex-1 items-center justify-center"
          >
            <div className="relative w-[280px]">
              {/* Phone frame */}
              <div className="relative w-[260px] mx-auto rounded-[40px] bg-[#18181B] border border-white/10 shadow-2xl overflow-hidden" style={{ height: 520 }}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#09090B] rounded-b-2xl z-10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                </div>
                {/* Screen content — gradient placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#0f0f1a] to-[#09090B] flex flex-col items-center justify-center gap-4 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-violet-600/30 border border-violet-400/20 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-violet-300" />
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="h-2.5 bg-white/10 rounded-full w-3/4 mx-auto" />
                    <div className="h-2 bg-white/6 rounded-full w-1/2 mx-auto" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full mt-2">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="h-24 rounded-xl bg-white/[0.04] border border-white/[0.07]" />
                    ))}
                  </div>
                </div>
              </div>
              {/* Glow behind phone */}
              <div className="absolute inset-0 -z-10 blur-[60px] bg-violet-600/15 rounded-full" />
            </div>
          </motion.div>
        </div>

        {/* Campaign theme chips preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-16 flex flex-wrap justify-start gap-2.5 max-w-6xl mx-auto"
        >
          {CAMPAIGN_THEMES.map(t => (
            <div key={t.label} className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium bg-gradient-to-r ${t.color} text-white shadow-md opacity-80`}>
              {t.label}
            </div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-28 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">From URL to campaign in minutes</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] transition-colors group"
              >
                <div className="text-xs font-mono font-bold text-white/20 mb-4">{item.step}</div>
                <h3 className="font-semibold text-white mb-2 text-[15px]">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Asset types */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">Content Types</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Every asset type, one workspace</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ASSET_TYPES.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] transition-colors"
              >
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{a.label}</p>
                  <p className="text-xs text-white/35">{a.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Ready to build your campaign?</h2>
          <p className="text-white/40 mb-8 leading-relaxed">Paste a URL and get a full strategic marketing system in seconds.</p>
          <Link
            to="/Onboarding"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all hover:scale-[1.02]"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/[0.06] text-center text-xs text-white/20">
        © 2026 AdForge · AI Campaign Studio
      </footer>
    </div>
  );
}