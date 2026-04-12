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
const ASSET_LABELS = {
  post: 'Post', story: 'Story', reel: 'Reel', carousel: 'Carousel',
  banner: 'Banner', video_concept: 'Video', ad: 'Ad'
};

export default function Gallery() {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState(null);
  const [filter, setFilter] = useState('all');

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['gallery-assets'],
    queryFn: () => base44.entities.CampaignAsset.list('-created_date', 500),
  });

  const allImages = [];
  assets.forEach(a => {
    if (a.status !== 'ready') return;
    const imgs = a.carousel_images?.length > 0 ? a.carousel_images : (a.preview_image ? [a.preview_image] : []);
    imgs.forEach((url, i) => allImages.push({ url, asset: a, slideIndex: i, totalSlides: imgs.length }));
  });

  const platforms = [...new Set(assets.filter(a => a.status === 'ready').map(a => a.platform))];
  const filtered = filter === 'all' ? allImages : allImages.filter(img => img.asset.platform === filter);

  const openLB = (img) => setLightbox({ images: filtered, index: filtered.indexOf(img) });
  const closeLB = () => setLightbox(null);
  const prev = () => setLightbox(l => ({ ...l, index: (l.index - 1 + l.images.length) % l.images.length }));
  const next = () => setLightbox(l => ({ ...l, index: (l.index + 1) % l.images.length }));

  const dl = async (url, asset) => {
    try {
      const res = await fetch(url, { mode: 'cors' }); const blob = await res.blob();
      const u = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = u; a.download = `${asset.platform}-${asset.asset_type}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
    } catch { window.open(url, '_blank'); }
  };

  const cur = lightbox ? lightbox.images[lightbox.index] : null;

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-5 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Gallery</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">{filtered.length} image{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filters */}
        {platforms.length > 1 && (
          <div className="flex gap-1 mb-6">
            <Pill active={filter === 'all'} onClick={() => setFilter('all')}>All</Pill>
            {platforms.map(p => <Pill key={p} active={filter === p} onClick={() => setFilter(p)}>{PLATFORM_LABELS[p]}</Pill>)}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {[...Array(10)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <ImageIcon className="w-5 h-5 text-gray-300" />
            </div>
            <h3 className="text-[14px] font-semibold text-gray-900 mb-1">No images yet</h3>
            <p className="text-[12px] text-gray-400 max-w-[220px]">Generate campaign assets to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {filtered.map((img, i) => (
              <motion.div key={`${img.asset.id}-${img.slideIndex}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.2) }}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => openLB(img)}>
                <img src={img.url} alt={img.asset.headline} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
                  <p className="text-white text-[10px] font-medium line-clamp-1 mb-1">{img.asset.headline}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-[9px] uppercase tracking-wider font-medium">{img.asset.platform} · {ASSET_LABELS[img.asset.asset_type]}</span>
                    <button onClick={(e) => { e.stopPropagation(); dl(img.url, img.asset); }}
                      className="w-6 h-6 rounded-md bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors">
                      <Download className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
                {img.totalSlides > 1 && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/40 text-[8px] text-white font-semibold">
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
        {lightbox && cur && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center" onClick={closeLB}>
            <button onClick={closeLB} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"><X className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"><ChevronRight className="w-4 h-4" /></button>
            <motion.div key={lightbox.index} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl max-h-[85vh] flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
              <img src={cur.url} alt="" className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl" />
              <div className="text-center">
                <p className="text-white font-semibold text-[13px] mb-0.5">{cur.asset.headline}</p>
                <p className="text-white/35 text-[10px] uppercase tracking-wider">{PLATFORM_LABELS[cur.asset.platform]} · {ASSET_LABELS[cur.asset.asset_type]}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => dl(cur.url, cur.asset)} className="flex items-center gap-1.5 h-[30px] px-3.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors">
                  <Download className="w-3 h-3" /> Download
                </button>
                <button onClick={() => navigate(`/Campaign?id=${cur.asset.campaign_id}&brand=${cur.asset.brand_id}`)}
                  className="flex items-center gap-1.5 h-[30px] px-3.5 rounded-md bg-[#6c5ce7] hover:bg-[#5f4dd6] text-white text-[11px] font-medium transition-colors">
                  <ExternalLink className="w-3 h-3" /> Campaign
                </button>
              </div>
            </motion.div>
            <div className="absolute bottom-4 text-white/25 text-[10px]">{lightbox.index + 1} / {lightbox.images.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
        active ? 'bg-[#6c5ce7] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
      }`}>{children}</button>
  );
}
