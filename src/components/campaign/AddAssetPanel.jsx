import React, { useState } from 'react';
import { X, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ASSET_OPTIONS = [
  { platform: 'instagram', asset_type: 'post', label: 'Instagram Post', sub: '1:1', format: '1:1' },
  { platform: 'instagram', asset_type: 'story', label: 'Story', sub: '9:16', format: '9:16' },
  { platform: 'instagram', asset_type: 'carousel', label: 'Carousel', sub: '1:1 multi', format: '1:1' },
  { platform: 'facebook', asset_type: 'post', label: 'Facebook Post', sub: '16:9', format: '16:9' },
  { platform: 'facebook', asset_type: 'ad', label: 'Facebook Ad', sub: '1:1', format: '1:1' },
  { platform: 'linkedin', asset_type: 'post', label: 'LinkedIn Post', sub: '1:1', format: '1:1' },
  { platform: 'linkedin', asset_type: 'banner', label: 'LinkedIn Banner', sub: '4:1', format: '4:1' },
  { platform: 'tiktok', asset_type: 'video_concept', label: 'TikTok', sub: '9:16', format: '9:16' },
  { platform: 'twitter', asset_type: 'post', label: 'X Post', sub: '16:9', format: '16:9' },
  { platform: 'general', asset_type: 'banner', label: 'Display Banner', sub: '16:9', format: '16:9' },
];

const STYLES = [
  { id: 'realistic', label: 'Realistic', sub: 'Photography, lifestyle, people' },
  { id: 'graphic', label: 'Graphic / 3D', sub: 'Abstract, UI mockups, 3D objects' },
  { id: 'animation', label: 'Animation', sub: 'Premium illustrated, 2.5D, stylized' },
];

const INTENTS = [
  { id: 'auto', label: 'Auto', sub: 'Let AI decide the best direction' },
  { id: 'product', label: 'Product', sub: 'Focus on the product or service' },
  { id: 'lifestyle', label: 'Lifestyle', sub: 'People, scenes, emotion' },
  { id: 'editorial', label: 'Editorial', sub: 'Typography-driven, bold' },
  { id: 'abstract', label: 'Abstract', sub: 'Conceptual, metaphorical' },
];

const TONES = [
  { id: 'brand', label: 'Brand Colors' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export default function AddAssetPanel({ onAdd, onClose }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [style, setStyle] = useState(null);
  const [intent, setIntent] = useState(null);
  const [tone, setTone] = useState('brand');
  const [postContent, setPostContent] = useState('');

  const back = () => setStep(s => s - 1);
  const confirm = () => {
    onAdd({ ...selected, visual_style: style?.id || 'realistic', background: 'rich', background_tone: tone, creative_intent: intent?.id || 'auto', post_content: postContent.trim() || null });
    onClose();
  };

  const titles = { 1: 'Choose format', 2: 'Visual style', 3: 'Creative direction', 4: 'Post content' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 340 }}
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', maxHeight: '75vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(26,22,18,0.06)' }}>
          <div>
            {step > 1 && <button onClick={back} style={{ fontSize: 10, color: 'rgba(108,92,231,0.7)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 2, display: 'block', fontFamily: 'inherit' }}>← Back</button>}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1612', letterSpacing: '-0.01em' }}>{titles[step]}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: 3, borderRadius: 3, transition: 'all 0.2s', width: i <= step ? 16 : 6, background: i <= step ? '#1A1612' : 'rgba(26,22,18,0.1)' }} />
              ))}
            </div>
            <button onClick={onClose} style={{ width: 24, height: 24, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X style={{ width: 14, height: 14, color: 'rgba(26,22,18,0.3)' }} />
            </button>
          </div>
        </div>

        {/* Step 1: Format */}
        {step === 1 && (
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {ASSET_OPTIONS.map(opt => (
                <button key={`${opt.platform}-${opt.asset_type}`} onClick={() => { setSelected(opt); setStep(2); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, border: '1px solid rgba(26,22,18,0.06)', background: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(26,22,18,0.12)'; e.currentTarget.style.background = 'rgba(26,22,18,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,22,18,0.06)'; e.currentTarget.style.background = '#fff'; }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(26,22,18,0.2)', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>{opt.sub}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1612' }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Style */}
        {step === 2 && (
          <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            {STYLES.map(s => (
              <button key={s.id} onClick={() => { setStyle(s); setStep(3); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, border: '1px solid rgba(26,22,18,0.06)', background: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(26,22,18,0.12)'; e.currentTarget.style.background = 'rgba(26,22,18,0.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,22,18,0.06)'; e.currentTarget.style.background = '#fff'; }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1612' }}>{s.label}</p>
                  <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', marginTop: 2 }}>{s.sub}</p>
                </div>
                <ArrowRight style={{ width: 14, height: 14, color: 'rgba(26,22,18,0.15)' }} />
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Intent + Tone */}
        {step === 3 && (
          <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,22,18,0.25)', marginBottom: 8 }}>Direction</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
              {INTENTS.map(i => (
                <button key={i.id} onClick={() => setIntent(i)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 10,
                    border: intent?.id === i.id ? '1px solid rgba(26,22,18,0.15)' : '1px solid rgba(26,22,18,0.06)',
                    background: intent?.id === i.id ? 'rgba(26,22,18,0.03)' : '#fff',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#1A1612' }}>{i.label}</p>
                    <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.3)' }}>{i.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,22,18,0.25)', marginBottom: 8 }}>Tone</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: tone === t.id ? '#1A1612' : 'rgba(26,22,18,0.04)',
                    color: tone === t.id ? '#fff' : 'rgba(26,22,18,0.4)',
                  }}>{t.label}</button>
              ))}
            </div>
            <button onClick={() => setStep(4)}
              style={{ width: '100%', height: 40, borderRadius: 999, background: '#1A1612', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Continue
            </button>
          </div>
        )}

        {/* Step 4: Post content */}
        {step === 4 && (
          <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 12, background: 'rgba(108,92,231,0.04)', border: '1px solid rgba(108,92,231,0.08)' }}>
              <FileText style={{ width: 14, height: 14, color: 'rgba(108,92,231,0.5)', marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.5)', lineHeight: 1.5 }}>
                Paste your caption or idea. The AI will translate the meaning into a visual.
              </p>
            </div>
            <textarea
              style={{
                flex: 1, width: '100%', padding: '10px 12px', borderRadius: 12,
                background: 'rgba(26,22,18,0.03)', border: '1px solid rgba(26,22,18,0.06)',
                fontSize: 12, color: '#1A1612', outline: 'none', resize: 'none', fontFamily: 'inherit',
              }}
              rows={5} placeholder="Example: Our AI tool helps designers create room concepts in minutes."
              value={postContent} onChange={e => setPostContent(e.target.value)} autoFocus />
            <button onClick={confirm}
              style={{
                width: '100%', height: 40, borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: '#1A1612', color: '#fff', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              <Sparkles style={{ width: 12, height: 12 }} />
              {postContent.trim() ? 'Generate from post' : 'Generate'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
