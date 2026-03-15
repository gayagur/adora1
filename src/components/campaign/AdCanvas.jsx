import React, { useEffect, useRef, useState, useCallback } from 'react';

const LAYOUTS = [
  { id: 'top',     label: 'Top Headline',    headlineY: 0.10, subtextY: 0.20, ctaY: 0.28 },
  { id: 'center',  label: 'Centered',         headlineY: 0.36, subtextY: 0.47, ctaY: 0.56 },
  { id: 'bottom',  label: 'Bottom Caption',   headlineY: 0.68, subtextY: 0.78, ctaY: 0.87 },
  { id: 'overlay', label: 'Dark Overlay',     headlineY: 0.34, subtextY: 0.45, ctaY: 0.54 },
];

const LOGO_POSITIONS = [
  { id: 'top-left',     label: 'Top Left',      x: 0.04, y: 0.04 },
  { id: 'top-right',    label: 'Top Right',     x: 0.96, y: 0.04 },
  { id: 'bottom-left',  label: 'Bottom Left',   x: 0.04, y: 0.92 },
  { id: 'bottom-right', label: 'Bottom Right',  x: 0.96, y: 0.92 },
  { id: 'center',       label: 'Watermark',     x: 0.5,  y: 0.5  },
];

export default function AdCanvas({ imageUrl, logoUrl, headline, cta, brandColors, onExport }) {
  const canvasRef = useRef(null);
  const [layout, setLayout] = useState(LAYOUTS[1]);
  const [logoPos, setLogoPos] = useState(LOGO_POSITIONS[1]);
  const [logoSize, setLogoSize] = useState(0.12);
  const [logoOpacity, setLogoOpacity] = useState(0.9);
  const [showText, setShowText] = useState(true);
  const [headlineColor, setHeadlineColor] = useState('#ffffff');
  const [ctaColor, setCtaColor] = useState(brandColors?.[0] || '#7c3aed');
  const [headlineFontSize, setHeadlineFontSize] = useState(38);

  const primaryColor = brandColors?.[0] || '#7c3aed';

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const drawOverlayAndText = () => {
      if (layout.id === 'overlay') {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, W, H);
      } else if (layout.id === 'top') {
        const grad = ctx.createLinearGradient(0, 0, 0, H * 0.35);
        grad.addColorStop(0, 'rgba(0,0,0,0.6)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      } else if (layout.id === 'bottom') {
        const grad = ctx.createLinearGradient(0, H * 0.6, 0, H);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.7)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      if (!showText) return;

      // Headline
      if (headline) {
        const hy = layout.headlineY * H;
        ctx.font = `bold ${headlineFontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = headlineColor;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;

        // Word wrap
        const words = headline.split(' ');
        const maxWidth = W * 0.8;
        let line = '';
        let lines = [];
        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          if (ctx.measureText(testLine).width > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        lines.forEach((l, i) => ctx.fillText(l, W / 2, hy + i * (headlineFontSize * 1.2)));
        ctx.shadowBlur = 0;
      }

      // CTA pill
      if (cta) {
        const cy = layout.ctaY * H;
        ctx.font = `600 ${Math.round(headlineFontSize * 0.48)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        const textW = ctx.measureText(cta).width;
        const padX = 24, padY = 12;
        const rx = W / 2 - textW / 2 - padX;
        const ry = cy - padY - 2;
        const rw = textW + padX * 2;
        const rh = headlineFontSize * 0.48 + padY * 2;
        const radius = rh / 2;

        ctx.beginPath();
        ctx.moveTo(rx + radius, ry);
        ctx.lineTo(rx + rw - radius, ry);
        ctx.arcTo(rx + rw, ry, rx + rw, ry + radius, radius);
        ctx.lineTo(rx + rw, ry + rh - radius);
        ctx.arcTo(rx + rw, ry + rh, rx + rw - radius, ry + rh, radius);
        ctx.lineTo(rx + radius, ry + rh);
        ctx.arcTo(rx, ry + rh, rx, ry + rh - radius, radius);
        ctx.lineTo(rx, ry + radius);
        ctx.arcTo(rx, ry, rx + radius, ry, radius);
        ctx.closePath();
        ctx.fillStyle = ctaColor;
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(cta, W / 2, cy + headlineFontSize * 0.48 * 0.35);
      }
    };

    const drawLogo = (logoImg) => {
      if (!logoImg) return;
      const lw = W * logoSize;
      const lh = (logoImg.naturalHeight / logoImg.naturalWidth) * lw;
      const lx = logoPos.x * W - (logoPos.x > 0.5 ? lw : logoPos.x === 0.5 ? lw / 2 : 0);
      const ly = logoPos.y * H - (logoPos.y > 0.5 ? lh : logoPos.y === 0.5 ? lh / 2 : 0);
      ctx.globalAlpha = logoOpacity;
      ctx.drawImage(logoImg, lx, ly, lw, lh);
      ctx.globalAlpha = 1;
    };

    // Load background
    if (imageUrl) {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, W, H);
        drawOverlayAndText();
        if (logoUrl) {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => drawLogo(logoImg);
          logoImg.onerror = () => {};
          logoImg.src = logoUrl;
        }
      };
      bgImg.onerror = () => {
        ctx.fillStyle = '#1e1e2e';
        ctx.fillRect(0, 0, W, H);
        drawOverlayAndText();
      };
      bgImg.src = imageUrl;
    } else {
      ctx.fillStyle = '#1e1e2e';
      ctx.fillRect(0, 0, W, H);
      drawOverlayAndText();
    }
  }, [imageUrl, logoUrl, headline, cta, layout, logoPos, logoSize, logoOpacity, showText, headlineColor, ctaColor, headlineFontSize]);

  useEffect(() => { draw(); }, [draw]);

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    onExport?.(url);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ad-creative.png';
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="rounded-xl overflow-hidden bg-gray-900 shadow-md">
        <canvas ref={canvasRef} width={1080} height={1080} className="w-full h-auto" />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        {/* Layout */}
        <ControlGroup label="Layout">
          <div className="grid grid-cols-2 gap-1">
            {LAYOUTS.map(l => (
              <button
                key={l.id}
                onClick={() => setLayout(l)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${layout.id === l.id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </ControlGroup>

        {/* Logo position */}
        <ControlGroup label="Logo Position">
          <div className="grid grid-cols-2 gap-1">
            {LOGO_POSITIONS.map(p => (
              <button
                key={p.id}
                onClick={() => setLogoPos(p)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${logoPos.id === p.id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </ControlGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Logo size */}
        <ControlGroup label={`Logo Size — ${Math.round(logoSize * 100)}%`}>
          <input type="range" min={0.04} max={0.35} step={0.01} value={logoSize}
            onChange={e => setLogoSize(Number(e.target.value))}
            className="w-full accent-violet-600" />
        </ControlGroup>

        {/* Logo opacity */}
        <ControlGroup label={`Logo Opacity — ${Math.round(logoOpacity * 100)}%`}>
          <input type="range" min={0.1} max={1} step={0.05} value={logoOpacity}
            onChange={e => setLogoOpacity(Number(e.target.value))}
            className="w-full accent-violet-600" />
        </ControlGroup>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Font size */}
        <ControlGroup label={`Headline Size — ${headlineFontSize}px`}>
          <input type="range" min={20} max={72} step={2} value={headlineFontSize}
            onChange={e => setHeadlineFontSize(Number(e.target.value))}
            className="w-full accent-violet-600" />
        </ControlGroup>

        {/* Headline color */}
        <ControlGroup label="Headline Color">
          <div className="flex gap-2 flex-wrap">
            {['#ffffff', '#000000', '#f3f4f6', ...(brandColors || [])].slice(0, 5).map(c => (
              <button key={c} onClick={() => setHeadlineColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${headlineColor === c ? 'border-violet-500 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </ControlGroup>

        {/* CTA color */}
        <ControlGroup label="CTA Color">
          <div className="flex gap-2 flex-wrap">
            {[primaryColor, '#000000', '#ffffff', '#ef4444', '#3b82f6'].slice(0, 5).map(c => (
              <button key={c} onClick={() => setCtaColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${ctaColor === c ? 'border-violet-500 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </ControlGroup>
      </div>

      {/* Show text toggle + export */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setShowText(p => !p)}
            className={`w-9 h-5 rounded-full transition-colors ${showText ? 'bg-violet-600' : 'bg-gray-200'} flex items-center px-0.5`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${showText ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <span className="text-xs text-gray-600 font-medium">Show Text Overlay</span>
        </label>
        <button
          onClick={exportImage}
          className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium transition-colors"
        >
          Export PNG
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