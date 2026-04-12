import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Download, Save, Loader2, Upload, ChevronLeft, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Sora:wght@300;400;500;600;700;800&display=swap';

function useGoogleFonts() {
  useEffect(() => {
    const id = 'canvas-gfonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet'; link.href = GOOGLE_FONTS_URL;
    document.head.appendChild(link);
  }, []);
}

const LAYOUTS = [
  { id: 'split-right', label: 'Split → Image Right', icon: '▥' },
  { id: 'split-left', label: 'Split → Image Left', icon: '▤' },
  { id: 'top-image', label: 'Image Top', icon: '▣' },
  { id: 'centered', label: 'Centered Text', icon: '☰' },
];

const PALETTES = [
  { id: 'light', label: 'Light', bg: '#FAFAFA', text: '#0A0A0A', sub: 'rgba(0,0,0,0.5)', tag: 'rgba(0,0,0,0.06)', tagText: 'rgba(0,0,0,0.4)', tagBorder: 'rgba(0,0,0,0.08)', card: '#FFFFFF' },
  { id: 'warm', label: 'Warm', bg: 'linear-gradient(160deg,#FFF8F0 0%,#FEF0E0 100%)', text: '#1A0A00', sub: 'rgba(26,10,0,0.5)', tag: 'rgba(180,80,0,0.07)', tagText: 'rgba(180,80,0,0.6)', tagBorder: 'rgba(180,80,0,0.12)', card: '#FFFFFF' },
  { id: 'dark', label: 'Dark', bg: 'linear-gradient(140deg,#09090B 0%,#18181F 100%)', text: '#FFFFFF', sub: 'rgba(255,255,255,0.55)', tag: 'rgba(255,255,255,0.06)', tagText: 'rgba(255,255,255,0.5)', tagBorder: 'rgba(255,255,255,0.1)', card: 'rgba(255,255,255,0.05)' },
  { id: 'purple', label: 'Purple', bg: 'linear-gradient(140deg,#1E0A3C 0%,#2D1260 100%)', text: '#FFFFFF', sub: 'rgba(255,255,255,0.6)', tag: 'rgba(167,139,250,0.15)', tagText: 'rgba(167,139,250,0.9)', tagBorder: 'rgba(167,139,250,0.25)', card: 'rgba(255,255,255,0.06)' },
];

