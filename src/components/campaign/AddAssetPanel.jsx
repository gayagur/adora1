import React, { useState } from 'react';
import { X, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ASSET_OPTIONS = [
  { platform: 'instagram', asset_type: 'post', label: 'Instagram Post', sub: '1:1', format: '1:1' },
  { platform: 'instagram', asset_type: 'story', label: 'Story', sub: '9:16', format: '9:16' },
  { platform: 'instagram', asset_type: 'carousel', label: 'Carousel', sub: '1:1 multi', format: '1:1' },
  { platform: 'facebook', asset_type: 'post', label: 'Facebook Post', sub: '16:9', format: '16:9' },
  { platform: 'facebook', asset_type: 'ad', label: 'Facebook Ad', sub: '1:1', format: '1:1' },
  { platform: 'linkedin', asset_type: 'post', label: 'LinkedIn Post', sub: '1:1', format: '1:1' },
  { platform: 'linkedin', asset_type: 'banner', label: 'LinkedIn Banner', sub: '4:1', format: '4:1' },
  { platform: 'tiktok', asset_type: 'video_concept', label: 'TikTok', sub: '9:16', format: '9:16' },
  { platform: 'twitter', asset_type: 'post', label: 'X Post', sub: '16:9', format: '16:9' },
  { platform: 'general', asset_type: 'banner', label: 'Display Banner', sub: '16:9', format: '16:9' },
];

const STYLES = [
  { id: 'realistic', label: 'Realistic', sub: 'Photography, lifestyle, people' },
  { id: 'graphic', label: 'Graphic / 3D', sub: 'Illustration, abstract, UI' },
];

const INTENTS = [
  { id: 'auto', label: 'Auto', sub: 'Let AI decide the best direction' },
  { id: 'product', label: 'Product', sub: 'Focus on the product or service' },
  { id: 'lifestyle', label: 'Lifestyle', sub: 'People, scenes, emotion' },
  { id: 'editorial', label: 'Editorial', sub: 'Typography-driven, bold' },
  { id: 'abstract', label: 'Abstract', sub: 'Conceptual, metaphorical' },
];

const TONES = [
  { id: 'brand', label: 'Brand Colors' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export default function AddAssetPanel({ onAdd, onClose }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [style, setStyle] = useState(null);
  const [intent, setIntent] = useState(null);
  const [tone, setTone] = useState('brand');
  const [postContent, setPostContent] = useState('');

  const back = () => setStep(s => s - 1);

  const confirm = () => {
    onAdd({
      ...selected,
      visual_style: style?.id || 'realistic',
      background: 'rich',
      background_tone: tone,
      creative_intent: intent?.id || 'auto',
      post_content: postContent.trim() || null,
    });
    onClose();
  };

  const titles = {
    1: 'Choose format',
    2: 'Visual style',
    3: 'Creative direction',
    4: 'Post content',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 340 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/10 flex flex-col"
        style={{ maxHeight: '75vh' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
          <div>
            {step > 1 && <button onClick={back} className="text-[10px] text-[#6c5ce7] font-semibold mb-0.5">← Back</button>}
            <h3 className="text-[14px] font-semibold text-gray-900 tracking-tight">{titles[step]}</h3>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex gap-0.5">
              {[1,2,3,4].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all ${i <= step ? 'w-4 bg-[#6c5ce7]' : 'w-1.5 bg-gray-200'}`} />
              ))}
            </div>
            <button onClick={onClose} className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Step 1: Format */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-1.5">
              {ASSET_OPTIONS.map(opt => (
                <button key={`${opt.platform}-${opt.asset_type}`}
                  onClick={() => { setSelected(opt); setStep(2); }}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-100 hover:border-[#6c5ce7]/30 hover:bg-[#6c5ce7]/[0.02] text-left transition-all group">
                  <span className="text-[10px] font-bold text-gray-300 group-hover:text-[#6c5ce7] uppercase tracking-wider shrink-0">{opt.sub}</span>
                  <span className="text-[12px] font-medium text-gray-700 group-hover:text-gray-900">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Style */}
        {step === 2 && (
          <div className="flex-1 p-5 flex flex-col gap-2 justify-center">
            {STYLES.map(s => (
              <button key={s.id} onClick={() => { setStyle(s); setStep(3); }}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#6c5ce7]/30 hover:bg-[#6c5ce7]/[0.02] text-left transition-all group">
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">{s.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-[#6c5ce7] transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Intent + Tone */}
        {step === 3 && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">Direction</p>
              <div className="space-y-1">
                {INTENTS.map(i => (
                  <button key={i.id} onClick={() => setIntent(i)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      intent?.id === i.id ? 'border-[#6c5ce7]/30 bg-[#6c5ce7]/[0.04]' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    <div>
                      <p className="text-[12px] font-medium text-gray-800">{i.label}</p>
                      <p className="text-[10px] text-gray-400">{i.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">Tone</p>
              <div className="flex gap-1.5">
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setTone(t.id)}
                    className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      tone === t.id ? 'bg-[#6c5ce7]/10 text-[#6c5ce7] border border-[#6c5ce7]/20' : 'bg-gray-50 text-gray-500 border border-transparent'
                    }`}>{t.label}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(4)}
              className="w-full h-10 rounded-xl bg-[#6c5ce7] hover:bg-[#5f4dd6] text-white text-[12px] font-semibold transition-colors mt-2">
              Continue
            </button>
          </div>
        )}

        {/* Step 4: Post content */}
        {step === 4 && (
          <div className="flex-1 p-5 flex flex-col gap-3">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#6c5ce7]/[0.04] border border-[#6c5ce7]/10">
              <FileText className="w-3.5 h-3.5 text-[#6c5ce7] mt-0.5 shrink-0" />
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Paste your caption or idea. The AI will translate the meaning into a visual — not just illustrate keywords.
              </p>
            </div>
            <textarea
              className="flex-1 w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-[12px] text-gray-800 placeholder-gray-300 outline-none focus:border-[#6c5ce7]/40 resize-none transition-colors"
              rows={5} placeholder="Example: Our AI tool helps designers create room concepts in minutes, not hours."
              value={postContent} onChange={e => setPostContent(e.target.value)} autoFocus />
            <button onClick={confirm}
              className="w-full h-10 rounded-xl bg-[#6c5ce7] hover:bg-[#5f4dd6] text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              {postContent.trim() ? 'Generate from post' : 'Generate'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
