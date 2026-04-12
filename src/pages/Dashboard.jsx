import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Globe, ChevronDown, Sparkles, Loader2, Layers, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import AppShell from '../components/ui/AppShell';

export default function Dashboard() {
  const navigate = useNavigate();
  const [expandedBrand, setExpandedBrand] = useState(null);
  const [generatingFor, setGeneratingFor] = useState(null);
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
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
  const assetCountMap = {};
  assets.forEach(a => { assetCountMap[a.campaign_id] = (assetCountMap[a.campaign_id] || 0) + 1; });

  const generateCampaignsForBrand = async (brand) => {
    setGeneratingFor(brand.id);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior marketing strategist. Generate 6 NEW and DIFFERENT campaign themes for this brand.
Avoid repeating themes that are too similar to generic ones — be creative and specific.

Brand: ${brand.brand_name}
Product/Service: ${brand.description}
Audience: ${brand.target_audience}
Tone: ${brand.tone_of_voice}
Key Messages: ${brand.key_messages?.join(', ')}
Industry: ${brand.industry}${brand.visual_style_notes ? `\n\nBrand Visual Style:\n${brand.visual_style_notes}` : ''}

Generate 6 strategic campaign themes with fresh angles.
For EACH theme return:
- title, strategy_angle, summary, target_audience, tone, key_message, visual_direction, suggested_channels`,
        response_json_schema: {
          type: "object",
          properties: {
            themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  strategy_angle: { type: "string" },
                  summary: { type: "string" },
                  target_audience: { type: "string" },
                  tone: { type: "string" },
                  key_message: { type: "string" },
                  visual_direction: { type: "string" },
                  suggested_channels: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      const saved = await Promise.all(
        (result.themes || []).map(t => base44.entities.AdCampaign.create({ ...t, brand_id: brand.id }))
      );

      if (saved.length > 0) {
        toast.success(`${saved.length} new campaigns generated!`);
        navigate(`/Campaign?id=${saved[0].id}&brand=${brand.id}`);
      }
    } catch (e) {
      toast.error('Failed to generate campaigns');
    }
    setGeneratingFor(null);
  };

  const grouped = {};
  campaigns.forEach(c => {
    const bId = c.brand_id || 'unknown';
    if (!grouped[bId]) grouped[bId] = [];
    grouped[bId].push(c);
  });

  // Auto-expand first brand if only one
  const brandIds = Object.keys(grouped);
  const effectiveExpanded = expandedBrand || (brandIds.length === 1 ? brandIds[0] : null);

  return (
    <AppShell>
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-[1.625rem] font-bold text-gray-900 tracking-tight">Campaigns</h1>
            <p className="text-[13px] text-gray-400 mt-1.5">
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} across {brands.length} brand{brands.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/Onboarding"
            className="flex items-center gap-1.5 h-[34px] px-4 rounded-[9px] bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white text-[13px] font-medium transition-all shadow-sm shadow-violet-200/50 active:scale-[0.97]"
          >
            <Plus className="w-3.5 h-3.5" /> New Campaign
          </Link>
        </div>

        {loadingCampaigns ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-44 rounded-2xl bg-gray-100/80 animate-pulse" />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-5">
              <Layers className="w-7 h-7 text-violet-400/70" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-[13px] text-gray-400 mb-8 max-w-[260px] leading-relaxed">Paste a website URL to generate strategic campaign themes instantly.</p>
            <Link to="/Onboarding" className="flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 text-white text-sm font-medium transition-all shadow-sm shadow-violet-200/50 active:scale-[0.97]">
              <Plus className="w-4 h-4" /> Create your first campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(grouped).map(([brandId, bCampaigns]) => {
              const brand = brandMap[brandId];
              const isExpanded = effectiveExpanded === brandId;
              const brandColors = brand?.brand_colors || [];

              return (
                <div key={brandId} className="group/brand">
                  {/* Brand header */}
                  <button
                    onClick={() => setExpandedBrand(isExpanded ? null : brandId)}
                    className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all duration-200 ${
                      isExpanded
                        ? 'bg-white border-violet-100 shadow-sm'
                        : 'bg-white border-gray-100/80 hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    {/* Brand color indicator */}
                    <div className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {brandColors.length > 0 ? (
                        <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                          {brandColors.slice(0, 4).map((c, i) => (
                            <div key={i} style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      ) : (
                        <Globe className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 text-[14px] tracking-tight">{brand?.brand_name || 'Unknown'}</h2>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{brand?.industry || brand?.url}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-gray-400 font-medium">{bCampaigns.length} campaign{bCampaigns.length !== 1 ? 's' : ''}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 px-1 pb-2 space-y-4">
                          {/* Brand DNA */}
                          {brand && (
                            <div className="bg-gradient-to-br from-gray-50 to-violet-50/30 rounded-xl p-5 border border-gray-100/80">
                              <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">Brand DNA</h3>
                              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                                {brand.description && (
                                  <div className="sm:col-span-2">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Description</p>
                                    <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-2">{brand.description}</p>
                                  </div>
                                )}
                                {brand.tone_of_voice && (
                                  <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Tone</p>
                                    <p className="text-[13px] text-gray-600">{brand.tone_of_voice}</p>
                                  </div>
                                )}
                                {brand.target_audience && (
                                  <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Target Audience</p>
                                    <p className="text-[13px] text-gray-600">{brand.target_audience}</p>
                                  </div>
                                )}
                              </div>
                              {brandColors.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Colors</p>
                                    <div className="flex gap-1.5">
                                      {brandColors.map(color => (
                                        <div
                                          key={color}
                                          className="w-6 h-6 rounded-md border border-black/5 shadow-sm"
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Campaigns */}
                          <div>
                            <div className="flex items-center justify-between mb-3 px-1">
                              <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Campaigns</h3>
                              <button
                                onClick={() => generateCampaignsForBrand(brand)}
                                disabled={generatingFor === brandId}
                                className="flex items-center gap-1.5 h-[28px] px-3 rounded-lg bg-gradient-to-b from-violet-500 to-violet-600 text-white text-[11px] font-semibold transition-all disabled:opacity-60 shadow-sm shadow-violet-200/40 active:scale-[0.97]"
                              >
                                {generatingFor === brandId
                                  ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                                  : <><Sparkles className="w-3 h-3" /> New Campaigns</>
                                }
                              </button>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {bCampaigns.map((camp, i) => (
                                <motion.div
                                  key={camp.id}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                >
                                  <Link to={`/Campaign?id=${camp.id}&brand=${camp.brand_id}`}>
                                    <div className="group bg-white rounded-xl border border-gray-100/80 p-4 hover:border-violet-200 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                                      <div className="flex items-start justify-between mb-2.5">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">{camp.strategy_angle}</span>
                                        <ArrowRight className="w-3 h-3 text-gray-200 group-hover:text-violet-500 transition-colors" />
                                      </div>
                                      <h4 className="font-semibold text-gray-900 text-[13px] mb-1 leading-snug tracking-tight">{camp.title}</h4>
                                      <p className="text-[12px] text-gray-400 leading-relaxed mb-3 line-clamp-2">{camp.summary}</p>
                                      <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
                                        <div className="flex gap-1 flex-wrap">
                                          {(camp.suggested_channels || []).slice(0, 2).map(ch => (
                                            <span key={ch} className="px-2 py-0.5 rounded-md bg-gray-50 text-[10px] text-gray-500 font-medium">{ch}</span>
                                          ))}
                                        </div>
                                        <span className="text-[11px] text-gray-300 font-medium shrink-0">
                                          {assetCountMap[camp.id] || 0} assets
                                        </span>
                                      </div>
                                    </div>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
