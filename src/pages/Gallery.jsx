import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Download, X, ChevronLeft, ChevronRight, ImageIcon, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '../components/ui/AppShell';

const PL = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', tiktok: 'TikTok', youtube: 'YouTube', twitter: 'X / Twitter', general: 'Display' };
const AL = { post: 'Post', story: 'Story', reel: 'Reel', carousel: 'Carousel', banner: 'Banner', video_concept: 'Video', ad: 'Ad' };

export default function Gallery() {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState(null);
  const [filter, setFilter] = useState('all');

  const { data: assets = [], isLoading } = useQuery({ queryKey: ['gallery-assets'], queryFn: () => base44.entities.CampaignAsset.list('-created_date', 500) });

  const allImages = [];
  assets.forEach(a => { if (a.status !== 'ready') return; const imgs = a.carousel_images?.length > 0 ? a.carousel_images : (a.preview_image ? [a.preview_image] : []); imgs.forEach((url, i) => allImages.push({ url, asset: a, slideIndex: i, totalSlides: imgs.length })); });

  const platforms = [...new Set(assets.filter(a => a.status === 'ready').map(a => a.platform))];
  const filtered = filter === 'all' ? allImages : allImages.filter(img => img.asset.platform === filter);

  const openLB = (img) => setLightbox({ images: filtered, index: filtered.indexOf(img) });
  const prev = () => setLightbox(l => ({ ...l, index: (l.index - 1 + l.images.length) % l.images.length }));
  const next = () => setLightbox(l => ({ ...l, index: (l.index + 1) % l.images.length }));

  const dl = async (url, asset) => { try { const r = await fetch(url, { mode: 'cors' }); const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `${asset.platform}-${asset.asset_type}.png`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u); } catch { window.open(url, '_blank'); } };

  const cur = lightbox ? lightbox.images[lightbox.index] : null;

  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1612', letterSpacing: '-0.02em' }}>Gallery</h1>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', marginTop: 4 }}>{filtered.length} image{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {platforms.length > 1 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
            <Pill active={filter === 'all'} onClick={() => setFilter('all')}>All</Pill>
            {platforms.map(p => <Pill key={p} active={filter === p} onClick={() => setFilter(p)}>{PL[p]}</Pill>)}
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {[...Array(10)].map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: 12, background: 'rgba(26,22,18,0.04)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(26,22,18,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <ImageIcon style={{ width: 20, height: 20, color: 'rgba(26,22,18,0.15)' }} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1612' }}>No images yet</h3>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', maxWidth: 220, marginTop: 4 }}>Generate campaign assets to see them here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {filtered.map((img, i) => (
              <motion.div key={`${img.asset.id}-${img.slideIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.2) }}
                style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', background: 'rgba(26,22,18,0.04)' }}
                className="group" onClick={() => openLB(img)}>
                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 10 }}>
                  <p style={{ color: '#fff', fontSize: 10, fontWeight: 500, marginBottom: 4 }} className="line-clamp-1">{img.asset.headline}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{img.asset.platform} · {AL[img.asset.asset_type]}</span>
                    <button onClick={(e) => { e.stopPropagation(); dl(img.url, img.asset); }} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Download style={{ width: 12, height: 12, color: '#fff' }} />
                    </button>
                  </div>
                </div>
                {img.totalSlides > 1 && <div style={{ position: 'absolute', top: 8, right: 8, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.4)', fontSize: 8, color: '#fff', fontWeight: 600 }}>{img.slideIndex + 1}/{img.totalSlides}</div>}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && cur && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setLightbox(null)}>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 10 }}><X style={{ width: 16, height: 16 }} /></button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 10 }}><ChevronLeft style={{ width: 16, height: 16 }} /></button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 10 }}><ChevronRight style={{ width: 16, height: 16 }} /></button>
            <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 520 }}>
              <img src={cur.url} alt="" style={{ maxHeight: '70vh', maxWidth: '100%', borderRadius: 12, objectFit: 'contain', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{cur.asset.headline}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{PL[cur.asset.platform]} · {AL[cur.asset.asset_type]}</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => dl(cur.url, cur.asset)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 14px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}><Download style={{ width: 12, height: 12 }} /> Download</button>
                <button onClick={() => navigate(`/Campaign?id=${cur.asset.campaign_id}&brand=${cur.asset.brand_id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 14px', borderRadius: 8, background: '#1A1612', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}><ExternalLink style={{ width: 12, height: 12 }} /> Campaign</button>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 16, color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>{lightbox.index + 1} / {lightbox.images.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      background: active ? '#1A1612' : '#fff',
      color: active ? '#fff' : 'rgba(26,22,18,0.4)',
      boxShadow: active ? 'none' : '0 0 0 1px rgba(26,22,18,0.08)',
      transition: 'all 0.15s ease',
    }}>{children}</button>
  );
}
