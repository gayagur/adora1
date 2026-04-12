import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { ArrowLeft, Download, Save, Loader2, Check, RefreshCw, Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// ─── Layout System ───────────────────────────────────────────────────────────
const LAYOUTS = {
  split_left: {
    label: 'Split Left', preview: '◧',
    textZone: { left: '0', top: '0', width: '48%', height: '100%', padding: '10%', align: 'left', justify: 'center' },
    imageZone: { left: '48%', top: '0', width: '52%', height: '100%' },
    logoPos: 'top-left',
  },
  split_right: {
    label: 'Split Right', preview: '◨',
    textZone: { left: '52%', top: '0', width: '48%', height: '100%', padding: '10%', align: 'left', justify: 'center' },
    imageZone: { left: '0', top: '0', width: '52%', height: '100%' },
    logoPos: 'top-right',
  },
  hero: {
    label: 'Hero', preview: '▣',
    textZone: { left: '0', top: '0', width: '100%', height: '100%', padding: '10%', align: 'center', justify: 'center' },
    imageZone: { left: '0', top: '0', width: '100%', height: '100%' },
    overlay: true, logoPos: 'top-left',
  },
  editorial: {
    label: 'Editorial', preview: '⊿',
    textZone: { left: '0', top: '0', width: '60%', height: '100%', padding: '8%', align: 'left', justify: 'flex-end', paddingBottom: '12%' },
    imageZone: { left: '0', top: '0', width: '100%', height: '100%' },
    overlay: true, overlayGradient: true, logoPos: 'top-left',
  },
  minimal: {
    label: 'Minimal', preview: '◻',
    textZone: { left: '0', top: '0', width: '100%', height: '100%', padding: '14%', align: 'center', justify: 'center' },
    imageZone: null, logoPos: 'top-center',
  },
  product: {
    label: 'Product', preview: '⊞',
    textZone: { left: '0', top: '0', width: '100%', height: '30%', padding: '7%', align: 'center', justify: 'center' },
    imageZone: { left: '5%', top: '28%', width: '90%', height: '66%' },
    logoPos: 'top-center',
  },
};

// ─── Style Modes ─────────────────────────────────────────────────────────────
const STYLES = {
  minimal: { label: 'Minimal', bg: '#ffffff', text: '#111', sub: 'rgba(0,0,0,0.4)', cta: '#111', ctaText: '#fff', headlineSize: 28, subSize: 13, weight: 500 },
  bold: { label: 'Bold', bg: '#0a0a0f', text: '#fff', sub: 'rgba(255,255,255,0.45)', cta: '#6c5ce7', ctaText: '#fff', headlineSize: 44, subSize: 15, weight: 800 },
  editorial: { label: 'Editorial', bg: '#f5f0eb', text: '#1a1a1a', sub: 'rgba(0,0,0,0.35)', cta: '#1a1a1a', ctaText: '#fff', headlineSize: 34, subSize: 14, weight: 600 },
  soft: { label: 'Soft', bg: '#faf8f5', text: '#2a2a2a', sub: 'rgba(0,0,0,0.3)', cta: '#8b6b4a', ctaText: '#fff', headlineSize: 30, subSize: 13, weight: 500 },
  dark: { label: 'Dark', bg: '#111118', text: '#fff', sub: 'rgba(255,255,255,0.4)', cta: '#6c5ce7', ctaText: '#fff', headlineSize: 36, subSize: 14, weight: 700 },
};

const FONT_PAIRS = [
  { id: 'inter', label: 'Modern', h: 'Inter', b: 'Inter' },
  { id: 'sora', label: 'Clean', h: 'Sora', b: 'Inter' },
  { id: 'playfair', label: 'Editorial', h: 'Playfair Display', b: 'DM Sans' },
  { id: 'space', label: 'Tech', h: 'Space Grotesk', b: 'Inter' },
];

// ─── Main RefineView ─────────────────────────────────────────────────────────
export default function RefineView({ asset, brand, onClose, onSave }) {
  const canvasRef = useRef(null);

  const [headline, setHeadline] = useState(asset.headline || '');
  const [subtext, setSubtext] = useState(asset.ad_copy || '');
  const [cta, setCta] = useState(asset.cta || '');
  const [image, setImage] = useState(asset.preview_image || null);
  const [layout, setLayout] = useState('hero');
  const [style, setStyle] = useState('bold');
  const [fontPair, setFontPair] = useState(FONT_PAIRS[0]);
  const [accentColor, setAccentColor] = useState(brand?.brand_colors?.[0] || '#6c5ce7');
  const [showLogo, setShowLogo] = useState(!!brand?.logo_url);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    const id = 'refine-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  const L = LAYOUTS[layout];
  const S = STYLES[style];
  const hasOverlay = L.overlay && image;
  const textCol = hasOverlay ? '#ffffff' : S.text;
  const subCol = hasOverlay ? 'rgba(255,255,255,0.55)' : S.sub;
  const colors = [...new Set([...(brand?.brand_colors || []), '#6c5ce7', '#111', '#fff'])].slice(0, 6);

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true); setEditingField(null);
    await new Promise(r => setTimeout(r, 80));
    const canvas = await html2canvas(canvasRef.current, { useCORS: true, allowTaint: true, scale: 2, logging: false, backgroundColor: null, imageTimeout: 30000 });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png'); a.download = 'creative.png'; a.click();
    setExporting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ headline, ad_copy: subtext, cta, preview_image: image });
    setSaving(false);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImage(file_url);
    e.target.value = '';
    toast.success('Image replaced');
  };

  const logoPos = {
    'top-left': 'top-[5%] left-[5%]',
    'top-right': 'top-[5%] right-[5%]',
    'top-center': 'top-[5%] left-1/2 -translate-x-1/2',
  }[L.logoPos] || 'top-[5%] left-[5%]';

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e12] flex flex-col">
      {/* ── Top Bar ─────────────────────────────────────── */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-white/[0.05] shrink-0">
        <button onClick={onClose} className="flex items-center gap-1.5 text-white/40 hover:text-white text-[12px] font-medium transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to grid
        </button>
        <span className="text-white/30 text-[11px] font-medium">Refine Mode</span>
        <div className="flex items-center gap-1.5">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1 h-[28px] px-3 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white text-[11px] font-medium transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
          </button>
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1 h-[28px] px-3 rounded-md bg-[#6c5ce7] hover:bg-[#5f4dd6] text-white text-[11px] font-medium transition-colors disabled:opacity-50">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>

      {/* ── Main: Preview + Panel ──────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[#111218]">
          <div className="w-full max-w-[480px]">
            <div ref={canvasRef} className="relative w-full overflow-hidden rounded-lg shadow-2xl shadow-black/50"
              style={{ paddingBottom: '100%', backgroundColor: S.bg }}>
              <div className="absolute inset-0">

                {/* Image zone */}
                {image && L.imageZone && (
                  <div className="absolute overflow-hidden" style={{
                    left: L.imageZone.left, top: L.imageZone.top,
                    width: L.imageZone.width, height: L.imageZone.height,
                  }}>
                    <img src={image} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  </div>
                )}

                {/* Overlay */}
                {hasOverlay && (
                  <div className="absolute" style={{
                    left: L.textZone.left, top: L.textZone.top,
                    width: L.textZone.width, height: L.textZone.height,
                    background: L.overlayGradient
                      ? 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 65%, transparent 100%)'
                      : 'rgba(0,0,0,0.38)',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Text zone */}
                <div className="absolute flex flex-col" style={{
                  left: L.textZone.left, top: L.textZone.top,
                  width: L.textZone.width, height: L.textZone.height,
                  padding: L.textZone.padding,
                  paddingBottom: L.textZone.paddingBottom || L.textZone.padding,
                  alignItems: L.textZone.align === 'center' ? 'center' : 'flex-start',
                  justifyContent: L.textZone.justify || 'center',
                  textAlign: L.textZone.align,
                }}>
                  {headline && (
                    <h2 className="leading-[1.1] mb-2 cursor-text" onClick={() => setEditingField('headline')}
                      style={{
                        color: textCol, fontSize: S.headlineSize,
                        fontFamily: `'${fontPair.h}', sans-serif`,
                        fontWeight: S.weight,
                        letterSpacing: S.weight >= 700 ? '-0.035em' : '-0.02em',
                        textShadow: hasOverlay ? '0 2px 16px rgba(0,0,0,0.3)' : 'none',
                        maxWidth: '100%', wordBreak: 'break-word',
                      }}>{headline}</h2>
                  )}
                  {subtext && (
                    <p className="leading-relaxed mb-4 cursor-text" onClick={() => setEditingField('subtext')}
                      style={{
                        color: subCol, fontSize: S.subSize,
                        fontFamily: `'${fontPair.b}', sans-serif`,
                        maxWidth: L.textZone.align === 'center' ? '80%' : '100%',
                        textShadow: hasOverlay ? '0 1px 6px rgba(0,0,0,0.2)' : 'none',
                      }}>{subtext}</p>
                  )}
                  {cta && (
                    <span className="inline-flex items-center font-semibold cursor-text" onClick={() => setEditingField('cta')}
                      style={{
                        backgroundColor: accentColor || S.cta, color: S.ctaText,
                        padding: '7px 20px', borderRadius: 999, fontSize: S.subSize * 0.85,
                        fontFamily: `'${fontPair.b}', sans-serif`,
                      }}>{cta}</span>
                  )}
                </div>

                {/* Logo */}
                {showLogo && brand?.logo_url && (
                  <div className={`absolute ${logoPos}`} style={{ width: '10%', minWidth: 24 }}>
                    <img src={brand.logo_url} alt="" className="w-full h-auto object-contain opacity-80" />
                  </div>
                )}
              </div>
            </div>
            <p className="text-center text-white/15 text-[10px] mt-3">Click text on canvas to edit</p>
          </div>
        </div>

        {/* ── Right Panel ──────────────────────────────── */}
        <div className="w-[260px] shrink-0 border-l border-white/[0.05] bg-[#0d0e12] overflow-y-auto p-4 space-y-5">

          {/* Layout */}
          <Section label="Layout">
            <div className="grid grid-cols-3 gap-1">
              {Object.entries(LAYOUTS).map(([key, cfg]) => (
                <button key={key} onClick={() => setLayout(key)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-lg transition-all text-[10px] font-medium ${
                    layout === key
                      ? 'bg-[#6c5ce7]/15 text-[#a29bfe] border border-[#6c5ce7]/30'
                      : 'bg-white/[0.02] text-white/30 border border-transparent hover:bg-white/[0.04] hover:text-white/50'
                  }`}>
                  <span className="text-base">{cfg.preview}</span>
                  {cfg.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Style */}
          <Section label="Style">
            <div className="space-y-0.5">
              {Object.entries(STYLES).map(([key, cfg]) => (
                <button key={key} onClick={() => setStyle(key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-[11px] font-medium ${
                    style === key ? 'bg-[#6c5ce7]/15 text-white' : 'text-white/30 hover:bg-white/[0.03] hover:text-white/50'
                  }`}>
                  {cfg.label}
                  {style === key && <Check className="w-3 h-3 text-[#6c5ce7]" />}
                </button>
              ))}
            </div>
          </Section>

          {/* Font */}
          <Section label="Typography">
            <div className="space-y-0.5">
              {FONT_PAIRS.map(fp => (
                <button key={fp.id} onClick={() => setFontPair(fp)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-[11px] ${
                    fontPair.id === fp.id ? 'bg-[#6c5ce7]/15 text-white font-medium' : 'text-white/30 hover:bg-white/[0.03] hover:text-white/50'
                  }`}>
                  <span style={{ fontFamily: `'${fp.h}', sans-serif` }}>{fp.label}</span>
                  {fontPair.id === fp.id && <Check className="w-3 h-3 text-[#6c5ce7]" />}
                </button>
              ))}
            </div>
          </Section>

          {/* Accent */}
          <Section label="Accent Color">
            <div className="flex gap-1.5">
              {colors.map(c => (
                <button key={c} onClick={() => setAccentColor(c)}
                  className={`w-6 h-6 rounded-md transition-all ${accentColor === c ? 'ring-2 ring-[#6c5ce7] ring-offset-1 ring-offset-[#0d0e12]' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </Section>

          {/* Content */}
          <Section label="Content">
            <div className="space-y-2">
              <FieldInput label="Headline" value={headline} onChange={setHeadline} max={80} />
              <FieldInput label="Subtext" value={subtext} onChange={setSubtext} max={200} multiline />
              <FieldInput label="CTA" value={cta} onChange={setCta} max={30} />
            </div>
          </Section>

          {/* Image */}
          <Section label="Image">
            {image && (
              <div className="relative rounded-lg overflow-hidden mb-2 aspect-video bg-white/[0.03]">
                <img src={image} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setImage(null)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded bg-black/50 flex items-center justify-center text-white/70 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/[0.03] hover:bg-white/[0.05] text-white/40 hover:text-white/60 text-[11px] cursor-pointer transition-colors border border-white/[0.05]">
              <Upload className="w-3 h-3" /> {image ? 'Replace image' : 'Upload image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
            </label>
          </Section>
        </div>
      </div>

      {/* ── Inline Edit Modal ──────────────────────────── */}
      {editingField && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setEditingField(null)}>
          <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }}
            className="bg-[#1a1b20] rounded-xl border border-white/[0.06] p-4 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white text-[13px] font-semibold capitalize">{editingField}</h3>
              <button onClick={() => setEditingField(null)} className="text-white/30 hover:text-white/60"><X className="w-3.5 h-3.5" /></button>
            </div>
            {editingField === 'headline' && <textarea autoFocus rows={2} className="w-full px-3 py-2 rounded-md bg-white/[0.05] border border-white/[0.08] text-white text-[13px] outline-none focus:border-[#6c5ce7]/40 resize-none" value={headline} onChange={e => setHeadline(e.target.value)} maxLength={80} />}
            {editingField === 'subtext' && <textarea autoFocus rows={3} className="w-full px-3 py-2 rounded-md bg-white/[0.05] border border-white/[0.08] text-white text-[13px] outline-none focus:border-[#6c5ce7]/40 resize-none" value={subtext} onChange={e => setSubtext(e.target.value)} maxLength={200} />}
            {editingField === 'cta' && <input autoFocus className="w-full px-3 py-2 rounded-md bg-white/[0.05] border border-white/[0.08] text-white text-[13px] outline-none focus:border-[#6c5ce7]/40" value={cta} onChange={e => setCta(e.target.value)} maxLength={30} />}
            <button onClick={() => setEditingField(null)} className="w-full mt-2.5 h-8 rounded-md bg-[#6c5ce7] text-white text-[11px] font-semibold">Done</button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/20 mb-2">{label}</p>
      {children}
    </div>
  );
}

function FieldInput({ label, value, onChange, max, multiline }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div>
      <p className="text-[10px] text-white/25 mb-0.5">{label}</p>
      <Tag className="w-full px-2.5 py-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-white text-[11px] outline-none focus:border-[#6c5ce7]/30 resize-none transition-colors"
        value={value} onChange={e => onChange(e.target.value)} maxLength={max}
        {...(multiline ? { rows: 2 } : {})} />
    </div>
  );
}
