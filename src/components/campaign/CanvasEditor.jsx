import React, { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Download, Type, Image as ImageIcon, Layers, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// ─── Load Google Fonts ────────────────────────────────────────────────────────
const FONTS = [
  { label: 'Inter',        value: 'Inter' },
  { label: 'Roboto',       value: 'Roboto' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Montserrat',   value: 'Montserrat' },
  { label: 'Oswald',       value: 'Oswald' },
  { label: 'Raleway',      value: 'Raleway' },
  { label: 'Lato',         value: 'Lato' },
  { label: 'Poppins',      value: 'Poppins' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Space Grotesk', value: 'Space Grotesk' },
];

// Inject Google Fonts link once
function useGoogleFonts() {
  useEffect(() => {
    const id = 'canvas-editor-gfonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    const families = FONTS.map(f => f.value.replace(/ /g, '+')).join('&family=');
    link.href = `https://fonts.googleapis.com/css2?family=${families}:wght@400;600;700;800&display=swap`;
    document.head.appendChild(link);
  }, []);
}

// ─── Draggable hook ───────────────────────────────────────────────────────────
function useDrag(initialPos, canvasRef) {
  const [pos, setPos] = useState(initialPos);
  const dragging = useRef(false);
  const start = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const rect = useRef(null);

  const onMouseDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    rect.current = canvasRef.current?.getBoundingClientRect();
    if (!rect.current) return;
    dragging.current = true;
    start.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };

    const onMove = (ev) => {
      if (!dragging.current || !rect.current) return;
      const dx = ((ev.clientX - start.current.mx) / rect.current.width) * 100;
      const dy = ((ev.clientY - start.current.my) / rect.current.height) * 100;
      setPos({ x: Math.max(0, Math.min(95, start.current.px + dx)), y: Math.max(0, Math.min(95, start.current.py + dy)) });
    };
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos, canvasRef]);

  return [pos, setPos, onMouseDown];
}

// ─── Resize hook (returns resize handle props + current width%) ───────────────
function useResize(initialWidth, canvasRef) {
  const [width, setWidth] = useState(initialWidth);
  const resizing = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onResizeMouseDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    resizing.current = true;
    startX.current = e.clientX;
    startW.current = width;

    const onMove = (ev) => {
      if (!resizing.current) return;
      const dx = ((ev.clientX - startX.current) / rect.width) * 100;
      setWidth(Math.max(10, Math.min(95, startW.current + dx)));
    };
    const onUp = () => { resizing.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [width, canvasRef]);

  return [width, setWidth, onResizeMouseDown];
}

const BACKGROUNDS = {
  dark:    { background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' },
  light:   { background: 'linear-gradient(160deg, #f8f9ff 0%, #eef0ff 50%, #e8ebff 100%)' },
  white:   { background: '#ffffff' },
  brand:   null,
  overlay: { background: 'linear-gradient(135deg,#1e1e2e,#2d1b6e)' },
};

const ASPECT_RATIOS = [
  { id: '1/1',  label: 'Square',    pad: 100 },
  { id: '16/9', label: 'Landscape', pad: 56.25 },
  { id: '9/16', label: 'Story',     pad: 177.78 },
  { id: '4/5',  label: '4:5',       pad: 125 },
];

const HIGHLIGHT_STYLES = [
  { id: 'none',     label: 'None' },
  { id: 'soft_box', label: 'Soft Box' },
  { id: 'marker',   label: 'Marker' },
  { id: 'blur',     label: 'Blur Strip' },
  { id: 'gradient', label: 'Gradient' },
];

function getHighlightStyle(style, color, opacity, padding, radius) {
  if (style === 'none') return {};
  const hex2 = Math.round(opacity * 255).toString(16).padStart(2, '0');
  const base = { padding: `${padding}px ${padding * 2}px`, borderRadius: radius, display: 'inline-block' };
  if (style === 'soft_box') return { ...base, backgroundColor: `${color}${hex2}` };
  if (style === 'marker')   return { ...base, backgroundColor: `${color}${hex2}`, borderRadius: 2 };
  if (style === 'blur')     return { ...base, backdropFilter: 'blur(8px)', backgroundColor: `${color}${Math.round(opacity * 0.6 * 255).toString(16).padStart(2, '0')}` };
  if (style === 'gradient') return { ...base, background: `linear-gradient(90deg, ${color}${hex2}, transparent)` };
  return {};
}

// ─── Remove white background from logo using canvas ──────────────────────────
function useWhiteRemovedLogo(logoUrl) {
  const [processedUrl, setProcessedUrl] = useState(null);

  useEffect(() => {
    if (!logoUrl) { setProcessedUrl(null); return; }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // Make near-white pixels transparent
        if (r > 220 && g > 220 && b > 220) {
          const brightness = (r + g + b) / 3;
          data[i + 3] = Math.round(Math.max(0, (255 - brightness) * 2));
        }
      }
      ctx.putImageData(imageData, 0, 0);
      setProcessedUrl(canvas.toDataURL('image/png'));
    };
    img.onerror = () => setProcessedUrl(logoUrl); // fallback
    img.src = logoUrl;
  }, [logoUrl]);

  return processedUrl;
}

