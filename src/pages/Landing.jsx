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
      <section className="pt-40 pb-32 px-6 relative overflow-hidden">
        {/* bg glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-violet-300 mb-8">
            <Zap className="w-3 h-3" />
            AI Marketing Studio
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.03em] leading-[1.03] text-balance">
            Turn any website into a{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              full marketing campaign
            </span>
          </h1>

          <p className="mt-7 text-lg sm:text-xl text-white/45 max-w-xl mx-auto leading-relaxed font-light">
            Analyze a URL, generate strategic campaign themes, and create multi-platform assets — all in one workspace.
          </p>

          {/* URL form */}
          <form onSubmit={handleSubmit} className="mt-10 max-w-lg mx-auto">
            <div className="relative flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-sm">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://yourbrand.com"
                className="flex-1 bg-transparent pl-4 pr-2 py-2.5 text-sm text-white placeholder-white/30 outline-none"
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

        {/* Campaign theme chips preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-16 flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto"
        >
          {CAMPAIGN_THEMES.map(t => (
            <div key={t.label} className={`px-4 py-2 rounded-full text-xs font-medium bg-gradient-to-r ${t.color} text-white shadow-lg`}>
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