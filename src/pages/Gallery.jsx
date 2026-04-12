import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Download, X, ChevronLeft, ChevronRight, ImageIcon, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '../components/ui/AppShell';

const PLATFORM_LABELS = {
  instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn',
  tiktok: 'TikTok', youtube: 'YouTube', twitter: 'X / Twitter', general: 'Display'
};
const PLATFORM_ICONS = {
  instagram: '📸', facebook: '📘', linkedin: '💼',
  tiktok: '🎵', youtube: '▶️', twitter: '🐦', general: '🖼'
};
const ASSET_LABELS = {
  post: 'Post', story: 'Story', reel: 'Reel', carousel: 'Carousel',
  banner: 'Banner', video_concept: 'Video', ad: 'Ad'
};

export default function Gallery() {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState(null); // { images: [], index: 0, asset }
  const [filterPlatform, setFilterPlatform] = useState('all');

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['all-assets-gallery'],
    queryFn: () => base44.entities.CampaignAsset.list('-created_date', 500),
  });

  // Collect all images with metadata
  const allImages = [];
  assets.forEach(asset => {
    if (asset.status !== 'ready') return;
    const images = asset.carousel_images?.length > 0 ? asset.carousel_images : (asset.preview_image ? [asset.preview_image] : []);
    images.forEach((url, i) => {
      allImages.push({ url, asset, slideIndex: i, totalSlides: images.length });
    });
  });

  const platforms = [...new Set(assets.filter(a => a.status === 'ready').map(a => a.platform))];

  const filtered = filterPlatform === 'all'
    ? allImages
    : allImages.filter(img => img.asset.platform === filterPlatform);

  const openLightbox = (img) => {
    const idx = filtered.indexOf(img);
    setLightbox({ images: filtered, index: idx });
  };

  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox(l => ({ ...l, index: (l.index - 1 + l.images.length) % l.images.length }));
  const next = () => setLightbox(l => ({ ...l, index: (l.index + 1) % l.images.length }));

  const downloadImage = async (url, asset) => {
    try {
      const res = await fetch(url, { mode: 'cors' });
      const blob = await res.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u;
      a.download = `${asset.platform}-${asset.asset_type}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(u);
    } catch {
      window.open(url, '_blank');
    }
  };

  const current = lightbox ? lightbox.images[lightbox.index] : null;

  return (
    <AppShell>
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Image Gallery</h1>
            <p className="text-sm text-gray-400 mt-1">{filtered.length} image{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Platform filter */}
        {platforms.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setFilterPlatform('all')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterPlatform === 'all' ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              All
            </button>
            {platforms.map(p => (
              <button
                key={p}
                onClick={() => setFilterPlatform(p)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterPlatform === p ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-5">
              <ImageIcon className="w-7 h-7 text-violet-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No images yet</h3>
            <p className="text-sm text-gray-400 max-w-xs">Generate campaign assets to see images here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((img, i) => (
              <motion.div
                key={`${img.asset.id}-${img.slideIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => navigate(`/Campaign?id=${img.asset.campaign_id}&brand=${img.asset.brand_id}`)}
              >
                <img src={img.url} alt={img.asset.headline} className="w-full h-full object-cover" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex flex-col justify-end p-2">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium line-clamp-2 mb-1">{img.asset.headline}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-[10px]">{PLATFORM_ICONS[img.asset.platform]} {ASSET_LABELS[img.asset.asset_type]}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); downloadImage(img.url, img.asset); }}
                        className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                      >
                        <Download className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                {img.totalSlides > 1 && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/50 text-[9px] text-white font-medium">
                    {img.slideIndex + 1}/{img.totalSlides}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
              <ChevronRight className="w-5 h-5" />
            </button>
            <motion.div
              key={lightbox.index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl max-h-[85vh] flex flex-col items-center gap-4"
              onClick={e => e.stopPropagation()}
            >
              <img src={current.url} alt={current.asset.headline} className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl" />
              <div className="text-center">
                <p className="text-white font-medium text-sm mb-1">{current.asset.headline}</p>
                <p className="text-white/50 text-xs">{PLATFORM_ICONS[current.asset.platform]} {PLATFORM_LABELS[current.asset.platform]} · {ASSET_LABELS[current.asset.asset_type]}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadImage(current.url, current.asset)}
                  className="flex items-center gap-2 h-8 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={() => navigate(`/Campaign?id=${current.asset.campaign_id}&brand=${current.asset.brand_id}`)}
                  className="flex items-center gap-2 h-8 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Campaign
                </button>
              </div>
            </motion.div>
            <div className="absolute bottom-4 text-white/40 text-xs">{lightbox.index + 1} / {lightbox.images.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}