import React, { useState } from 'react';
import { Copy, Download, RefreshCw, Check, Loader2, ImageIcon, Pencil, Copy as DuplicateIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PLATFORM_ICONS = {
  instagram: '📸', facebook: '📘', linkedin: '💼',
  tiktok: '🎵', youtube: '▶️', twitter: '🐦', general: '🖼'
};
const ASSET_LABELS = {
  post: 'Post', story: 'Story', reel: 'Reel', carousel: 'Carousel',
  banner: 'Banner', video_concept: 'Video', ad: 'Ad'
};

export default function AssetCard({ asset, index, onEdit, onRegenerate, onDuplicate }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const isGenerating = asset.status === 'generating';
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
    if (!asset.preview_image) return;
    try {
      const res = await fetch(asset.preview_image, { mode: 'cors' });
      const blob = await res.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u; a.download = `${asset.platform}-${asset.asset_type}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(u);
      toast.success('Downloaded');
    } catch {
      // CORS fallback — open in new tab
      window.open(asset.preview_image, '_blank');
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4) }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-violet-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => !isGenerating && onEdit && onEdit(asset)}
    >
      {/* Image */}
      <div className="relative bg-gray-50 aspect-square">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
            <p className="text-xs text-gray-400">Generating…</p>
          </div>
        ) : asset.preview_image ? (
          <>
            <img src={asset.preview_image} alt={asset.headline} className="w-full h-full object-cover" />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-white rounded-xl px-3 py-1.5 text-xs font-medium text-gray-800 shadow-lg flex items-center gap-1.5">
                <Pencil className="w-3 h-3" /> Edit
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[11px] font-medium text-gray-700 shadow-sm">
            {PLATFORM_ICONS[asset.platform]} {ASSET_LABELS[asset.asset_type] || asset.asset_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!isGenerating ? (
          <>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{asset.headline}</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{asset.ad_copy}</p>

            {asset.cta && (
              <span className="inline-block px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium mb-3">{asset.cta}</span>
            )}

            {/* Action row */}
            <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onEdit && onEdit(asset)}
                className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-colors"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
              <button onClick={copyCaption} className={`flex items-center justify-center gap-1 w-8 h-8 rounded-lg text-xs font-medium border transition-colors ${copied ? 'border-green-200 bg-green-50 text-green-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
              {asset.preview_image && (
                <button onClick={downloadImage} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  <Download className="w-3 h-3" />
                </button>
              )}
              {onDuplicate && (
                <button onClick={handleDuplicate} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  <DuplicateIcon className="w-3 h-3" />
                </button>
              )}
              {onRegenerate && (
                <button onClick={handleRegenerate} disabled={regenerating} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="h-8 rounded-lg bg-gray-100 animate-pulse" />
        )}
      </div>
    </motion.div>
  );
}