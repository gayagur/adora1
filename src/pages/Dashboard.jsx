import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Globe, Layers, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
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
          <div className="space-y-12">
            {Object.entries(grouped).map(([brandId, bCampaigns]) => {
              const brand = brandMap[brandId];
              return (
                <div key={brandId}>
                  {/* Brand row */}
                  {brand && (
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-800 text-[15px]">{brand.brand_name}</h2>
                        <p className="text-xs text-gray-400">{brand.url}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
                        <span>{bCampaigns.length} campaign{bCampaigns.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bCampaigns.map((camp, i) => (
                      <motion.div
                        key={camp.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link to={`/Campaign?id=${camp.id}&brand=${camp.brand_id}`}>
                          <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-violet-200 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{camp.strategy_angle}</span>
                              <div className="w-6 h-6 rounded-lg bg-gray-50 group-hover:bg-violet-50 flex items-center justify-center transition-colors">
                                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-violet-600 transition-colors" />
                              </div>
                            </div>

                            <h3 className="font-semibold text-gray-900 text-[15px] mb-1.5 leading-snug">{camp.title}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{camp.summary}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex gap-1.5 flex-wrap">
                                {(camp.suggested_channels || []).slice(0, 3).map(ch => (
                                  <span key={ch} className="px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-500">{ch}</span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-400 shrink-0">
                                {assetCountMap[camp.id] || 0} asset{assetCountMap[camp.id] !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}

                    {/* Quick-add card */}
                    <Link to="/Onboarding">
                      <div className="flex flex-col items-center justify-center h-full min-h-[160px] rounded-2xl border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50/20 transition-all group cursor-pointer p-5">
                        <Plus className="w-6 h-6 text-gray-300 group-hover:text-violet-500 mb-2 transition-colors" />
                        <p className="text-xs font-medium text-gray-400 group-hover:text-violet-600 transition-colors">New campaign</p>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}