// ─── Main CanvasEditor ────────────────────────────────────────────────────────
export default function CanvasEditor({
  initialHeadline = '', initialSubtext = '', initialCta = '',
  initialImage = null, logoUrl = null, brandColors = [],
  screenshots = [], onClose,
}) {
  useGoogleFonts();
  const canvasRef = useRef(null);

  const [headline, setHeadline] = useState(initialHeadline);
  const [subtext, setSubtext] = useState(initialSubtext);
  const [cta, setCta] = useState(initialCta);
  const [bgImage, setBgImage] = useState(initialImage);
  const [bgStyle, setBgStyle] = useState('dark');
  const [accentColor, setAccentColor] = useState(brandColors[0] || '#7c3aed');
  const [headlineColor, setHeadlineColor] = useState('#ffffff');
  const [headlineSize, setHeadlineSize] = useState(44);
  const [subtextSize, setSubtextSize] = useState(18);
  const [font, setFont] = useState('Inter');
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [activeLogo, setActiveLogo] = useState(logoUrl || null);
  const [showLogo, setShowLogo] = useState(!!logoUrl);
  const processedLogoUrl = useWhiteRemovedLogo(activeLogo);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [logoScale, setLogoScale] = useState(20);
  const [bgOverlay, setBgOverlay] = useState(0.45);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [editingText, setEditingText] = useState(null);
  const [imgScale, setImgScale] = useState(48);
  const [mobilePanelTab, setMobilePanelTab] = useState('source');

  // Highlight
  const [highlightStyle, setHighlightStyle] = useState('none');
  const [highlightColor, setHighlightColor] = useState('#000000');
  const [highlightOpacity, setHighlightOpacity] = useState(0.5);
  const [highlightPadding, setHighlightPadding] = useState(6);
  const [highlightRadius, setHighlightRadius] = useState(6);

  // Drag positions
  const [headlinePos, setHeadlinePos, headlineDrag] = useDrag({ x: 5, y: 38 }, canvasRef);
  const [subtextPos, setSubtextPos, subtextDrag] = useDrag({ x: 5, y: 62 }, canvasRef);
  const [ctaPos, setCtaPos, ctaDrag] = useDrag({ x: 5, y: 78 }, canvasRef);
  const [logoPos, setLogoPos, logoDrag] = useDrag({ x: 4, y: 4 }, canvasRef);
  const [imgPos, setImgPos, imgDrag] = useDrag({ x: 50, y: 2 }, canvasRef);

  // Resize widths (% of canvas)
  const [headlineWidth, setHeadlineWidth, headlineResize] = useResize(42, canvasRef);
  const [subtextWidth, setSubtextWidth, subtextResize] = useResize(38, canvasRef);
  const [imgWidth, setImgWidth, imgResize] = useResize(48, canvasRef);

  const bgObj = bgStyle === 'brand'
    ? { background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor}44)` }
    : BACKGROUNDS[bgStyle] || BACKGROUNDS.dark;

  const highlightCss = getHighlightStyle(highlightStyle, highlightColor, highlightOpacity, highlightPadding, highlightRadius);

  const applyLayout = (preset) => {
    if (preset === 'hero') {
      setHeadlinePos({ x: 5, y: 30 }); setSubtextPos({ x: 5, y: 50 }); setCtaPos({ x: 5, y: 64 });
      setImgPos({ x: 50, y: 0 }); setImgScale(50); setLogoPos({ x: 4, y: 4 });
      setBgStyle('dark'); setHeadlineColor('#ffffff');
    } else if (preset === 'split') {
      setHeadlinePos({ x: 5, y: 38 }); setSubtextPos({ x: 5, y: 56 }); setCtaPos({ x: 5, y: 68 });
      setImgPos({ x: 50, y: 0 }); setImgScale(50);
      setBgStyle('white'); setHeadlineColor('#111111');
    } else if (preset === 'centered') {
      setHeadlinePos({ x: 50, y: 35 }); setSubtextPos({ x: 50, y: 52 }); setCtaPos({ x: 50, y: 64 });
      setImgPos({ x: 20, y: 5 }); setImgScale(60);
      setBgStyle('overlay'); setHeadlineColor('#ffffff'); setBgOverlay(0.55);
    } else if (preset === 'product') {
      setHeadlinePos({ x: 50, y: 8 }); setSubtextPos({ x: 50, y: 22 }); setImgPos({ x: 10, y: 30 });
      setImgScale(80); setCtaPos({ x: 50, y: 88 });
      setBgStyle('light'); setHeadlineColor('#111111');
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    setSelectedLayer(null);
    setEditingText(null);
    await new Promise(r => setTimeout(r, 100));
    const canvas = await html2canvas(canvasRef.current, {
      useCORS: true, allowTaint: false, scale: 2, logging: false,
      backgroundColor: null, imageTimeout: 15000,
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = 'ad-creative.png'; a.click();
    setExporting(false);
  };

  const colorSwatches = [...new Set([...brandColors, '#ffffff', '#111111', '#000000', '#7c3aed', '#2563eb', '#059669', '#ef4444'])].slice(0, 8);
  const textStyle = { fontFamily: `'${font}', sans-serif` };

  const canvasContent = (
    <div className="absolute inset-0">
      {bgImage && (
        <ResizableDraggableLayer x={imgPos.x} y={imgPos.y} width={imgWidth} onDragMouseDown={imgDrag} onResizeMouseDown={imgResize}
          selected={selectedLayer === 'img'} onSelect={() => setSelectedLayer('img')} onRemove={() => setBgImage(null)} noBorder={exporting}>
          <img src={bgImage} alt="" className="w-full rounded-lg shadow-2xl block" style={{ objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
        </ResizableDraggableLayer>
      )}
      {bgStyle === 'overlay' && (
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${bgOverlay})`, pointerEvents: 'none' }} />
      )}
      {headline && (
        <ResizableDraggableLayer x={headlinePos.x} y={headlinePos.y} width={headlineWidth} onDragMouseDown={headlineDrag} onResizeMouseDown={headlineResize}
          selected={selectedLayer === 'headline'} onSelect={() => setSelectedLayer('headline')} onRemove={() => setHeadline('')} noBorder={exporting}>
          <div style={highlightCss}>
            {editingText === 'headline' ? (
              <textarea autoFocus className="bg-transparent outline-none resize-none font-bold leading-tight w-full"
                style={{ color: headlineColor, fontSize: headlineSize, lineHeight: 1.2, ...textStyle }}
                value={headline} onChange={e => setHeadline(e.target.value)} onBlur={() => setEditingText(null)} onClick={e => e.stopPropagation()} rows={2} />
            ) : (
              <p className="font-bold leading-tight cursor-text w-full"
                style={{ color: headlineColor, fontSize: headlineSize, lineHeight: 1.2, ...textStyle,
                  textShadow: highlightStyle === 'none' && (bgStyle === 'dark' || bgStyle === 'overlay') ? '0 2px 16px rgba(0,0,0,0.6)' : 'none' }}
                onDoubleClick={(e) => { e.stopPropagation(); setEditingText('headline'); setSelectedLayer('headline'); }}
              >{headline}</p>
            )}
          </div>
        </ResizableDraggableLayer>
      )}
      {subtext && (
        <ResizableDraggableLayer x={subtextPos.x} y={subtextPos.y} width={subtextWidth} onDragMouseDown={subtextDrag} onResizeMouseDown={subtextResize}
          selected={selectedLayer === 'subtext'} onSelect={() => setSelectedLayer('subtext')} onRemove={() => setSubtext('')} noBorder={exporting}>
          {editingText === 'subtext' ? (
            <textarea autoFocus className="bg-transparent outline-none resize-none leading-snug w-full"
              style={{ color: headlineColor === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)', fontSize: subtextSize, ...textStyle }}
              value={subtext} onChange={e => setSubtext(e.target.value)} onBlur={() => setEditingText(null)} onClick={e => e.stopPropagation()} rows={2} />
          ) : (
            <p className="leading-snug cursor-text w-full"
              style={{ color: headlineColor === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)', fontSize: subtextSize, ...textStyle }}
              onDoubleClick={(e) => { e.stopPropagation(); setEditingText('subtext'); setSelectedLayer('subtext'); }}
            >{subtext}</p>
          )}
        </ResizableDraggableLayer>
      )}
      {cta && (
        <DraggableLayer x={ctaPos.x} y={ctaPos.y} onMouseDown={ctaDrag}
          selected={selectedLayer === 'cta'} onSelect={() => setSelectedLayer('cta')} onRemove={() => setCta('')} noBorder={exporting}>
          {editingText === 'cta' ? (
            <input autoFocus className="outline-none bg-transparent font-semibold text-white text-center"
              style={{ backgroundColor: accentColor, padding: '8px 20px', borderRadius: 999, fontSize: subtextSize * 0.9, ...textStyle }}
              value={cta} onChange={e => setCta(e.target.value)} onBlur={() => setEditingText(null)} onClick={e => e.stopPropagation()} />
          ) : (
            <span className="inline-flex items-center font-semibold text-white cursor-text"
              style={{ backgroundColor: accentColor, padding: '8px 20px', borderRadius: 999, fontSize: subtextSize * 0.9, ...textStyle }}
              onDoubleClick={(e) => { e.stopPropagation(); setEditingText('cta'); setSelectedLayer('cta'); }}
            >{cta}</span>
          )}
        </DraggableLayer>
      )}
      {activeLogo && showLogo && (
        <DraggableLayer x={logoPos.x} y={logoPos.y} onMouseDown={logoDrag}
          selected={selectedLayer === 'logo'} onSelect={() => setSelectedLayer('logo')}
          onRemove={() => { setActiveLogo(null); setShowLogo(false); }}
          noBorder={exporting} style={{ width: `${logoScale}%`, minWidth: 40 }}>
          <img src={processedLogoUrl || activeLogo} alt="logo" onError={e => { e.target.style.display = 'none'; }}
            style={{ width: '100%', height: 'auto', display: 'block', opacity: logoOpacity, objectFit: 'contain' }} />
        </DraggableLayer>
      )}
    </div>
  );

  const sourcePanelContent = (
    <div className="space-y-4">
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
            <img src={url} alt={label} className="absolute inset-0 w-full h-full object-cover object-top" crossOrigin="anonymous" />
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
  );

  const stylePanelContent = (
    <div className="space-y-4">
      <SideSection label="Background">
        <div className="grid grid-cols-3 gap-1">
          {Object.keys(BACKGROUNDS).map(k => (
            <button key={k} onClick={() => setBgStyle(k)}
              className={`px-2 py-1.5 rounded-md text-[10px] font-semibold capitalize transition-colors ${bgStyle === k ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/15 hover:text-white'}`}>
              {k}
            </button>
          ))}
        </div>
        {bgStyle === 'overlay' && (
          <div className="mt-2">
            <p className="text-[10px] text-white/40 mb-1">Overlay opacity</p>
            <input type="range" min={0} max={0.85} step={0.05} value={bgOverlay}
              onChange={e => setBgOverlay(Number(e.target.value))} className="w-full accent-violet-500" />
          </div>
        )}
      </SideSection>
      {bgImage && (
        <SideSection label="Image Layer">
          <SliderControl label="Width %" min={10} max={100} value={imgWidth} onChange={setImgWidth} />
        </SideSection>
      )}
      <SideSection label="Font">
        <div className="grid grid-cols-2 gap-1">
          {FONTS.map(f => (
            <button key={f.value} onClick={() => setFont(f.value)}
              className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${font === f.value ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
              style={{ fontFamily: `'${f.value}', sans-serif` }}>
              {f.label}
            </button>
          ))}
        </div>
      </SideSection>
      <SideSection label="Headline">
        <SliderControl label="Font size" min={18} max={80} value={headlineSize} onChange={setHeadlineSize} unit="px" />
        <p className="text-[10px] text-white/40 mt-2 mb-1">Color</p>
        <ColorSwatches colors={colorSwatches} selected={headlineColor} onSelect={setHeadlineColor} />
      </SideSection>
      <SideSection label="Text Highlight">
        <div className="grid grid-cols-2 gap-1 mb-2">
          {HIGHLIGHT_STYLES.map(s => (
            <button key={s.id} onClick={() => setHighlightStyle(s.id)}
              className={`px-2 py-1.5 rounded-md text-[10px] font-semibold transition-colors ${highlightStyle === s.id ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/15 hover:text-white'}`}>
              {s.label}
            </button>
          ))}
        </div>
        {highlightStyle !== 'none' && (
          <>
            <p className="text-[10px] text-white/40 mb-1">Color</p>
            <ColorSwatches colors={['#000000', '#ffffff', '#1e1e1e', ...brandColors]} selected={highlightColor} onSelect={setHighlightColor} />
            <SliderControl label="Opacity" min={0.05} max={1} step={0.05} value={highlightOpacity} onChange={setHighlightOpacity} />
            <SliderControl label="Padding" min={0} max={24} value={highlightPadding} onChange={setHighlightPadding} unit="px" />
            <SliderControl label="Radius" min={0} max={20} value={highlightRadius} onChange={setHighlightRadius} unit="px" />
          </>
        )}
      </SideSection>
      <SideSection label="Subtext">
        <SliderControl label="Font size" min={10} max={36} value={subtextSize} onChange={setSubtextSize} unit="px" />
      </SideSection>
      <SideSection label="CTA / Accent">
        <ColorSwatches colors={colorSwatches} selected={accentColor} onSelect={setAccentColor} />
      </SideSection>
      <SideSection label="Logo">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-white/50">Visible</span>
          <button onClick={() => setShowLogo(v => !v)}
            className={`w-8 h-4 rounded-full transition-colors ${showLogo ? 'bg-violet-600' : 'bg-white/20'} flex items-center px-0.5`}>
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${showLogo ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
        <label className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs cursor-pointer transition-colors mb-2">
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
        {showLogo && activeLogo && (
          <>
            <SliderControl label="Width %" min={5} max={50} value={logoScale} onChange={setLogoScale} />
            <SliderControl label="Opacity" min={0.1} max={1} step={0.05} value={logoOpacity} onChange={setLogoOpacity} />
          </>
        )}
      </SideSection>
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
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#111318] flex flex-col" onClick={() => { setSelectedLayer(null); setEditingText(null); }}>
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-white/10 shrink-0 gap-2" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="text-white/50 hover:text-white text-sm font-medium transition-colors shrink-0">← Back</button>
        <div className="flex items-center gap-0.5 bg-white/10 rounded-lg p-0.5 overflow-x-auto shrink-0">
          {ASPECT_RATIOS.map(ar => (
            <button key={ar.id} onClick={() => setAspectRatio(ar)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${aspectRatio.id === ar.id ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white'}`}>
              {ar.label}
            </button>
          ))}
        </div>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-1 h-8 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors disabled:opacity-50 shrink-0">
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{exporting ? 'Exporting…' : 'Export PNG'}</span>
        </button>
      </div>

      {/* DESKTOP: 3-column layout */}
      <div className="hidden md:flex flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="w-52 shrink-0 border-r border-white/10 overflow-y-auto p-3">
          {sourcePanelContent}
        </div>
        <div className="flex-1 flex items-center justify-center overflow-auto p-8 bg-[#16181d]"
          onClick={() => { setSelectedLayer(null); setEditingText(null); }}>
          <div className="relative" style={{ width: '100%', maxWidth: `${80 / (aspectRatio.pad / 100)}vh`, maxHeight: '80vh' }}
            onClick={e => e.stopPropagation()}>
            <div ref={canvasRef} className="relative w-full overflow-hidden rounded-xl shadow-2xl select-none"
              style={{ paddingBottom: `${aspectRatio.pad}%`, ...bgObj }}>
              {canvasContent}
            </div>
            <p className="text-center text-white/25 text-xs mt-3">Double-click text to edit · Drag to move · Drag corner to resize</p>
          </div>
        </div>
        <div className="w-60 shrink-0 border-l border-white/10 overflow-y-auto p-3" onClick={e => e.stopPropagation()}>
          {stylePanelContent}
        </div>
      </div>

      {/* MOBILE: Canvas on top, tabs panel below */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Canvas area */}
        <div className="flex items-center justify-center p-3 bg-[#16181d]"
          onClick={() => { setSelectedLayer(null); setEditingText(null); }}>
          <div className="relative w-full" style={{ maxWidth: `${60 / (aspectRatio.pad / 100)}vh` }}
            onClick={e => e.stopPropagation()}>
            <div ref={canvasRef} className="relative w-full overflow-hidden rounded-xl shadow-2xl select-none"
              style={{ paddingBottom: `${aspectRatio.pad}%`, ...bgObj }}>
              {canvasContent}
            </div>
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="flex border-t border-b border-white/10 shrink-0" onClick={e => e.stopPropagation()}>
          {[
            { id: 'source', label: 'Source' },
            { id: 'style', label: 'Style' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setMobilePanelTab(tab.id)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${mobilePanelTab === tab.id ? 'text-violet-400 border-b-2 border-violet-500' : 'text-white/40'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile panel content */}
        <div className="flex-1 overflow-y-auto p-3" onClick={e => e.stopPropagation()}>
          {mobilePanelTab === 'source' ? sourcePanelContent : stylePanelContent}
        </div>
      </div>
    </div>
  );
}

// ─── ResizableDraggableLayer ─────────────────────────────────────────────────
function ResizableDraggableLayer({ x, y, width, onDragMouseDown, onResizeMouseDown, children, selected, onSelect, onRemove, noBorder }) {
  return (
    <div
      onMouseDown={onDragMouseDown}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      className="absolute cursor-move"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        outline: (!noBorder && selected) ? '2px solid #7c3aed' : (!noBorder ? '1px dashed rgba(255,255,255,0.1)' : 'none'),
        outlineOffset: 4,
        borderRadius: 4,
      }}
    >
      {children}
      {!noBorder && onRemove && (
        <div
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: -8, right: -8,
            width: 16, height: 16, borderRadius: '50%',
            background: '#ef4444', cursor: 'pointer', zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid white', fontSize: 10, color: 'white', fontWeight: 700, lineHeight: 1,
          }}
        >×</div>
      )}
      {!noBorder && (
        <div
          onMouseDown={onResizeMouseDown}
          style={{
            position: 'absolute', right: -6, bottom: -6,
            width: 12, height: 12, borderRadius: 3,
            background: selected ? '#7c3aed' : 'rgba(255,255,255,0.25)',
            cursor: 'ew-resize', zIndex: 10,
            border: '1.5px solid rgba(255,255,255,0.5)',
          }}
          onClick={e => e.stopPropagation()}
        />
      )}
    </div>
  );
}

// ─── Plain DraggableLayer (no resize) ────────────────────────────────────────
function DraggableLayer({ x, y, onMouseDown, children, selected, onSelect, onRemove, style = {}, noBorder = false }) {
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
      {!noBorder && onRemove && (
        <div
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: -8, right: -8,
            width: 16, height: 16, borderRadius: '50%',
            background: '#ef4444', cursor: 'pointer', zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid white', fontSize: 10, color: 'white', fontWeight: 700, lineHeight: 1,
          }}
        >×</div>
      )}
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
      {[...new Set(colors)].map(c => (
        <button key={c} onClick={() => onSelect(c)}
          className={`w-6 h-6 rounded-full border-2 transition-all shrink-0 ${selected === c ? 'border-violet-400 scale-110 shadow-md' : 'border-transparent'}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}