const FONTS = [
  { id: 'inter', label: 'Inter', value: 'Inter, sans-serif' },
  { id: 'jakarta', label: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", sans-serif' },
  { id: 'sora', label: 'Sora', value: 'Sora, sans-serif' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', pad: 100 },
  { id: '4:5', label: '4:5', pad: 125 },
  { id: '9:16', label: '9:16', pad: 177.78 },
  { id: '16:9', label: '16:9', pad: 56.25 },
];

export default function PremiumCanvasEditor({
  initialHeadline = '', initialSubtext = '', initialCta = 'Get Started',
  initialImage = null, logoUrl = null, brandColors = [],
  screenshots = [], onClose, onSave,
}) {
  useGoogleFonts();
  const canvasRef = useRef(null);

  const [headline, setHeadline] = useState(initialHeadline);
  const [subtext, setSubtext] = useState(initialSubtext);
  const [cta, setCta] = useState(initialCta);
  const [tagText, setTagText] = useState('NEW');
  const [showTag, setShowTag] = useState(true);
  const [showLogo, setShowLogo] = useState(!!logoUrl);
  const [activeLogo, setActiveLogo] = useState(logoUrl);
  const [image, setImage] = useState(initialImage);
  const [layout, setLayout] = useState(LAYOUTS[0]);
  const [palette, setPalette] = useState(PALETTES[0]);
  const [font, setFont] = useState(FONTS[0]);
  const [ratio, setRatio] = useState(ASPECT_RATIOS[0]);
  const [ctaColor, setCtaColor] = useState(brandColors[0] || '#7C3AED');
  const [headlineSize, setHeadlineSize] = useState(48);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const allImages = [
    ...(screenshots || []),
    ...(initialImage && !screenshots?.includes(initialImage) ? [initialImage] : []),
  ];

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    await new Promise(r => setTimeout(r, 150));
    const canvas = await html2canvas(canvasRef.current, {
      useCORS: true, allowTaint: true, scale: 2, backgroundColor: null,
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href = url; a.download = 'ad-creative.png'; a.click();
    setExporting(false);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    await onSave({ headline, ad_copy: subtext, cta, preview_image: image });
    setSaving(false);
    toast.success('Saved');
  };

  const bgStyle = palette.bg.startsWith('linear') || palette.bg.startsWith('radial')
    ? { background: palette.bg }
    : { backgroundColor: palette.bg };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0C0C0F' }}>
      {/* Top bar */}
      <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-sm transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-white/50 text-sm">Ad Creative Canvas</span>
        </div>
        {/* Ratio selector */}
        <div className="flex items-center gap-0.5 bg-white/[0.06] rounded-lg p-0.5">
          {ASPECT_RATIOS.map(ar => (
            <button key={ar.id} onClick={() => setRatio(ar)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${ratio.id === ar.id ? 'bg-white/12 text-white' : 'text-white/35 hover:text-white/70'}`}>
              {ar.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
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

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT sidebar — controls */}
        <div className="w-56 shrink-0 border-r border-white/[0.06] flex flex-col overflow-y-auto">

          {/* Layout */}
          <Section title="Layout">
            {LAYOUTS.map(l => (
              <button key={l.id} onClick={() => setLayout(l)}
                className={`w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5 ${layout.id === l.id ? 'bg-violet-600/20 text-violet-300' : 'text-white/40 hover:bg-white/[0.05] hover:text-white/70'}`}>
                <span className="text-sm">{l.icon}</span> {l.label}
              </button>
            ))}
          </Section>

          {/* Palette */}
          <Section title="Color Palette">
            <div className="grid grid-cols-2 gap-1">
              {PALETTES.map(p => (
                <button key={p.id} onClick={() => setPalette(p)}
                  className={`py-2 rounded-lg text-[10px] font-semibold transition-all border ${palette.id === p.id ? 'border-violet-500 text-violet-300' : 'border-white/8 text-white/35 hover:border-white/20'}`}
                  style={{ background: p.bg.startsWith('linear') ? p.bg : p.bg }}>
                  <span style={{ color: p.id === 'light' || p.id === 'warm' ? '#333' : '#fff' }}>{p.label}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Font */}
          <Section title="Font">
            {FONTS.map(f => (
              <button key={f.id} onClick={() => setFont(f)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs mb-0.5 transition-colors ${font.id === f.id ? 'bg-violet-600/20 text-violet-300' : 'text-white/40 hover:bg-white/[0.05] hover:text-white/70'}`}
                style={{ fontFamily: f.value }}>
                {f.label}
              </button>
            ))}
          </Section>

          {/* CTA color */}
          <Section title="CTA Color">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[...(brandColors || []), '#7C3AED', '#2563EB', '#059669', '#DC2626', '#0A0A0A'].filter(Boolean).slice(0, 6).map(c => (
                <button key={c} onClick={() => setCtaColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-all shrink-0"
                  style={{ backgroundColor: c, borderColor: ctaColor === c ? 'white' : 'transparent' }} />
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-6 h-6 rounded border border-white/20" style={{ backgroundColor: ctaColor }} />
              <span className="text-[10px] text-white/35 font-mono">{ctaColor}</span>
              <input type="color" value={ctaColor} onChange={e => setCtaColor(e.target.value)} className="sr-only" />
            </label>
          </Section>

          {/* Headline size */}
          <Section title="Headline Size">
            <input type="range" min={24} max={80} value={headlineSize} onChange={e => setHeadlineSize(Number(e.target.value))}
              className="w-full accent-violet-500" />
            <p className="text-[10px] text-white/30 mt-1 text-right">{headlineSize}px</p>
          </Section>

          {/* Tag */}
          <Section title="Label Tag">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/40">Show tag</span>
              <button onClick={() => setShowTag(v => !v)}
                className={`w-8 h-4 rounded-full transition-colors relative ${showTag ? 'bg-violet-600' : 'bg-white/15'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${showTag ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {showTag && (
              <input value={tagText} onChange={e => setTagText(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 outline-none focus:border-violet-400"
                placeholder="e.g. NEW · FEATURED" />
            )}
          </Section>

          {/* Logo */}
          <Section title="Logo">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/40">Show logo</span>
              <button onClick={() => setShowLogo(v => !v)}
                className={`w-8 h-4 rounded-full transition-colors relative ${showLogo && activeLogo ? 'bg-violet-600' : 'bg-white/15'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${showLogo && activeLogo ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <label className="relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 text-[10px] cursor-pointer transition-colors">
              {uploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              {activeLogo ? 'Replace Logo' : 'Upload Logo'}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                setUploadingLogo(true);
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                setActiveLogo(file_url); setShowLogo(true);
                setUploadingLogo(false); e.target.value = '';
              }} />
            </label>
          </Section>
        </div>

        {/* CENTER — Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-[#0E0E12]">
          <div style={{ width: '100%', maxWidth: `min(${ratio.pad < 100 ? '85vh' : ratio.pad > 150 ? '55vh' : '80vh'} * ${100 / ratio.pad}, 88%)` }}>
            <div ref={canvasRef}
              className="relative w-full overflow-hidden rounded-2xl"
              style={{ paddingBottom: `${ratio.pad}%`, ...bgStyle, fontFamily: font.value }}>
              <div className="absolute inset-0">
                <AdLayout
                  layout={layout.id}
                  palette={palette}
                  font={font}
                  headline={headline}
                  subtext={subtext}
                  cta={cta}
                  tagText={tagText}
                  showTag={showTag}
                  image={image}
                  showLogo={showLogo}
                  activeLogo={activeLogo}
                  ctaColor={ctaColor}
                  headlineSize={headlineSize}
                  onHeadlineChange={setHeadline}
                  onSubtextChange={setSubtext}
                  onCtaChange={setCta}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT sidebar — text + image */}
        <div className="w-56 shrink-0 border-l border-white/[0.06] flex flex-col overflow-y-auto">
          <Section title="Headline">
            <textarea value={headline} onChange={e => setHeadline(e.target.value)} rows={3}
              className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white/80 outline-none focus:border-violet-400 resize-none"
              placeholder="Enter headline..." />
          </Section>
          <Section title="Subheadline">
            <textarea value={subtext} onChange={e => setSubtext(e.target.value)} rows={2}
              className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white/80 outline-none focus:border-violet-400 resize-none"
              placeholder="Supporting line..." />
          </Section>
          <Section title="CTA Button">
            <input value={cta} onChange={e => setCta(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/80 outline-none focus:border-violet-400"
              placeholder="Get Started" />
          </Section>
          <Section title="Image">
            <label className="relative flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 text-[10px] cursor-pointer transition-colors mb-2">
              {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Upload Image
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                setUploadingImage(true);
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                setImage(file_url);
                setUploadingImage(false); e.target.value = '';
              }} />
            </label>
            {/* Image gallery */}
            {allImages.length > 0 && (
              <div className="grid grid-cols-2 gap-1">
                {allImages.map((url, i) => (
                  <button key={i} onClick={() => setImage(url)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video ${image === url ? 'border-violet-500' : 'border-white/8 hover:border-white/20'}`}>
                    <img src={url} alt="" className="w-full h-full object-cover object-top" crossOrigin="anonymous" />
                  </button>
                ))}
                <button onClick={() => setImage(null)}
                  className="rounded-lg border border-white/8 hover:border-white/20 text-white/25 hover:text-white/50 text-[9px] flex items-center justify-center aspect-video transition-colors">
                  No Image
                </button>
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ── Ad Layout Renderer ── */
function AdLayout({ layout, palette, font, headline, subtext, cta, tagText, showTag, image, showLogo, activeLogo, ctaColor, headlineSize, onHeadlineChange, onSubtextChange, onCtaChange }) {
  const textBlock = (
    <TextBlock
      palette={palette}
      font={font}
      headline={headline}
      subtext={subtext}
      cta={cta}
      tagText={tagText}
      showTag={showTag}
      showLogo={showLogo}
      activeLogo={activeLogo}
      ctaColor={ctaColor}
      headlineSize={headlineSize}
      onHeadlineChange={onHeadlineChange}
      onSubtextChange={onSubtextChange}
      onCtaChange={onCtaChange}
    />
  );

  const imageBlock = image ? (
    <div className="relative w-full h-full rounded-2xl overflow-hidden"
      style={{ boxShadow: `0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.1)`, background: palette.card }}>
      <img src={image} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
    </div>
  ) : (
    <div className="w-full h-full rounded-2xl flex items-center justify-center"
      style={{ background: palette.card, border: `1px solid rgba(${palette.id === 'dark' || palette.id === 'purple' ? '255,255,255' : '0,0,0'},0.08)` }}>
      <span style={{ color: palette.sub, fontSize: 12, opacity: 0.5 }}>No image</span>
    </div>
  );

  if (layout === 'split-right') {
    return (
      <div className="absolute inset-0 flex p-8 gap-6">
        <div className="flex-1 flex flex-col justify-center min-w-0">{textBlock}</div>
        <div className="w-[44%] flex flex-col">{imageBlock}</div>
      </div>
    );
  }
  if (layout === 'split-left') {
    return (
      <div className="absolute inset-0 flex p-8 gap-6">
        <div className="w-[44%] flex flex-col">{imageBlock}</div>
        <div className="flex-1 flex flex-col justify-center min-w-0">{textBlock}</div>
      </div>
    );
  }
  if (layout === 'top-image') {
    return (
      <div className="absolute inset-0 flex flex-col p-7 gap-5">
        <div className="flex-1 min-h-0">{imageBlock}</div>
        <div className="shrink-0">{textBlock}</div>
      </div>
    );
  }
  // centered
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
      {image && (
        <div className="w-2/3 max-w-xs rounded-xl overflow-hidden aspect-video shrink-0"
          style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.16)' }}>
          <img src={image} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
        </div>
      )}
      <TextBlock
        palette={palette} font={font} headline={headline} subtext={subtext} cta={cta}
        tagText={tagText} showTag={showTag} showLogo={showLogo} activeLogo={activeLogo}
        ctaColor={ctaColor} headlineSize={headlineSize} centered
        onHeadlineChange={onHeadlineChange} onSubtextChange={onSubtextChange} onCtaChange={onCtaChange}
      />
    </div>
  );
}

function TextBlock({ palette, font, headline, subtext, cta, tagText, showTag, showLogo, activeLogo, ctaColor, headlineSize, centered, onHeadlineChange, onSubtextChange, onCtaChange }) {
  return (
    <div className={`flex flex-col gap-3 ${centered ? 'items-center text-center' : 'items-start'}`} style={{ fontFamily: font.value }}>
      {/* Logo */}
      {showLogo && activeLogo && (
        <img src={activeLogo} alt="Logo" className="h-7 w-auto object-contain mb-1"
          style={{ filter: (palette.id === 'dark' || palette.id === 'purple') ? 'brightness(0) invert(1)' : 'none', opacity: 0.85 }}
          crossOrigin="anonymous" />
      )}
      {/* Tag */}
      {showTag && tagText && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase"
          style={{ background: palette.tag, color: palette.tagText, border: `1px solid ${palette.tagBorder}`, letterSpacing: '0.1em' }}>
          {tagText}
        </div>
      )}
      {/* Headline */}
      <div style={{ color: palette.text, fontSize: headlineSize, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em', wordBreak: 'keep-all' }}>
        {headline}
      </div>
      {/* Subtext */}
      {subtext && (
        <div style={{ color: palette.sub, fontSize: Math.max(13, headlineSize * 0.3), fontWeight: 400, lineHeight: 1.55, letterSpacing: '-0.01em' }}>
          {subtext}
        </div>
      )}
      {/* CTA */}
      {cta && (
        <div className="mt-1">
          <span className="inline-flex items-center font-semibold"
            style={{
              backgroundColor: ctaColor,
              color: '#FFFFFF',
              fontSize: Math.max(12, headlineSize * 0.26),
              fontWeight: 600,
              borderRadius: 9999,
              padding: `${Math.max(8, headlineSize * 0.16)}px ${Math.max(18, headlineSize * 0.42)}px`,
              letterSpacing: '-0.01em',
              boxShadow: `0 8px 24px ${ctaColor}55`,
            }}>
            {cta} →
          </span>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-b border-white/[0.06] py-3 px-4">
      {title && <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 mb-2.5">{title}</p>}
      {children}
    </div>
  );
}