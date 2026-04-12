import React, { useState } from 'react';
import { Copy, Download, RefreshCw, Check, Loader2, ImageIcon, Pencil, Copy as DuplicateIcon, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ASSET_LABELS = {
  post: 'Post', story: 'Story', reel: 'Reel', carousel: 'Carousel',
  banner: 'Banner', video_concept: 'Video', ad: 'Ad'
};

export default function AssetCard({ asset, index, onEdit, onRegenerate, onDuplicate, onCanvas }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const isStuck = asset.status === 'generating' &&
    asset.created_date && (Date.now() - new Date(asset.created_date).getTime()) > 8 * 60 * 1000;
  const isGenerating = asset.status === 'generating' && !isStuck;
  const carouselImages = asset.carousel_images && asset.carousel_images.length > 0 ? asset.carousel_images : [];
  const currentImage = carouselImages.length > 0 ? carouselImages[carouselIndex] : asset.preview_image;

  const copyCaption = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.full_caption || asset.ad_copy || '');
    setCopied(true);
    toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async (e) => {
    e.stopPropagation();
    if (!currentImage) return;
    try {
      const res = await fetch(currentImage, { mode: 'cors' });
      const blob = await res.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u; a.download = `${asset.platform}-${asset.asset_type}${carouselImages.length > 0 ? `-${carouselIndex + 1}` : ''}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(u);
      toast.success('Downloaded');
    } catch {
      window.open(currentImage, '_blank');
      toast.success('Opened in new tab');
    }
  };

  const handleRegenerate = async (e) => {
    e.stopPropagation();
    setRegenerating(true);
    await onRegenerate(asset.id);
    setRegenerating(false);
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    onDuplicate(asset);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.35 }}
      className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 cursor-pointer group"
      onClick={() => !isGenerating && onEdit && onEdit(asset)}
    >
      {/* Image */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        {isStuck ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-[12px] text-gray-400 font-medium">Generation timed out</p>
            <button
              onClick={async (e) => { e.stopPropagation(); setRegenerating(true); await onRegenerate(asset.id); setRegenerating(false); }}
              disabled={regenerating}
              className="flex items-center gap-1.5 h-[30px] px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-medium transition-colors disabled:opacity-50"
            >
              {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Retry
            </button>
          </div>
        ) : isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-50 to-violet-50/30">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-violet-200 border-t-violet-500 animate-spin" />
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Creating asset…</p>
          </div>
        ) : currentImage ? (
          <>
            <img src={currentImage} alt={asset.headline} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
              <div className="flex items-center gap-1.5">
                <span className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[11px] font-semibold text-gray-800 shadow-lg flex items-center gap-1.5">
                  <Pencil className="w-3 h-3" /> Edit
                </span>
              </div>
            </div>
            {/* Carousel indicators */}
            {carouselImages.length > 1 && (
              <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1">
                {carouselImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCarouselIndex(i); }}
                    className={`rounded-full transition-all ${i === carouselIndex ? 'w-5 h-1.5 bg-white shadow-sm' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-gray-200" />
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-[3px] rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-gray-600 shadow-sm tracking-wide uppercase">
            {asset.platform} · {ASSET_LABELS[asset.asset_type] || asset.asset_type}
            {carouselImages.length > 1 && <span className="ml-1 text-gray-400">({carouselIndex + 1}/{carouselImages.length})</span>}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        {isStuck ? (
          <div className="h-8 rounded-lg bg-gray-50" />
        ) : !isGenerating ? (
          <>
            <h3 className="font-semibold text-gray-900 text-[13px] leading-snug mb-1 tracking-tight line-clamp-1">{asset.headline}</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-3 line-clamp-2">{asset.ad_copy}</p>

            {asset.cta && (
              <span className="inline-block px-2.5 py-[3px] rounded-lg bg-violet-50 text-violet-600 text-[11px] font-semibold mb-3">{asset.cta}</span>
            )}

            {/* Action row */}
            <div className="flex gap-1 pt-2.5 border-t border-gray-50" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onCanvas && onCanvas(asset)}
                className="flex-1 flex items-center justify-center gap-1.5 h-[30px] rounded-lg text-[11px] font-semibold border border-gray-100 text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-all"
              >
                <Layers className="w-3 h-3" /> Design
              </button>
              <ActionButton onClick={() => onEdit && onEdit(asset)} title="Edit">
                <Pencil className="w-3 h-3" />
              </ActionButton>
              <ActionButton onClick={copyCaption} title="Copy caption" active={copied}>
                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              </ActionButton>
              {asset.preview_image && (
                <ActionButton onClick={downloadImage} title="Download">
                  <Download className="w-3 h-3" />
                </ActionButton>
              )}
              {onDuplicate && (
                <ActionButton onClick={handleDuplicate} title="Duplicate">
                  <DuplicateIcon className="w-3 h-3" />
                </ActionButton>
              )}
              {onRegenerate && (
                <ActionButton onClick={handleRegenerate} disabled={regenerating} title="Regenerate">
                  <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                </ActionButton>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-gray-50 animate-pulse" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ActionButton({ onClick, disabled, title, active, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-[30px] h-[30px] flex items-center justify-center rounded-lg border transition-all disabled:opacity-30 ${
        active
          ? 'border-green-200 bg-green-50'
          : 'border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
