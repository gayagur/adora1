import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import AppShell from '../components/ui/AppShell';
import CampaignHeader from '../components/campaign/CampaignHeader';
import AssetCard from '../components/campaign/AssetCard';
import AddAssetPanel from '../components/campaign/AddAssetPanel';
import AssetEditorPanel from '../components/campaign/AssetEditorPanel';
import CampaignEditPanel from '../components/campaign/CampaignEditPanel';
import BrandEditPanel from '../components/campaign/BrandEditPanel';
import RefineView from '../components/campaign/RefineView';
import { recordFeedback } from '../lib/brand-preferences';

const PLATFORM_ORDER = ['instagram', 'facebook', 'linkedin', 'tiktok', 'youtube', 'twitter', 'general'];
const PLATFORM_LABELS = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', tiktok: 'TikTok', youtube: 'YouTube', twitter: 'X / Twitter', general: 'Display' };

export default function Campaign() {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');
  const brandId = urlParams.get('brand');
  const qc = useQueryClient();

  // UI modes
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [refiningAsset, setRefiningAsset] = useState(null); // Refine mode
  const [editingCampaign, setEditingCampaign] = useState(false);
  const [editingBrand, setEditingBrand] = useState(false);

  const { data: campaign, refetch: refetchCampaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => base44.entities.AdCampaign.filter({ id: campaignId }).then(r => r[0]),
    enabled: !!campaignId,
  });
  const { data: brand } = useQuery({
    queryKey: ['brand', brandId],
    queryFn: () => base44.entities.Brand.filter({ id: brandId }).then(r => r[0]),
    enabled: !!brandId,
  });
  const { data: assets = [] } = useQuery({
    queryKey: ['assets', campaignId],
    queryFn: () => base44.entities.CampaignAsset.filter({ campaign_id: campaignId }),
    enabled: !!campaignId,
    refetchInterval: (query) => query.state.data?.some(a => a.status === 'generating') ? 3000 : false,
  });

  const generateAsset = (assetId, option, camp, br) => {
    base44.functions.invoke('generateAsset', { assetId, option, campaign: camp, brand: br }).catch(() => {});
  };

  const handleAddAsset = async (option) => {
    const placeholder = await base44.entities.CampaignAsset.create({
      campaign_id: campaignId, brand_id: brandId,
      platform: option.platform, asset_type: option.asset_type,
      format: option.format, status: 'generating',
    });
    qc.setQueryData(['assets', campaignId], prev => [...(prev || []), placeholder]);
    generateAsset(placeholder.id, option, campaign, brand);
  };

  const handleRegenerate = async (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    await base44.entities.CampaignAsset.update(assetId, { status: 'generating' });
    qc.invalidateQueries({ queryKey: ['assets', campaignId] });
    generateAsset(assetId, { platform: asset.platform, asset_type: asset.asset_type, format: asset.format }, campaign, brand);
    toast.success('Regenerating...');
  };

  const handleDuplicate = async (asset) => {
    const { id, created_date, updated_date, created_by, ...rest } = asset;
    const copy = await base44.entities.CampaignAsset.create({ ...rest, headline: rest.headline + ' (copy)' });
    qc.setQueryData(['assets', campaignId], prev => [...(prev || []), copy]);
    toast.success('Duplicated');
  };

  const handleAssetSaved = (updated) => {
    qc.setQueryData(['assets', campaignId], prev => prev?.map(a => a.id === updated.id ? updated : a));
    setEditingAsset(null);
  };

  const handleRefineSaved = async (designData) => {
    const updated = { ...refiningAsset, ...designData };
    await base44.entities.CampaignAsset.update(refiningAsset.id, {
      headline: designData.headline, ad_copy: designData.ad_copy,
      cta: designData.cta, preview_image: designData.preview_image,
    });
    qc.setQueryData(['assets', campaignId], prev => prev?.map(a => a.id === refiningAsset.id ? updated : a));
    setRefiningAsset(null);
  };

  const handleFeedback = async (asset, action) => {
    if (!brandId) return;
    qc.setQueryData(['assets', campaignId], prev => prev?.map(a => a.id === asset.id ? { ...a, feedback: action } : a));
    try { await recordFeedback(brandId, asset, action); } catch (e) {}
  };

  // Group assets by platform
  const grouped = {};
  assets.forEach(a => { if (!grouped[a.platform]) grouped[a.platform] = []; grouped[a.platform].push(a); });
  const usedPlatforms = PLATFORM_ORDER.filter(p => grouped[p]?.length > 0);
  const readyAssets = assets.filter(a => a.status === 'ready');

  // ── REFINE MODE ──────────────────────────────────────────────────────────
  if (refiningAsset) {
    return (
      <RefineView
        asset={refiningAsset}
        brand={brand}
        onClose={() => setRefiningAsset(null)}
        onSave={handleRefineSaved}
      />
    );
  }

  // ── GENERATE MODE (default) ──────────────────────────────────────────────
  return (
    <AppShell>
      <div className="min-h-screen bg-[#fafafa]">
        {campaign && (
          <CampaignHeader
            campaign={campaign}
            brandName={brand?.brand_name}
            assetCount={readyAssets.length}
            onEdit={() => setEditingCampaign(true)}
            onEditBrand={brand ? () => setEditingBrand(true) : undefined}
          />
        )}

        <div className="max-w-[1200px] mx-auto px-5 py-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-[14px] font-semibold text-gray-900">
                Generated Creatives
                {readyAssets.length > 0 && <span className="text-gray-300 font-normal ml-1.5">({readyAssets.length})</span>}
              </h2>
            </div>
            <button onClick={() => setShowAddPanel(true)}
              className="flex items-center gap-1.5 h-[30px] px-3.5 rounded-lg bg-[#6c5ce7] hover:bg-[#5f4dd6] text-white text-[12px] font-medium transition-colors">
              <Plus className="w-3 h-3" /> Generate
            </button>
          </div>

          {/* Empty state */}
          {assets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <Plus className="w-5 h-5 text-gray-300" />
              </div>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-1">No creatives yet</h3>
              <p className="text-[12px] text-gray-400 mb-5 max-w-[220px]">Generate your first batch of creatives for this campaign.</p>
              <button onClick={() => setShowAddPanel(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#6c5ce7] text-white text-[13px] font-medium">
                <Plus className="w-3.5 h-3.5" /> Generate creatives
              </button>
            </div>
          )}

          {/* Asset grid — organized by platform */}
          {usedPlatforms.map(platform => (
            <div key={platform} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-[0.08em]">{PLATFORM_LABELS[platform]}</h3>
                <span className="text-[10px] text-gray-300">{grouped[platform].length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {grouped[platform].map((asset, i) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    index={i}
                    onEdit={setEditingAsset}
                    onRefine={setRefiningAsset}
                    onRegenerate={handleRegenerate}
                    onDuplicate={handleDuplicate}
                    onFeedback={handleFeedback}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAddPanel && <AddAssetPanel onAdd={handleAddAsset} onClose={() => setShowAddPanel(false)} />}
        {editingAsset && (
          <AssetEditorPanel asset={editingAsset} campaign={campaign} brand={brand}
            onSave={handleAssetSaved} onClose={() => setEditingAsset(null)} />
        )}
        {editingCampaign && campaign && (
          <CampaignEditPanel campaign={campaign}
            onSave={(u) => { qc.setQueryData(['campaign', campaignId], u); setEditingCampaign(false); refetchCampaign(); }}
            onClose={() => setEditingCampaign(false)} />
        )}
        {editingBrand && brand && (
          <BrandEditPanel brand={brand}
            onSave={(u) => { qc.setQueryData(['brand', brandId], u); setEditingBrand(false); }}
            onClose={() => setEditingBrand(false)} />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
