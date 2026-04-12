import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Download, Save, Loader2, X, ChevronDown, Upload, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Layout System ───────────────────────────────────────────────────────────
// Each layout defines structural zones, NOT pixel positions.
// The user chooses a layout; the system enforces composition.

const LAYOUTS = {
  split_left: {
    label: 'Split — Text Left',
    description: 'Text on left, image fills right',
    preview: '◧',
    textZone: { left: '0', top: '0', width: '48%', height: '100%', padding: '10%', align: 'left', justify: 'center' },
    imageZone: { left: '48%', top: '0', width: '52%', height: '100%' },
    ctaAlign: 'left',
    logoPos: 'top-left',
  },
  split_right: {
    label: 'Split — Text Right',
    description: 'Image fills left, text on right',
    preview: '◨',
    textZone: { left: '52%', top: '0', width: '48%', height: '100%', padding: '10%', align: 'left', justify: 'center' },
    imageZone: { left: '0', top: '0', width: '52%', height: '100%' },
    ctaAlign: 'left',
    logoPos: 'top-right',
  },
  hero_overlay: {
    label: 'Hero Overlay',
    description: 'Full-bleed image with text overlay',
    preview: '▣',
    textZone: { left: '0', top: '0', width: '100%', height: '100%', padding: '10%', align: 'center', justify: 'center' },
    imageZone: { left: '0', top: '0', width: '100%', height: '100%' },
    overlay: true,
    ctaAlign: 'center',
    logoPos: 'top-left',
  },
  editorial: {
    label: 'Editorial',
    description: 'Asymmetric offset text over image',
    preview: '⊿',
    textZone: { left: '0', top: '0', width: '60%', height: '100%', padding: '8%', align: 'left', justify: 'flex-end', paddingBottom: '14%' },
    imageZone: { left: '0', top: '0', width: '100%', height: '100%' },
    overlay: true,
    overlayStyle: 'gradient-left',
    ctaAlign: 'left',
    logoPos: 'top-left',
  },
  minimal: {
    label: 'Minimal Poster',
    description: 'Clean space, centered content, no image',
    preview: '◻',
    textZone: { left: '0', top: '0', width: '100%', height: '100%', padding: '16%', align: 'center', justify: 'center' },
    imageZone: null,
    ctaAlign: 'center',
    logoPos: 'top-center',
  },
  product_top: {
    label: 'Product Focus',
    description: 'Headline top, image dominant below',
    preview: '⊞',
    textZone: { left: '0', top: '0', width: '100%', height: '35%', padding: '8%', align: 'center', justify: 'center' },
    imageZone: { left: '5%', top: '32%', width: '90%', height: '62%' },
    ctaAlign: 'center',
    logoPos: 'top-center',
  },
};

// ─── Creative Modes ──────────────────────────────────────────────────────────
// Each mode configures typography scale, colors, and spacing density.

const CREATIVE_MODES = {
  minimal: {
    label: 'Minimal',
    headlineSize: 'text-3xl',
    headlineSizePx: 30,
    subtextSizePx: 14,
    headlineWeight: 'font-medium',
    headlineTracking: 'tracking-tight',
    bgClass: 'bg-white',
    textColor: '#111111',
    subtextColor: 'rgba(0,0,0,0.45)',
    ctaBg: '#111111',
    ctaText: '#ffffff',
  },
  bold: {
    label: 'Bold',
    headlineSize: 'text-5xl',
    headlineSizePx: 48,
    subtextSizePx: 16,
    headlineWeight: 'font-black',
    headlineTracking: 'tracking-tighter',
    bgClass: 'bg-[#0a0a0f]',
    textColor: '#ffffff',
    subtextColor: 'rgba(255,255,255,0.5)',
    ctaBg: '#7c3aed',
    ctaText: '#ffffff',
  },
  editorial: {
    label: 'Editorial',
    headlineSize: 'text-4xl',
    headlineSizePx: 36,
    subtextSizePx: 15,
    headlineWeight: 'font-semibold',
    headlineTracking: 'tracking-tight',
    bgClass: 'bg-[#f5f0eb]',
    textColor: '#1a1a1a',
    subtextColor: 'rgba(0,0,0,0.4)',
    ctaBg: '#1a1a1a',
    ctaText: '#ffffff',
  },
  product: {
    label: 'Product',
    headlineSize: 'text-3xl',
    headlineSizePx: 30,
    subtextSizePx: 14,
    headlineWeight: 'font-bold',
    headlineTracking: 'tracking-tight',
    bgClass: 'bg-gradient-to-br from-gray-50 to-gray-100',
    textColor: '#111111',
    subtextColor: 'rgba(0,0,0,0.5)',
    ctaBg: '#7c3aed',
    ctaText: '#ffffff',
  },
  soft: {
    label: 'Soft',
    headlineSize: 'text-3xl',
    headlineSizePx: 32,
    subtextSizePx: 14,
    headlineWeight: 'font-medium',
    headlineTracking: 'tracking-normal',
    bgClass: 'bg-[#faf8f5]',
    textColor: '#2a2a2a',
    subtextColor: 'rgba(0,0,0,0.35)',
    ctaBg: '#8b6b4a',
    ctaText: '#ffffff',
  },
};

