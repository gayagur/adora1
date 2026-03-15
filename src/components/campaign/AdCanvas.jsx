import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Monitor, Smartphone, Square } from 'lucide-react';
import AdPreview from './AdPreview';

export const LAYOUTS = [
  { id: 'hero',    label: 'Screenshot Hero',   icon: '◧', desc: 'Headline left, screenshot right' },
  { id: 'product', label: 'Product Focus',     icon: '⊞', desc: 'Screenshot centered, text above' },
  { id: 'split',   label: 'Split',             icon: '◫', desc: 'Text left, screenshot right' },
  { id: 'overlay', label: 'Dark Overlay',      icon: '◼', desc: 'Full image, text centered' },
  { id: 'story',   label: 'Story / Reel',      icon: '▬', desc: 'Vertical, headline bottom' },
];

const ASPECT_RATIOS = [
  { id: '1/1',   label: 'Square', icon: Square },
  { id: '16/9',  label: 'Landscape', icon: Monitor },
  { id: '9/16',  label: 'Story', icon: Smartphone },
];

const LOGO_POSITIONS = [
  { id: 'top-left',     label: 'Top Left' },
  { id: 'top-right',    label: 'Top Right' },
  { id: 'bottom-left',  label: 'Bottom Left' },
  { id: 'bottom-right', label: 'Bottom Right' },
];

export default function AdCanvas({ imageUrl, logoUrl, headline, subtext, cta, brandColors, screenshots, onExport }) {
  const previewRef = useRef(null);
  const [layoutId, setLayoutId] = useState('hero');
  const [aspectRatio, setAspectRatio] = useState('1/1');
  const [logoPos, setLogoPos] = useState('top-right');
  const [accentColor, setAccentColor] = useState(brandColors?.[0] || '#7c3aed');
  const [selectedImage, setSelectedImage] = useState(imageUrl);
  const [exporting, setExporting] = useState(false);

  // Build image source list: screenshots first, then imageUrl
  const imageSources = [
    ...(screenshots || []).map((url, i) => ({ url, label: `Screenshot ${i + 1}` })),
    ...(imageUrl && !screenshots?.includes(imageUrl) ? [{ url: imageUrl, label: 'AI Generated' }] : []),
  ];

  const handleExport = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    const canvas = await html2canvas(previewRef.current, { useCORS: true, scale: 2, logging: false });
    const url = canvas.toDataURL('image/png');
    onExport?.(url);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ad-creative.png';
    a.click();
    setExporting(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Preview */}
      <div ref={previewRef}>
        <AdPreview
          layoutId={layoutId}
          imageUrl={selectedImage}
          logoUrl={logoUrl}
          headline={headline}
          subtext={subtext}
          cta={cta}
          accentColor={accentColor}
          logoPos={logoPos}
          aspectRatio={aspectRatio}
        />
      </div>

      {/* Controls */}
      <div className="space-y-3">

        {/* Visual Source */}
        {imageSources.length > 0 && (
          <ControlGroup label="Visual Source">
            <div className="grid grid-cols-3 gap-1.5">
              {imageSources.map(({ url, label }) => (
                <button
                  key={url}
                  onClick={() => setSelectedImage(url)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video ${selectedImage === url ? 'border-violet-500 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={url} alt={label} className="w-full h-full object-cover object-top" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                    <p className="text-[9px] text-white truncate">{label}</p>
                  </div>
                </button>
              ))}
            </div>
          </ControlGroup>
        )}

        {/* Layout Templates */}
        <ControlGroup label="Layout Template">
          <div className="grid grid-cols-1 gap-1">
            {LAYOUTS.map(l => (
              <button
                key={l.id}
                onClick={() => setLayoutId(l.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${layoutId === l.id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <span className="text-base shrink-0">{l.icon}</span>
                <div>
                  <p className="text-[11px] font-semibold leading-none">{l.label}</p>
                  <p className={`text-[10px] leading-none mt-0.5 ${layoutId === l.id ? 'text-violet-200' : 'text-gray-400'}`}>{l.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </ControlGroup>

        {/* Aspect Ratio */}
        <ControlGroup label="Format">
          <div className="flex gap-1.5">
            {ASPECT_RATIOS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAspectRatio(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${aspectRatio === id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </ControlGroup>

        {/* Logo Position */}
        <ControlGroup label="Logo Position">
          <div className="grid grid-cols-2 gap-1">
            {LOGO_POSITIONS.map(p => (
              <button
                key={p.id}
                onClick={() => setLogoPos(p.id)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${logoPos === p.id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </ControlGroup>

        {/* Accent Color */}
        <ControlGroup label="Accent / CTA Color">
          <div className="flex gap-2 flex-wrap">
            {[...(brandColors || []), '#7c3aed', '#2563eb', '#059669', '#dc2626', '#ea580c', '#000000'].slice(0, 7).map(c => (
              <button
                key={c}
                onClick={() => setAccentColor(c)}
                title={c}
                className={`w-7 h-7 rounded-full border-2 transition-all shrink-0 ${accentColor === c ? 'border-violet-500 scale-110 shadow-md' : 'border-white shadow-sm'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </ControlGroup>

        {/* Export */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting…' : 'Export PNG'}
        </button>
      </div>
    </div>
  );
}

function ControlGroup({ label, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      {children}
    </div>
  );
}