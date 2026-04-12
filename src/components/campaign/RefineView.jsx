import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { ArrowLeft, Download, Save, Loader2, Check, Upload, X, Search, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUTS — structural foundation (preserved)
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
  minimal: { label: 'Minimal', bg: '#ffffff', text: '#1a1a1a', sub: 'rgba(0,0,0,0.35)', cta: '#1a1a1a', ctaText: '#fff', headlineSize: 28, subSize: 13, weight: 500 },
  bold: { label: 'Bold', bg: '#0a0a0f', text: '#ffffff', sub: 'rgba(255,255,255,0.45)', cta: '#6c5ce7', ctaText: '#fff', headlineSize: 44, subSize: 15, weight: 800 },
  editorial: { label: 'Editorial', bg: '#f5f0eb', text: '#1a1a1a', sub: 'rgba(0,0,0,0.3)', cta: '#1a1a1a', ctaText: '#fff', headlineSize: 34, subSize: 14, weight: 600 },
  soft: { label: 'Soft', bg: '#faf8f5', text: '#2a2a2a', sub: 'rgba(0,0,0,0.25)', cta: '#8b6b4a', ctaText: '#fff', headlineSize: 30, subSize: 13, weight: 500 },
  dark: { label: 'Dark', bg: '#111118', text: '#ffffff', sub: 'rgba(255,255,255,0.4)', cta: '#6c5ce7', ctaText: '#fff', headlineSize: 36, subSize: 14, weight: 700 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FONT LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════

const FONT_LIB = {
  'Sans': [
    'Inter', 'Plus Jakarta Sans', 'DM Sans', 'Manrope', 'Sora', 'Outfit', 'Figtree',
    'Space Grotesk', 'Poppins', 'Montserrat', 'Rubik', 'Work Sans', 'Jost',
  ],
  'Serif': [
    'Playfair Display', 'Cormorant Garamond', 'Libre Baskerville', 'Lora', 'EB Garamond', 'Merriweather',
  ],
  'Display': [
    'Bebas Neue', 'Oswald', 'Anton', 'Archivo Black', 'Barlow Condensed',
  ],
};
const ALL_FONTS = Object.values(FONT_LIB).flat();

const FRAMES = {
  none: { label: 'None' },
  border: { label: 'Border', css: { border: '2px solid rgba(0,0,0,0.08)', borderRadius: 8 } },
  card: { label: 'Card', css: { borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } },
  shadow: { label: 'Float', css: { borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' } },
  iphone: { label: 'iPhone', device: 'iphone' },
  laptop: { label: 'Laptop', device: 'laptop' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FREE DRAG HOOK
// ═══════════════════════════════════════════════════════════════════════════════

function useFreeDrag(canvasRef) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const start = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  const onPointerDown = useCallback((e) => {
    e.stopPropagation(); e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragging.current = true;
    start.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
    const onMove = (ev) => {
      if (!dragging.current) return;
      const r = canvasRef.current?.getBoundingClientRect();
      if (!r) return;
      setOffset({
        x: start.current.ox + ((ev.clientX - start.current.mx) / r.width) * 100,
        y: start.current.oy + ((ev.clientY - start.current.my) / r.height) * 100,
      });
    };
    const onUp = () => { dragging.current = false; window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [canvasRef, offset]);

  return [offset, setOffset, onPointerDown];
}

// ═══════════════════════════════════════════════════════════════════════════════
// FONT LOADER
// ═══════════════════════════════════════════════════════════════════════════════

function useFonts() {
  useEffect(() => {
    const id = 'refine-fonts-v3';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${ALL_FONTS.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900`).join('&')}&display=swap`;
    document.head.appendChild(link);
  }, []);
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFINE VIEW — Light premium canvas editor
// ═══════════════════════════════════════════════════════════════════════════════

export default function RefineView({ asset, brand, onClose, onSave }) {
  useFonts();
  const canvasRef = useRef(null);

  // Content
  const [headline, setHeadline] = useState(asset.headline || '');
  const [subtext, setSubtext] = useState(asset.ad_copy || '');
  const [cta, setCta] = useState(asset.cta || '');
  const [image, setImage] = useState(asset.preview_image || null);

  // Structure
  const [layout, setLayout] = useState('hero');
  const [style, setStyle] = useState('bold');
  const [hFont, setHFont] = useState('Inter');
  const [bFont, setBFont] = useState('Inter');
  const [accent, setAccent] = useState(brand?.brand_colors?.[0] || '#6c5ce7');
  const [frame, setFrame] = useState('none');

  // Text effects
  const [letterSp, setLetterSp] = useState(0);
  const [lineH, setLineH] = useState(1.1);
  const [txtTransform, setTxtTransform] = useState('none');
  const [txtOpacity, setTxtOpacity] = useState(1);
  const [shadow, setShadow] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(12);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [stroke, setStroke] = useState(false);
  const [strokeW, setStrokeW] = useState(1);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [gradientText, setGradientText] = useState(false);

  // Image effects
  const [imgOpacity, setImgOpacity] = useState(1);
  const [imgBlur, setImgBlur] = useState(0);
  const [imgBright, setImgBright] = useState(100);
  const [imgContrast, setImgContrast] = useState(100);
  const [imgSat, setImgSat] = useState(100);
  const [imgGray, setImgGray] = useState(0);
  const [imgRadius, setImgRadius] = useState(0);

  // Logo
  const [logoUrl, setLogoUrl] = useState(brand?.logo_url || null);
  const [showLogo, setShowLogo] = useState(!!brand?.logo_url);
  const [logoSize, setLogoSize] = useState(10);
  const [logoOpacity, setLogoOpacity] = useState(0.85);

  // Drag
  const [hOff,, hDrag] = useFreeDrag(canvasRef);
  const [sOff,, sDrag] = useFreeDrag(canvasRef);
  const [cOff,, cDrag] = useFreeDrag(canvasRef);
  const [lOff,, lDrag] = useFreeDrag(canvasRef);

  // UI
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editField, setEditField] = useState(null);
  const [panel, setPanel] = useState('layout');
  const [fontSearch, setFontSearch] = useState('');

  const L = LAYOUTS[layout];
  const S = STYLES[style];
  const hasOv = L.overlay && image;
  const tCol = hasOv ? '#fff' : S.text;
  const sCol = hasOv ? 'rgba(255,255,255,0.55)' : S.sub;
  const swatches = [...new Set([...(brand?.brand_colors || []), '#6c5ce7', '#2563eb', '#059669', '#1a1a1a', '#ffffff'])].slice(0, 8);

  const hShadow = shadow ? `0 2px ${shadowBlur}px ${shadowColor}` : (hasOv ? '0 2px 16px rgba(0,0,0,0.3)' : 'none');
  const hStroke = stroke ? { WebkitTextStroke: `${strokeW}px ${strokeColor}`, paintOrder: 'stroke fill' } : {};
  const imgFilter = `blur(${imgBlur}px) brightness(${imgBright}%) contrast(${imgContrast}%) saturate(${imgSat}%) grayscale(${imgGray}%)`;
  const fc = FRAMES[frame];

  // Gradient text style
  const gradientStyle = gradientText ? {
    background: `linear-gradient(135deg, ${accent}, #a29bfe)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } : {};

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true); setEditField(null);
    await new Promise(r => setTimeout(r, 80));
    const c = await html2canvas(canvasRef.current, { useCORS: true, allowTaint: true, scale: 2, logging: false, backgroundColor: null, imageTimeout: 30000 });
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png'); a.download = 'creative.png'; a.click();
    setExporting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ headline, ad_copy: subtext, cta, preview_image: image });
    setSaving(false);
  };

  const upload = async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (target === 'logo') { setLogoUrl(file_url); setShowLogo(true); }
    else setImage(file_url);
    e.target.value = '';
    toast.success(target === 'logo' ? 'Logo updated' : 'Image replaced');
  };

  const logoCls = { 'top-left': 'top-[5%] left-[5%]', 'top-right': 'top-[5%] right-[5%]', 'top-center': 'top-[5%] left-1/2 -translate-x-1/2' }[L.logoPos] || 'top-[5%] left-[5%]';

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f4] flex flex-col">

      {/* ── Top Bar — light, minimal ─────────────────────────────────────── */}
      <div className="h-[48px] flex items-center justify-between px-5 border-b border-black/[0.06] bg-white shrink-0">
        <button onClick={onClose} className="flex items-center gap-1.5 text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 text-[13px] font-medium transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span className="text-[#1a1a1a]/25 text-[11px] font-medium tracking-wide uppercase">Refine</span>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 h-[32px] px-4 rounded-lg border border-black/[0.08] text-[#1a1a1a]/60 hover:bg-[#fafafa] text-[12px] font-medium transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
          </button>
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 h-[32px] px-4 rounded-lg bg-[#1a1a1a] hover:bg-[#333] text-white text-[12px] font-medium transition-colors disabled:opacity-50">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Canvas Area — light infinite canvas feel ────────────────────── */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden" onClick={() => setEditField(null)}
          style={{ background: 'linear-gradient(180deg, #f0f0ee 0%, #e8e8e5 100%)' }}>
          {/* Subtle dot grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          <div className="w-full max-w-[460px] relative z-10 p-8">
            <div ref={canvasRef} className="relative w-full overflow-hidden rounded-2xl"
              style={{ paddingBottom: '100%', backgroundColor: S.bg, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 40px rgba(0,0,0,0.08)' }}>
              <div className="absolute inset-0">

                {/* Image */}
                {image && L.imageZone && (
                  <div className="absolute overflow-hidden" style={{ left: L.imageZone.left, top: L.imageZone.top, width: L.imageZone.width, height: L.imageZone.height }}>
                    {fc?.device ? (
                      <DeviceFrame type={fc.device}>
                        <img src={image} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" style={{ filter: imgFilter, borderRadius: imgRadius, opacity: imgOpacity }} />
                      </DeviceFrame>
                    ) : (
                      <div style={fc?.css || {}}>
                        <img src={image} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" style={{ filter: imgFilter, borderRadius: imgRadius, opacity: imgOpacity, ...(fc?.css || {}) }} />
                      </div>
                    )}
                  </div>
                )}

                {/* Overlay */}
                {hasOv && (
                  <div className="absolute pointer-events-none" style={{
                    left: L.textZone.left, top: L.textZone.top, width: L.textZone.width, height: L.textZone.height,
                    background: L.overlayGradient ? 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' : 'rgba(0,0,0,0.35)',
                  }} />
                )}

                {/* Text zone */}
                <div className="absolute flex flex-col" style={{
                  left: L.textZone.left, top: L.textZone.top, width: L.textZone.width, height: L.textZone.height,
                  padding: L.textZone.padding, paddingBottom: L.textZone.paddingBottom || L.textZone.padding,
                  alignItems: L.textZone.align === 'center' ? 'center' : 'flex-start',
                  justifyContent: L.textZone.justify || 'center', textAlign: L.textZone.align,
                }}>
                  {headline && (
                    <div style={{ transform: `translate(${hOff.x}%, ${hOff.y}%)` }}
                      onPointerDown={hDrag} className="cursor-grab active:cursor-grabbing touch-none select-none">
                      <h2 className="leading-none mb-2" onClick={e => { e.stopPropagation(); setEditField('headline'); }}
                        style={{
                          color: gradientText ? undefined : tCol, fontSize: S.headlineSize,
                          fontFamily: `'${hFont}', sans-serif`, fontWeight: S.weight,
                          letterSpacing: `${letterSp}em`, lineHeight: lineH, textTransform: txtTransform,
                          opacity: txtOpacity, textShadow: hShadow, ...hStroke, ...gradientStyle,
                          maxWidth: '100%', wordBreak: 'break-word',
                        }}>{headline}</h2>
                    </div>
                  )}
                  {subtext && (
                    <div style={{ transform: `translate(${sOff.x}%, ${sOff.y}%)` }}
                      onPointerDown={sDrag} className="cursor-grab active:cursor-grabbing touch-none select-none">
                      <p className="leading-relaxed mb-4" onClick={e => { e.stopPropagation(); setEditField('subtext'); }}
                        style={{ color: sCol, fontSize: S.subSize, fontFamily: `'${bFont}', sans-serif`,
                          maxWidth: L.textZone.align === 'center' ? '80%' : '100%',
                          textShadow: hasOv ? '0 1px 6px rgba(0,0,0,0.2)' : 'none',
                        }}>{subtext}</p>
                    </div>
                  )}
                  {cta && (
                    <div style={{ transform: `translate(${cOff.x}%, ${cOff.y}%)` }}
                      onPointerDown={cDrag} className="cursor-grab active:cursor-grabbing touch-none select-none">
                      <span className="inline-flex items-center font-semibold" onClick={e => { e.stopPropagation(); setEditField('cta'); }}
                        style={{ backgroundColor: accent || S.cta, color: S.ctaText, padding: '7px 20px', borderRadius: 999,
                          fontSize: S.subSize * 0.85, fontFamily: `'${bFont}', sans-serif`,
                        }}>{cta}</span>
                    </div>
                  )}
                </div>

                {/* Logo */}
                {showLogo && logoUrl && (
                  <div className={`absolute ${logoCls} cursor-grab active:cursor-grabbing touch-none select-none`}
                    style={{ width: `${logoSize}%`, minWidth: 20, transform: `translate(${lOff.x}%, ${lOff.y}%)` }}
                    onPointerDown={lDrag}>
                    <img src={logoUrl} alt="" className="w-full h-auto object-contain pointer-events-none" style={{ opacity: logoOpacity }} crossOrigin="anonymous" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel — light, clean ──────────────────────────────────── */}
        <div className="w-[280px] shrink-0 border-l border-black/[0.06] bg-white flex flex-col overflow-hidden">
          <div className="flex border-b border-black/[0.04] shrink-0 overflow-x-auto">
            {['layout','text','image','logo','style'].map(t => (
              <button key={t} onClick={() => setPanel(t)}
                className={`flex-none px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors capitalize ${
                  panel === t ? 'text-[#1a1a1a] border-b-2 border-[#1a1a1a]' : 'text-[#1a1a1a]/25 hover:text-[#1a1a1a]/45'
                }`}>{t}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* LAYOUT */}
            {panel === 'layout' && (<>
              <Sec label="Composition">
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(LAYOUTS).map(([k, c]) => (
                    <button key={k} onClick={() => setLayout(k)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[9px] font-medium transition-all ${
                        layout === k ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f5f4] text-[#1a1a1a]/35 hover:bg-[#eeeeec] hover:text-[#1a1a1a]/60'
                      }`}><span className="text-sm">{c.preview}</span>{c.label}</button>
                  ))}
                </div>
              </Sec>
              <Sec label="Style">
                {Object.entries(STYLES).map(([k, c]) => (
                  <button key={k} onClick={() => setStyle(k)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                      style === k ? 'bg-[#f5f5f4] text-[#1a1a1a]' : 'text-[#1a1a1a]/30 hover:bg-[#fafafa]'
                    }`}>{c.label}{style === k && <Check className="w-3 h-3 text-[#6c5ce7]" />}</button>
                ))}
              </Sec>
              <Sec label="Accent">
                <div className="flex flex-wrap gap-2">
                  {swatches.map(c => (
                    <button key={c} onClick={() => setAccent(c)}
                      className={`w-7 h-7 rounded-lg border-2 transition-all ${accent === c ? 'border-[#1a1a1a] scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </Sec>
              <Sec label="Frame">
                <div className="grid grid-cols-3 gap-1">
                  {Object.entries(FRAMES).map(([k, c]) => (
                    <button key={k} onClick={() => setFrame(k)}
                      className={`py-1.5 rounded-lg text-[9px] font-medium transition-all ${
                        frame === k ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f5f4] text-[#1a1a1a]/30 hover:bg-[#eee]'
                      }`}>{c.label}</button>
                  ))}
                </div>
              </Sec>
            </>)}

            {/* TEXT */}
            {panel === 'text' && (<>
              <Sec label="Content">
                <Field label="Headline" value={headline} onChange={setHeadline} max={80} />
                <Field label="Subtext" value={subtext} onChange={setSubtext} max={200} multi />
                <Field label="CTA" value={cta} onChange={setCta} max={30} />
              </Sec>
              <Sec label="Headline Font">
                <FontPicker value={hFont} onChange={setHFont} search={fontSearch} onSearch={setFontSearch} />
              </Sec>
              <Sec label="Body Font">
                <FontPicker value={bFont} onChange={setBFont} search={fontSearch} onSearch={setFontSearch} />
              </Sec>
              <Sec label="Style">
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {['none','uppercase','lowercase','capitalize'].map(t => (
                    <button key={t} onClick={() => setTxtTransform(t)}
                      className={`py-1.5 rounded-lg text-[9px] font-medium ${txtTransform === t ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f5f4] text-[#1a1a1a]/30'}`}>
                      {t === 'none' ? 'Aa' : t.slice(0,3).toUpperCase()}</button>
                  ))}
                </div>
                <Slider label="Letter spacing" min={-0.08} max={0.15} step={0.005} val={letterSp} set={setLetterSp} unit="em" />
                <Slider label="Line height" min={0.8} max={1.8} step={0.05} val={lineH} set={setLineH} />
                <Slider label="Opacity" min={0.1} max={1} step={0.05} val={txtOpacity} set={setTxtOpacity} />
              </Sec>
              <Sec label="Effects">
                <Toggle on={gradientText} set={setGradientText} label="Gradient text" />
                <Toggle on={shadow} set={setShadow} label="Shadow" />
                {shadow && (<>
                  <Slider label="Blur" min={0} max={30} val={shadowBlur} set={setShadowBlur} unit="px" />
                  <Colors selected={shadowColor} onSelect={setShadowColor} options={['#000','#fff','#1a1a1a',accent]} />
                </>)}
                <Toggle on={stroke} set={setStroke} label="Outline" />
                {stroke && (<>
                  <Slider label="Width" min={0.5} max={4} step={0.5} val={strokeW} set={setStrokeW} unit="px" />
                  <Colors selected={strokeColor} onSelect={setStrokeColor} options={['#000','#fff',accent]} />
                </>)}
              </Sec>
            </>)}

            {/* IMAGE */}
            {panel === 'image' && (<>
              <Sec label="Source">
                {image && (
                  <div className="relative rounded-xl overflow-hidden mb-2 aspect-video bg-[#f5f5f4]">
                    <img src={image} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setImage(null)} className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md bg-black/40 flex items-center justify-center text-white"><X className="w-3 h-3" /></button>
                  </div>
                )}
                <label className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#f5f5f4] hover:bg-[#eee] text-[#1a1a1a]/40 hover:text-[#1a1a1a]/60 text-[11px] font-medium cursor-pointer transition-colors border border-black/[0.04]">
                  <Upload className="w-3 h-3" /> {image ? 'Replace' : 'Upload image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => upload(e, 'image')} />
                </label>
              </Sec>
              <Sec label="Adjustments">
                <Slider label="Opacity" min={0.1} max={1} step={0.05} val={imgOpacity} set={setImgOpacity} />
                <Slider label="Blur" min={0} max={10} step={0.5} val={imgBlur} set={setImgBlur} unit="px" />
                <Slider label="Brightness" min={50} max={150} val={imgBright} set={setImgBright} unit="%" />
                <Slider label="Contrast" min={50} max={150} val={imgContrast} set={setImgContrast} unit="%" />
                <Slider label="Saturation" min={0} max={200} val={imgSat} set={setImgSat} unit="%" />
                <Slider label="Grayscale" min={0} max={100} val={imgGray} set={setImgGray} unit="%" />
                <Slider label="Corners" min={0} max={24} val={imgRadius} set={setImgRadius} unit="px" />
              </Sec>
            </>)}

            {/* LOGO */}
            {panel === 'logo' && (<>
              <Sec label="Logo">
                <Toggle on={showLogo} set={setShowLogo} label="Show" />
                {showLogo && (<>
                  {logoUrl && (
                    <div className="w-14 h-14 rounded-xl bg-[#f5f5f4] flex items-center justify-center p-2 mb-2 border border-black/[0.04]">
                      <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f5f5f4] hover:bg-[#eee] text-[#1a1a1a]/40 text-[11px] font-medium cursor-pointer transition-colors border border-black/[0.04] mb-2">
                    <Upload className="w-3 h-3" /> {logoUrl ? 'Replace' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => upload(e, 'logo')} />
                  </label>
                  <Slider label="Size" min={4} max={25} val={logoSize} set={setLogoSize} unit="%" />
                  <Slider label="Opacity" min={0.1} max={1} step={0.05} val={logoOpacity} set={setLogoOpacity} />
                </>)}
              </Sec>
            </>)}

            {/* STYLE PRESETS */}
            {panel === 'style' && (<>
              <Sec label="Quick Presets">
                {[
                  { l: 'Modern Clean', hf: 'Inter', bf: 'Inter', s: 'minimal' },
                  { l: 'Bold Impact', hf: 'Bebas Neue', bf: 'Inter', s: 'bold' },
                  { l: 'Editorial', hf: 'Playfair Display', bf: 'DM Sans', s: 'editorial' },
                  { l: 'Tech', hf: 'Space Grotesk', bf: 'Inter', s: 'dark' },
                  { l: 'Warm Luxury', hf: 'Cormorant Garamond', bf: 'Plus Jakarta Sans', s: 'soft' },
                  { l: 'Display Bold', hf: 'Oswald', bf: 'Inter', s: 'bold' },
                ].map(p => (
                  <button key={p.l} onClick={() => { setHFont(p.hf); setBFont(p.bf); setStyle(p.s); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[#1a1a1a]/30 hover:bg-[#f5f5f4] hover:text-[#1a1a1a]/60 text-[12px] transition-all">
                    <span style={{ fontFamily: `'${p.hf}', sans-serif` }}>{p.l}</span>
                    <span className="text-[9px] text-[#1a1a1a]/15">{p.hf}</span>
                  </button>
                ))}
              </Sec>
            </>)}
          </div>
        </div>
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      {editField && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setEditField(null)}>
          <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-5 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-[#1a1a1a] capitalize">{editField}</h3>
              <button onClick={() => setEditField(null)} className="text-[#1a1a1a]/20 hover:text-[#1a1a1a]/50"><X className="w-4 h-4" /></button>
            </div>
            {editField === 'headline' && <textarea autoFocus rows={2} className="w-full px-3 py-2.5 rounded-xl bg-[#f5f5f4] border border-black/[0.06] text-[#1a1a1a] text-[14px] outline-none focus:border-[#6c5ce7]/30 resize-none" value={headline} onChange={e => setHeadline(e.target.value)} maxLength={80} />}
            {editField === 'subtext' && <textarea autoFocus rows={3} className="w-full px-3 py-2.5 rounded-xl bg-[#f5f5f4] border border-black/[0.06] text-[#1a1a1a] text-[14px] outline-none focus:border-[#6c5ce7]/30 resize-none" value={subtext} onChange={e => setSubtext(e.target.value)} maxLength={200} />}
            {editField === 'cta' && <input autoFocus className="w-full px-3 py-2.5 rounded-xl bg-[#f5f5f4] border border-black/[0.06] text-[#1a1a1a] text-[14px] outline-none focus:border-[#6c5ce7]/30" value={cta} onChange={e => setCta(e.target.value)} maxLength={30} />}
            <button onClick={() => setEditField(null)} className="w-full mt-3 h-[38px] rounded-xl bg-[#1a1a1a] hover:bg-[#333] text-white text-[13px] font-medium transition-colors">Done</button>
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
  if (type === 'iphone') return (
    <div className="w-[70%] mx-auto mt-[8%]">
      <div className="relative rounded-[20px] border-[3px] border-[#d1d1d0] bg-[#1a1a1a] overflow-hidden shadow-lg" style={{ paddingBottom: '200%' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-[3%] bg-[#1a1a1a] rounded-b-xl z-10" />
        <div className="absolute inset-[2px] rounded-[17px] overflow-hidden">{children}</div>
      </div>
    </div>
  );
  if (type === 'laptop') return (
    <div className="w-[85%] mx-auto mt-[5%]">
      <div className="relative rounded-t-xl border-[3px] border-[#d1d1d0] bg-[#e5e5e3] overflow-hidden shadow-md" style={{ paddingBottom: '62%' }}>
        <div className="absolute inset-[2px] rounded-t-lg overflow-hidden">{children}</div>
      </div>
      <div className="w-[110%] -ml-[5%] h-[4%] bg-[#d1d1d0] rounded-b-lg" />
    </div>
  );
  return <>{children}</>;
}

function FontPicker({ value, onChange, search, onSearch }) {
  const [open, setOpen] = useState(false);
  const filtered = search.trim() ? ALL_FONTS.filter(f => f.toLowerCase().includes(search.toLowerCase())) : null;
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#f5f5f4] border border-black/[0.04] text-[12px] text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors">
        <span style={{ fontFamily: `'${value}', sans-serif` }}>{value}</span>
        <span className="text-[9px] text-[#1a1a1a]/20">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/[0.06] rounded-xl shadow-lg z-20 max-h-[280px] overflow-hidden flex flex-col">
          <div className="p-2 border-b border-black/[0.04]">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f5f5f4]">
              <Search className="w-3 h-3 text-[#1a1a1a]/25" />
              <input autoFocus className="bg-transparent text-[#1a1a1a] text-[12px] outline-none flex-1 placeholder-[#1a1a1a]/20"
                placeholder="Search…" value={search} onChange={e => onSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-1.5">
            {filtered ? (
              filtered.length > 0 ? filtered.map(f => (
                <FRow key={f} font={f} active={value === f} pick={() => { onChange(f); setOpen(false); onSearch(''); }} />
              )) : <p className="text-[10px] text-[#1a1a1a]/20 p-2">No results</p>
            ) : (
              Object.entries(FONT_LIB).map(([cat, fonts]) => (
                <div key={cat}>
                  <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a]/15 px-2 pt-2 pb-1">{cat}</p>
                  {fonts.map(f => <FRow key={f} font={f} active={value === f} pick={() => { onChange(f); setOpen(false); onSearch(''); }} />)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FRow({ font, active, pick }) {
  return (
    <button onClick={pick}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] transition-colors ${
        active ? 'bg-[#f5f5f4] text-[#1a1a1a] font-medium' : 'text-[#1a1a1a]/40 hover:bg-[#fafafa] hover:text-[#1a1a1a]/60'
      }`}>
      <span style={{ fontFamily: `'${font}', sans-serif` }}>{font}</span>
      {active && <Check className="w-3 h-3 text-[#6c5ce7]" />}
    </button>
  );
}

function Sec({ label, children }) {
  return <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a]/20 mb-2">{label}</p><div className="space-y-1">{children}</div></div>;
}

function Slider({ label, min, max, step = 1, val, set, unit = '' }) {
  const d = typeof val === 'number' && val % 1 !== 0 ? val.toFixed(step < 1 ? 3 : 1) : val;
  return (
    <div className="mt-1.5">
      <div className="flex justify-between mb-0.5">
        <span className="text-[10px] text-[#1a1a1a]/25">{label}</span>
        <span className="text-[10px] text-[#1a1a1a]/35 font-mono">{d}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(Number(e.target.value))} className="w-full accent-[#6c5ce7] h-1" />
    </div>
  );
}

function Toggle({ on, set, label }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-[#1a1a1a]/30">{label}</span>
      <button onClick={() => set(!on)}
        className={`w-8 h-[18px] rounded-full transition-colors flex items-center px-0.5 ${on ? 'bg-[#6c5ce7]' : 'bg-[#1a1a1a]/10'}`}>
        <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-3.5' : ''}`} />
      </button>
    </div>
  );
}

function Colors({ selected, onSelect, options }) {
  return (
    <div className="flex gap-1.5 mt-1">
      {options.map(c => (
        <button key={c} onClick={() => onSelect(c)}
          className={`w-5 h-5 rounded-md border transition-all ${selected === c ? 'border-[#1a1a1a] scale-110' : 'border-transparent'}`}
          style={{ backgroundColor: c }} />
      ))}
    </div>
  );
}

function Field({ label, value, onChange, max, multi }) {
  const Tag = multi ? 'textarea' : 'input';
  return (
    <div>
      <p className="text-[10px] text-[#1a1a1a]/25 mb-0.5">{label}</p>
      <Tag className="w-full px-2.5 py-2 rounded-lg bg-[#f5f5f4] border border-black/[0.04] text-[#1a1a1a] text-[12px] outline-none focus:border-[#6c5ce7]/30 resize-none transition-colors"
        value={value} onChange={e => onChange(e.target.value)} maxLength={max} {...(multi ? { rows: 2 } : {})} />
    </div>
  );
}
