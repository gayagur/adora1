import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, RefreshCw, Loader2, Upload, Wand2, Scissors, Zap, Heart, ChevronDown, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import CanvasEditor from './CanvasEditor';

const IMPROVE_ACTIONS = [
  { label: 'Shorten', icon: Scissors, instruction: 'Make this copy shorter and punchier. Keep the core message.' },
  { label: 'Bolder', icon: Zap, instruction: 'Make this copy bolder, more confident, and assertive.' },
  { label: 'Emotional', icon: Heart, instruction: 'Make this copy more emotionally resonant and human.' },
  { label: 'Improve', icon: Wand2, instruction: 'Improve the overall quality, clarity, and persuasiveness of this copy.' },
];

export default function AssetEditorPanel({ asset, campaign, brand, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...asset });
  const [saving, setSaving] = useState(false);
  const [regeneratingText, setRegeneratingText] = useState(false);
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [improvingField, setImprovingField] = useState(null);
  const [showCanvasEditor, setShowCanvasEditor] = useState(false);

  const updateField = (k, v) => setDraft(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.CampaignAsset.update(asset.id, draft);
    toast.success('Saved');
    onSave({ ...asset, ...draft });
    setSaving(false);
  };

  const regenerateText = async () => {
    setRegeneratingText(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Regenerate copy for this marketing asset.

Campaign: ${campaign?.title} — ${campaign?.strategy_angle}
Key Message: ${campaign?.key_message}
Tone: ${campaign?.tone || draft.tone || 'Professional'}
Target Audience: ${campaign?.target_audience}
Brand: ${brand?.brand_name}
Platform: ${asset.platform}
Asset Type: ${asset.asset_type}

Current headline: ${draft.headline}
Current ad copy: ${draft.ad_copy}

Write new, better versions. Be creative, different from current.
Return: headline, ad_copy, full_caption (with hashtags), cta`,
      response_json_schema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          ad_copy: { type: 'string' },
          full_caption: { type: 'string' },
          cta: { type: 'string' }
        }
      }
    });
    setDraft(prev => ({ ...prev, ...result }));
    setRegeneratingText(false);
    toast.success('Copy regenerated');
  };

  const improveField = async (field, instruction) => {
    setImprovingField(field);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `${instruction}

Original text: "${draft[field]}"

Context:
- Brand: ${brand?.brand_name}
- Campaign angle: ${campaign?.strategy_angle}
- Platform: ${asset.platform}
- Tone: ${campaign?.tone || 'Professional'}

Return ONLY the improved text, nothing else.`,
    });
    setDraft(prev => ({ ...prev, [field]: result }));
    setImprovingField(null);
    toast.success('Done');
  };

  const regenerateImage = async () => {
    setRegeneratingImage(true);
    const res = await base44.integrations.Core.GenerateImage({
      prompt: `${draft.visual_prompt}. Brand colors: ${brand?.brand_colors?.join(', ')}. Premium marketing creative. No text overlays. High quality.`,
      existing_image_urls: brand?.image_assets?.length > 0 ? brand.image_assets.slice(0, 2) : undefined
    });
    setDraft(prev => ({ ...prev, preview_image: res.url }));
    setRegeneratingImage(false);
    toast.success('Image regenerated');
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setDraft(prev => ({ ...prev, preview_image: file_url }));
    setUploadingImage(false);
    toast.success('Image replaced');
    e.target.value = '';
  };

  if (showCanvasEditor) {
    return (
      <CanvasEditor
        initialHeadline={draft.headline}
        initialSubtext={draft.ad_copy}
        initialCta={draft.cta}
        initialImage={draft.preview_image}
        logoUrl={brand?.logo_url}
        brandColors={brand?.brand_colors}
        screenshots={brand?.image_assets}
        onClose={() => setShowCanvasEditor(false)}
        onSave={async (designData) => {
          setDraft(prev => ({
            ...prev,
            headline: designData.headline,
            ad_copy: designData.ad_copy,
            cta: designData.cta,
            preview_image: designData.preview_image,
          }));
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl shadow-black/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-6 pt-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-900 text-[15px] tracking-tight">Edit Asset</h2>
              <p className="text-[11px] text-gray-400 capitalize font-medium">{asset.platform} · {asset.asset_type}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 h-[32px] px-4 rounded-[9px] bg-gradient-to-b from-violet-500 to-violet-600 text-white text-[12px] font-semibold transition-all disabled:opacity-60 shadow-sm shadow-violet-200/40 active:scale-[0.97]"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Save
              </button>
              <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          {/* Tab bar */}
          <div className="flex items-center">
            <div className="flex items-center gap-1">
              <span className="px-3 py-2 text-[12px] font-semibold text-violet-600 border-b-2 border-violet-600">
                Edit Copy
              </span>
            </div>
            <button
              onClick={() => setShowCanvasEditor(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-gray-400 hover:text-violet-600 ml-auto transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              Design Canvas
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Image section */}
          <div>
            <SectionLabel>Visual</SectionLabel>
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-50 mb-3 border border-gray-100">
              {regeneratingImage ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
                  <div className="w-8 h-8 rounded-full border-2 border-violet-200 border-t-violet-500 animate-spin" />
                  <p className="text-[11px] text-gray-400 font-medium">Generating new image…</p>
                </div>
              ) : draft.preview_image ? (
                <img src={draft.preview_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-[12px]">No image</div>
              )}
            </div>

            <label className="block mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-1.5 block">Image Prompt</span>
              <textarea
                className={inputCls + ' resize-none text-[12px]'}
                rows={3}
                value={draft.visual_prompt || ''}
                onChange={e => updateField('visual_prompt', e.target.value)}
                placeholder="Describe the image you want to generate…"
              />
            </label>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={regenerateImage}
                disabled={regeneratingImage}
                className="flex items-center gap-1.5 h-[30px] px-3 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${regeneratingImage ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <label className="flex items-center gap-1.5 h-[30px] px-3 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition-all">
                {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                Replace
                <input type="file" accept="image/*" className="hidden" onChange={uploadImage} disabled={uploadingImage} />
              </label>
            </div>
          </div>

          {/* Copy section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Copy</SectionLabel>
              <button
                onClick={regenerateText}
                disabled={regeneratingText}
                className="flex items-center gap-1.5 h-[26px] px-3 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 text-[11px] font-semibold transition-colors disabled:opacity-50"
              >
                {regeneratingText ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Regenerate All
              </button>
            </div>

            <TextField
              label="Headline"
              value={draft.headline || ''}
              onChange={v => updateField('headline', v)}
              onImprove={IMPROVE_ACTIONS}
              improving={improvingField === 'headline'}
              onImproveAction={(action) => improveField('headline', action.instruction)}
            />
            <TextField
              label="Ad Copy"
              value={draft.ad_copy || ''}
              onChange={v => updateField('ad_copy', v)}
              multiline
              onImprove={IMPROVE_ACTIONS}
              improving={improvingField === 'ad_copy'}
              onImproveAction={(action) => improveField('ad_copy', action.instruction)}
            />
            <TextField
              label="Full Caption"
              value={draft.full_caption || ''}
              onChange={v => updateField('full_caption', v)}
              multiline
              rows={5}
              onImprove={IMPROVE_ACTIONS}
              improving={improvingField === 'full_caption'}
              onImproveAction={(action) => improveField('full_caption', action.instruction)}
            />
            <TextField
              label="Call to Action"
              value={draft.cta || ''}
              onChange={v => updateField('cta', v)}
              placeholder="e.g. Try for Free, Learn More"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SectionLabel({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">{children}</p>;
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[13px] text-gray-900 placeholder-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all';

function TextField({ label, value, onChange, multiline, rows = 3, placeholder, onImprove, improving, onImproveAction }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12px] font-medium text-gray-600">{label}</label>
        {onImprove && (
          <div className="relative">
            <button
              onClick={() => setShowActions(prev => !prev)}
              disabled={improving}
              className="flex items-center gap-1 text-[11px] text-violet-500 hover:text-violet-700 font-semibold disabled:opacity-50 transition-colors"
            >
              {improving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              Improve <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-6 z-20 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-100/50 p-1 min-w-[140px]">
                {onImprove.map(action => (
                  <button
                    key={action.label}
                    onClick={() => { onImproveAction(action); setShowActions(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-gray-600 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition-colors font-medium"
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {multiline ? (
        <textarea
          className={`${inputCls} resize-none`}
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={inputCls}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
