import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, X, Upload, Loader2, ImageIcon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import GeneratorControls from './GeneratorControls';

function ColorSwatch({ color, onRemove, onChange }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
      <div className="relative">
        <div
          className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer shadow-sm"
          style={{ backgroundColor: color }}
          onClick={() => document.getElementById(`color-pick-${color}`)?.click()}
        />
        <input
          id={`color-pick-${color}`}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </div>
      <span className="text-xs font-mono text-slate-600">{color}</span>
      <button onClick={onRemove} className="text-slate-400 hover:text-slate-600 ml-1">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function BrandSetupForm({ brandData, onUpdate, onGenerate, tone, platform, onToneChange, onPlatformChange }) {
  const [newColor, setNewColor] = useState('#6366f1');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userImages, setUserImages] = useState([]);
  const [generating, setGenerating] = useState(false);

  const addColor = () => {
    if (!brandData.brand_colors?.includes(newColor)) {
      onUpdate({ ...brandData, brand_colors: [...(brandData.brand_colors || []), newColor] });
    }
  };

  const removeColor = (color) => {
    onUpdate({ ...brandData, brand_colors: brandData.brand_colors.filter(c => c !== color) });
  };

  const changeColor = (oldColor, newColor) => {
    onUpdate({
      ...brandData,
      brand_colors: brandData.brand_colors.map(c => c === oldColor ? newColor : c)
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);
    try {
      const uploaded = await Promise.all(
        files.map(file => base44.integrations.Core.UploadFile({ file }))
      );
      const newUrls = uploaded.map(r => r.file_url);
      setUserImages(prev => [...prev, ...newUrls]);
      onUpdate({ ...brandData, user_images: [...(brandData.user_images || []), ...newUrls] });
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeImage = (url) => {
    const updated = (brandData.user_images || []).filter(u => u !== url);
    setUserImages(updated);
    onUpdate({ ...brandData, user_images: updated });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await onGenerate();
    setGenerating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Brand Name & Description */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
          Brand Info
        </h3>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Brand Name</Label>
          <Input
            value={brandData.brand_name || ''}
            onChange={e => onUpdate({ ...brandData, brand_name: e.target.value })}
            placeholder="e.g. Acme Inc."
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Product / Service Description</Label>
          <Textarea
            value={brandData.description || ''}
            onChange={e => onUpdate({ ...brandData, description: e.target.value })}
            placeholder="What does your product or service do?"
            className="rounded-xl border-slate-200 resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Target Audience</Label>
            <Input
              value={brandData.target_audience || ''}
              onChange={e => onUpdate({ ...brandData, target_audience: e.target.value })}
              placeholder="e.g. Startup founders"
              className="rounded-xl border-slate-200"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Tone of Voice</Label>
            <Input
              value={brandData.tone_of_voice || ''}
              onChange={e => onUpdate({ ...brandData, tone_of_voice: e.target.value })}
              placeholder="e.g. Professional, bold"
              className="rounded-xl border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</span>
          Brand Colors
          <span className="text-xs font-normal text-slate-400 ml-1">optional override</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {(brandData.brand_colors || []).map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              onRemove={() => removeColor(color)}
              onChange={(nc) => changeColor(color, nc)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <div
              className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer"
              style={{ backgroundColor: newColor }}
              onClick={() => document.getElementById('new-color-picker')?.click()}
            />
            <input
              id="new-color-picker"
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-600">{newColor}</span>
          </div>
          <Button variant="outline" size="sm" onClick={addColor} className="gap-1.5 rounded-xl">
            <Plus className="w-3.5 h-3.5" />
            Add Color
          </Button>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
          Your Images
          <span className="text-xs font-normal text-slate-400 ml-1">optional — used as visual references</span>
        </h3>

        {/* Uploaded images grid */}
        {(brandData.user_images || []).length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {(brandData.user_images || []).map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(url)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          uploadingImage ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
        }`}>
          {uploadingImage ? (
            <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
          ) : (
            <Upload className="w-7 h-7 text-slate-400" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              {uploadingImage ? 'Uploading...' : 'Upload product images or screenshots'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP — up to 10 files</p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
        </label>
      </div>

      {/* Platform & Tone */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">4</span>
          Ad Settings
        </h3>
        <GeneratorControls
          tone={tone}
          platform={platform}
          onToneChange={onToneChange}
          onPlatformChange={onPlatformChange}
        />
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full h-14 text-base rounded-xl bg-indigo-600 hover:bg-indigo-500 gap-2 shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating your ads...
          </>
        ) : (
          <>
            Generate My Ads
            <span className="text-indigo-300">→</span>
          </>
        )}
      </Button>
    </motion.div>
  );
}