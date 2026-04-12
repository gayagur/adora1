import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
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

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [refiningAsset, setRefiningAsset] = useState(null);
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

  const handleAssetSaved = (updated) => { qc.setQueryData(['assets', campaignId], prev => prev?.map(a => a.id === updated.id ? updated : a)); setEditingAsset(null); };
  const handleRefineSaved = async (designData) => {
    const updated = { ...refiningAsset, ...designData };
    await base44.entities.CampaignAsset.update(refiningAsset.id, { headline: designData.headline, ad_copy: designData.ad_copy, cta: designData.cta, preview_image: designData.preview_image });
    qc.setQueryData(['assets', campaignId], prev => prev?.map(a => a.id === refiningAsset.id ? updated : a));
    setRefiningAsset(null);
  };

  const handleFeedback = async (asset, action) => {
    if (!brandId) return;
    qc.setQueryData(['assets', campaignId], prev => prev?.map(a => a.id === asset.id ? { ...a, feedback: action } : a));
    try { await recordFeedback(brandId, asset, action); } catch (e) {}
  };

  const grouped = {};
  assets.forEach(a => { if (!grouped[a.platform]) grouped[a.platform] = []; grouped[a.platform].push(a); });
  const usedPlatforms = PLATFORM_ORDER.filter(p => grouped[p]?.length > 0);
  const readyAssets = assets.filter(a => a.status === 'ready');

  if (refiningAsset) return <RefineView asset={refiningAsset} brand={brand} onClose={() => setRefiningAsset(null)} onSave={handleRefineSaved} />;

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: '#F8F8F7' }}>
        {campaign && <CampaignHeader campaign={campaign} brandName={brand?.brand_name} assetCount={readyAssets.length} onEdit={() => setEditingCampaign(true)} onEditBrand={brand ? () => setEditingBrand(true) : undefined} />}

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1A1612' }}>
              Generated Creatives
              {readyAssets.length > 0 && <span style={{ color: 'rgba(26,22,18,0.2)', fontWeight: 400, marginLeft: 6 }}>({readyAssets.length})</span>}
            </h2>
            <button onClick={() => setShowAddPanel(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 16px', borderRadius: 999,
              background: '#1A1612', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <Plus style={{ width: 12, height: 12 }} /> Generate
            </button>
          </div>

          {assets.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(26,22,18,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Plus style={{ width: 20, height: 20, color: 'rgba(26,22,18,0.15)' }} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1612', marginBottom: 4 }}>No creatives yet</h3>
              <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', marginBottom: 20, maxWidth: 220 }}>Generate your first batch of creatives.</p>
              <button onClick={() => setShowAddPanel(true)} style={{
                display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 18px', borderRadius: 999,
                background: '#1A1612', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <Plus style={{ width: 14, height: 14 }} /> Generate creatives
              </button>
            </div>
          )}

          {usedPlatforms.map(platform => (
            <div key={platform} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,22,18,0.3)' }}>{PLATFORM_LABELS[platform]}</h3>
                <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.15)' }}>{grouped[platform].length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {grouped[platform].map((asset, i) => (
                  <AssetCard key={asset.id} asset={asset} index={i}
                    onEdit={setEditingAsset} onRefine={setRefiningAsset}
                    onRegenerate={handleRegenerate} onDuplicate={handleDuplicate} onFeedback={handleFeedback} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAddPanel && <AddAssetPanel onAdd={handleAddAsset} onClose={() => setShowAddPanel(false)} />}
        {editingAsset && <AssetEditorPanel asset={editingAsset} campaign={campaign} brand={brand} onSave={handleAssetSaved} onClose={() => setEditingAsset(null)} />}
        {editingCampaign && campaign && <CampaignEditPanel campaign={campaign} onSave={(u) => { qc.setQueryData(['campaign', campaignId], u); setEditingCampaign(false); refetchCampaign(); }} onClose={() => setEditingCampaign(false)} />}
        {editingBrand && brand && <BrandEditPanel brand={brand} onSave={(u) => { qc.setQueryData(['brand', brandId], u); setEditingBrand(false); }} onClose={() => setEditingBrand(false)} />}
      </AnimatePresence>
    </AppShell>
  );
}
