import React from 'react';

function truncateWords(text, max) {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.slice(0, max).join(' ') + (words.length > max ? '…' : '');
}

// Layout: Screenshot Hero — headline top-left, screenshot right, CTA bottom-left
function LayoutHero({ headline, subtext, cta, imageUrl, logoUrl, accentColor, logoPos }) {
  return (
    <div className="relative w-full h-full flex overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
      {/* Left text block */}
      <div className="relative z-10 flex flex-col justify-center px-[8%] w-[52%] h-full">
        {logoUrl && logoPos === 'top-left' && (
          <img src={logoUrl} alt="" className="h-[6%] max-w-[30%] object-contain mb-[6%]" style={{ filter: 'brightness(0) invert(1)' }} />
        )}
        {headline && (
          <h1 className="font-bold text-white leading-tight mb-[4%]" style={{ fontSize: 'clamp(20px, 5.5cqw, 54px)', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            {truncateWords(headline, 8)}
          </h1>
        )}
        {subtext && (
          <p className="text-white/70 mb-[7%] font-normal leading-snug" style={{ fontSize: 'clamp(11px, 2.2cqw, 20px)' }}>
            {truncateWords(subtext, 12)}
          </p>
        )}
        {cta && (
          <div className="inline-block">
            <span className="inline-flex items-center px-[5%] py-[2%] rounded-full font-semibold text-white" style={{ backgroundColor: accentColor, fontSize: 'clamp(9px, 1.8cqw, 17px)' }}>
              {truncateWords(cta, 4)}
            </span>
          </div>
        )}
        {logoUrl && logoPos === 'bottom-left' && (
          <img src={logoUrl} alt="" className="h-[5%] max-w-[25%] object-contain mt-auto" style={{ filter: 'brightness(0) invert(1)', opacity: 0.7 }} />
        )}
      </div>

      {/* Right screenshot */}
      <div className="absolute right-0 top-0 w-[54%] h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f1a] to-transparent z-10" />
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover object-left-top" />
        ) : (
          <div className="w-full h-full bg-white/5" />
        )}
        {logoUrl && logoPos === 'top-right' && (
          <img src={logoUrl} alt="" className="absolute top-[5%] right-[5%] z-20 h-[6%] max-w-[20%] object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
        )}
      </div>
    </div>
  );
}

// Layout: Product Focus — screenshot centered, gradient bg, text above/below
function LayoutProductFocus({ headline, subtext, cta, imageUrl, logoUrl, accentColor, logoPos }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between py-[6%] px-[8%] overflow-hidden" style={{ background: `linear-gradient(160deg, #f8f9ff 0%, #eef0ff 50%, #e8ebff 100%)` }}>
      {/* Top */}
      <div className="flex w-full items-center justify-between z-10">
        {logoUrl && (logoPos === 'top-left' || logoPos === 'top-right') ? (
          <img src={logoUrl} alt="" className="h-[7%] max-w-[20%] object-contain" style={{ marginLeft: logoPos === 'top-right' ? 'auto' : 0 }} />
        ) : <div />}
      </div>

      {/* Headline */}
      {headline && (
        <h1 className="font-bold text-gray-900 text-center leading-tight z-10" style={{ fontSize: 'clamp(16px, 4cqw, 42px)' }}>
          {truncateWords(headline, 8)}
        </h1>
      )}

      {/* Screenshot card */}
      <div className="relative z-10 w-[80%] rounded-xl overflow-hidden shadow-2xl" style={{ flex: '0 0 45%' }}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full bg-white/40 rounded-xl" style={{ minHeight: 100 }} />
        )}
        <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />
      </div>

      {/* Subtext + CTA */}
      <div className="flex flex-col items-center gap-[3%] z-10">
        {subtext && (
          <p className="text-gray-500 text-center" style={{ fontSize: 'clamp(9px, 1.8cqw, 16px)' }}>
            {truncateWords(subtext, 10)}
          </p>
        )}
        {cta && (
          <span className="inline-flex items-center px-[5%] py-[1.5%] rounded-full font-semibold text-white" style={{ backgroundColor: accentColor, fontSize: 'clamp(8px, 1.6cqw, 15px)' }}>
            {truncateWords(cta, 4)}
          </span>
        )}
      </div>
    </div>
  );
}

