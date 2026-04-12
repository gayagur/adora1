import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ArrowRight, Plus, X, Upload, Loader2, Check, Instagram, Linkedin, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingStepBrand({ brandData, onUpdate, onBack, onConfirm }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newColor, setNewColor] = useState('#6366f1');

  const update = (key, value) => onUpdate({ ...brandData, [key]: value });

  const addColor = () => {
    if (!brandData.brand_colors?.includes(newColor)) {
      onUpdate({ ...brandData, brand_colors: [...(brandData.brand_colors || []), newColor] });
    }
  };
  const removeColor = (c) => onUpdate({ ...brandData, brand_colors: brandData.brand_colors.filter(x => x !== c) });
  const changeColor = (old, nw) => onUpdate({ ...brandData, brand_colors: brandData.brand_colors.map(c => c === old ? nw : c) });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f })));
      onUpdate({ ...brandData, image_assets: [...(brandData.image_assets || []), ...results.map(r => r.file_url)] });
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} added`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleConfirm = async () => {
    setSaving(true);
    await onConfirm(brandData);
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">Review brand profile</h1>
        <p className="text-gray-500 text-sm">We analyzed <span className="font-medium text-gray-700">{brandData.url}</span>. Adjust anything before generating campaigns.</p>
      </div>

      <div className="space-y-4">
        {/* Brand name + industry */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Brand Name">
            <input className={inputCls} value={brandData.brand_name || ''} onChange={e => update('brand_name', e.target.value)} placeholder="Acme Corp" />
          </Field>
          <Field label="Industry">
            <input className={inputCls} value={brandData.industry || ''} onChange={e => update('industry', e.target.value)} placeholder="SaaS, Fintech..." />
          </Field>
        </div>

        {/* Description */}
        <Field label="Product / Service Description">
          <textarea className={`${inputCls} resize-none`} rows={3} value={brandData.description || ''} onChange={e => update('description', e.target.value)} placeholder="What does your product do?" />
        </Field>

        {/* Audience + Tone */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Target Audience">
            <input className={inputCls} value={brandData.target_audience || ''} onChange={e => update('target_audience', e.target.value)} placeholder="e.g. SaaS founders" />
          </Field>
          <Field label="Tone of Voice">
            <input className={inputCls} value={brandData.tone_of_voice || ''} onChange={e => update('tone_of_voice', e.target.value)} placeholder="e.g. Professional, bold" />
          </Field>
        </div>

        {/* Key messages */}
        <Field label="Key Messages">
          <div className="space-y-2">
            {(brandData.key_messages || []).map((msg, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  className={`${inputCls} flex-1`}
                  value={msg}
                  onChange={e => {
                    const msgs = [...brandData.key_messages];
                    msgs[i] = e.target.value;
                    update('key_messages', msgs);
                  }}
                />
                <button onClick={() => update('key_messages', brandData.key_messages.filter((_, j) => j !== i))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => update('key_messages', [...(brandData.key_messages || []), ''])}
              className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium mt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add message
            </button>
          </div>
        </Field>

        {/* Brand Colors */}
        <Field label="Brand Colors">
          <div className="flex flex-wrap gap-2 mb-3">
            {(brandData.brand_colors || []).map(color => (
              <ColorChip key={color} color={color} onRemove={() => removeColor(color)} onChange={nc => changeColor(color, nc)} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer"
              onClick={() => document.getElementById('new-cp')?.click()}>
              <div className="w-5 h-5 rounded" style={{ backgroundColor: newColor }} />
              <span className="text-xs font-mono text-gray-500">{newColor}</span>
              <input id="new-cp" type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <button onClick={addColor} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </Field>

        {/* Brand Logo */}
        <Field label="Brand Logo" hint="Displayed on generated ad creatives">
          <div className="flex items-start gap-4">
            {brandData.logo_url ? (
              <div className="relative group w-20 h-20 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden shrink-0"
                   style={{ backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px', backgroundColor: '#f9fafb' }}>
                 <img src={brandData.logo_url} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                <button
                  onClick={() => update('logo_url', null)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                <span className="text-[11px] text-gray-400 text-center px-1">No logo</span>
              </div>
            )}
            <div className="flex-1 space-y-2">
              <label className="relative flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors text-xs font-medium text-gray-600">
                <Upload className="w-3.5 h-3.5" /> Upload logo
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const { file_url } = await base44.integrations.Core.UploadFile({ file });
                  update('logo_url', file_url);
                  e.target.value = '';
                }} />
              </label>
              <p className="text-xs text-gray-400">PNG with transparency works best. The logo will be overlaid on generated ads.</p>
            </div>
          </div>
        </Field>

        {/* Social Reference */}
        <Field label="Social Style Reference" hint="Optional — helps AI match your visual identity">
          <p className="text-xs text-gray-400 mb-3">Paste links to your social pages. The AI will analyze your visual style to generate more consistent creatives.</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
              <input className={inputCls} value={brandData.social_instagram || ''} onChange={e => update('social_instagram', e.target.value)} placeholder="https://instagram.com/yourbrand" />
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400 shrink-0" />
              <input className={inputCls} value={brandData.social_facebook || ''} onChange={e => update('social_facebook', e.target.value)} placeholder="https://facebook.com/yourbrand" />
            </div>
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-600 shrink-0" />
              <input className={inputCls} value={brandData.social_linkedin || ''} onChange={e => update('social_linkedin', e.target.value)} placeholder="https://linkedin.com/company/yourbrand" />
            </div>
          </div>
        </Field>

        {/* Image Upload */}
        <Field label="Brand Images" hint="Optional — used as visual references when generating ads">
          {(brandData.image_assets || []).length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {brandData.image_assets.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => onUpdate({ ...brandData, image_assets: brandData.image_assets.filter((_, j) => j !== i) })}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${uploading ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/30'}`}>
            {uploading ? <Loader2 className="w-5 h-5 text-violet-500 animate-spin shrink-0" /> : <Upload className="w-5 h-5 text-gray-400 shrink-0" />}
            <div>
              <p className="text-sm font-medium text-gray-700">{uploading ? 'Uploading...' : 'Upload product images'}</p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP — optional</p>
            </div>
            <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </Field>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={saving}
          className="flex items-center gap-2 h-11 px-7 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-medium text-sm transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Generate Campaign Themes</>}
        </button>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";

function Field({ label, hint, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-baseline gap-2 mb-3">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ColorChip({ color, onRemove, onChange }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
      <div className="relative w-5 h-5 rounded cursor-pointer" style={{ backgroundColor: color }}
        onClick={() => document.getElementById(`cp-${color}`)?.click()}>
        <input id={`cp-${color}`} type="color" value={color} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
      </div>
      <span className="text-xs font-mono text-gray-500">{color}</span>
      <button onClick={onRemove} className="text-gray-400 hover:text-gray-600 ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}