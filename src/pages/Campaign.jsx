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
import CanvasEditor from '../components/campaign/CanvasEditor';
import { recordFeedback } from '../lib/brand-preferences';

const PLATFORM_ORDER = ['instagram', 'facebook', 'linkedin', 'tiktok', 'youtube', 'twitter', 'general'];
const PLATFORM_LABELS = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', tiktok: 'TikTok', youtube: 'YouTube', twitter: 'X / Twitter', general: 'Display' };
const PLATFORM_COLORS = {
  instagram: 'text-pink-600 bg-pink-50',
  facebook: 'text-blue-600 bg-blue-50',
  linkedin: 'text-sky-700 bg-sky-50',
  tiktok: 'text-gray-900 bg-gray-100',
  youtube: 'text-red-600 bg-red-50',
  twitter: 'text-gray-700 bg-gray-100',
  general: 'text-violet-600 bg-violet-50'
};

export default function Campaign() {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');
  const brandId = urlParams.get('brand');
  const qc = useQueryClient();

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [canvasAsset, setCanvasAsset] = useState(null);
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
    base44.functions.invoke('generateAsset', {
      assetId,
      option,
      campaign: camp,
      brand: br,
    }).catch(() => {});
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
    generateAsset(assetId, {
      platform: asset.platform,
      asset_type: asset.asset_type,
      format: asset.format,
      label: `${asset.platform} ${asset.asset_type}`
    }, campaign, brand);
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

  const handleCanvasSaved = async (designData) => {
    const updated = { ...canvasAsset, ...designData };
    await base44.entities.CampaignAsset.update(canvasAsset.id, {
      headline: designData.headline,
      ad_copy: designData.ad_copy,
      cta: designData.cta,
      preview_image: designData.preview_image,
    });
    qc.setQueryData(['assets', campaignId], prev => prev?.map(a => a.id === canvasAsset.id ? updated : a));
    setCanvasAsset(null);
  };

  const handleCampaignSaved = (updated) => {
    qc.setQueryData(['campaign', campaignId], updated);
    setEditingCampaign(false);
    refetchCampaign();
  };

  const handleFeedback = async (asset, action) => {
    if (!brandId) return;
    // Update local state immediately
    qc.setQueryData(['assets', campaignId], prev =>
      prev?.map(a => a.id === asset.id ? { ...a, feedback: action } : a)
    );
    // Persist feedback and update brand preferences
    try {
      await recordFeedback(brandId, asset, action);
    } catch (e) {
      console.error('Failed to record feedback:', e);
    }
  };

  const grouped = {};
  assets.forEach(a => { if (!grouped[a.platform]) grouped[a.platform] = []; grouped[a.platform].push(a); });
  const usedPlatforms = PLATFORM_ORDER.filter(p => grouped[p]?.length > 0);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FAFAFA]">
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
            <h2 className="text-[15px] font-semibold text-gray-900 tracking-tight">
              Assets
              {assets.length > 0 && <span className="text-gray-300 font-normal text-[13px] ml-2">({assets.length})</span>}
            </h2>
            <button
              onClick={() => setShowAddPanel(true)}
              className="flex items-center gap-1.5 h-[34px] px-4 rounded-[9px] bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white text-[13px] font-medium transition-all shadow-sm shadow-violet-200/50 active:scale-[0.97]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Content
            </button>
          </div>

          {assets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-violet-400/70" />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">No content yet</h3>
              <p className="text-[13px] text-gray-400 mb-6 max-w-[260px] leading-relaxed">Generate posts, stories, reels, banners and more for this campaign.</p>
              <button onClick={() => setShowAddPanel(true)} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 text-white text-sm font-medium transition-all shadow-sm shadow-violet-200/50 active:scale-[0.97]">
                <Plus className="w-4 h-4" /> Add your first asset
              </button>
            </div>
          )}

          {usedPlatforms.map(platform => (
            <div key={platform} className="mb-10">
              <div className="flex items-center gap-2.5 mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-[0.08em] ${PLATFORM_COLORS[platform]}`}>
                  {PLATFORM_LABELS[platform]}
                </span>
                <span className="text-[11px] text-gray-300 font-medium">{grouped[platform].length} item{grouped[platform].length !== 1 ? 's' : ''}</span>
                <button onClick={() => setShowAddPanel(true)} className="ml-auto flex items-center gap-1 text-[12px] text-gray-400 hover:text-violet-600 transition-colors font-medium">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {grouped[platform].map((asset, i) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    index={i}
                    onEdit={setEditingAsset}
                    onCanvas={setCanvasAsset}
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
        {canvasAsset && (
          <CanvasEditor
            initialHeadline={canvasAsset.headline}
            initialSubtext={canvasAsset.ad_copy}
            initialCta={canvasAsset.cta}
            initialImage={canvasAsset.preview_image}
            logoUrl={brand?.logo_url}
            brandColors={brand?.brand_colors}
            screenshots={brand?.image_assets}
            onClose={() => setCanvasAsset(null)}
            onSave={handleCanvasSaved}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
