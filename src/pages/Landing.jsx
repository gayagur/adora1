import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F2E8DE 0%, #E8D5C8 30%, #D4A990 65%, #C08B72 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#1A1612',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Load DM Serif Display for headline */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
      }}>
        <Link to="/Landing" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src={logoImg} alt="Adora" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <span style={{ fontSize: 17, fontWeight: 600, color: '#1A1612', letterSpacing: '-0.01em' }}>Adora</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link to="/Dashboard" style={{ fontSize: 14, color: 'rgba(26,22,18,0.5)', fontWeight: 500, textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link to="/Gallery" style={{ fontSize: 14, color: 'rgba(26,22,18,0.5)', fontWeight: 500, textDecoration: 'none' }}>
            Gallery
          </Link>
          <Link to="/Onboarding" style={{
            height: 40, padding: '0 24px', borderRadius: 999,
            background: '#1A1612', color: '#fff',
            fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', textDecoration: 'none',
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        padding: '100px 24px 60px',
        position: 'relative', zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 700 }}
        >
          {/* Headline */}
          <h1 style={{
            fontSize: 72,
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            color: '#1A1612',
            margin: 0,
          }}>
            Navigating Brands,
            <br />
            Discovering Creatives
          </h1>

          {/* Subtext */}
          <p style={{
            marginTop: 24, fontSize: 16, lineHeight: 1.65,
            color: 'rgba(26,22,18,0.45)', maxWidth: 480,
            marginLeft: 'auto', marginRight: 'auto',
            fontWeight: 400,
          }}>
            Stay ahead, stay informed, and transform insights into action
            with Adora — where brands are not just discovered, they're transformed.
          </p>

          {/* Input bar */}
          <form onSubmit={go} style={{ marginTop: 36, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: 5, borderRadius: 999,
              background: focused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
              border: focused ? '1px solid rgba(26,22,18,0.12)' : '1px solid rgba(26,22,18,0.08)',
              boxShadow: focused
                ? '0 0 0 3px rgba(26,22,18,0.04), 0 4px 16px rgba(0,0,0,0.06)'
                : '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(12px)',
            }}>
              <input
                type="text" value={url} onChange={e => setUrl(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                placeholder="https://yourbrand.com"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  padding: '11px 18px', fontSize: 14, color: '#1A1612',
                  fontFamily: 'inherit',
                }}
              />
              <button type="submit" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 44, padding: '0 26px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: '#1A1612', color: '#fff',
                fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}>
                Start exploring
              </button>
            </div>
          </form>
        </motion.div>
      </section>

      {/* ── Decorative wave / abstract visual at bottom ────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '110%', maxWidth: 900, zIndex: 0,
        pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 900 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="wave1" x1="0" y1="0" x2="900" y2="320" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E85D75" />
              <stop offset="25%" stopColor="#D94F8A" />
              <stop offset="50%" stopColor="#C74BA0" />
              <stop offset="75%" stopColor="#9B59B6" />
              <stop offset="100%" stopColor="#6C5CE7" />
            </linearGradient>
            <linearGradient id="wave2" x1="100" y1="50" x2="800" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F39C6B" />
              <stop offset="30%" stopColor="#E8756B" />
              <stop offset="60%" stopColor="#D95B8A" />
              <stop offset="100%" stopColor="#B855A0" />
            </linearGradient>
            <linearGradient id="wave3" x1="200" y1="100" x2="700" y2="320" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDCB6E" />
              <stop offset="35%" stopColor="#F0A05E" />
              <stop offset="70%" stopColor="#E07858" />
              <stop offset="100%" stopColor="#D65D6E" />
            </linearGradient>
          </defs>
          {/* Layer 3 — back */}
          <path d="M0 280 Q150 120 350 180 Q500 220 650 140 Q800 80 900 160 L900 320 L0 320 Z" fill="url(#wave1)" opacity="0.7" />
          {/* Layer 2 — mid */}
          <path d="M0 300 Q200 160 400 220 Q550 260 700 180 Q820 130 900 200 L900 320 L0 320 Z" fill="url(#wave2)" opacity="0.8" />
          {/* Layer 1 — front */}
          <path d="M0 310 Q180 220 380 260 Q520 280 680 220 Q800 180 900 240 L900 320 L0 320 Z" fill="url(#wave3)" opacity="0.9" />
          {/* Accent lines */}
          <path d="M50 290 Q200 180 400 230 Q560 260 720 200 Q830 160 900 210" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
          <path d="M0 295 Q180 200 380 245 Q540 270 700 210 Q820 170 900 220" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section style={{
        padding: '120px 24px 100px', maxWidth: 880, margin: '0 auto',
        position: 'relative', zIndex: 2,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,22,18,0.3)', marginBottom: 10 }}>
            How it works
          </p>
          <h2 style={{ fontSize: 34, fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, letterSpacing: '-0.01em', color: '#1A1612', margin: 0 }}>
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
                padding: 24, borderRadius: 16,
                background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.4)',
              }}>
              <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: 'rgba(26,22,18,0.2)' }}>{s.n}</span>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1612', marginTop: 12, marginBottom: 6 }}>{s.t}</h3>
              <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', lineHeight: 1.6, margin: 0 }}>{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '60px 24px 100px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <h2 style={{ fontSize: 30, fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, letterSpacing: '-0.01em', marginBottom: 12, color: '#1A1612' }}>Ready to start?</h2>
        <p style={{ fontSize: 14, color: 'rgba(26,22,18,0.35)', marginBottom: 28 }}>
          Paste a URL and get a full campaign system in seconds.
        </p>
        <Link to="/Onboarding" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 46, padding: '0 30px', borderRadius: 999,
          background: '#1A1612', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none',
        }}>
          Get started <ArrowRight style={{ width: 15, height: 15 }} />
        </Link>
      </section>

      <footer style={{
        padding: '20px 0', textAlign: 'center', fontSize: 11,
        color: 'rgba(26,22,18,0.15)',
        position: 'relative', zIndex: 2,
      }}>
        Adora · AI Creative Engine
      </footer>
    </div>
  );
}
