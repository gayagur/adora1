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

  // Get recent ready assets for hero preview
  const recentImages = assets.filter(a => a.status === 'ready' && a.preview_image).slice(0, 6);

  const generateCampaignsForBrand = async (brand) => {
    setGeneratingFor(brand.id);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior marketing strategist. Generate 6 NEW campaign themes for this brand. Be creative and specific.
Brand: ${brand.brand_name}
Product: ${brand.description}
Audience: ${brand.target_audience}
Tone: ${brand.tone_of_voice}
Key Messages: ${brand.key_messages?.join(', ')}
Industry: ${brand.industry}${brand.visual_style_notes ? `\nVisual Style:\n${brand.visual_style_notes}` : ''}
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
      const saved = await Promise.all(
        (result.themes || []).map(t => base44.entities.AdCampaign.create({ ...t, brand_id: brand.id }))
      );
      if (saved.length > 0) {
        toast.success(`${saved.length} campaigns generated`);
        navigate(`/Campaign?id=${saved[0].id}&brand=${brand.id}`);
      }
    } catch (e) { toast.error('Failed to generate'); }
    setGeneratingFor(null);
  };

  // Group by brand
  const grouped = {};
  campaigns.forEach(c => {
    const bId = c.brand_id || 'unknown';
    if (!grouped[bId]) grouped[bId] = [];
    grouped[bId].push(c);
  });

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Campaigns</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} · {brands.length} brand{brands.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/Onboarding"
            className="flex items-center gap-1.5 h-[32px] px-3.5 rounded-lg bg-[#6c5ce7] hover:bg-[#5f4dd6] text-white text-[12px] font-medium transition-colors">
            <Plus className="w-3 h-3" /> New Campaign
          </Link>
        </div>

        {/* Recent outputs preview — show value immediately */}
        {recentImages.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Recent outputs</p>
              <Link to="/Gallery" className="text-[11px] text-gray-400 hover:text-[#6c5ce7] font-medium transition-colors flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {recentImages.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer group"
                  onClick={() => navigate(`/Campaign?id=${a.campaign_id}&brand=${a.brand_id}`)}>
                  <img src={a.preview_image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && campaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5 text-gray-300" />
            </div>
            <h3 className="text-[15px] font-semibold text-gray-900 mb-1">No campaigns yet</h3>
            <p className="text-[12px] text-gray-400 mb-6 max-w-[240px]">Paste a website URL to analyze and generate campaigns.</p>
            <Link to="/Onboarding" className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#6c5ce7] text-white text-[13px] font-medium">
              <Plus className="w-3.5 h-3.5" /> Create first campaign
            </Link>
          </div>
        )}

        {/* Brand sections */}
        {!isLoading && Object.entries(grouped).map(([brandId, bCampaigns]) => {
          const brand = brandMap[brandId];
          const colors = brand?.brand_colors || [];

          return (
            <div key={brandId} className="mb-8">
              {/* Brand header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  {colors.length > 0 ? (
                    <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                      {colors.slice(0, 4).map((c, i) => <div key={i} style={{ backgroundColor: c }} />)}
                    </div>
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[14px] font-semibold text-gray-900 tracking-tight">{brand?.brand_name || 'Unknown'}</h2>
                  <p className="text-[11px] text-gray-400 truncate">{brand?.industry || brand?.url}</p>
                </div>
                <button onClick={() => brand && generateCampaignsForBrand(brand)}
                  disabled={generatingFor === brandId}
                  className="flex items-center gap-1 h-[26px] px-2.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-semibold transition-colors disabled:opacity-50">
                  {generatingFor === brandId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate more
                </button>
              </div>

              {/* Campaign cards grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {bCampaigns.map((camp, i) => (
                  <motion.div key={camp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Link to={`/Campaign?id=${camp.id}&brand=${camp.brand_id}`}
                      className="block group p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">{camp.strategy_angle}</span>
                        <ArrowRight className="w-3 h-3 text-gray-200 group-hover:text-[#6c5ce7] transition-colors" />
                      </div>
                      <h3 className="text-[13px] font-semibold text-gray-900 mb-1 tracking-tight leading-snug">{camp.title}</h3>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-3">{camp.summary}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <div className="flex gap-1">
                          {(camp.suggested_channels || []).slice(0, 2).map(ch => (
                            <span key={ch} className="px-1.5 py-0.5 rounded bg-gray-50 text-[9px] text-gray-500 font-medium">{ch}</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-300">{assetMap[camp.id] || 0} assets</span>
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