// Layout: Split — left text, right screenshot
function LayoutSplit({ headline, subtext, cta, imageUrl, logoUrl, accentColor, logoPos }) {
  return (
    <div className="relative w-full h-full flex overflow-hidden bg-white">
      {/* Left */}
      <div className="relative z-10 flex flex-col justify-center px-[8%] w-[48%] h-full bg-white">
        {logoUrl && logoPos === 'top-left' && (
          <img src={logoUrl} alt="" className="h-[6%] max-w-[40%] object-contain mb-[8%]" />
        )}
        <div className="w-[15%] h-1 rounded-full mb-[5%]" style={{ backgroundColor: accentColor }} />
        {headline && (
          <h1 className="font-bold text-gray-900 leading-tight mb-[4%]" style={{ fontSize: 'clamp(16px, 4.5cqw, 44px)' }}>
            {truncateWords(headline, 7)}
          </h1>
        )}
        {subtext && (
          <p className="text-gray-500 mb-[7%] leading-snug" style={{ fontSize: 'clamp(10px, 2cqw, 17px)' }}>
            {truncateWords(subtext, 12)}
          </p>
        )}
        {cta && (
          <span className="inline-flex items-center px-[6%] py-[2%] rounded-lg font-semibold text-white w-fit" style={{ backgroundColor: accentColor, fontSize: 'clamp(9px, 1.7cqw, 15px)' }}>
            {truncateWords(cta, 4)}
          </span>
        )}
      </div>

      {/* Right screenshot */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#f3f4f6' }}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, white 0%, transparent 15%)' }} />
        {logoUrl && logoPos === 'top-right' && (
          <img src={logoUrl} alt="" className="absolute top-[5%] right-[5%] h-[6%] max-w-[25%] object-contain z-10" />
        )}
      </div>
    </div>
  );
}

// Layout: Dark Overlay — full background image with centered text
function LayoutDarkOverlay({ headline, subtext, cta, imageUrl, logoUrl, accentColor, logoPos }) {
  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
      {/* Background */}
      {imageUrl ? (
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#1e1e2e,#2d1b6e)' }} />
      )}
      <div className="absolute inset-0 bg-black/55" />

      {/* Logo top */}
      {logoUrl && (logoPos === 'top-left' || logoPos === 'top-right') && (
        <img src={logoUrl} alt="" className="absolute top-[5%] h-[6%] max-w-[20%] object-contain z-20"
          style={{ [logoPos === 'top-right' ? 'right' : 'left']: '5%', filter: 'brightness(0) invert(1)' }} />
      )}

      {/* Center text */}
      <div className="relative z-10 flex flex-col items-center text-center px-[10%] gap-[3%]">
        {headline && (
          <h1 className="font-bold text-white leading-tight" style={{ fontSize: 'clamp(18px, 5cqw, 52px)', textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}>
            {truncateWords(headline, 8)}
          </h1>
        )}
        {subtext && (
          <p className="text-white/75" style={{ fontSize: 'clamp(10px, 2cqw, 18px)' }}>
            {truncateWords(subtext, 12)}
          </p>
        )}
        {cta && (
          <span className="inline-flex items-center px-[5%] py-[2%] rounded-full font-bold text-white mt-[2%]" style={{ backgroundColor: accentColor, fontSize: 'clamp(9px, 1.8cqw, 17px)' }}>
            {truncateWords(cta, 4)}
          </span>
        )}
      </div>

      {/* Logo bottom */}
      {logoUrl && (logoPos === 'bottom-left' || logoPos === 'bottom-right') && (
        <img src={logoUrl} alt="" className="absolute bottom-[5%] h-[5%] max-w-[20%] object-contain z-20"
          style={{ [logoPos === 'bottom-right' ? 'right' : 'left']: '5%', filter: 'brightness(0) invert(1)', opacity: 0.75 }} />
      )}
    </div>
  );
}

// Layout: Story/Vertical — for Instagram story style
function LayoutStory({ headline, subtext, cta, imageUrl, logoUrl, accentColor, logoPos }) {
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {/* Background */}
      {imageUrl ? (
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#0f0c29,#302b63,#24243e)' }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* Top logo */}
      {logoUrl && (
        <div className="relative z-10 px-[6%] pt-[5%]">
          <img src={logoUrl} alt="" className="h-[5%] max-w-[25%] object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
      )}

      {/* Bottom text */}
      <div className="relative z-10 mt-auto px-[6%] pb-[7%]">
        {headline && (
          <h1 className="font-bold text-white leading-tight mb-[3%]" style={{ fontSize: 'clamp(20px, 5cqw, 50px)', textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>
            {truncateWords(headline, 7)}
          </h1>
        )}
        {subtext && (
          <p className="text-white/75 mb-[4%]" style={{ fontSize: 'clamp(10px, 2cqw, 18px)' }}>
            {truncateWords(subtext, 10)}
          </p>
        )}
        {cta && (
          <span className="inline-flex items-center px-[5%] py-[2%] rounded-full font-bold text-white" style={{ backgroundColor: accentColor, fontSize: 'clamp(9px, 1.8cqw, 16px)' }}>
            {truncateWords(cta, 4)}
          </span>
        )}
      </div>
    </div>
  );
}

const LAYOUT_COMPONENTS = {
  hero: LayoutHero,
  product: LayoutProductFocus,
  split: LayoutSplit,
  overlay: LayoutDarkOverlay,
  story: LayoutStory,
};

export default function AdPreview({ layoutId = 'hero', imageUrl, logoUrl, headline, subtext, cta, accentColor = '#7c3aed', logoPos = 'top-right', aspectRatio = '1/1' }) {
  const Component = LAYOUT_COMPONENTS[layoutId] || LayoutHero;

  const paddingMap = {
    '1/1': 'pb-[100%]',
    '4/5': 'pb-[125%]',
    '16/9': 'pb-[56.25%]',
    '9/16': 'pb-[177.78%]',
  };

  return (
    <div className="w-full relative rounded-xl overflow-hidden shadow-xl" style={{ containerType: 'size' }}>
      <div className={`relative w-full ${paddingMap[aspectRatio] || 'pb-[100%]'}`}>
        <div className="absolute inset-0">
          <Component
            headline={headline}
            subtext={subtext}
            cta={cta}
            imageUrl={imageUrl}
            logoUrl={logoUrl}
            accentColor={accentColor}
            logoPos={logoPos}
          />
        </div>
      </div>
    </div>
  );
}