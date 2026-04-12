import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Grid3X3, BarChart3, MonitorSmartphone, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';

const STEPS = [
  { n: '01', title: 'Paste a URL', desc: 'We analyze the brand — colors, tone, audience, visual style — in seconds.' },
  { n: '02', title: 'Review brand profile', desc: 'Confirm or refine what we found. Add your own assets and overrides.' },
  { n: '03', title: 'Get campaign themes', desc: '6 strategic directions generated automatically — each a unique angle.' },
  { n: '04', title: 'Generate content', desc: 'Create posts, stories, reels, and ads — all on-brand, all intelligent.' },
];

const FORMATS = [
  { icon: MonitorSmartphone, label: 'Instagram', sub: 'Posts, Stories, Reels' },
  { icon: Grid3X3, label: 'Carousel', sub: 'Multi-slide decks' },
  { icon: BarChart3, label: 'LinkedIn', sub: 'Professional content' },
  { icon: PenTool, label: 'Banners', sub: 'Display & social' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  const go = (e) => { e.preventDefault(); if (url.trim()) navigate(`/Onboarding?url=${encodeURIComponent(url.trim())}`); };

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-[#6c5ce7]/30">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-6 bg-[#09090b]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="Adora" className="w-7 h-7 object-contain" />
          <span className="text-[14px] font-semibold tracking-tight">Adora</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/Dashboard" className="text-[12px] text-white/35 hover:text-white/70 font-medium transition-colors">Dashboard</Link>
          <Link to="/Onboarding" className="h-[30px] px-4 rounded-lg bg-white text-[#09090b] text-[12px] font-semibold flex items-center hover:bg-white/90 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero — product-focused, not decorative */}
      <section className="pt-36 pb-28 px-6 relative">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#6c5ce7]/6 rounded-full blur-[140px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center relative z-10">

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.03] text-[10px] font-semibold text-white/40 uppercase tracking-[0.12em] mb-8">
            <Zap className="w-2.5 h-2.5" /> AI Creative Engine
          </div>

          <h1 className="text-[2.75rem] sm:text-[3.5rem] font-bold tracking-[-0.04em] leading-[1.08] text-balance">
            Brand to campaign<br/>
            <span className="text-[#a29bfe]">in one click</span>
          </h1>

          <p className="mt-5 text-[15px] text-white/30 max-w-md mx-auto leading-relaxed">
            Paste any URL. Get strategic campaigns and production-ready creatives — automatically.
          </p>

          <form onSubmit={go} className="mt-10 max-w-[440px] mx-auto">
            <div className={`flex items-center gap-2 p-1 rounded-xl border transition-all duration-200 ${focused ? 'bg-white/[0.06] border-[#6c5ce7]/30' : 'bg-white/[0.03] border-white/[0.07]'}`}>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                placeholder="https://yourbrand.com"
                className="flex-1 bg-transparent pl-3.5 py-2.5 text-[13px] text-white placeholder-white/20 outline-none" />
              <button type="submit"
                className="flex items-center gap-1.5 h-[38px] px-5 rounded-lg bg-[#6c5ce7] hover:bg-[#5f4dd6] text-white text-[13px] font-medium transition-colors shrink-0">
                Analyze <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </section>

      {/* Process — compact, not decorative */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 mb-3 text-center">Process</p>
          <h2 className="text-2xl font-bold tracking-tight text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STEPS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <span className="text-[10px] font-mono text-[#6c5ce7]/50 font-bold">{s.n}</span>
                <h3 className="text-[13px] font-semibold text-white mt-2 mb-1">{s.title}</h3>
                <p className="text-[11px] text-white/25 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 mb-3 text-center">Formats</p>
          <h2 className="text-2xl font-bold tracking-tight text-center mb-10">Every platform, one system</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FORMATS.map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <f.icon className="w-5 h-5 text-[#a29bfe]/50" />
                <p className="text-[12px] font-medium text-white">{f.label}</p>
                <p className="text-[10px] text-white/20">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Start building</h2>
          <p className="text-white/25 text-[14px] mb-8">Paste a URL. Get a complete campaign in seconds.</p>
          <Link to="/Onboarding"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#6c5ce7] hover:bg-[#5f4dd6] text-white font-medium transition-colors">
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-6 text-center text-[10px] text-white/10 border-t border-white/[0.04]">Adora · AI Creative Engine</footer>
    </div>
  );
}
