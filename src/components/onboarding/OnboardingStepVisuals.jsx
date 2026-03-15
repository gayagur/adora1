import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ArrowRight, Loader2, Upload, Check, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const SECTION_LABELS = ['Hero', 'Product', 'Features', 'Social Proof', 'Pricing', 'About', 'CTA', 'General'];

export default function OnboardingStepVisuals({ brandData, onBack, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [screenshots, setScreenshots] = useState(null); // null = not loaded yet
  const [selected, setSelected] = useState(new Set());
  const [uploading, setUploading] = useState(false);
  const [extraImages, setExtraImages] = useState([]);

  const fetchScreenshots = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('captureScreenshots', { url: brandData.url });
      const items = (response.data.screenshots || []).map((s, i) => ({ ...s, id: i }));
      setScreenshots(items);
      // Pre-select all that succeeded
      setSelected(new Set(items.filter(s => s.image_url).map(s => s.id)));
    } catch {
      toast.error('Could not capture screenshots');
      setScreenshots([]);
    }
    setLoading(false);
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const results = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f })));
    const urls = results.map(r => r.file_url);
    setExtraImages(prev => [...prev, ...urls]);
    toast.success(`${files.length} image${files.length > 1 ? 's' : ''} added`);
    setUploading(false);
    e.target.value = '';
  };

  const handleConfirm = () => {
    const selectedScreenshots = (screenshots || [])
      .filter(s => selected.has(s.id) && s.image_url)
      .map(s => s.image_url);
    onConfirm([...selectedScreenshots, ...extraImages]);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">Select visual references</h1>
        <p className="text-gray-500 text-sm">
          Choose screenshots and images to use as visual references when generating campaign assets.
        </p>
      </div>

      {screenshots === null ? (
        <div className="flex flex-col items-center justify-center py-16 gap-5 bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-violet-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800 mb-1">Generate website visuals</p>
            <p className="text-sm text-gray-400 max-w-xs">We'll create visual references from {brandData.brand_name}'s website sections</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchScreenshots}
              disabled={loading}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Generating…' : 'Generate Visuals'}
            </button>
            <button onClick={() => onConfirm([])} className="h-10 px-5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              Skip this step
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {screenshots.map((shot) => (
              <motion.button
                key={shot.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => toggleSelect(shot.id)}
                className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${selected.has(shot.id) ? 'border-violet-500 shadow-md' : 'border-transparent opacity-60'}`}
              >
                {shot.generating || !shot.image_url ? (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                  </div>
                ) : (
                  <img src={shot.image_url} alt={shot.section} className="w-full h-full object-cover" />
                )}
                {/* Section label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-[11px] font-medium text-white">{shot.section}</p>
                </div>
                {/* Check */}
                {selected.has(shot.id) && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Uploaded extras */}
          {extraImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              {extraImages.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-square border-2 border-violet-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setExtraImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload */}
          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50/20 cursor-pointer transition-colors mb-6">
            {uploading ? <Loader2 className="w-4 h-4 text-violet-400 animate-spin" /> : <Upload className="w-4 h-4 text-gray-400" />}
            <span className="text-sm text-gray-500">{uploading ? 'Uploading…' : 'Upload your own images'}</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>

          <p className="text-xs text-gray-400 mb-6">{selected.size} screenshot{selected.size !== 1 ? 's' : ''} selected · {extraImages.length} uploaded</p>
        </>
      )}

      {screenshots !== null && (
        <div className="flex items-center justify-between mt-2">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-3">
            <button onClick={() => onConfirm([])} className="h-10 px-5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              Skip
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}