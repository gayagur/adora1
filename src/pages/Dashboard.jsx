import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, ChevronRight, Sparkles, Loader2, Layers, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import AppShell from '../components/ui/AppShell';

export default function Dashboard() {
  const navigate = useNavigate();
  const [generatingFor, setGeneratingFor] = useState(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['all-campaigns'],
    queryFn: () => base44.entities.AdCampaign.list('-created_date', 100),
  });
  const { data: brands = [] } = useQuery({
    queryKey: ['all-brands'],
    queryFn: () => base44.entities.Brand.list('-created_date', 100),
  });
  const { data: assets = [] } = useQuery({
    queryKey: ['all-assets'],
    queryFn: () => base44.entities.CampaignAsset.list('-created_date', 500),
  });

  const brandMap = Object.fromEntries(brands.map(b => [b.id, b]));
  const assetMap = {};
  assets.forEach(a => { assetMap[a.campaign_id] = (assetMap[a.campaign_id] || 0) + 1; });
  const recentImages = assets.filter(a => a.status === 'ready' && a.preview_image).slice(0, 6);

  const generateCampaignsForBrand = async (brand) => {
    setGeneratingFor(brand.id);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior marketing strategist. Generate 6 NEW campaign themes for this brand. Be creative and specific.
Brand: ${brand.brand_name}\nProduct: ${brand.description}\nAudience: ${brand.target_audience}\nTone: ${brand.tone_of_voice}\nKey Messages: ${brand.key_messages?.join(', ')}\nIndustry: ${brand.industry}${brand.visual_style_notes ? `\nVisual Style:\n${brand.visual_style_notes}` : ''}
Return 6 themes, each with: title, strategy_angle, summary, target_audience, tone, key_message, visual_direction, suggested_channels`,
        response_json_schema: {
          type: "object",
          properties: { themes: { type: "array", items: { type: "object", properties: {
            title: { type: "string" }, strategy_angle: { type: "string" }, summary: { type: "string" },
            target_audience: { type: "string" }, tone: { type: "string" }, key_message: { type: "string" },
            visual_direction: { type: "string" }, suggested_channels: { type: "array", items: { type: "string" } }
          }}}}
        }
      });
      const saved = await Promise.all((result.themes || []).map(t => base44.entities.AdCampaign.create({ ...t, brand_id: brand.id })));
      if (saved.length > 0) { toast.success(`${saved.length} campaigns generated`); navigate(`/Campaign?id=${saved[0].id}&brand=${brand.id}`); }
    } catch (e) { toast.error('Failed to generate'); }
    setGeneratingFor(null);
  };

  const grouped = {};
  campaigns.forEach(c => { const bId = c.brand_id || 'unknown'; if (!grouped[bId]) grouped[bId] = []; grouped[bId].push(c); });

  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1612', letterSpacing: '-0.02em' }}>Campaigns</h1>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', marginTop: 4 }}>
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} · {brands.length} brand{brands.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/Onboarding" style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 16px', borderRadius: 999,
            background: '#1A1612', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none',
          }}>
            <Plus style={{ width: 12, height: 12 }} /> New Campaign
          </Link>
        </div>

        {/* Recent outputs */}
        {recentImages.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,22,18,0.25)' }}>Recent outputs</p>
              <Link to="/Gallery" style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                View all <ChevronRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
              {recentImages.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: 'rgba(26,22,18,0.04)' }}
                  onClick={() => navigate(`/Campaign?id=${a.campaign_id}&brand=${a.brand_id}`)}>
                  <img src={a.preview_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 160, borderRadius: 12, background: 'rgba(26,22,18,0.04)', animation: 'pulse 2s infinite' }} />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && campaigns.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(26,22,18,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Layers style={{ width: 20, height: 20, color: 'rgba(26,22,18,0.2)' }} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1612', marginBottom: 4 }}>No campaigns yet</h3>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', marginBottom: 24, maxWidth: 240 }}>Paste a website URL to analyze and generate campaigns.</p>
            <Link to="/Onboarding" style={{
              display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 18px', borderRadius: 999,
              background: '#1A1612', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>
              <Plus style={{ width: 14, height: 14 }} /> Create first campaign
            </Link>
          </div>
        )}

        {/* Brand sections */}
        {!isLoading && Object.entries(grouped).map(([brandId, bCampaigns]) => {
          const brand = brandMap[brandId];
          const colors = brand?.brand_colors || [];
          return (
            <div key={brandId} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(26,22,18,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {colors.length > 0 ? (
                    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
                      {colors.slice(0, 4).map((c, i) => <div key={i} style={{ backgroundColor: c }} />)}
                    </div>
                  ) : <Globe style={{ width: 14, height: 14, color: 'rgba(26,22,18,0.25)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1A1612', letterSpacing: '-0.01em' }}>{brand?.brand_name || 'Unknown'}</h2>
                  <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand?.industry || brand?.url}</p>
                </div>
                <button onClick={() => brand && generateCampaignsForBrand(brand)} disabled={generatingFor === brandId}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, height: 26, padding: '0 10px', borderRadius: 8,
                    background: 'rgba(26,22,18,0.04)', border: 'none', cursor: 'pointer',
                    color: 'rgba(26,22,18,0.5)', fontSize: 10, fontWeight: 600, fontFamily: 'inherit',
                    opacity: generatingFor === brandId ? 0.5 : 1,
                  }}>
                  {generatingFor === brandId ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Sparkles style={{ width: 12, height: 12 }} />}
                  Generate more
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {bCampaigns.map((camp, i) => (
                  <motion.div key={camp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Link to={`/Campaign?id=${camp.id}&brand=${camp.brand_id}`} style={{
                      display: 'block', padding: 16, borderRadius: 14, textDecoration: 'none',
                      background: '#fff', border: '1px solid rgba(26,22,18,0.06)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(26,22,18,0.12)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,22,18,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,22,18,0.25)' }}>{camp.strategy_angle}</span>
                        <ArrowRight style={{ width: 12, height: 12, color: 'rgba(26,22,18,0.12)' }} />
                      </div>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1612', marginBottom: 4, letterSpacing: '-0.01em', lineHeight: 1.4 }}>{camp.title}</h3>
                      <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{camp.summary}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(26,22,18,0.04)' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {(camp.suggested_channels || []).slice(0, 2).map(ch => (
                            <span key={ch} style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(26,22,18,0.03)', fontSize: 9, color: 'rgba(26,22,18,0.4)', fontWeight: 500 }}>{ch}</span>
                          ))}
                        </div>
                        <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.2)' }}>{assetMap[camp.id] || 0} assets</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
