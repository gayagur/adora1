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
    <div style={{ minHeight: '100vh', background: '#F8F8F7', color: '#0A0A0A', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', background: 'rgba(248,248,247,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}>
        <Link to="/Landing" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src={logoImg} alt="Adora" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', letterSpacing: '-0.01em' }}>Adora</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/Dashboard" style={{ fontSize: 13, color: 'rgba(10,10,10,0.4)', fontWeight: 500, textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link to="/Onboarding" style={{
            height: 36, padding: '0 20px', borderRadius: 999, background: '#0A0A0A', color: '#fff',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none',
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 400, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(108,92,231,0.05) 0%, transparent 70%)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 560, textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999,
            background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)',
            fontSize: 11, fontWeight: 500, color: 'rgba(10,10,10,0.4)',
            marginBottom: 32,
          }}>
            <Sparkles style={{ width: 12, height: 12, color: 'rgba(108,92,231,0.5)' }} />
            AI Creative Engine
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 64, fontWeight: 750, lineHeight: 1.05,
            letterSpacing: '-0.04em', margin: 0,
            color: '#0A0A0A',
          }}>
            Brand to campaign
          </h1>
          <h1 style={{
            fontSize: 64, fontWeight: 750, lineHeight: 1.05,
            letterSpacing: '-0.04em', margin: 0,
            background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #6c5ce7 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            in one click
          </h1>

          {/* Subtext */}
          <p style={{
            marginTop: 20, fontSize: 16, lineHeight: 1.6,
            color: 'rgba(10,10,10,0.35)', maxWidth: 380, marginLeft: 'auto', marginRight: 'auto',
            fontWeight: 400,
          }}>
            Paste any URL. Get strategic campaigns and production-ready creatives — automatically.
          </p>

          {/* Input */}
          <form onSubmit={go} style={{ marginTop: 32, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: 5, borderRadius: 16,
              background: focused ? '#fff' : 'rgba(255,255,255,0.8)',
              border: focused ? '1px solid rgba(108,92,231,0.25)' : '1px solid rgba(0,0,0,0.07)',
              boxShadow: focused
                ? '0 0 0 4px rgba(108,92,231,0.06), 0 2px 8px rgba(0,0,0,0.04)'
                : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
            }}>
              <input
                type="text" value={url} onChange={e => setUrl(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                placeholder="https://yourbrand.com"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  padding: '10px 14px', fontSize: 14, color: '#0A0A0A',
                  fontFamily: 'inherit',
                }}
              />
              <button type="submit" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 42, padding: '0 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #7c6cf0, #6c5ce7)',
                color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(108,92,231,0.25)',
                transition: 'all 0.15s ease',
              }}>
                Analyze <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </form>

          {/* Trust */}
          <p style={{ marginTop: 16, fontSize: 11, color: 'rgba(10,10,10,0.15)', fontWeight: 500 }}>
            Works with any website · No sign-up required
          </p>
        </motion.div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', maxWidth: 880, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(108,92,231,0.45)', marginBottom: 10 }}>
            How it works
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', color: '#0A0A0A', margin: 0 }}>
            From URL to campaign in minutes
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { n: '01', t: 'Paste a URL', d: 'We analyze colors, tone, audience, and visual style.' },
            { n: '02', t: 'Review brand', d: 'Confirm or refine the brand profile.' },
            { n: '03', t: 'Get campaigns', d: '6 strategic directions — each unique.' },
            { n: '04', t: 'Generate', d: 'Posts, stories, reels, ads — all on-brand.' },
          ].map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
              style={{
                padding: 24, borderRadius: 16, background: '#fff',
                border: '1px solid rgba(0,0,0,0.04)',
              }}>
              <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: 'rgba(108,92,231,0.35)' }}>{s.n}</span>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A', marginTop: 12, marginBottom: 6 }}>{s.t}</h3>
              <p style={{ fontSize: 12, color: 'rgba(10,10,10,0.3)', lineHeight: 1.6, margin: 0 }}>{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>Ready to start?</h2>
        <p style={{ fontSize: 14, color: 'rgba(10,10,10,0.3)', marginBottom: 28 }}>
          Paste a URL and get a full campaign system in seconds.
        </p>
        <Link to="/Onboarding" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 44, padding: '0 28px', borderRadius: 999,
          background: '#0A0A0A', color: '#fff', fontSize: 14, fontWeight: 600,
          textDecoration: 'none',
        }}>
          Get started <ArrowRight style={{ width: 15, height: 15 }} />
        </Link>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{
        padding: '24px 0', textAlign: 'center', fontSize: 11,
        color: 'rgba(10,10,10,0.1)', borderTop: '1px solid rgba(0,0,0,0.04)',
      }}>
        Adora · AI Creative Engine
      </footer>
    </div>
  );
}
