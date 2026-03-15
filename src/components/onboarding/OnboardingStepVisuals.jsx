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
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a web content analyst. Given this brand/website, generate 8 realistic mock screenshot descriptions that represent key visual sections of the website.

Brand: ${brandData.brand_name}
URL: ${brandData.url}
Industry: ${brandData.industry}
Description: ${brandData.description}
Brand Colors: ${brandData.brand_colors?.join(', ')}

For each section, provide:
- section: one of "Hero", "Product", "Features", "Social Proof", "Pricing", "About", "CTA", "General"
- description: brief description of what this screenshot shows
- visual_prompt: a detailed AI image generation prompt to recreate this section as a marketing visual. No text. Use brand colors. Clean, modern UI screenshot style.

Generate exactly 8 items covering different parts of the website.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  section: { type: 'string' },
                  description: { type: 'string' },
                  visual_prompt: { type: 'string' }
                }
              }
            }
          }
        }
      });

      // Generate images for first 4 (to keep it fast), rest are placeholders
      const items = (result.items || []).slice(0, 8);
      const withPlaceholders = items.map((item, i) => ({ ...item, id: i, image_url: null, generating: i < 4 }));
      setScreenshots(withPlaceholders);

      // Select all by default
      setSelected(new Set(withPlaceholders.map(s => s.id)));

      // Generate images for first 4 in parallel
      const first4 = withPlaceholders.slice(0, 4);
      Promise.all(
        first4.map(async (item) => {
          const res = await base44.integrations.Core.GenerateImage({
            prompt: `${item.visual_prompt}. Modern clean UI screenshot, ${brandData.brand_colors?.join(', ')} color scheme. No text.`
          });
          return { id: item.id, url: res.url };
        })
      ).then(results => {
        setScreenshots(prev => prev.map(s => {
          const found = results.find(r => r.id === s.id);
          return found ? { ...s, image_url: found.url, generating: false } : s;
        }));
      });

      // Generate rest 4 after
      Promise.all(
        withPlaceholders.slice(4).map(async (item) => {
          const res = await base44.integrations.Core.GenerateImage({
            prompt: `${item.visual_prompt}. Modern clean UI screenshot, ${brandData.brand_colors?.join(', ')} color scheme. No text.`
          });
          return { id: item.id, url: res.url };
        })
      ).then(results => {
        setScreenshots(prev => prev.map(s => {
          const found = results.find(r => r.id === s.id);
          return found ? { ...s, image_url: found.url, generating: false } : s;
        }));
      });

    } catch {
      toast.error('Could not generate screenshots');
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