// ─── Font Pairings ───────────────────────────────────────────────────────────
const FONT_PAIRS = [
  { id: 'modern', label: 'Modern', headline: 'Inter', body: 'Inter', description: 'Clean & versatile' },
  { id: 'editorial', label: 'Editorial', headline: 'Playfair Display', body: 'DM Sans', description: 'Magazine feel' },
  { id: 'bold', label: 'Impact', headline: 'Sora', body: 'Inter', description: 'Strong & clear' },
  { id: 'luxury', label: 'Luxury', headline: 'Playfair Display', body: 'Inter', description: 'Elegant & refined' },
  { id: 'tech', label: 'Tech', headline: 'Space Grotesk', body: 'Inter', description: 'Precise & modern' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', pad: 100 },
  { id: '16:9', label: '16:9', pad: 56.25 },
  { id: '9:16', label: '9:16', pad: 177.78 },
  { id: '4:5', label: '4:5', pad: 125 },
];

// ─── Google Fonts loader ─────────────────────────────────────────────────────
function useGoogleFonts() {
  useEffect(() => {
    const id = 'structured-canvas-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);
}

// ─── White background removal for logos ──────────────────────────────────────
function useProcessedLogo(logoUrl) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!logoUrl) { setUrl(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) {
        if (d.data[i] > 220 && d.data[i+1] > 220 && d.data[i+2] > 220) {
          d.data[i+3] = Math.round(Math.max(0, (255 - (d.data[i] + d.data[i+1] + d.data[i+2]) / 3) * 2));
        }
      }
      ctx.putImageData(d, 0, 0);
      setUrl(c.toDataURL('image/png'));
    };
    img.onerror = () => setUrl(logoUrl);
    img.src = logoUrl;
  }, [logoUrl]);
  return url;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function CanvasEditor({
  initialHeadline = '', initialSubtext = '', initialCta = '',
  initialImage = null, logoUrl = null, brandColors = [],
  screenshots = [], onClose, onSave,
}) {
  useGoogleFonts();
  const canvasRef = useRef(null);

  // Content state
  const [headline, setHeadline] = useState(initialHeadline);
  const [subtext, setSubtext] = useState(initialSubtext);
  const [cta, setCta] = useState(initialCta);
  const [bgImage, setBgImage] = useState(initialImage);

  // Structure state
  const [layout, setLayout] = useState('hero_overlay');
  const [mode, setMode] = useState('bold');
  const [fontPair, setFontPair] = useState(FONT_PAIRS[0]);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [accentColor, setAccentColor] = useState(brandColors[0] || '#7c3aed');
  const [showLogo, setShowLogo] = useState(!!logoUrl);
  const [activeLogo, setActiveLogo] = useState(logoUrl);

  // UI state
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [activePanel, setActivePanel] = useState('layout');

  const processedLogo = useProcessedLogo(activeLogo);
  const modeConfig = CREATIVE_MODES[mode];
  const layoutConfig = LAYOUTS[layout];

  // Derived colors — mode drives defaults, but image overlay overrides
  const hasOverlay = layoutConfig.overlay && bgImage;
  const textColor = hasOverlay ? '#ffffff' : modeConfig.textColor;
  const subtextColor = hasOverlay ? 'rgba(255,255,255,0.6)' : modeConfig.subtextColor;
  const ctaBg = accentColor || modeConfig.ctaBg;

  // Background style
  const canvasBg = bgImage && layoutConfig.imageZone
    ? {} // Image handles background
    : { background: modeConfig.bgClass.includes('gradient')
        ? 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
        : modeConfig.bgClass.includes('#') ? modeConfig.bgClass.match(/#[0-9a-fA-F]+/)?.[0] || '#ffffff' : '#ffffff'
      };

  const bgColorMap = {
    'bg-white': '#ffffff',
    'bg-[#0a0a0f]': '#0a0a0f',
    'bg-[#f5f0eb]': '#f5f0eb',
    'bg-[#faf8f5]': '#faf8f5',
  };

  const resolvedBg = bgColorMap[modeConfig.bgClass] || '#ffffff';

  // Export
  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    setEditingField(null);
    await new Promise(r => setTimeout(r, 100));
    const canvas = await html2canvas(canvasRef.current, {
      useCORS: true, allowTaint: true, scale: 2, logging: false, backgroundColor: null, imageTimeout: 30000,
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = 'creative.png'; a.click();
    setExporting(false);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    await onSave({ headline, ad_copy: subtext, cta, preview_image: bgImage });
    setSaving(false);
    toast.success('Saved');
  };

  const allImages = [
    ...(screenshots || []).map((url, i) => ({ url, label: `Screenshot ${i + 1}` })),
    ...(initialImage && !screenshots?.includes(initialImage) ? [{ url: initialImage, label: 'AI Generated' }] : []),
  ];

  const colorSwatches = [...new Set([...brandColors, '#7c3aed', '#2563eb', '#059669', '#ef4444', '#111111', '#ffffff'])].slice(0, 8);

  // Logo position based on layout
  const logoPositionClass = {
    'top-left': 'top-[6%] left-[6%]',
    'top-right': 'top-[6%] right-[6%]',
    'top-center': 'top-[6%] left-1/2 -translate-x-1/2',
  }[layoutConfig.logoPos] || 'top-[6%] left-[6%]';

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0f13] flex flex-col">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="h-[52px] flex items-center justify-between px-5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-white/40 hover:text-white text-[13px] font-medium transition-colors">
            ← Back
          </button>
          <div className="w-px h-4 bg-white/[0.08]" />
          <span className="text-white/60 text-[13px] font-medium">Creative Studio</span>
        </div>

        {/* Aspect ratio pills */}
        <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
          {ASPECT_RATIOS.map(ar => (
            <button key={ar.id} onClick={() => setAspectRatio(ar)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                aspectRatio.id === ar.id ? 'bg-white text-gray-900' : 'text-white/40 hover:text-white/70'
              }`}>
              {ar.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {onSave && (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 h-[32px] px-4 rounded-[8px] bg-white/[0.08] hover:bg-white/[0.12] text-white text-[12px] font-medium transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save
            </button>
          )}
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 h-[32px] px-4 rounded-[8px] bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-colors disabled:opacity-50">
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* ── Main Area ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Canvas Preview ──────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-10 bg-[#131419]">
          <div className="relative w-full" style={{ maxWidth: aspectRatio.pad > 120 ? '340px' : '560px' }}>
            <div
              ref={canvasRef}
              className="relative w-full overflow-hidden rounded-xl shadow-2xl shadow-black/40"
              style={{ paddingBottom: `${aspectRatio.pad}%`, backgroundColor: resolvedBg }}
            >
              <div className="absolute inset-0">

                {/* Image Zone */}
                {bgImage && layoutConfig.imageZone && (
                  <div className="absolute overflow-hidden" style={{
                    left: layoutConfig.imageZone.left,
                    top: layoutConfig.imageZone.top,
                    width: layoutConfig.imageZone.width,
                    height: layoutConfig.imageZone.height,
                  }}>
                    <img src={bgImage} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  </div>
                )}

                {/* Overlay */}
                {hasOverlay && (
                  <div className="absolute" style={{
                    left: layoutConfig.textZone.left,
                    top: layoutConfig.textZone.top,
                    width: layoutConfig.textZone.width,
                    height: layoutConfig.textZone.height,
                    background: layoutConfig.overlayStyle === 'gradient-left'
                      ? 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)'
                      : 'rgba(0,0,0,0.4)',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Text Zone */}
                <div className="absolute flex flex-col" style={{
                  left: layoutConfig.textZone.left,
                  top: layoutConfig.textZone.top,
                  width: layoutConfig.textZone.width,
                  height: layoutConfig.textZone.height,
                  padding: layoutConfig.textZone.padding,
                  paddingBottom: layoutConfig.textZone.paddingBottom || layoutConfig.textZone.padding,
                  alignItems: layoutConfig.textZone.align === 'center' ? 'center' : 'flex-start',
                  justifyContent: layoutConfig.textZone.justify || 'center',
                  textAlign: layoutConfig.textZone.align,
                }}>
                  {/* Headline */}
                  {headline && (
                    <h2
                      className="leading-[1.1] mb-2 cursor-text"
                      style={{
                        color: textColor,
                        fontSize: modeConfig.headlineSizePx,
                        fontFamily: `'${fontPair.headline}', sans-serif`,
                        fontWeight: mode === 'bold' ? 800 : mode === 'minimal' ? 500 : 700,
                        letterSpacing: mode === 'bold' ? '-0.04em' : '-0.02em',
                        textShadow: hasOverlay ? '0 2px 20px rgba(0,0,0,0.4)' : 'none',
                        maxWidth: '100%',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                      onClick={() => setEditingField('headline')}
                    >
                      {headline}
                    </h2>
                  )}

                  {/* Subtext */}
                  {subtext && (
                    <p
                      className="leading-relaxed mb-4 cursor-text"
                      style={{
                        color: subtextColor,
                        fontSize: modeConfig.subtextSizePx,
                        fontFamily: `'${fontPair.body}', sans-serif`,
                        fontWeight: 400,
                        textShadow: hasOverlay ? '0 1px 8px rgba(0,0,0,0.3)' : 'none',
                        maxWidth: layoutConfig.textZone.align === 'center' ? '80%' : '100%',
                      }}
                      onClick={() => setEditingField('subtext')}
                    >
                      {subtext}
                    </p>
                  )}

                  {/* CTA */}
                  {cta && (
                    <span
                      className="inline-flex items-center font-semibold cursor-text"
                      style={{
                        backgroundColor: ctaBg,
                        color: modeConfig.ctaText,
                        padding: '8px 24px',
                        borderRadius: 999,
                        fontSize: modeConfig.subtextSizePx * 0.85,
                        fontFamily: `'${fontPair.body}', sans-serif`,
                      }}
                      onClick={() => setEditingField('cta')}
                    >
                      {cta}
                    </span>
                  )}
                </div>

                {/* Logo */}
                {showLogo && processedLogo && (
                  <div className={`absolute ${logoPositionClass}`} style={{ width: '12%', minWidth: 28 }}>
                    <img src={processedLogo} alt="Logo" className="w-full h-auto object-contain" style={{ opacity: 0.9 }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel ─────────────────────────────────────────────────── */}
        <div className="w-[300px] shrink-0 border-l border-white/[0.06] bg-[#0e0f13] flex flex-col overflow-hidden">

          {/* Panel tabs */}
          <div className="flex border-b border-white/[0.06] shrink-0">
            {[
              { id: 'layout', label: 'Layout' },
              { id: 'style', label: 'Style' },
              { id: 'content', label: 'Content' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActivePanel(tab.id)}
                className={`flex-1 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                  activePanel === tab.id ? 'text-white border-b-2 border-violet-500' : 'text-white/30 hover:text-white/50'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* ── LAYOUT PANEL ─────────────────────────────────────────────── */}
            {activePanel === 'layout' && (
              <>
                <PanelSection label="Composition">
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(LAYOUTS).map(([key, cfg]) => (
                      <button key={key} onClick={() => setLayout(key)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          layout === key
                            ? 'border-violet-500/50 bg-violet-500/10 text-white'
                            : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:text-white/60'
                        }`}>
                        <span className="text-lg">{cfg.preview}</span>
                        <span className="text-[10px] font-medium">{cfg.label}</span>
                      </button>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection label="Creative Mode">
                  <div className="space-y-1">
                    {Object.entries(CREATIVE_MODES).map(([key, cfg]) => (
                      <button key={key} onClick={() => setMode(key)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all ${
                          mode === key
                            ? 'bg-violet-500/15 text-white border border-violet-500/30'
                            : 'text-white/40 hover:bg-white/[0.04] hover:text-white/60 border border-transparent'
                        }`}>
                        <span className="text-[12px] font-medium">{cfg.label}</span>
                        {mode === key && <Check className="w-3.5 h-3.5 text-violet-400" />}
                      </button>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection label="Aspect Ratio">
                  <div className="flex gap-1">
                    {ASPECT_RATIOS.map(ar => (
                      <button key={ar.id} onClick={() => setAspectRatio(ar)}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                          aspectRatio.id === ar.id
                            ? 'bg-white/[0.1] text-white'
                            : 'text-white/30 hover:text-white/50'
                        }`}>
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </PanelSection>
              </>
            )}

            {/* ── STYLE PANEL ──────────────────────────────────────────────── */}
            {activePanel === 'style' && (
              <>
                <PanelSection label="Font Pairing">
                  <div className="space-y-1">
                    {FONT_PAIRS.map(fp => (
                      <button key={fp.id} onClick={() => setFontPair(fp)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all ${
                          fontPair.id === fp.id
                            ? 'bg-violet-500/15 text-white border border-violet-500/30'
                            : 'text-white/40 hover:bg-white/[0.04] hover:text-white/60 border border-transparent'
                        }`}>
                        <div>
                          <p className="text-[12px] font-medium text-left" style={{ fontFamily: `'${fp.headline}', sans-serif` }}>{fp.label}</p>
                          <p className="text-[10px] text-white/25 mt-0.5">{fp.headline} + {fp.body}</p>
                        </div>
                        {fontPair.id === fp.id && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection label="Accent Color">
                  <div className="flex flex-wrap gap-2">
                    {colorSwatches.map(c => (
                      <button key={c} onClick={() => setAccentColor(c)}
                        className={`w-7 h-7 rounded-lg transition-all ${
                          accentColor === c ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-[#0e0f13] scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </PanelSection>

                <PanelSection label="Logo">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-white/40">Show Logo</span>
                    <ToggleSwitch on={showLogo} onChange={setShowLogo} />
                  </div>
                  {showLogo && (
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] text-white/50 hover:text-white/70 text-[11px] cursor-pointer transition-colors border border-white/[0.06]">
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      {activeLogo ? 'Replace Logo' : 'Upload Logo'}
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        setActiveLogo(file_url);
                        setShowLogo(true);
                        e.target.value = '';
                      }} />
                    </label>
                  )}
                </PanelSection>
              </>
            )}

            {/* ── CONTENT PANEL ────────────────────────────────────────────── */}
            {activePanel === 'content' && (
              <>
                <PanelSection label="Headline">
                  <textarea
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] placeholder-white/20 outline-none focus:border-violet-500/40 resize-none transition-colors"
                    rows={2}
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    placeholder="Enter headline..."
                    maxLength={80}
                  />
                  <p className="text-[10px] text-white/20 mt-1">{headline.length}/80 characters</p>
                </PanelSection>

                <PanelSection label="Subtext">
                  <textarea
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] placeholder-white/20 outline-none focus:border-violet-500/40 resize-none transition-colors"
                    rows={3}
                    value={subtext}
                    onChange={e => setSubtext(e.target.value)}
                    placeholder="Supporting text..."
                    maxLength={200}
                  />
                </PanelSection>

                <PanelSection label="Call to Action">
                  <input
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] placeholder-white/20 outline-none focus:border-violet-500/40 transition-colors"
                    value={cta}
                    onChange={e => setCta(e.target.value)}
                    placeholder="e.g. Get Started"
                    maxLength={30}
                  />
                </PanelSection>

                <PanelSection label="Image">
                  {allImages.length > 0 ? (
                    <div className="space-y-1.5">
                      {allImages.map(({ url, label }) => (
                        <button key={url} onClick={() => setBgImage(url)}
                          className={`relative w-full rounded-lg overflow-hidden border-2 transition-all ${
                            bgImage === url ? 'border-violet-400' : 'border-white/[0.06] hover:border-white/[0.12]'
                          }`} style={{ paddingBottom: '50%' }}>
                          <img src={url} alt={label} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                            <p className="text-[10px] text-white/80 font-medium">{label}</p>
                          </div>
                          {bgImage === url && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                      <button onClick={() => setBgImage(null)}
                        className={`w-full px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                          !bgImage ? 'bg-white/[0.08] text-white/60' : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06] hover:text-white/50'
                        }`}>
                        No Image
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-white/20">No images available</p>
                  )}
                </PanelSection>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Inline Edit Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingField(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1b20] rounded-2xl border border-white/[0.08] p-5 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-[14px] font-semibold capitalize">{editingField}</h3>
                <button onClick={() => setEditingField(null)} className="w-6 h-6 rounded-lg hover:bg-white/[0.08] flex items-center justify-center transition-colors">
                  <X className="w-3.5 h-3.5 text-white/40" />
                </button>
              </div>
              {editingField === 'headline' && (
                <textarea
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-[14px] placeholder-white/20 outline-none focus:border-violet-500/40 resize-none"
                  rows={2}
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  maxLength={80}
                />
              )}
              {editingField === 'subtext' && (
                <textarea
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-[14px] placeholder-white/20 outline-none focus:border-violet-500/40 resize-none"
                  rows={3}
                  value={subtext}
                  onChange={e => setSubtext(e.target.value)}
                  maxLength={200}
                />
              )}
              {editingField === 'cta' && (
                <input
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-[14px] placeholder-white/20 outline-none focus:border-violet-500/40"
                  value={cta}
                  onChange={e => setCta(e.target.value)}
                  maxLength={30}
                />
              )}
              <button onClick={() => setEditingField(null)}
                className="w-full mt-3 h-9 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-semibold transition-colors">
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function PanelSection({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/25 mb-2.5">{label}</p>
      {children}
    </div>
  );
}

function ToggleSwitch({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${on ? 'bg-violet-600' : 'bg-white/[0.12]'}`}>
      <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}
