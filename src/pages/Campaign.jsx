import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import AppShell from '../components/ui/AppShell';
import CampaignHeader from '../components/campaign/CampaignHeader';
import AssetCard from '../components/campaign/AssetCard';
import AddAssetPanel from '../components/campaign/AddAssetPanel';
import AssetEditorPanel from '../components/campaign/AssetEditorPanel';
import CampaignEditPanel from '../components/campaign/CampaignEditPanel';
import BrandEditPanel from '../components/campaign/BrandEditPanel';

const PLATFORM_ORDER = ['instagram', 'facebook', 'linkedin', 'tiktok', 'youtube', 'twitter', 'general'];
const PLATFORM_LABELS = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', tiktok: 'TikTok', youtube: 'YouTube', twitter: 'X / Twitter', general: 'Display' };
const PLATFORM_ICONS = { instagram: '📸', facebook: '📘', linkedin: '💼', tiktok: '🎵', youtube: '▶️', twitter: '🐦', general: '🖼' };

export default function Campaign() {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');
  const brandId = urlParams.get('brand');
  const qc = useQueryClient();

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
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
    // Fire and forget — backend completes the generation even if browser disconnects
    // Frontend discovers result via refetchInterval polling
    base44.functions.invoke('generateAsset', {
      assetId,
      option,
      campaign: camp,
      brand: br,
    }).catch(() => {
      // Ignore — asset will show as error via polling if backend failed
    });
  };

  const handleAddAsset = async (option) => {
    const placeholder = await base44.entities.CampaignAsset.create({
      campaign_id: campaignId,
      brand_id: brandId,
      platform: option.platform,
      asset_type: option.asset_type,
      format: option.format,
      status: 'generating',
    });
    qc.setQueryData(['assets', campaignId], prev => [...(prev || []), placeholder]);
    generateAsset(placeholder.id, option, campaign, brand);
  };

  const handleRegenerate = async (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    await base44.entities.CampaignAsset.update(assetId, { status: 'generating' });
    qc.invalidateQueries({ queryKey: ['assets', campaignId] });
    generateAsset(assetId, { platform: asset.platform, asset_type: asset.asset_type, format: asset.format, label: `${asset.platform} ${asset.asset_type}` }, campaign, brand);
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

  const handleCampaignSaved = (updated) => {
    qc.setQueryData(['campaign', campaignId], updated);
    setEditingCampaign(false);
    refetchCampaign();
  };

  // Group by platform
  const grouped = {};
  assets.forEach(a => { if (!grouped[a.platform]) grouped[a.platform] = []; grouped[a.platform].push(a); });
  const usedPlatforms = PLATFORM_ORDER.filter(p => grouped[p]?.length > 0);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#F7F7F8]">
        {campaign && (
          <CampaignHeader
            campaign={campaign}
            brandName={brand?.brand_name}
            assetCount={assets.filter(a => a.status === 'ready').length}
            onEdit={() => setEditingCampaign(true)}
            onEditBrand={brand ? () => setEditingBrand(true) : undefined}
          />
        )}

        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Assets
              {assets.length > 0 && <span className="text-gray-400 font-normal text-sm ml-2">({assets.length})</span>}
            </h2>
            <button
              onClick={() => setShowAddPanel(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Content
            </button>
          </div>

          {assets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                <Plus className="w-7 h-7 text-violet-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">No content yet</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">Generate posts, stories, reels, banners and more for this campaign.</p>
              <button onClick={() => setShowAddPanel(true)} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add your first asset
              </button>
            </div>
          )}

          {usedPlatforms.map(platform => (
            <div key={platform} className="mb-10">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-lg">{PLATFORM_ICONS[platform]}</span>
                <h3 className="font-semibold text-gray-800 text-[15px]">{PLATFORM_LABELS[platform]}</h3>
                <span className="text-xs text-gray-400">{grouped[platform].length} item{grouped[platform].length !== 1 ? 's' : ''}</span>
                <button onClick={() => setShowAddPanel(true)} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-violet-600 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {grouped[platform].map((asset, i) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    index={i}
                    onEdit={setEditingAsset}
                    onRegenerate={handleRegenerate}
                    onDuplicate={handleDuplicate}
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
          <AssetEditorPanel
            asset={editingAsset}
            campaign={campaign}
            brand={brand}
            onSave={handleAssetSaved}
            onClose={() => setEditingAsset(null)}
          />
        )}
        {editingCampaign && campaign && (
          <CampaignEditPanel
            campaign={campaign}
            onSave={handleCampaignSaved}
            onClose={() => setEditingCampaign(false)}
          />
        )}
        {editingBrand && brand && (
          <BrandEditPanel
            brand={brand}
            onSave={(updated) => { qc.setQueryData(['brand', brandId], updated); setEditingBrand(false); }}
            onClose={() => setEditingBrand(false)}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}