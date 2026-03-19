import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Globe, Layers, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import AppShell from '../components/ui/AppShell';



export default function Dashboard() {
  const [expandedBrand, setExpandedBrand] = useState(null);
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

  // Group campaigns by brand
  const grouped = {};
  campaigns.forEach(c => {
    const bId = c.brand_id || 'unknown';
    if (!grouped[bId]) grouped[bId] = [];
    grouped[bId].push(c);
  });

  return (
    <AppShell>
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campaigns</h1>
            <p className="text-sm text-gray-400 mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} across {brands.length} brand{brands.length !== 1 ? 's' : ''}</p>
          </div>
          <Link
            to="/Onboarding"
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> New Campaign
          </Link>
        </div>

        {loadingCampaigns ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-5">
              <Layers className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-sm text-gray-400 mb-8 max-w-xs">Paste a website URL to generate strategic campaign themes instantly.</p>
            <Link to="/Onboarding" className="flex items-center gap-2 h-10 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Create your first campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(grouped).map(([brandId, bCampaigns]) => {
              const brand = brandMap[brandId];
              const isExpanded = expandedBrand === brandId;
              
              return (
                <div key={brandId}>
                  {/* Brand header - clickable */}
                  <button
                    onClick={() => setExpandedBrand(isExpanded ? null : brandId)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                      <Globe className="w-4 h-4 text-gray-500 group-hover:text-violet-600 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 text-[15px]">{brand?.brand_name || 'Unknown'}</h2>
                      <p className="text-xs text-gray-400 truncate">{brand?.url}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">{bCampaigns.length} campaign{bCampaigns.length !== 1 ? 's' : ''}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 px-4 pb-4 space-y-4">
                        {/* Brand DNA */}
                        {brand && (
                          <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-xl p-4 border border-violet-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Brand DNA</h3>
                            <div className="space-y-2">
                              {brand.description && (
                                <div>
                                  <p className="text-[11px] text-gray-500">Description</p>
                                  <p className="text-sm text-gray-700 line-clamp-2">{brand.description}</p>
                                </div>
                              )}
                              {brand.tone_of_voice && (
                                <div>
                                  <p className="text-[11px] text-gray-500">Tone</p>
                                  <p className="text-sm text-gray-700">{brand.tone_of_voice}</p>
                                </div>
                              )}
                              {brand.target_audience && (
                                <div>
                                  <p className="text-[11px] text-gray-500">Target Audience</p>
                                  <p className="text-sm text-gray-700">{brand.target_audience}</p>
                                </div>
                              )}
                              {brand.brand_colors && brand.brand_colors.length > 0 && (
                                <div>
                                  <p className="text-[11px] text-gray-500 mb-1.5">Colors</p>
                                  <div className="flex gap-2">
                                    {brand.brand_colors.map(color => (
                                      <div
                                        key={color}
                                        className="w-8 h-8 rounded-lg border border-gray-200"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Campaigns */}
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Campaigns</h3>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {bCampaigns.map((camp, i) => (
                              <motion.div
                                key={camp.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                              >
                                <Link to={`/Campaign?id=${camp.id}&brand=${camp.brand_id}`}>
                                  <div className="group bg-white rounded-xl border border-gray-100 p-4 hover:border-violet-200 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{camp.strategy_angle}</span>
                                      <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-violet-600 transition-colors" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1 leading-snug">{camp.title}</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-1">{camp.summary}</p>
                                    <div className="flex items-center justify-between">
                                      <div className="flex gap-1 flex-wrap">
                                        {(camp.suggested_channels || []).slice(0, 2).map(ch => (
                                          <span key={ch} className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] text-gray-500">{ch}</span>
                                        ))}
                                      </div>
                                      <span className="text-xs text-gray-400 shrink-0">
                                        {assetCountMap[camp.id] || 0}
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}