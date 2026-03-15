import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Copy, Download, RefreshCw, ChevronDown, ChevronUp, Check, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PLATFORM_ICONS = {
  instagram: '📸', facebook: '📘', linkedin: '💼',
  tiktok: '🎵', youtube: '▶️', twitter: '🐦', general: '🖼'
};
const ASSET_LABELS = {
  post: 'Post', story: 'Story', reel: 'Reel', carousel: 'Carousel',
  banner: 'Banner', video_concept: 'Video Concept', ad: 'Ad'
};

export default function AssetCard({ asset, index, onRegenerate }) {
  const [showCaption, setShowCaption] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setregenerating] = useState(false);

  const isGenerating = asset.status === 'generating';

  const copyCaption = () => {
    navigator.clipboard.writeText(asset.full_caption || asset.ad_copy || '');
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async () => {
    if (!asset.preview_image) return;
    try {
      const res = await fetch(asset.preview_image);
      const blob = await res.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u; a.download = `${asset.platform}-${asset.asset_type}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(u);
      toast.success('Downloaded');
    } catch { toast.error('Download failed'); }
  };

  const handleRegenerate = async () => {
    setregenerating(true);
    await onRegenerate(asset.id);
    setregenerating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all duration-200"
    >
      {/* Image */}
      <div className="relative bg-gray-50 aspect-square">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
            <p className="text-xs text-gray-400">Generating…</p>
          </div>
        ) : asset.preview_image ? (
          <img src={asset.preview_image} alt={asset.headline} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[11px] font-medium text-gray-700 shadow-sm">
            {PLATFORM_ICONS[asset.platform]} {ASSET_LABELS[asset.asset_type] || asset.asset_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!isGenerating && (
          <>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5">{asset.headline}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{asset.ad_copy}</p>

            {asset.cta && (
              <div className="mb-3">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium">{asset.cta}</span>
              </div>
            )}

            {/* Caption toggle */}
            {asset.full_caption && (
              <>
                <button
                  onClick={() => setShowCaption(!showCaption)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 mb-3 transition-colors"
                >
                  {showCaption ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showCaption ? 'Hide' : 'View'} full caption
                </button>
                {showCaption && (
                  <div className="mb-3 p-3 rounded-xl bg-gray-50 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {asset.full_caption}
                  </div>
                )}
              </>
            )}

            {/* Actions */}
            <div className="flex gap-1.5">
              <button onClick={copyCaption} className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium border transition-colors ${copied ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              {asset.preview_image && (
                <button onClick={downloadImage} className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  <Download className="w-3 h-3" /> Save
                </button>
              )}
              {onRegenerate && (
                <button onClick={handleRegenerate} disabled={regenerating} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 transition-colors">
                  <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}