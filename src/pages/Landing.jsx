import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Layers, Target, Palette, BarChart3, PenTool, MonitorSmartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const CAMPAIGN_THEMES = [
  { label: 'Product Launch', color: 'bg-violet-100 text-violet-700' },
  { label: 'Problem / Solution', color: 'bg-rose-50 text-rose-600' },
  { label: 'Social Proof', color: 'bg-amber-50 text-amber-700' },
  { label: 'Feature Highlight', color: 'bg-sky-50 text-sky-700' },
  { label: 'Brand Awareness', color: 'bg-emerald-50 text-emerald-700' },
  { label: 'Emotional Story', color: 'bg-purple-50 text-purple-700' },
];

const ASSET_TYPES = [
  { icon: MonitorSmartphone, label: 'Instagram Post', sub: '1:1 feed' },
  { icon: MonitorSmartphone, label: 'Instagram Story', sub: '9:16 full-screen' },
  { icon: PenTool, label: 'Reel Concept', sub: 'Short-form video' },
  { icon: BarChart3, label: 'LinkedIn Post', sub: 'Professional' },
  { icon: Layers, label: 'Carousel', sub: 'Multi-slide' },
  { icon: Palette, label: 'Banner Ad', sub: 'Display' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Paste any URL', desc: 'Our AI analyzes your website, extracts brand voice, colors, audience, and visual identity in seconds.' },
  { step: '02', title: 'Review your brand', desc: 'Confirm what was extracted or fine-tune. Add images, colors, and tone overrides.' },
  { step: '03', title: 'Generate campaigns', desc: 'AI creates 6 strategic campaign directions — each with a unique angle tailored to your brand.' },
  { step: '04', title: 'Create content', desc: 'Build posts, stories, reels, and banners for every platform — all on-brand, all intelligent.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    navigate(`/Onboarding?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#08080C] text-white selection:bg-violet-500/30">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-[60px] bg-[#08080C]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight">AdForge</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/Dashboard" className="text-[13px] text-white/40 hover:text-white/80 transition-colors font-medium">Campaigns</Link>
          <Link to="/Onboarding" className="h-[34px] px-4 rounded-[9px] bg-white text-[#08080C] text-[13px] font-semibold hover:bg-white/90 transition-all flex items-center active:scale-[0.97]">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-44 pb-36 px-6 relative overflow-hidden">
        {/* Refined bg glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-600/8 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] font-medium text-violet-300/80 mb-10 tracking-wide uppercase">
            <Zap className="w-3 h-3" />
            AI-Powered Creative Studio
          </div>

          <h1 className="text-[3.25rem] sm:text-[4rem] md:text-[4.75rem] font-bold tracking-[-0.035em] leading-[1.05] text-balance">
            Turn any website into{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-300 bg-clip-text text-transparent">
              stunning campaigns
            </span>
          </h1>

          <p className="mt-6 text-[17px] sm:text-lg text-white/35 max-w-lg mx-auto leading-relaxed font-light">
            Analyze a URL. Generate strategic campaign themes. Create multi-platform assets — all in one workspace.
          </p>

          {/* URL form */}
          <form onSubmit={handleSubmit} className="mt-12 max-w-[480px] mx-auto">
            <div className={`relative flex items-center gap-2 p-1.5 rounded-2xl border transition-all duration-300 ${
              focused
                ? 'bg-white/[0.08] border-violet-500/30 shadow-lg shadow-violet-500/5'
                : 'bg-white/[0.04] border-white/[0.08]'
            }`}>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="https://yourbrand.com"
                className="flex-1 bg-transparent pl-4 pr-2 py-2.5 text-sm text-white placeholder-white/20 outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-2 h-[42px] px-5 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white text-sm font-medium transition-all shrink-0 shadow-lg shadow-violet-600/20 active:scale-[0.97]"
              >
                Analyze
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Campaign theme chips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-20 flex flex-wrap justify-center gap-2 max-w-xl mx-auto"
        >
          {CAMPAIGN_THEMES.map(t => (
            <div key={t.label} className={`px-3.5 py-[7px] rounded-full text-[11px] font-medium ${t.color} bg-opacity-10`}>
              {t.label}
            </div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet-400/70 mb-3">How it works</p>
            <h2 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight text-white leading-tight">From URL to campaign<br className="hidden sm:block" /> in minutes</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 group"
              >
                <div className="text-[11px] font-mono font-bold text-violet-500/40 mb-4 tracking-wider">{item.step}</div>
                <h3 className="font-semibold text-white mb-2 text-[15px] tracking-tight">{item.title}</h3>
                <p className="text-[13px] text-white/30 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Asset types */}
      <section className="py-28 px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-14 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet-400/70 mb-3">Content types</p>
            <h2 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight text-white leading-tight">Every format,<br className="hidden sm:block" /> one workspace</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ASSET_TYPES.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                  <a.icon className="w-4 h-4 text-violet-400/60" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">{a.label}</p>
                  <p className="text-[11px] text-white/25 mt-0.5">{a.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-28 px-6 border-t border-white/[0.04]">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight mb-5 leading-tight">Ready to build<br />your campaign?</h2>
          <p className="text-white/30 mb-10 leading-relaxed text-[15px]">Paste a URL and get a complete marketing system in seconds.</p>
          <Link
            to="/Onboarding"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-medium transition-all shadow-lg shadow-violet-600/20 active:scale-[0.97]"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/[0.04] text-center text-[11px] text-white/15 tracking-wide">
        AdForge · AI Campaign Studio
      </footer>
    </div>
  );
}
