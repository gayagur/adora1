import React, { useRef, useState, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Download, Eye, EyeOff, RotateCcw, Type, Image as ImageIcon, Layers } from 'lucide-react';

// --- Draggable Layer Hook ---
function useDrag(initialPos, canvasRef) {
  const [pos, setPos] = useState(initialPos);
  const dragging = useRef(false);
  const start = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const onMouseDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragging.current = true;
    start.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };

    const onMove = (ev) => {
      if (!dragging.current) return;
      const dx = ((ev.clientX - start.current.mx) / rect.width) * 100;
      const dy = ((ev.clientY - start.current.my) / rect.height) * 100;
      setPos({ x: Math.max(0, Math.min(95, start.current.px + dx)), y: Math.max(0, Math.min(95, start.current.py + dy)) });
    };
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos, canvasRef]);

  return [pos, setPos, onMouseDown];
}

// ─── CANVAS BACKGROUNDS ─────────────────────────────────────────────────────
const BACKGROUNDS = {
  dark:    { background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' },
  light:   { background: 'linear-gradient(160deg, #f8f9ff 0%, #eef0ff 50%, #e8ebff 100%)' },
  white:   { background: '#ffffff' },
  brand:   null, // set dynamically from accentColor
  overlay: { background: 'linear-gradient(135deg,#1e1e2e,#2d1b6e)' },
};

const ASPECT_RATIOS = [
  { id: '1/1',  label: 'Square',    pad: 100 },
  { id: '16/9', label: 'Landscape', pad: 56.25 },
  { id: '9/16', label: 'Story',     pad: 177.78 },
  { id: '4/5',  label: '4:5',       pad: 125 },
];

// ─── MAIN CANVAS EDITOR ────────────────────────────────────────────────────
export default function CanvasEditor({
  initialHeadline = '', initialSubtext = '', initialCta = '',
  initialImage = null, logoUrl = null, brandColors = [],
  screenshots = [], onClose,
}) {
  const canvasRef = useRef(null);

  // State
  const [headline, setHeadline] = useState(initialHeadline);
  const [subtext, setSubtext] = useState(initialSubtext);
  const [cta, setCta] = useState(initialCta);
  const [bgImage, setBgImage] = useState(initialImage);
  const [bgStyle, setBgStyle] = useState('dark');
  const [accentColor, setAccentColor] = useState(brandColors[0] || '#7c3aed');
  const [headlineColor, setHeadlineColor] = useState('#ffffff');
  const [headlineSize, setHeadlineSize] = useState(44);
  const [subtextSize, setSubtextSize] = useState(18);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [showLogo, setShowLogo] = useState(!!logoUrl);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [logoScale, setLogoScale] = useState(14); // % of canvas width
  const [bgOverlay, setBgOverlay] = useState(0.45);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [editingText, setEditingText] = useState(null); // 'headline' | 'subtext' | 'cta'

  // Draggable layer positions (% of canvas)
  const [headlinePos, setHeadlinePos, headlineDrag] = useDrag({ x: 8, y: 35 }, canvasRef);
  const [subtextPos, setSubtextPos, subtextDrag] = useDrag({ x: 8, y: 52 }, canvasRef);
  const [ctaPos, setCtaPos, ctaDrag] = useDrag({ x: 8, y: 66 }, canvasRef);
  const [logoPos, setLogoPos, logoDrag] = useDrag({ x: 5, y: 4 }, canvasRef);
  const [imgPos, setImgPos, imgDrag] = useDrag({ x: 52, y: 0 }, canvasRef);
  const [imgScale, setImgScale] = useState(48); // % width

  const accentBg = accentColor + '22';
  const bgObj = bgStyle === 'brand'
    ? { background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor}44)` }
    : BACKGROUNDS[bgStyle] || BACKGROUNDS.dark;

  // Apply a layout preset
  const applyLayout = (preset) => {
    if (preset === 'hero') {
      setHeadlinePos({ x: 5, y: 30 });
      setSubtextPos({ x: 5, y: 50 });
      setCtaPos({ x: 5, y: 64 });
      setImgPos({ x: 50, y: 0 });
      setImgScale(50);
      setLogoPos({ x: 4, y: 4 });
      setBgStyle('dark');
      setHeadlineColor('#ffffff');
    } else if (preset === 'split') {
      setHeadlinePos({ x: 5, y: 38 });
      setSubtextPos({ x: 5, y: 56 });
      setCtaPos({ x: 5, y: 68 });
      setImgPos({ x: 50, y: 0 });
      setImgScale(50);
      setBgStyle('white');
      setHeadlineColor('#111111');
    } else if (preset === 'centered') {
      setHeadlinePos({ x: 50, y: 35 });
      setSubtextPos({ x: 50, y: 52 });
      setCtaPos({ x: 50, y: 64 });
      setImgPos({ x: 20, y: 5 });
      setImgScale(60);
      setBgStyle('overlay');
      setHeadlineColor('#ffffff');
      setBgOverlay(0.55);
    } else if (preset === 'product') {
      setHeadlinePos({ x: 50, y: 8 });
      setSubtextPos({ x: 50, y: 22 });
      setImgPos({ x: 10, y: 30 });
      setImgScale(80);
      setCtaPos({ x: 50, y: 88 });
      setBgStyle('light');
      setHeadlineColor('#111111');
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    setSelectedLayer(null);
    setEditingText(null);
    await new Promise(r => setTimeout(r, 80));
    const el = canvasRef.current;
    const canvas = await html2canvas(el, { useCORS: true, allowTaint: true, scale: 2, logging: false, backgroundColor: null });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ad-creative.png';
    a.click();
    setExporting(false);
  };

  const colorSwatches = [...new Set([...brandColors, '#ffffff', '#111111', '#7c3aed', '#2563eb', '#059669', '#ef4444'])].slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 bg-[#111318] flex flex-col" onClick={() => { setSelectedLayer(null); setEditingText(null); }}>
      {/* ── Top Bar ── */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-white/10 shrink-0" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-white/50 hover:text-white text-sm font-medium transition-colors">← Back</button>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-white/70 text-sm font-medium">Canvas Editor</span>
        </div>

        {/* Aspect ratio */}
        <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5">
          {ASPECT_RATIOS.map(ar => (
            <button key={ar.id} onClick={() => setAspectRatio(ar)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${aspectRatio.id === ar.id ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white'}`}>
              {ar.label}
            </button>
          ))}
        </div>

        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
          <Download className="w-3.5 h-3.5" />
          {exporting ? 'Exporting…' : 'Export PNG'}
        </button>
      </div>

      {/* ── Main 3-column layout ── */}
      <div className="flex flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* LEFT SIDEBAR — Assets */}
        <div className="w-52 shrink-0 border-r border-white/10 overflow-y-auto p-3 space-y-4">
          <SideSection label="Templates">
            {[
              { id: 'hero', label: 'Hero', emoji: '◧' },
              { id: 'split', label: 'Split', emoji: '◫' },
              { id: 'centered', label: 'Centered', emoji: '◼' },
              { id: 'product', label: 'Product', emoji: '⊞' },
            ].map(t => (
              <button key={t.id} onClick={() => applyLayout(t.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-colors text-left">
                <span>{t.emoji}</span>{t.label}
              </button>
            ))}
          </SideSection>

          <SideSection label="Visual Source">
            {[
              ...(screenshots || []).map((url, i) => ({ url, label: `Screenshot ${i + 1}` })),
              ...(initialImage && !screenshots?.includes(initialImage) ? [{ url: initialImage, label: 'AI Image' }] : []),
            ].map(({ url, label }) => (
              <button key={url} onClick={() => setBgImage(url)}
                className={`relative w-full rounded-lg overflow-hidden border-2 transition-all ${bgImage === url ? 'border-violet-400' : 'border-transparent'}`}
                style={{ paddingBottom: '56%' }}>
                <img src={url} alt={label} className="absolute inset-0 w-full h-full object-cover object-top" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5">
                  <p className="text-[9px] text-white/90 truncate">{label}</p>
                </div>
              </button>
            ))}
            <button onClick={() => setBgImage(null)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-xs transition-colors">
              No Image
            </button>
          </SideSection>
        </div>

        {/* CENTER — Canvas */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-8 bg-[#16181d]"
          onClick={() => { setSelectedLayer(null); setEditingText(null); }}>
          <div className="relative" style={{ width: '100%', maxWidth: `${80 / (aspectRatio.pad / 100)}vh`, maxHeight: '80vh' }}
            onClick={e => e.stopPropagation()}>
            <div
              ref={canvasRef}
              className="relative w-full overflow-hidden rounded-xl shadow-2xl select-none"
              style={{ paddingBottom: `${aspectRatio.pad}%`, ...bgObj }}
            >
              <div className="absolute inset-0">

                {/* BG Image */}
                {bgImage && (
                  <DraggableLayer
                    x={imgPos.x} y={imgPos.y}
                    onMouseDown={imgDrag}
                    selected={selectedLayer === 'img'}
                    onSelect={() => setSelectedLayer('img')}
                    style={{ width: `${imgScale}%`, pointerEvents: 'all' }}
                    noBorder={exporting}
                  >
                    <img src={bgImage} alt="" className="w-full rounded-lg shadow-2xl block" style={{ objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                  </DraggableLayer>
                )}

                {/* Dark overlay (overlay mode) */}
                {bgStyle === 'overlay' && (
                  <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${bgOverlay})`, pointerEvents: 'none' }} />
                )}

                {/* Headline */}
                {headline && (
                  <DraggableLayer
                    x={headlinePos.x} y={headlinePos.y}
                    onMouseDown={headlineDrag}
                    selected={selectedLayer === 'headline'}
                    onSelect={() => setSelectedLayer('headline')}
                    noBorder={exporting}
                  >
                    {editingText === 'headline' ? (
                      <textarea
                        autoFocus
                        className="bg-transparent outline-none resize-none font-bold leading-tight text-center w-full"
                        style={{ color: headlineColor, fontSize: headlineSize, minWidth: 200, lineHeight: 1.2 }}
                        value={headline}
                        onChange={e => setHeadline(e.target.value)}
                        onBlur={() => setEditingText(null)}
                        onClick={e => e.stopPropagation()}
                        rows={2}
                      />
                    ) : (
                      <p
                        className="font-bold leading-tight cursor-text"
                        style={{ color: headlineColor, fontSize: headlineSize, textShadow: bgStyle === 'dark' || bgStyle === 'overlay' ? '0 2px 16px rgba(0,0,0,0.6)' : 'none', maxWidth: 420, lineHeight: 1.2 }}
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingText('headline'); setSelectedLayer('headline'); }}
                      >{headline}</p>
                    )}
                  </DraggableLayer>
                )}

                {/* Subtext */}
                {subtext && (
                  <DraggableLayer
                    x={subtextPos.x} y={subtextPos.y}
                    onMouseDown={subtextDrag}
                    selected={selectedLayer === 'subtext'}
                    onSelect={() => setSelectedLayer('subtext')}
                    noBorder={exporting}
                  >
                    {editingText === 'subtext' ? (
                      <textarea
                        autoFocus
                        className="bg-transparent outline-none resize-none leading-snug"
                        style={{ color: headlineColor === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)', fontSize: subtextSize, minWidth: 160 }}
                        value={subtext}
                        onChange={e => setSubtext(e.target.value)}
                        onBlur={() => setEditingText(null)}
                        onClick={e => e.stopPropagation()}
                        rows={2}
                      />
                    ) : (
                      <p
                        className="leading-snug cursor-text"
                        style={{ color: headlineColor === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)', fontSize: subtextSize, maxWidth: 380 }}
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingText('subtext'); setSelectedLayer('subtext'); }}
                      >{subtext}</p>
                    )}
                  </DraggableLayer>
                )}

                {/* CTA */}
                {cta && (
                  <DraggableLayer
                    x={ctaPos.x} y={ctaPos.y}
                    onMouseDown={ctaDrag}
                    selected={selectedLayer === 'cta'}
                    onSelect={() => setSelectedLayer('cta')}
                    noBorder={exporting}
                  >
                    {editingText === 'cta' ? (
                      <input
                        autoFocus
                        className="outline-none bg-transparent font-semibold text-white text-center"
                        style={{ backgroundColor: accentColor, padding: '8px 20px', borderRadius: 999, fontSize: subtextSize * 0.9 }}
                        value={cta}
                        onChange={e => setCta(e.target.value)}
                        onBlur={() => setEditingText(null)}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="inline-flex items-center font-semibold text-white cursor-text"
                        style={{ backgroundColor: accentColor, padding: '8px 20px', borderRadius: 999, fontSize: subtextSize * 0.9 }}
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingText('cta'); setSelectedLayer('cta'); }}
                      >{cta}</span>
                    )}
                  </DraggableLayer>
                )}

                {/* Logo */}
                {logoUrl && showLogo && (
                  <DraggableLayer
                    x={logoPos.x} y={logoPos.y}
                    onMouseDown={logoDrag}
                    selected={selectedLayer === 'logo'}
                    onSelect={() => setSelectedLayer('logo')}
                    noBorder={exporting}
                  >
                    <img
                      src={logoUrl}
                      alt=""
                      style={{ width: `${logoScale * 4}px`, maxWidth: 160, opacity: logoOpacity, objectFit: 'contain', filter: (bgStyle === 'dark' || bgStyle === 'overlay') ? 'brightness(0) invert(1)' : 'none' }}
                    />
                  </DraggableLayer>
                )}

              </div>
            </div>

            {/* Hint */}
            <p className="text-center text-white/25 text-xs mt-3">Double-click text to edit · Drag to reposition</p>
          </div>
        </div>

        {/* RIGHT SIDEBAR — Controls */}
        <div className="w-60 shrink-0 border-l border-white/10 overflow-y-auto p-3 space-y-4" onClick={e => e.stopPropagation()}>

          <SideSection label="Background">
            <div className="grid grid-cols-3 gap-1">
              {Object.keys(BACKGROUNDS).map(k => (
                <button key={k} onClick={() => setBgStyle(k)}
                  className={`px-2 py-1.5 rounded-md text-[10px] font-semibold capitalize transition-colors ${bgStyle === k ? 'bg-violet-600 text-white' : 'bg-white/8 text-white/50 hover:bg-white/15 hover:text-white'}`}>
                  {k}
                </button>
              ))}
            </div>
            {(bgStyle === 'overlay') && (
              <div className="mt-2">
                <p className="text-[10px] text-white/40 mb-1">Overlay opacity</p>
                <input type="range" min={0} max={0.85} step={0.05} value={bgOverlay}
                  onChange={e => setBgOverlay(Number(e.target.value))} className="w-full accent-violet-500" />
              </div>
            )}
          </SideSection>

          <SideSection label="Image Layer">
            {bgImage && (
              <>
                <SliderControl label="Width" min={20} max={100} value={imgScale} onChange={setImgScale} />
              </>
            )}
          </SideSection>

          <SideSection label="Headline">
            <SliderControl label="Font size" min={18} max={80} value={headlineSize} onChange={setHeadlineSize} unit="px" />
            <p className="text-[10px] text-white/40 mt-2 mb-1">Color</p>
            <ColorSwatches colors={colorSwatches} selected={headlineColor} onSelect={setHeadlineColor} />
          </SideSection>

          <SideSection label="Subtext">
            <SliderControl label="Font size" min={10} max={36} value={subtextSize} onChange={setSubtextSize} unit="px" />
          </SideSection>

          <SideSection label="CTA / Accent">
            <ColorSwatches colors={colorSwatches} selected={accentColor} onSelect={setAccentColor} />
          </SideSection>

          {logoUrl && (
            <SideSection label="Logo">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/50">Visible</span>
                <button onClick={() => setShowLogo(v => !v)}
                  className={`w-8 h-4 rounded-full transition-colors ${showLogo ? 'bg-violet-600' : 'bg-white/20'} flex items-center px-0.5`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${showLogo ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
              <SliderControl label="Size" min={4} max={30} value={logoScale} onChange={setLogoScale} />
              <SliderControl label="Opacity" min={0.1} max={1} step={0.05} value={logoOpacity} onChange={setLogoOpacity} />
            </SideSection>
          )}

          <SideSection label="Layers">
            {[
              { id: 'img', label: 'Screenshot', icon: ImageIcon },
              { id: 'headline', label: 'Headline', icon: Type },
              { id: 'subtext', label: 'Subtext', icon: Type },
              { id: 'cta', label: 'CTA Button', icon: Layers },
              { id: 'logo', label: 'Logo', icon: Layers },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setSelectedLayer(id)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${selectedLayer === id ? 'bg-violet-600/30 text-violet-300' : 'text-white/40 hover:bg-white/5 hover:text-white/70'}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </button>
            ))}
          </SideSection>

        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DraggableLayer({ x, y, onMouseDown, children, selected, onSelect, style = {}, noBorder = false }) {
  return (
    <div
      onMouseDown={onMouseDown}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      className="absolute cursor-move"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        outline: (!noBorder && selected) ? '2px solid #7c3aed' : (!noBorder ? '1px dashed rgba(255,255,255,0.1)' : 'none'),
        outlineOffset: 4,
        borderRadius: 4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SideSection({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SliderControl({ label, min, max, step = 1, value, onChange, unit = '' }) {
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-[10px] text-white/40">{label}</span>
        <span className="text-[10px] text-white/60 font-mono">{typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} className="w-full accent-violet-500" />
    </div>
  );
}

function ColorSwatches({ colors, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {colors.map(c => (
        <button key={c} onClick={() => onSelect(c)}
          className={`w-6 h-6 rounded-full border-2 transition-all shrink-0 ${selected === c ? 'border-violet-400 scale-110 shadow-md' : 'border-transparent'}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}