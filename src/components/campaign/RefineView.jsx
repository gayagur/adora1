import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { ArrowLeft, Download, Save, Loader2, Check, Upload, X, Search, GripVertical } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT SYSTEM (preserved — this is the structural foundation)
// ═══════════════════════════════════════════════════════════════════════════════

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

const STYLES = {
  minimal: { label: 'Minimal', bg: '#ffffff', text: '#111', sub: 'rgba(0,0,0,0.4)', cta: '#111', ctaText: '#fff', headlineSize: 28, subSize: 13, weight: 500 },
  bold: { label: 'Bold', bg: '#0a0a0f', text: '#fff', sub: 'rgba(255,255,255,0.45)', cta: '#6c5ce7', ctaText: '#fff', headlineSize: 44, subSize: 15, weight: 800 },
  editorial: { label: 'Editorial', bg: '#f5f0eb', text: '#1a1a1a', sub: 'rgba(0,0,0,0.35)', cta: '#1a1a1a', ctaText: '#fff', headlineSize: 34, subSize: 14, weight: 600 },
  soft: { label: 'Soft', bg: '#faf8f5', text: '#2a2a2a', sub: 'rgba(0,0,0,0.3)', cta: '#8b6b4a', ctaText: '#fff', headlineSize: 30, subSize: 13, weight: 500 },
  dark: { label: 'Dark', bg: '#111118', text: '#fff', sub: 'rgba(255,255,255,0.4)', cta: '#6c5ce7', ctaText: '#fff', headlineSize: 36, subSize: 14, weight: 700 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FONT LIBRARY (expanded — categorized, searchable)
// ═══════════════════════════════════════════════════════════════════════════════

const FONT_LIBRARY = {
  'Modern Sans': [
    { label: 'Inter', value: 'Inter' },
    { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans' },
    { label: 'DM Sans', value: 'DM Sans' },
    { label: 'Manrope', value: 'Manrope' },
    { label: 'Sora', value: 'Sora' },
    { label: 'Outfit', value: 'Outfit' },
    { label: 'Figtree', value: 'Figtree' },
  ],
  'Geometric': [
    { label: 'Space Grotesk', value: 'Space Grotesk' },
    { label: 'Poppins', value: 'Poppins' },
    { label: 'Montserrat', value: 'Montserrat' },
    { label: 'Rubik', value: 'Rubik' },
    { label: 'Work Sans', value: 'Work Sans' },
    { label: 'Jost', value: 'Jost' },
  ],
  'Editorial Serif': [
    { label: 'Playfair Display', value: 'Playfair Display' },
    { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
    { label: 'Libre Baskerville', value: 'Libre Baskerville' },
    { label: 'Lora', value: 'Lora' },
    { label: 'EB Garamond', value: 'EB Garamond' },
    { label: 'Merriweather', value: 'Merriweather' },
  ],
  'Bold Display': [
    { label: 'Bebas Neue', value: 'Bebas Neue' },
    { label: 'Oswald', value: 'Oswald' },
    { label: 'Anton', value: 'Anton' },
    { label: 'Archivo Black', value: 'Archivo Black' },
    { label: 'Barlow Condensed', value: 'Barlow Condensed' },
  ],
};

const ALL_FONTS = Object.values(FONT_LIBRARY).flat();

// ═══════════════════════════════════════════════════════════════════════════════
// FRAME SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

const FRAMES = {
  none: { label: 'None' },
  border: { label: 'Border', style: { border: '2px solid rgba(255,255,255,0.15)', borderRadius: 8 } },
  editorial: { label: 'Editorial', style: { border: '4px solid rgba(255,255,255,0.08)', borderRadius: 2 } },
  card: { label: 'Card', style: { borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' } },
  shadow: { label: 'Float', style: { borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)' } },
  iphone: { label: 'iPhone', device: 'iphone' },
  laptop: { label: 'Laptop', device: 'laptop' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTRAINED DRAG HOOK
// ═══════════════════════════════════════════════════════════════════════════════

function useFreeDrag(canvasRef) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const start = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  const onPointerDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragging.current = true;
    start.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };

    const onMove = (ev) => {
      if (!dragging.current) return;
      const r = canvasRef.current?.getBoundingClientRect();
      if (!r) return;
      const dx = ((ev.clientX - start.current.mx) / r.width) * 100;
      const dy = ((ev.clientY - start.current.my) / r.height) * 100;
      setOffset({ x: start.current.ox + dx, y: start.current.oy + dy });
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [canvasRef, offset]);

  return [offset, setOffset, onPointerDown];
}

// ═══════════════════════════════════════════════════════════════════════════════
// FONT LOADER
// ═══════════════════════════════════════════════════════════════════════════════

function useFontLoader() {
  useEffect(() => {
    const id = 'refine-fonts-v2';
    if (document.getElementById(id)) return;
    const families = ALL_FONTS.map(f => f.value.replace(/ /g, '+')).join('&family=');
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${ALL_FONTS.map(f => `family=${f.value.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900`).join('&')}&display=swap`;
    document.head.appendChild(link);
  }, []);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN REFINE VIEW
// ═══════════════════════════════════════════════════════════════════════════════

export default function RefineView({ asset, brand, onClose, onSave }) {
  useFontLoader();
  const canvasRef = useRef(null);

  // ── Content ────────────────────────────────────────────────────────────────
  const [headline, setHeadline] = useState(asset.headline || '');
  const [subtext, setSubtext] = useState(asset.ad_copy || '');
  const [cta, setCta] = useState(asset.cta || '');
  const [image, setImage] = useState(asset.preview_image || null);

  // ── Structure ──────────────────────────────────────────────────────────────
  const [layout, setLayout] = useState('hero');
  const [style, setStyle] = useState('bold');
  const [headlineFont, setHeadlineFont] = useState('Inter');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [accentColor, setAccentColor] = useState(brand?.brand_colors?.[0] || '#6c5ce7');
  const [frame, setFrame] = useState('none');

  // ── Text Effects ───────────────────────────────────────────────────────────
  const [txtShadow, setTxtShadow] = useState(false);
  const [txtShadowColor, setTxtShadowColor] = useState('#000000');
  const [txtShadowBlur, setTxtShadowBlur] = useState(12);
  const [txtStroke, setTxtStroke] = useState(false);
  const [txtStrokeColor, setTxtStrokeColor] = useState('#000000');
  const [txtStrokeWidth, setTxtStrokeWidth] = useState(1);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.1);
  const [textTransform, setTextTransform] = useState('none');
  const [headlineOpacity, setHeadlineOpacity] = useState(1);

  // ── Image Effects ──────────────────────────────────────────────────────────
  const [imgOpacity, setImgOpacity] = useState(1);
  const [imgBlur, setImgBlur] = useState(0);
  const [imgBrightness, setImgBrightness] = useState(100);
  const [imgContrast, setImgContrast] = useState(100);
  const [imgSaturation, setImgSaturation] = useState(100);
  const [imgGrayscale, setImgGrayscale] = useState(0);
  const [imgRadius, setImgRadius] = useState(0);

  // ── Logo ───────────────────────────────────────────────────────────────────
  const [logoUrl, setLogoUrl] = useState(brand?.logo_url || null);
  const [showLogo, setShowLogo] = useState(!!brand?.logo_url);
  const [logoSize, setLogoSize] = useState(10);
  const [logoOpacity, setLogoOpacity] = useState(0.85);

  // ── Constrained Drag Offsets ───────────────────────────────────────────────
  const [headlineOff, setHeadlineOff, headlineDrag] = useFreeDrag(canvasRef);
  const [subtextOff, setSubtextOff, subtextDrag] = useFreeDrag(canvasRef);
  const [ctaOff, setCtaOff, ctaDrag] = useFreeDrag(canvasRef);
  const [logoOff, setLogoOff, logoDrag] = useFreeDrag(canvasRef);

  // ── UI State ───────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [panel, setPanel] = useState('layout');
  const [fontSearch, setFontSearch] = useState('');
  const [fontTarget, setFontTarget] = useState('headline'); // headline | body

  // Reset offsets on layout change
  useEffect(() => {
    setHeadlineOff({ x: 0, y: 0 }); setSubtextOff({ x: 0, y: 0 });
    setCtaOff({ x: 0, y: 0 }); setLogoOff({ x: 0, y: 0 });
  }, [layout]);

  const L = LAYOUTS[layout];
  const S = STYLES[style];
  const hasOverlay = L.overlay && image;
  const textCol = hasOverlay ? '#ffffff' : S.text;
  const subCol = hasOverlay ? 'rgba(255,255,255,0.55)' : S.sub;
  const colors = [...new Set([...(brand?.brand_colors || []), '#6c5ce7', '#2563eb', '#059669', '#111', '#fff'])].slice(0, 8);

  // Text shadow CSS
  const headlineShadow = txtShadow ? `0 2px ${txtShadowBlur}px ${txtShadowColor}` : (hasOverlay ? '0 2px 16px rgba(0,0,0,0.3)' : 'none');
  const headlineStroke = txtStroke ? { WebkitTextStroke: `${txtStrokeWidth}px ${txtStrokeColor}`, paintOrder: 'stroke fill' } : {};

  // Image filter CSS
  const imgFilter = `blur(${imgBlur}px) brightness(${imgBrightness}%) contrast(${imgContrast}%) saturate(${imgSaturation}%) grayscale(${imgGrayscale}%)`;

  // Frame config
  const frameConfig = FRAMES[frame];
  const isDeviceFrame = frameConfig?.device;

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

  const handleUpload = async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (target === 'logo') setLogoUrl(file_url);
    else setImage(file_url);
    e.target.value = '';
    toast.success(target === 'logo' ? 'Logo updated' : 'Image replaced');
  };

  const logoPositionClass = {
    'top-left': 'top-[5%] left-[5%]',
    'top-right': 'top-[5%] right-[5%]',
    'top-center': 'top-[5%] left-1/2 -translate-x-1/2',
  }[L.logoPos] || 'top-[5%] left-[5%]';

  // Filtered fonts for search
  const filteredFonts = fontSearch.trim()
    ? ALL_FONTS.filter(f => f.label.toLowerCase().includes(fontSearch.toLowerCase()))
    : null;

  const PANELS = [
    { id: 'layout', label: 'Layout' },
    { id: 'text', label: 'Text' },
    { id: 'image', label: 'Image' },
    { id: 'logo', label: 'Logo' },
    { id: 'style', label: 'Style' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e12] flex flex-col">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-white/[0.05] shrink-0">
        <button onClick={onClose} className="flex items-center gap-1.5 text-white/40 hover:text-white text-[12px] font-medium transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to grid
        </button>
        <span className="text-white/30 text-[11px] font-medium">Refine · Drag elements to reposition</span>
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

      <div className="flex flex-1 overflow-hidden">
        {/* ── Canvas Preview ────────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[#111218]" onClick={() => setEditingField(null)}>
          <div className="w-full max-w-[480px]">
            <div ref={canvasRef} className="relative w-full overflow-hidden rounded-lg shadow-2xl shadow-black/50"
              style={{ paddingBottom: '100%', backgroundColor: S.bg }}>
              <div className="absolute inset-0">

                {/* ── Image Zone ──────────────────────────────────────────── */}
                {image && L.imageZone && (
                  <div className="absolute overflow-hidden" style={{
                    left: L.imageZone.left, top: L.imageZone.top,
                    width: L.imageZone.width, height: L.imageZone.height,
                  }}>
                    {isDeviceFrame ? (
                      <DeviceFrame type={frameConfig.device}>
                        <img src={image} alt="" className="w-full h-full object-cover" crossOrigin="anonymous"
                          style={{ filter: imgFilter, borderRadius: imgRadius, opacity: imgOpacity }} />
                      </DeviceFrame>
                    ) : (
                      <div style={frameConfig?.style || {}}>
                        <img src={image} alt="" className="w-full h-full object-cover" crossOrigin="anonymous"
                          style={{ filter: imgFilter, borderRadius: imgRadius, opacity: imgOpacity, ...(frameConfig?.style || {}) }} />
                      </div>
                    )}
                  </div>
                )}

                {/* ── Overlay ──────────────────────────────────────────────── */}
                {hasOverlay && (
                  <div className="absolute pointer-events-none" style={{
                    left: L.textZone.left, top: L.textZone.top,
                    width: L.textZone.width, height: L.textZone.height,
                    background: L.overlayGradient
                      ? 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 65%, transparent 100%)'
                      : 'rgba(0,0,0,0.38)',
                  }} />
                )}

                {/* ── Text Zone ─────────────────────────────────────────────── */}
                <div className="absolute flex flex-col" style={{
                  left: L.textZone.left, top: L.textZone.top,
                  width: L.textZone.width, height: L.textZone.height,
                  padding: L.textZone.padding,
                  paddingBottom: L.textZone.paddingBottom || L.textZone.padding,
                  alignItems: L.textZone.align === 'center' ? 'center' : 'flex-start',
                  justifyContent: L.textZone.justify || 'center',
                  textAlign: L.textZone.align,
                }}>
                  {/* Headline — draggable */}
                  {headline && (
                    <div style={{ transform: `translate(${headlineOff.x}%, ${headlineOff.y}%)` }}
                      onPointerDown={headlineDrag} className="cursor-grab active:cursor-grabbing touch-none select-none">
                      <h2 className="leading-none mb-2" onClick={(e) => { e.stopPropagation(); setEditingField('headline'); }}
                        style={{
                          color: textCol, fontSize: S.headlineSize,
                          fontFamily: `'${headlineFont}', sans-serif`,
                          fontWeight: S.weight,
                          letterSpacing: `${letterSpacing}em`,
                          lineHeight: lineHeight,
                          textTransform: textTransform,
                          opacity: headlineOpacity,
                          textShadow: headlineShadow,
                          ...headlineStroke,
                          maxWidth: '100%', wordBreak: 'break-word',
                        }}>{headline}</h2>
                    </div>
                  )}

                  {/* Subtext — draggable */}
                  {subtext && (
                    <div style={{ transform: `translate(${subtextOff.x}%, ${subtextOff.y}%)` }}
                      onPointerDown={subtextDrag} className="cursor-grab active:cursor-grabbing touch-none select-none">
                      <p className="leading-relaxed mb-4" onClick={(e) => { e.stopPropagation(); setEditingField('subtext'); }}
                        style={{
                          color: subCol, fontSize: S.subSize,
                          fontFamily: `'${bodyFont}', sans-serif`,
                          maxWidth: L.textZone.align === 'center' ? '80%' : '100%',
                          textShadow: hasOverlay ? '0 1px 6px rgba(0,0,0,0.2)' : 'none',
                        }}>{subtext}</p>
                    </div>
                  )}

                  {/* CTA — draggable */}
                  {cta && (
                    <div style={{ transform: `translate(${ctaOff.x}%, ${ctaOff.y}%)` }}
                      onPointerDown={ctaDrag} className="cursor-grab active:cursor-grabbing touch-none select-none">
                      <span className="inline-flex items-center font-semibold"
                        onClick={(e) => { e.stopPropagation(); setEditingField('cta'); }}
                        style={{
                          backgroundColor: accentColor || S.cta, color: S.ctaText,
                          padding: '7px 20px', borderRadius: 999, fontSize: S.subSize * 0.85,
                          fontFamily: `'${bodyFont}', sans-serif`,
                        }}>{cta}</span>
                    </div>
                  )}
                </div>

                {/* ── Logo — draggable ─────────────────────────────────────── */}
                {showLogo && logoUrl && (
                  <div className={`absolute ${logoPositionClass} cursor-grab active:cursor-grabbing touch-none select-none`}
                    style={{ width: `${logoSize}%`, minWidth: 20, transform: `translate(${logoOff.x}%, ${logoOff.y}%)` }}
                    onPointerDown={logoDrag}>
                    <img src={logoUrl} alt="" className="w-full h-auto object-contain pointer-events-none"
                      style={{ opacity: logoOpacity }} crossOrigin="anonymous" />
                  </div>
                )}
              </div>
            </div>
            <p className="text-center text-white/15 text-[10px] mt-3">Drag elements to reposition · Click to edit text</p>
          </div>
        </div>

        {/* ── Right Panel ──────────────────────────────────────────────────── */}
        <div className="w-[280px] shrink-0 border-l border-white/[0.05] bg-[#0d0e12] flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/[0.05] shrink-0 overflow-x-auto">
            {PANELS.map(t => (
              <button key={t.id} onClick={() => setPanel(t.id)}
                className={`flex-none px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors whitespace-nowrap ${
                  panel === t.id ? 'text-white border-b-2 border-[#6c5ce7]' : 'text-white/25 hover:text-white/40'
                }`}>{t.label}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">

            {/* ══ LAYOUT PANEL ══════════════════════════════════════════════ */}
            {panel === 'layout' && (<>
              <Sec label="Composition">
                <div className="grid grid-cols-3 gap-1">
                  {Object.entries(LAYOUTS).map(([k, c]) => (
                    <button key={k} onClick={() => setLayout(k)}
                      className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[9px] font-medium transition-all ${
                        layout === k ? 'bg-[#6c5ce7]/15 text-[#a29bfe] border border-[#6c5ce7]/30' : 'bg-white/[0.02] text-white/25 border border-transparent hover:bg-white/[0.04]'
                      }`}><span className="text-sm">{c.preview}</span>{c.label}</button>
                  ))}
                </div>
              </Sec>
              <Sec label="Style Mode">
                {Object.entries(STYLES).map(([k, c]) => (
                  <button key={k} onClick={() => setStyle(k)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[11px] font-medium transition-all ${
                      style === k ? 'bg-[#6c5ce7]/15 text-white' : 'text-white/25 hover:bg-white/[0.03]'
                    }`}>{c.label}{style === k && <Check className="w-3 h-3 text-[#6c5ce7]" />}</button>
                ))}
              </Sec>
              <Sec label="Accent Color">
                <div className="flex flex-wrap gap-1.5">
                  {colors.map(c => (
                    <button key={c} onClick={() => setAccentColor(c)}
                      className={`w-6 h-6 rounded-md transition-all ${accentColor === c ? 'ring-2 ring-[#6c5ce7] ring-offset-1 ring-offset-[#0d0e12]' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </Sec>
              <Sec label="Frame">
                <div className="grid grid-cols-4 gap-1">
                  {Object.entries(FRAMES).map(([k, c]) => (
                    <button key={k} onClick={() => setFrame(k)}
                      className={`py-1.5 rounded-md text-[9px] font-medium transition-all ${
                        frame === k ? 'bg-[#6c5ce7]/15 text-[#a29bfe]' : 'bg-white/[0.02] text-white/25 hover:bg-white/[0.04]'
                      }`}>{c.label}</button>
                  ))}
                </div>
              </Sec>
            </>)}

            {/* ══ TEXT PANEL ════════════════════════════════════════════════ */}
            {panel === 'text' && (<>
              <Sec label="Content">
                <FieldInput label="Headline" value={headline} onChange={setHeadline} max={80} />
                <FieldInput label="Subtext" value={subtext} onChange={setSubtext} max={200} multiline />
                <FieldInput label="CTA" value={cta} onChange={setCta} max={30} />
              </Sec>

              <Sec label="Headline Font">
                <FontPicker value={headlineFont} onChange={setHeadlineFont} search={fontSearch} onSearch={setFontSearch} />
              </Sec>

              <Sec label="Body Font">
                <FontPicker value={bodyFont} onChange={setBodyFont} search={fontSearch} onSearch={setFontSearch} />
              </Sec>

              <Sec label="Text Style">
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {['none', 'uppercase', 'lowercase', 'capitalize'].map(t => (
                    <button key={t} onClick={() => setTextTransform(t)}
                      className={`py-1.5 rounded-md text-[9px] font-medium transition-all ${
                        textTransform === t ? 'bg-[#6c5ce7]/15 text-white' : 'bg-white/[0.02] text-white/25'
                      }`}>{t === 'none' ? 'Normal' : t.charAt(0).toUpperCase() + t.slice(1, 3)}</button>
                  ))}
                </div>
                <Slider label="Letter spacing" min={-0.08} max={0.15} step={0.005} value={letterSpacing} onChange={setLetterSpacing} unit="em" />
                <Slider label="Line height" min={0.8} max={1.8} step={0.05} value={lineHeight} onChange={setLineHeight} />
                <Slider label="Opacity" min={0.1} max={1} step={0.05} value={headlineOpacity} onChange={setHeadlineOpacity} />
              </Sec>

              <Sec label="Text Shadow">
                <Toggle on={txtShadow} onChange={setTxtShadow} label="Enable" />
                {txtShadow && (<>
                  <Slider label="Blur" min={0} max={30} value={txtShadowBlur} onChange={setTxtShadowBlur} unit="px" />
                  <div className="flex gap-1 mt-1">
                    {['#000000', '#ffffff', '#1a1a1a', accentColor].map(c => (
                      <button key={c} onClick={() => setTxtShadowColor(c)}
                        className={`w-5 h-5 rounded ${txtShadowColor === c ? 'ring-1 ring-[#6c5ce7]' : ''}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </>)}
              </Sec>

              <Sec label="Text Outline">
                <Toggle on={txtStroke} onChange={setTxtStroke} label="Enable" />
                {txtStroke && (<>
                  <Slider label="Width" min={0.5} max={4} step={0.5} value={txtStrokeWidth} onChange={setTxtStrokeWidth} unit="px" />
                  <div className="flex gap-1 mt-1">
                    {['#000000', '#ffffff', accentColor].map(c => (
                      <button key={c} onClick={() => setTxtStrokeColor(c)}
                        className={`w-5 h-5 rounded ${txtStrokeColor === c ? 'ring-1 ring-[#6c5ce7]' : ''}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </>)}
              </Sec>
            </>)}

            {/* ══ IMAGE PANEL ══════════════════════════════════════════════ */}
            {panel === 'image' && (<>
              <Sec label="Source">
                {image && (
                  <div className="relative rounded-lg overflow-hidden mb-2 aspect-video bg-white/[0.03]">
                    <img src={image} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setImage(null)} className="absolute top-1 right-1 w-5 h-5 rounded bg-black/50 flex items-center justify-center text-white/70 hover:text-white"><X className="w-3 h-3" /></button>
                  </div>
                )}
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/[0.03] hover:bg-white/[0.05] text-white/40 text-[11px] cursor-pointer transition-colors border border-white/[0.05]">
                  <Upload className="w-3 h-3" /> {image ? 'Replace' : 'Upload image'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'image')} />
                </label>
              </Sec>
              <Sec label="Adjustments">
                <Slider label="Opacity" min={0.1} max={1} step={0.05} value={imgOpacity} onChange={setImgOpacity} />
                <Slider label="Blur" min={0} max={10} step={0.5} value={imgBlur} onChange={setImgBlur} unit="px" />
                <Slider label="Brightness" min={50} max={150} value={imgBrightness} onChange={setImgBrightness} unit="%" />
                <Slider label="Contrast" min={50} max={150} value={imgContrast} onChange={setImgContrast} unit="%" />
                <Slider label="Saturation" min={0} max={200} value={imgSaturation} onChange={setImgSaturation} unit="%" />
                <Slider label="Grayscale" min={0} max={100} value={imgGrayscale} onChange={setImgGrayscale} unit="%" />
                <Slider label="Corner radius" min={0} max={24} value={imgRadius} onChange={setImgRadius} unit="px" />
              </Sec>
            </>)}

            {/* ══ LOGO PANEL ═══════════════════════════════════════════════ */}
            {panel === 'logo' && (<>
              <Sec label="Logo">
                <Toggle on={showLogo} onChange={setShowLogo} label="Show logo" />
                {showLogo && (<>
                  {logoUrl && (
                    <div className="w-16 h-16 rounded-lg bg-white/[0.04] flex items-center justify-center p-2 mb-2">
                      <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/[0.03] hover:bg-white/[0.05] text-white/40 text-[11px] cursor-pointer transition-colors border border-white/[0.05] mb-2">
                    <Upload className="w-3 h-3" /> {logoUrl ? 'Replace logo' : 'Upload logo'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'logo')} />
                  </label>
                  <Slider label="Size" min={4} max={25} value={logoSize} onChange={setLogoSize} unit="%" />
                  <Slider label="Opacity" min={0.1} max={1} step={0.05} value={logoOpacity} onChange={setLogoOpacity} />
                </>)}
              </Sec>
            </>)}

            {/* ══ STYLE PANEL ══════════════════════════════════════════════ */}
            {panel === 'style' && (<>
              <Sec label="Quick Presets">
                {[
                  { label: 'Modern Clean', hf: 'Inter', bf: 'Inter', s: 'minimal' },
                  { label: 'Bold Impact', hf: 'Bebas Neue', bf: 'Inter', s: 'bold' },
                  { label: 'Editorial', hf: 'Playfair Display', bf: 'DM Sans', s: 'editorial' },
                  { label: 'Tech', hf: 'Space Grotesk', bf: 'Inter', s: 'dark' },
                  { label: 'Warm Luxury', hf: 'Cormorant Garamond', bf: 'Plus Jakarta Sans', s: 'soft' },
                ].map(p => (
                  <button key={p.label} onClick={() => { setHeadlineFont(p.hf); setBodyFont(p.bf); setStyle(p.s); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-white/30 hover:bg-white/[0.03] hover:text-white/50 text-[11px] transition-all">
                    <span style={{ fontFamily: `'${p.hf}', sans-serif` }}>{p.label}</span>
                    <span className="text-[9px] text-white/15">{p.hf}</span>
                  </button>
                ))}
              </Sec>
            </>)}
          </div>
        </div>
      </div>

      {/* ── Inline Edit Modal ────────────────────────────────────────────── */}
      {editingField && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function DeviceFrame({ type, children }) {
  if (type === 'iphone') {
    return (
      <div className="w-[70%] mx-auto mt-[8%]">
        <div className="relative rounded-[18px] border-[3px] border-gray-700 bg-black overflow-hidden shadow-2xl" style={{ paddingBottom: '200%' }}>
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-[3%] bg-black rounded-b-xl z-10" />
          <div className="absolute inset-[2px] rounded-[15px] overflow-hidden">{children}</div>
        </div>
      </div>
    );
  }
  if (type === 'laptop') {
    return (
      <div className="w-[85%] mx-auto mt-[5%]">
        <div className="relative rounded-t-lg border-[3px] border-gray-600 bg-gray-800 overflow-hidden shadow-xl" style={{ paddingBottom: '62%' }}>
          <div className="absolute inset-[2px] rounded-t-md overflow-hidden">{children}</div>
        </div>
        <div className="w-[110%] -ml-[5%] h-[4%] bg-gray-600 rounded-b-lg shadow-lg" />
      </div>
    );
  }
  return <>{children}</>;
}

function FontPicker({ value, onChange, search, onSearch }) {
  const [open, setOpen] = useState(false);
  const filtered = search.trim() ? ALL_FONTS.filter(f => f.label.toLowerCase().includes(search.toLowerCase())) : null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-2.5 py-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/60 hover:text-white transition-colors">
        <span style={{ fontFamily: `'${value}', sans-serif` }}>{value}</span>
        <span className="text-white/20 text-[9px]">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1b20] border border-white/[0.08] rounded-lg shadow-2xl z-20 max-h-[300px] overflow-hidden flex flex-col">
          <div className="p-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/[0.04]">
              <Search className="w-3 h-3 text-white/30" />
              <input autoFocus className="bg-transparent text-white text-[11px] outline-none flex-1 placeholder-white/20"
                placeholder="Search fonts..." value={search} onChange={e => onSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-1.5">
            {filtered ? (
              filtered.length > 0 ? filtered.map(f => (
                <FontRow key={f.value} font={f} active={value === f.value} onSelect={() => { onChange(f.value); setOpen(false); onSearch(''); }} />
              )) : <p className="text-[10px] text-white/20 p-2">No matches</p>
            ) : (
              Object.entries(FONT_LIBRARY).map(([cat, fonts]) => (
                <div key={cat}>
                  <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-white/15 px-2 pt-2 pb-1">{cat}</p>
                  {fonts.map(f => (
                    <FontRow key={f.value} font={f} active={value === f.value} onSelect={() => { onChange(f.value); setOpen(false); onSearch(''); }} />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FontRow({ font, active, onSelect }) {
  return (
    <button onClick={onSelect}
      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] transition-colors ${
        active ? 'bg-[#6c5ce7]/15 text-white' : 'text-white/40 hover:bg-white/[0.04] hover:text-white/60'
      }`}>
      <span style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</span>
      {active && <Check className="w-3 h-3 text-[#6c5ce7]" />}
    </button>
  );
}

function Sec({ label, children }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/20 mb-2">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Slider({ label, min, max, step = 1, value, onChange, unit = '' }) {
  const display = typeof value === 'number' && value % 1 !== 0 ? value.toFixed(step < 1 ? 3 : 1) : value;
  return (
    <div className="mt-1">
      <div className="flex justify-between mb-0.5">
        <span className="text-[9px] text-white/30">{label}</span>
        <span className="text-[9px] text-white/40 font-mono">{display}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} className="w-full accent-[#6c5ce7] h-1" />
    </div>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[10px] text-white/30">{label}</span>
      <button onClick={() => onChange(!on)}
        className={`w-8 h-[18px] rounded-full transition-colors flex items-center px-0.5 ${on ? 'bg-[#6c5ce7]' : 'bg-white/[0.1]'}`}>
        <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-sm ${on ? 'translate-x-3.5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function FieldInput({ label, value, onChange, max, multiline }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div>
      <p className="text-[9px] text-white/25 mb-0.5">{label}</p>
      <Tag className="w-full px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-white text-[11px] outline-none focus:border-[#6c5ce7]/30 resize-none transition-colors"
        value={value} onChange={e => onChange(e.target.value)} maxLength={max}
        {...(multiline ? { rows: 2 } : {})} />
    </div>
  );
}
