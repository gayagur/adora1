import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import {
  Download, Save, Loader2, Upload, ChevronLeft,
  Monitor, Smartphone, AlignLeft, AlignCenter, AlignRight,
  Type, Layers, Image as ImageIcon, X, Eye
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { LAYOUT_PRESETS, FONT_PRESETS, ASPECT_RATIOS, GOOGLE_FONTS_URL } from './DesignSystem';
import { useDraggable, useResizable } from './hooks/useDraggable';
import { CanvasLayer, DraggableElement } from './CanvasLayer';
import { MacbookMockup, IphoneMockup, BrowserMockup } from './DeviceMockup';

function useGoogleFonts() {
  useEffect(() => {
    const id = 'premium-canvas-gfonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet'; link.href = GOOGLE_FONTS_URL;
    document.head.appendChild(link);
  }, []);
}

/* ── Primitives ── */
const SidePanel = ({ children, title }) => (
  <div className="border-b border-white/6 py-3 px-4">
    {title && <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 mb-2.5">{title}</p>}
    {children}
  </div>
);

const Toggle = ({ value, onChange, label }) => (
  <div className="flex items-center justify-between">
    <span className="text-[11px] text-white/50">{label}</span>
    <button onClick={() => onChange(!value)}
      className={`relative w-8 h-4 rounded-full transition-colors ${value ? 'bg-violet-600' : 'bg-white/15'}`}>
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

const Slider = ({ label, value, min, max, step = 1, onChange, unit = '' }) => (
  <div className="mb-2">
    <div className="flex justify-between mb-1">
      <span className="text-[10px] text-white/40">{label}</span>
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="text-[10px] text-white/70 font-mono bg-white/6 border border-white/8 rounded w-12 text-center outline-none focus:border-violet-400 px-1"
      />
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1 accent-violet-500" />
  </div>
);

const ColorRow = ({ label, value, onChange, swatches = [] }) => (
  <div className="mb-2">
    <p className="text-[10px] text-white/35 mb-1.5">{label}</p>
    <div className="flex items-center gap-1.5 flex-wrap">
      {swatches.map(c => (
        <button key={c} onClick={() => onChange(c)}
          className="w-5 h-5 rounded-full border-2 transition-all shrink-0"
          style={{ backgroundColor: c, borderColor: value === c ? '#7c3aed' : 'transparent', transform: value === c ? 'scale(1.2)' : 'scale(1)' }}
        />
      ))}
      <label className="flex items-center gap-1 cursor-pointer ml-auto">
        <div className="w-5 h-5 rounded border border-white/15" style={{ backgroundColor: value }} />
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="sr-only" />
      </label>
      <input
        value={value}
        onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(e.target.value); }}
        className="text-[9px] font-mono text-white/50 bg-white/5 border border-white/8 rounded px-1.5 py-0.5 w-16 outline-none focus:border-violet-400"
        placeholder="#000000"
      />
    </div>
  </div>
);

const WeightSelector = ({ value, onChange }) => {
  const weights = [
    { label: 'Light', value: 300 }, { label: 'Regular', value: 400 },
    { label: 'Medium', value: 500 }, { label: 'SemiBold', value: 600 },
    { label: 'Bold', value: 700 }, { label: 'Black', value: 900 },
  ];
  return (
    <div className="grid grid-cols-3 gap-0.5 mb-2">
      {weights.map(w => (
        <button key={w.value} onClick={() => onChange(w.value)}
          className={`py-1 rounded text-[9px] transition-colors ${value === w.value ? 'bg-violet-600 text-white' : 'bg-white/4 text-white/35 hover:bg-white/8'}`}
          style={{ fontWeight: w.value }}>
          {w.label}
        </button>
      ))}
    </div>
  );
};

const AlignSelector = ({ value, onChange }) => (
  <div className="flex gap-0.5 mb-2">
    {[
      { v: 'left', Icon: AlignLeft },
      { v: 'center', Icon: AlignCenter },
      { v: 'right', Icon: AlignRight },
    ].map(({ v, Icon }) => (
      <button key={v} onClick={() => onChange(v)}
        className={`flex-1 py-1.5 rounded flex items-center justify-center transition-colors ${value === v ? 'bg-violet-600/20 text-violet-400' : 'bg-white/4 text-white/25 hover:bg-white/8'}`}>
        <Icon className="w-3 h-3" />
      </button>
    ))}
  </div>
);

/* ── Default layer styles ── */
const defaultLayerStyle = (type, brandColor, mode) => {
  const isDark = mode === 'dark';
  const base = {
    headline: {
      fontSize: 56, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.025,
      color: isDark ? '#FFFFFF' : '#0A0A0A', align: 'left',
      bgEnabled: false, bgColor: '#000000', bgOpacity: 0.4,
    },
    subtext: {
      fontSize: 18, fontWeight: 400, lineHeight: 1.6, letterSpacing: -0.01,
      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)', align: 'left',
      bgEnabled: false, bgColor: '#000000', bgOpacity: 0.3,
    },
    cta: {
      fontSize: 15, fontWeight: 600, lineHeight: 1, letterSpacing: -0.01,
      color: '#FFFFFF', align: 'center',
      bgColor: brandColor || '#7c3aed', bgRadius: 9999, bgPaddingX: 24, bgPaddingY: 10,
      shadow: true,
    },
  };
  return base[type] || base.subtext;
};

