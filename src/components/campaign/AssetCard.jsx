import React, { useState } from 'react';
import { Copy, Download, RefreshCw, Check, Loader2, ImageIcon, Pencil, ThumbsUp, ThumbsDown, Bookmark, Paintbrush } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ASSET_LABELS = {
  post: 'Post', story: 'Story', reel: 'Reel', carousel: 'Carousel',
  banner: 'Banner', video_concept: 'Video', ad: 'Ad'
};

export default function AssetCard({ asset, index, onEdit, onRefine, onRegenerate, onDuplicate, onFeedback }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [feedbackState, setFeedbackState] = useState(asset.feedback || null);

  const isStuck = asset.status === 'generating' &&
    asset.created_date && (Date.now() - new Date(asset.created_date).getTime()) > 8 * 60 * 1000;
  const isGenerating = asset.status === 'generating' && !isStuck;
  const carouselImages = asset.carousel_images?.length > 0 ? asset.carousel_images : [];
  const currentImage = carouselImages.length > 0 ? carouselImages[carouselIndex] : asset.preview_image;

  const copyCaption = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.full_caption || asset.ad_copy || '');
    setCopied(true); toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async (e) => {
    e.stopPropagation();
    if (!currentImage) return;
    try {
      const res = await fetch(currentImage, { mode: 'cors' });
      const blob = await res.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = u;
      a.download = `${asset.platform}-${asset.asset_type}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(u);
    } catch { window.open(currentImage, '_blank'); }
  };

  const handleRegenerate = async (e) => {
    e.stopPropagation();
    setRegenerating(true);
    await onRegenerate(asset.id);
    setRegenerating(false);
  };

  const handleFeedback = (action, e) => {
    e.stopPropagation();
    const newState = feedbackState === action ? null : action;
    setFeedbackState(newState);
    if (onFeedback) onFeedback(asset, newState);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.3 }}
      className={`group bg-white rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
        feedbackState === 'like' ? 'border-emerald-200 hover:shadow-md' :
        feedbackState === 'save' ? 'border-[#6c5ce7]/20 hover:shadow-md' :
        feedbackState === 'dislike' ? 'border-gray-100 opacity-50' :
        'border-gray-100 hover:border-gray-200 hover:shadow-md'
      }`}
      onClick={() => !isGenerating && onEdit && onEdit(asset)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {isStuck ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50">
            <p className="text-[11px] text-gray-400">Timed out</p>
            <button onClick={async (e) => { e.stopPropagation(); setRegenerating(true); await onRegenerate(asset.id); setRegenerating(false); }}
              disabled={regenerating}
              className="h-[26px] px-3 rounded-md bg-[#6c5ce7] text-white text-[10px] font-medium disabled:opacity-50">
              {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Retry'}
            </button>
          </div>
        ) : isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#6c5ce7] animate-spin" />
            <p className="text-[10px] text-gray-300">Generating…</p>
          </div>
        ) : currentImage ? (
          <>
            <img src={currentImage} alt={asset.headline} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />

            {/* Hover overlay — actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* Feedback row — top */}
              <div className="absolute top-2 right-2 flex gap-1" onClick={e => e.stopPropagation()}>
                <MiniBtn active={feedbackState === 'like'} activeClass="bg-emerald-500 text-white" onClick={(e) => handleFeedback('like', e)}><ThumbsUp className="w-2.5 h-2.5" /></MiniBtn>
                <MiniBtn active={feedbackState === 'dislike'} activeClass="bg-red-500 text-white" onClick={(e) => handleFeedback('dislike', e)}><ThumbsDown className="w-2.5 h-2.5" /></MiniBtn>
                <MiniBtn active={feedbackState === 'save'} activeClass="bg-[#6c5ce7] text-white" onClick={(e) => handleFeedback('save', e)}><Bookmark className="w-2.5 h-2.5" /></MiniBtn>
              </div>

              {/* Refine button — center */}
              <div className="absolute inset-0 flex items-center justify-center" onClick={e => { e.stopPropagation(); onRefine && onRefine(asset); }}>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/95 text-gray-800 text-[11px] font-semibold shadow-lg backdrop-blur-sm">
                  <Paintbrush className="w-3 h-3" /> Refine
                </span>
              </div>
            </div>

            {/* Carousel dots */}
            {carouselImages.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1">
                {carouselImages.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setCarouselIndex(i); }}
                    className={`rounded-full transition-all ${i === carouselIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-200" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className="px-1.5 py-0.5 rounded bg-white/85 backdrop-blur-sm text-[9px] font-semibold text-gray-500 uppercase tracking-wider">
            {asset.platform} · {ASSET_LABELS[asset.asset_type] || asset.asset_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {!isGenerating && !isStuck ? (
          <>
            <h3 className="text-[12px] font-semibold text-gray-900 leading-snug mb-0.5 line-clamp-1 tracking-tight">{asset.headline}</h3>
            <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2 mb-2">{asset.ad_copy}</p>

            {/* Actions */}
            <div className="flex gap-1 pt-2 border-t border-gray-50" onClick={e => e.stopPropagation()}>
              <SmallBtn onClick={() => onRefine && onRefine(asset)} title="Refine"><Paintbrush className="w-3 h-3" /></SmallBtn>
              <SmallBtn onClick={() => onEdit && onEdit(asset)} title="Edit copy"><Pencil className="w-3 h-3" /></SmallBtn>
              <SmallBtn onClick={copyCaption} title="Copy"><Copy className="w-3 h-3" /></SmallBtn>
              {currentImage && <SmallBtn onClick={downloadImage} title="Download"><Download className="w-3 h-3" /></SmallBtn>}
              {onRegenerate && <SmallBtn onClick={handleRegenerate} disabled={regenerating} title="Regenerate"><RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} /></SmallBtn>}
            </div>
          </>
        ) : (
          <div className="space-y-1.5">
            <div className="h-2.5 w-3/4 rounded bg-gray-100 animate-pulse" />
            <div className="h-2.5 w-1/2 rounded bg-gray-50 animate-pulse" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SmallBtn({ onClick, disabled, title, children }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="w-[26px] h-[26px] flex items-center justify-center rounded-md border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-30">
      {children}
    </button>
  );
}

function MiniBtn({ active, activeClass, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${active ? activeClass : 'bg-black/25 backdrop-blur-sm text-white hover:bg-black/40'}`}>
      {children}
    </button>
  );
}