export default function PremiumCanvasEditor({
  initialHeadline = '', initialSubtext = '', initialCta = '',
  initialImage = null, logoUrl = null, brandColors = [],
  screenshots = [], onClose, onSave,
}) {
  useGoogleFonts();
  const canvasRef = useRef(null);

  const [headline, setHeadline] = useState(initialHeadline);
  const [subtext, setSubtext] = useState(initialSubtext);
  const [cta, setCta] = useState(initialCta);
  const [pill, setPill] = useState('NEW');
  const [showPill, setShowPill] = useState(true);
  const [editingText, setEditingText] = useState(null);

  const [bgImage, setBgImage] = useState(initialImage);
  const [colorMode, setColorMode] = useState('light');
  const [deviceMode, setDeviceMode] = useState('macbook');
  const [showDevice, setShowDevice] = useState(!!initialImage);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [showLogo, setShowLogo] = useState(!!logoUrl);
  const [activeLogo, setActiveLogo] = useState(logoUrl);
  const [fontPreset, setFontPreset] = useState(FONT_PRESETS[0]);
  const [deviceRotation, setDeviceRotation] = useState(-3);
  const [shadowIntensity, setShadowIntensity] = useState(0.4);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('layout');

  // Per-layer style state
  const primaryBrand = brandColors[0] || '#7c3aed';
  const [headlineStyle, setHeadlineStyle] = useState(() => defaultLayerStyle('headline', primaryBrand, 'light'));
  const [subtextStyle, setSubtextStyle] = useState(() => defaultLayerStyle('subtext', primaryBrand, 'light'));
  const [ctaStyle, setCtaStyle] = useState(() => defaultLayerStyle('cta', primaryBrand, 'light'));

  // Sync defaults when colorMode changes
  useEffect(() => {
    setHeadlineStyle(prev => ({
      ...prev,
      color: colorMode === 'dark' ? '#FFFFFF' : '#0A0A0A',
    }));
    setSubtextStyle(prev => ({
      ...prev,
      color: colorMode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
    }));
  }, [colorMode]);

  const brandSwatches = [...new Set([...brandColors, '#0A0A0A', '#FFFFFF', '#7c3aed', '#2563eb', '#059669'])].slice(0, 8);

  // Draggable positions
  const [pillPos, , pillDrag] = useDraggable({ x: 8, y: 8 }, canvasRef);
  const [headlinePos, setHeadlinePos, headlineDrag] = useDraggable({ x: 8, y: 20 }, canvasRef);
  const [subtextPos, setSubtextPos, subtextDrag] = useDraggable({ x: 8, y: 60 }, canvasRef);
  const [ctaPos, , ctaDrag] = useDraggable({ x: 8, y: 78 }, canvasRef);
  const [imagePos, setImagePos, imageDrag] = useDraggable({ x: 50, y: 0 }, canvasRef);
  const [logoPos, , logoDrag] = useDraggable({ x: 8, y: 4 }, canvasRef);

  // Resizable widths
  const [headlineWidth, setHeadlineWidth, headlineResize] = useResizable(46, canvasRef);
  const [subtextWidth, setSubtextWidth, subtextResize] = useResizable(40, canvasRef);
  const [imageWidth, setImageWidth, imageResize] = useResizable(50, canvasRef);
  const [logoWidth, , logoResize] = useResizable(16, canvasRef);

  const applyLayout = useCallback((preset) => {
    const e = preset.elements;
    if (e.headline) {
      setHeadlinePos({ x: e.headline.x, y: e.headline.y });
      setHeadlineWidth(e.headline.width);
      setHeadlineStyle(prev => ({ ...prev, fontSize: e.headline.fontSize, align: e.headline.centered ? 'center' : 'left' }));
    }
    if (e.subtext) {
      setSubtextPos({ x: e.subtext.x, y: e.subtext.y });
      setSubtextWidth(e.subtext.width);
      setSubtextStyle(prev => ({ ...prev, fontSize: e.subtext.fontSize }));
    }
    if (e.image) { setImagePos({ x: e.image.x, y: e.image.y }); setImageWidth(e.image.width); }
    setColorMode(preset.colorMode);
  }, []);

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    setSelectedLayer(null);
    setEditingText(null);
    await new Promise(r => setTimeout(r, 200));
    const canvas = await html2canvas(canvasRef.current, {
      useCORS: true, allowTaint: true, scale: 2, backgroundColor: null, imageTimeout: 30000,
      onclone: (doc) => {
        const link = doc.createElement('link'); link.rel = 'stylesheet'; link.href = GOOGLE_FONTS_URL;
        doc.head.appendChild(link);
        const style = doc.createElement('style'); style.textContent = '* { outline: none !important; }';
        doc.head.appendChild(style);
      }
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href = url; a.download = 'ad-creative.png'; a.click();
    setExporting(false);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    await onSave({ headline, ad_copy: subtext, cta, preview_image: bgImage });
    setSaving(false);
    toast.success('Saved');
  };

  const bgStyle = colorMode === 'dark'
    ? { background: 'linear-gradient(135deg, #08080A 0%, #0F0F16 60%, #0A0810 100%)' }
    : { background: 'linear-gradient(160deg, #FAFAF8 0%, #F0EFE9 100%)' };

  const renderDevice = (url) => {
    if (!url || deviceMode === 'raw') return <img src={url} alt="" className="w-full rounded-lg block" style={{ boxShadow: `0 32px 80px rgba(0,0,0,${shadowIntensity})` }} crossOrigin="anonymous" />;
    if (deviceMode === 'macbook') return <MacbookMockup imageUrl={url} rotation={deviceRotation} shadowIntensity={shadowIntensity} />;
    if (deviceMode === 'iphone') return <IphoneMockup imageUrl={url} rotation={-deviceRotation} shadowIntensity={shadowIntensity} />;
    if (deviceMode === 'browser') return <BrowserMockup imageUrl={url} shadowIntensity={shadowIntensity} />;
  };

  const makeTextStyle = (s, font) => ({
    fontFamily: font,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    lineHeight: s.lineHeight,
    letterSpacing: `${s.letterSpacing}em`,
    color: s.color,
    textAlign: s.align,
    width: '100%',
  });

  // Right panel content based on selected layer or tab
  const activeLayer = selectedLayer;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0C0C0F]" onClick={() => { setSelectedLayer(null); setEditingText(null); }}>

      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b border-white/6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-sm transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-white/60 text-sm font-medium">Canvas Editor</span>
        </div>
        <div className="flex items-center gap-0.5 bg-white/6 rounded-lg p-0.5">
          {ASPECT_RATIOS.map(ar => (
            <button key={ar.id} onClick={() => setAspectRatio(ar)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${aspectRatio.id === ar.id ? 'bg-white/12 text-white' : 'text-white/35 hover:text-white/70'}`}>
              {ar.display}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setColorMode(m => m === 'light' ? 'dark' : 'light')}
            className="h-8 px-3 rounded-lg bg-white/6 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
            {colorMode === 'light' ? '☀️ Light' : '🌙 Dark'}
          </button>
          {onSave && (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
            </button>
          )}
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors disabled:opacity-50">
            <Download className="w-3 h-3" /> {exporting ? 'Exporting…' : 'Export PNG'}
          </button>
        </div>
      </div>

      {/* Main 3-col */}
      <div className="flex flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* LEFT */}
        <div className="hidden lg:flex w-48 shrink-0 border-r border-white/6 flex-col overflow-y-auto">
          <SidePanel title="Layout">
            {Object.values(LAYOUT_PRESETS).map(preset => (
              <button key={preset.id} onClick={() => applyLayout(preset)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/6 text-white/55 hover:text-white text-xs font-medium transition-colors text-left mb-0.5">
                <span className="text-base leading-none">{preset.icon}</span>
                <div>
                  <p>{preset.name}</p>
                  <p className="text-[9px] text-white/25 mt-0.5">{preset.description}</p>
                </div>
              </button>
            ))}
          </SidePanel>
          <SidePanel title="Image Source">
            {[
              ...(screenshots || []).map((url, i) => ({ url, label: `Screenshot ${i + 1}` })),
              ...(initialImage && !screenshots?.includes(initialImage) ? [{ url: initialImage, label: 'AI Image' }] : []),
            ].map(({ url, label }) => (
              <button key={url} onClick={() => { setBgImage(url); setShowDevice(true); }}
                className={`relative w-full rounded-lg overflow-hidden border-2 transition-all mb-1.5 ${bgImage === url ? 'border-violet-500' : 'border-white/6 hover:border-white/15'}`}
                style={{ paddingBottom: '56.25%' }}>
                <img src={url} alt={label} className="absolute inset-0 w-full h-full object-cover object-top" crossOrigin="anonymous" />
              </button>
            ))}
            <button onClick={() => { setBgImage(null); setShowDevice(false); }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/4 hover:bg-white/8 text-white/30 hover:text-white/60 text-[10px] transition-colors">
              No Image
            </button>
          </SidePanel>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-[#0E0E12]"
          onClick={() => { setSelectedLayer(null); setEditingText(null); }}>
          <div className="relative" style={{ width: '100%', maxWidth: `min(${aspectRatio.pad < 100 ? '90vh' : '70vh'} * ${100 / aspectRatio.pad}, 90%)` }}
            onClick={e => e.stopPropagation()}>
            <div ref={canvasRef}
              className="relative w-full overflow-hidden rounded-2xl select-none"
              style={{ paddingBottom: `${aspectRatio.pad}%`, ...bgStyle }}>
              <div className="absolute inset-0">

                {/* Image Layer */}
                {bgImage && showDevice && (
                  <CanvasLayer x={imagePos.x} y={imagePos.y} width={imageWidth}
                    dragBind={imageDrag} resizeBind={imageResize}
                    selected={selectedLayer === 'image'} onSelect={() => setSelectedLayer('image')}
                    onRemove={() => { setBgImage(null); setShowDevice(false); }} exporting={exporting}>
                    {renderDevice(bgImage)}
                  </CanvasLayer>
                )}

                {/* Pill */}
                {showPill && (
                  <DraggableElement x={pillPos.x} y={pillPos.y} dragBind={pillDrag}
                    selected={selectedLayer === 'pill'} onSelect={() => setSelectedLayer('pill')} exporting={exporting}>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase"
                      style={{
                        fontFamily: fontPreset.body,
                        background: colorMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        color: colorMode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                        border: `1px solid ${colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        letterSpacing: '0.1em',
                      }}>
                      {editingText === 'pill' ? (
                        <input autoFocus value={pill} onChange={e => setPill(e.target.value)}
                          onBlur={() => setEditingText(null)} onClick={e => e.stopPropagation()}
                          className="bg-transparent outline-none w-20 text-center"
                          style={{ fontFamily: fontPreset.body, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em' }} />
                      ) : (
                        <span onDoubleClick={e => { e.stopPropagation(); setEditingText('pill'); setSelectedLayer('pill'); }} className="cursor-text">{pill}</span>
                      )}
                    </div>
                  </DraggableElement>
                )}

                {/* Headline */}
                {headline && (
                  <CanvasLayer x={headlinePos.x} y={headlinePos.y} width={headlineWidth}
                    dragBind={headlineDrag} resizeBind={headlineResize}
                    selected={selectedLayer === 'headline'} onSelect={() => { setSelectedLayer('headline'); setActiveTab('type'); }}
                    onRemove={() => setHeadline('')} exporting={exporting}>
                    <div style={{
                      position: 'relative',
                      background: headlineStyle.bgEnabled
                        ? `rgba(${hexToRgb(headlineStyle.bgColor)},${headlineStyle.bgOpacity})`
                        : 'transparent',
                      borderRadius: headlineStyle.bgEnabled ? 8 : 0,
                      padding: headlineStyle.bgEnabled ? '6px 10px' : 0,
                    }}>
                      {editingText === 'headline' ? (
                        <textarea autoFocus value={headline} onChange={e => setHeadline(e.target.value)}
                          onBlur={() => setEditingText(null)} onClick={e => e.stopPropagation()}
                          className="bg-transparent outline-none resize-none w-full"
                          style={makeTextStyle(headlineStyle, fontPreset.headline)} rows={3} />
                      ) : (
                        <p style={makeTextStyle(headlineStyle, fontPreset.headline)}
                          onDoubleClick={e => { e.stopPropagation(); setEditingText('headline'); setSelectedLayer('headline'); setActiveTab('type'); }}
                          className="cursor-text">{headline}</p>
                      )}
                    </div>
                  </CanvasLayer>
                )}

                {/* Subtext */}
                {subtext && (
                  <CanvasLayer x={subtextPos.x} y={subtextPos.y} width={subtextWidth}
                    dragBind={subtextDrag} resizeBind={subtextResize}
                    selected={selectedLayer === 'subtext'} onSelect={() => { setSelectedLayer('subtext'); setActiveTab('type'); }}
                    onRemove={() => setSubtext('')} exporting={exporting}>
                    <div style={{
                      position: 'relative',
                      background: subtextStyle.bgEnabled
                        ? `rgba(${hexToRgb(subtextStyle.bgColor)},${subtextStyle.bgOpacity})`
                        : 'transparent',
                      borderRadius: subtextStyle.bgEnabled ? 6 : 0,
                      padding: subtextStyle.bgEnabled ? '4px 8px' : 0,
                    }}>
                      {editingText === 'subtext' ? (
                        <textarea autoFocus value={subtext} onChange={e => setSubtext(e.target.value)}
                          onBlur={() => setEditingText(null)} onClick={e => e.stopPropagation()}
                          className="bg-transparent outline-none resize-none w-full"
                          style={makeTextStyle(subtextStyle, fontPreset.body)} rows={2} />
                      ) : (
                        <p style={makeTextStyle(subtextStyle, fontPreset.body)}
                          onDoubleClick={e => { e.stopPropagation(); setEditingText('subtext'); setSelectedLayer('subtext'); setActiveTab('type'); }}
                          className="cursor-text">{subtext}</p>
                      )}
                    </div>
                  </CanvasLayer>
                )}

                {/* CTA */}
                {cta && (
                  <DraggableElement x={ctaPos.x} y={ctaPos.y} dragBind={ctaDrag}
                    selected={selectedLayer === 'cta'} onSelect={() => { setSelectedLayer('cta'); setActiveTab('type'); }}
                    onRemove={() => setCta('')} exporting={exporting}>
                    <div className="inline-flex">
                      {editingText === 'cta' ? (
                        <input autoFocus value={cta} onChange={e => setCta(e.target.value)}
                          onBlur={() => setEditingText(null)} onClick={e => e.stopPropagation()}
                          className="outline-none text-center"
                          style={{
                            backgroundColor: ctaStyle.bgColor,
                            color: ctaStyle.color,
                            fontFamily: fontPreset.body,
                            fontSize: ctaStyle.fontSize,
                            fontWeight: ctaStyle.fontWeight,
                            letterSpacing: `${ctaStyle.letterSpacing}em`,
                            borderRadius: ctaStyle.bgRadius,
                            padding: `${ctaStyle.bgPaddingY}px ${ctaStyle.bgPaddingX}px`,
                          }} />
                      ) : (
                        <span className="inline-flex items-center cursor-text"
                          style={{
                            backgroundColor: ctaStyle.bgColor,
                            color: ctaStyle.color,
                            fontFamily: fontPreset.body,
                            fontSize: ctaStyle.fontSize,
                            fontWeight: ctaStyle.fontWeight,
                            letterSpacing: `${ctaStyle.letterSpacing}em`,
                            borderRadius: ctaStyle.bgRadius,
                            padding: `${ctaStyle.bgPaddingY}px ${ctaStyle.bgPaddingX}px`,
                            boxShadow: ctaStyle.shadow ? `0 8px 32px ${ctaStyle.bgColor}66` : 'none',
                          }}
                          onDoubleClick={e => { e.stopPropagation(); setEditingText('cta'); setSelectedLayer('cta'); setActiveTab('type'); }}>
                          {cta} →
                        </span>
                      )}
                    </div>
                  </DraggableElement>
                )}

                {/* Logo */}
                {activeLogo && showLogo && (
                  <CanvasLayer x={logoPos.x} y={logoPos.y} width={logoWidth}
                    dragBind={logoDrag} resizeBind={logoResize}
                    selected={selectedLayer === 'logo'} onSelect={() => setSelectedLayer('logo')}
                    onRemove={() => { setActiveLogo(null); setShowLogo(false); }} exporting={exporting}>
                    <img src={activeLogo} alt="Logo" className="w-full h-auto object-contain block"
                      style={{ filter: colorMode === 'dark' ? 'brightness(0) invert(1)' : 'none', opacity: 0.85 }}
                      crossOrigin="anonymous" />
                  </CanvasLayer>
                )}

              </div>
            </div>
            <p className="text-center text-white/15 text-[10px] mt-3 font-medium tracking-wide">
              DOUBLE-CLICK TO EDIT · DRAG TO MOVE · DRAG CORNER TO RESIZE · CLICK LAYER TO SELECT
            </p>
          </div>
        </div>

        {/* RIGHT — Controls */}
        <div className="hidden lg:flex w-60 shrink-0 border-l border-white/6 flex-col overflow-y-auto" onClick={e => e.stopPropagation()}>

          {/* Tabs */}
          <div className="flex border-b border-white/6 shrink-0">
            {[
              { id: 'layout', icon: Layers, label: 'Style' },
              { id: 'type', icon: Type, label: 'Text' },
              { id: 'image', icon: ImageIcon, label: 'Image' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'text-violet-400 border-b border-violet-500' : 'text-white/25 hover:text-white/50'}`}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Style Tab ── */}
          {activeTab === 'layout' && (
            <>
              <SidePanel title="Font Preset">
                <div className="space-y-0.5">
                  {FONT_PRESETS.map(p => (
                    <button key={p.id} onClick={() => setFontPreset(p)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${fontPreset.id === p.id ? 'bg-violet-600/20 text-violet-300' : 'bg-white/3 text-white/45 hover:bg-white/6 hover:text-white/80'}`}
                      style={{ fontFamily: p.headline }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </SidePanel>

              <SidePanel title="Brand Colors">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {brandSwatches.map(c => (
                    <button key={c} title={c}
                      className="w-6 h-6 rounded-full border border-white/10 shrink-0 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        if (activeLayer === 'headline') setHeadlineStyle(s => ({ ...s, color: c }));
                        else if (activeLayer === 'subtext') setSubtextStyle(s => ({ ...s, color: c }));
                        else if (activeLayer === 'cta') setCtaStyle(s => ({ ...s, bgColor: c }));
                      }}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-white/25">Click a color then select a layer to apply</p>
              </SidePanel>

              <SidePanel title="Pill / Tag">
                <Toggle value={showPill} onChange={setShowPill} label="Show tag" />
                {showPill && (
                  <input value={pill} onChange={e => setPill(e.target.value)}
                    className="mt-2 w-full bg-white/5 border border-white/8 rounded-lg px-2.5 py-1.5 text-xs text-white/70 outline-none focus:border-violet-400"
                    placeholder="Tag text" />
                )}
              </SidePanel>

              <SidePanel title="Logo">
                <Toggle value={showLogo && !!activeLogo} onChange={v => setShowLogo(v)} label="Show logo" />
                <label className="flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg bg-white/4 hover:bg-white/8 text-white/40 text-[10px] cursor-pointer transition-colors">
                  <Upload className="w-3 h-3" />
                  {activeLogo ? 'Replace' : 'Upload Logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    setActiveLogo(file_url); setShowLogo(true); e.target.value = '';
                  }} />
                </label>
              </SidePanel>
            </>
          )}

          {/* ── Text Tab ── */}
          {activeTab === 'type' && (
            <>
              {/* Layer selector */}
              <SidePanel>
                <div className="flex gap-0.5">
                  {[
                    { id: 'headline', label: 'Headline' },
                    { id: 'subtext', label: 'Body' },
                    { id: 'cta', label: 'CTA' },
                  ].map(l => (
                    <button key={l.id} onClick={() => setSelectedLayer(l.id)}
                      className={`flex-1 py-1.5 rounded text-[10px] font-semibold transition-colors ${selectedLayer === l.id ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/35 hover:bg-white/8'}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </SidePanel>

              {/* Headline controls */}
              {(selectedLayer === 'headline' || !selectedLayer) && (
                <LayerStylePanel
                  label="Headline"
                  style={headlineStyle}
                  onChange={setHeadlineStyle}
                  swatches={brandSwatches}
                  showBg
                />
              )}

              {/* Body controls */}
              {selectedLayer === 'subtext' && (
                <LayerStylePanel
                  label="Body Text"
                  style={subtextStyle}
                  onChange={setSubtextStyle}
                  swatches={brandSwatches}
                  showBg
                />
              )}

              {/* CTA controls */}
              {selectedLayer === 'cta' && (
                <CtaStylePanel
                  style={ctaStyle}
                  onChange={setCtaStyle}
                  swatches={brandSwatches}
                />
              )}
            </>
          )}

          {/* ── Image Tab ── */}
          {activeTab === 'image' && (
            <>
              <SidePanel title="Device Frame">
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'macbook', label: 'MacBook', DevIcon: Monitor },
                    { id: 'iphone', label: 'iPhone', DevIcon: Smartphone },
                    { id: 'browser', label: 'Browser', DevIcon: Eye },
                    { id: 'raw', label: 'Raw Image', DevIcon: ImageIcon },
                  ].map(({ id, label, DevIcon }) => (
                    <button key={id} onClick={() => setDeviceMode(id)}
                      className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-colors ${deviceMode === id ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' : 'bg-white/4 text-white/30 hover:bg-white/8 border border-transparent'}`}>
                      <DevIcon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </SidePanel>
              <SidePanel title="Device Effects">
                <Slider label="Rotation" min={-8} max={8} step={0.5} value={deviceRotation} onChange={setDeviceRotation} unit="°" />
                <Slider label="Shadow" min={0} max={0.8} step={0.05} value={shadowIntensity} onChange={setShadowIntensity} />
              </SidePanel>
              <SidePanel title="Upload Image">
                <label className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg bg-white/4 hover:bg-white/8 text-white/45 text-[10px] cursor-pointer transition-colors">
                  <Upload className="w-3 h-3" />
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    setBgImage(file_url); setShowDevice(true); e.target.value = '';
                  }} />
                </label>
              </SidePanel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-panels ── */
function LayerStylePanel({ label, style, onChange, swatches, showBg }) {
  const set = (k, v) => onChange(prev => ({ ...prev, [k]: v }));
  return (
    <>
      <SidePanel title={`${label} — Color`}>
        <ColorRow label="Text color" value={style.color} onChange={v => set('color', v)} swatches={swatches} />
      </SidePanel>
      <SidePanel title={`${label} — Typography`}>
        <Slider label="Font size" min={12} max={120} value={style.fontSize} onChange={v => set('fontSize', v)} unit="px" />
        <p className="text-[9px] text-white/25 mb-1.5 mt-1">Weight</p>
        <WeightSelector value={style.fontWeight} onChange={v => set('fontWeight', v)} />
        <AlignSelector value={style.align} onChange={v => set('align', v)} />
        <Slider label="Line height" min={0.8} max={2.5} step={0.05} value={style.lineHeight} onChange={v => set('lineHeight', v)} />
        <Slider label="Letter spacing" min={-0.05} max={0.2} step={0.005} value={style.letterSpacing} onChange={v => set('letterSpacing', v)} />
      </SidePanel>
      {showBg && (
        <SidePanel title={`${label} — Background`}>
          <Toggle value={style.bgEnabled} onChange={v => set('bgEnabled', v)} label="Text background" />
          {style.bgEnabled && (
            <div className="mt-2 space-y-2">
              <ColorRow label="Background color" value={style.bgColor} onChange={v => set('bgColor', v)} swatches={['#000000', '#FFFFFF', '#1a1a2e', '#0f3460']} />
              <Slider label="Opacity" min={0} max={1} step={0.05} value={style.bgOpacity} onChange={v => set('bgOpacity', v)} />
            </div>
          )}
        </SidePanel>
      )}
    </>
  );
}

function CtaStylePanel({ style, onChange, swatches }) {
  const set = (k, v) => onChange(prev => ({ ...prev, [k]: v }));
  return (
    <>
      <SidePanel title="CTA — Colors">
        <ColorRow label="Button color" value={style.bgColor} onChange={v => set('bgColor', v)} swatches={swatches} />
        <ColorRow label="Text color" value={style.color} onChange={v => set('color', v)} swatches={['#FFFFFF', '#0A0A0A', '#F5F5F5']} />
      </SidePanel>
      <SidePanel title="CTA — Typography">
        <Slider label="Font size" min={10} max={32} value={style.fontSize} onChange={v => set('fontSize', v)} unit="px" />
        <p className="text-[9px] text-white/25 mb-1.5 mt-1">Weight</p>
        <WeightSelector value={style.fontWeight} onChange={v => set('fontWeight', v)} />
      </SidePanel>
      <SidePanel title="CTA — Shape">
        <Slider label="Border radius" min={0} max={9999} step={4} value={style.bgRadius} onChange={v => set('bgRadius', v)} unit="px" />
        <Slider label="H Padding" min={8} max={64} value={style.bgPaddingX} onChange={v => set('bgPaddingX', v)} unit="px" />
        <Slider label="V Padding" min={4} max={32} value={style.bgPaddingY} onChange={v => set('bgPaddingY', v)} unit="px" />
        <div className="mt-1">
          <Toggle value={style.shadow} onChange={v => set('shadow', v)} label="Glow shadow" />
        </div>
      </SidePanel>
    </>
  );
}

// Helpers
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '0,0,0';
}