import React, { useState } from 'react';
import { X, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ASSET_OPTIONS = [
  { platform: 'instagram', asset_type: 'post', label: 'Instagram Post', sub: '1:1 feed', format: '1:1' },
  { platform: 'instagram', asset_type: 'story', label: 'Instagram Story', sub: '9:16 full-screen', format: '9:16' },
  { platform: 'instagram', asset_type: 'reel', label: 'Reel Concept', sub: 'Short-form video', format: '9:16' },
  { platform: 'instagram', asset_type: 'carousel', label: 'Carousel Post', sub: 'Multi-slide', format: '1:1' },
  { platform: 'facebook', asset_type: 'post', label: 'Facebook Post', sub: 'Feed post', format: '16:9' },
  { platform: 'facebook', asset_type: 'ad', label: 'Facebook Ad', sub: 'Paid creative', format: '1:1' },
  { platform: 'linkedin', asset_type: 'post', label: 'LinkedIn Post', sub: 'Professional', format: '1:1' },
  { platform: 'linkedin', asset_type: 'banner', label: 'LinkedIn Banner', sub: 'Header image', format: '4:1' },
  { platform: 'tiktok', asset_type: 'video_concept', label: 'TikTok Concept', sub: 'Video script', format: '9:16' },
  { platform: 'youtube', asset_type: 'banner', label: 'YouTube Banner', sub: 'Channel art', format: '16:9' },
  { platform: 'twitter', asset_type: 'post', label: 'X / Twitter Post', sub: 'Short text + visual', format: '16:9' },
  { platform: 'general', asset_type: 'banner', label: 'Display Banner', sub: 'Web banner', format: '16:9' },
];

const VISUAL_STYLES = [
  { id: 'realistic', label: 'Realistic', sub: 'Photography, lifestyle, people, product shots', color: 'from-amber-50 to-orange-50 border-amber-100' },
  { id: 'graphic', label: 'Graphic / 3D', sub: 'Illustrations, abstract, 3D objects, UI mockups', color: 'from-violet-50 to-indigo-50 border-violet-100' },
];

const BACKGROUND_OPTIONS = [
  { id: 'rich', label: 'Full Background', sub: 'Scene or environment fills the frame', color: 'from-emerald-50 to-teal-50 border-emerald-100' },
  { id: 'minimal', label: 'Minimal', sub: 'Clean, simple, or soft neutral background', color: 'from-gray-50 to-slate-50 border-gray-200' },
  { id: 'none', label: 'Isolated', sub: 'Subject on white or transparent background', color: 'from-white to-gray-50 border-gray-200' },
];

const TONE_OPTIONS = [
  { id: 'light', label: 'Light', sub: 'White, cream, or soft pastel tones', color: 'from-white to-amber-50/30 border-gray-200' },
  { id: 'dark', label: 'Dark', sub: 'Deep, dramatic, moody backgrounds', color: 'from-gray-900 to-gray-800 border-gray-700 text-white' },
  { id: 'brand', label: 'Brand Colors', sub: "Use the brand's own palette", color: 'from-violet-50 to-indigo-50 border-violet-200' },
];

const CREATIVE_INTENTS = [
  { id: 'auto', label: 'Auto — Let AI decide', sub: 'Best creative direction based on your brand and content' },
  { id: 'product', label: 'Product-focused', sub: 'Showcase the product, feature, or service' },
  { id: 'lifestyle', label: 'Lifestyle / Emotional', sub: 'People, scenes, and emotional moments' },
  { id: 'editorial', label: 'Editorial / Typography', sub: 'Bold text-driven, poster-style creative' },
  { id: 'data', label: 'Stats / Social proof', sub: 'Metrics, numbers, testimonials' },
  { id: 'abstract', label: 'Abstract / Conceptual', sub: 'Metaphorical, artistic, brand-world imagery' },
];

export default function AddAssetPanel({ onAdd, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [postContent, setPostContent] = useState('');

  const handleSelectAsset = (opt) => { setSelectedOption(opt); setStep(2); };
  const handleSelectStyle = (style) => { setSelectedStyle(style); setStep(3); };
  const handleSelectBackground = (bg) => { setSelectedBackground(bg); setStep(4); };
  const handleSelectTone = (tone) => { setSelectedTone(tone); setStep(5); };
  const handleSelectIntent = (intent) => { setSelectedIntent(intent); setStep(6); };

  const handleBack = () => setStep(s => s - 1);

  const handleConfirm = () => {
    onAdd({
      ...selectedOption,
      visual_style: selectedStyle?.id || 'realistic',
      background: selectedBackground?.id || 'rich',
      background_tone: selectedTone?.id || 'brand',
      creative_intent: selectedIntent?.id || 'auto',
      post_content: postContent.trim() || null,
    });
    onClose();
  };

  const stepConfig = {
    1: { title: 'Choose format', sub: 'Select platform and content type' },
    2: { title: 'Visual style', sub: selectedOption?.label },
    3: { title: 'Background', sub: 'How should the background look?' },
    4: { title: 'Tone', sub: 'Light, dark, or brand colors?' },
    5: { title: 'Creative direction', sub: 'What should the visual focus on?' },
    6: { title: 'Post content', sub: 'Optional — tell the AI what this post is about' },
  };

  const totalSteps = 6;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 340 }}
        className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl shadow-black/10 flex flex-col"
        style={{ maxHeight: 'min(82vh, 660px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex-1">
            {step > 1 && (
              <button onClick={handleBack} className="text-[11px] text-violet-500 hover:text-violet-700 font-semibold mb-0.5 transition-colors">← Back</button>
            )}
            <h3 className="font-semibold text-gray-900 text-[15px] tracking-tight">{stepConfig[step].title}</h3>
            {stepConfig[step].sub && <p className="text-[11px] text-gray-400 mt-0.5">{stepConfig[step].sub}</p>}
          </div>
          <div className="flex items-center gap-3">
            {/* Step indicator */}
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i < step ? 'w-4 bg-violet-500' : 'w-1.5 bg-gray-200'}`} />
              ))}
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Step 1: Asset type */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2">
              {ASSET_OPTIONS.map((opt) => (
                <button
                  key={`${opt.platform}-${opt.asset_type}`}
                  onClick={() => handleSelectAsset(opt)}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-white hover:bg-violet-50/50 border border-gray-100 hover:border-violet-200 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-violet-100/50 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-violet-600 uppercase tracking-wider transition-colors">{opt.format}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">{opt.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Visual style */}
        {step === 2 && (
          <div className="flex-1 p-5 flex flex-col gap-2.5 justify-center">
            {VISUAL_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => handleSelectStyle(style)}
                className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br ${style.color} border text-left transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
                  <span className="text-2xl">{style.id === 'realistic' ? '📷' : '🎨'}</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-gray-900">{style.label}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{style.sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Background */}
        {step === 3 && (
          <div className="flex-1 p-5 flex flex-col gap-2.5 justify-center">
            {BACKGROUND_OPTIONS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => handleSelectBackground(bg)}
                className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br ${bg.color} border text-left transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
                  <span className="text-2xl">{bg.id === 'rich' ? '🌄' : bg.id === 'minimal' ? '◻️' : '✂️'}</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-gray-900">{bg.label}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{bg.sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Tone */}
        {step === 4 && (
          <div className="flex-1 p-5 flex flex-col gap-2.5 justify-center">
            {TONE_OPTIONS.map((tone) => (
              <button
                key={tone.id}
                onClick={() => handleSelectTone(tone)}
                className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br ${tone.color} border text-left transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tone.id === 'dark' ? 'bg-white/10' : 'bg-white/60'}`}>
                  <span className="text-2xl">{tone.id === 'light' ? '☀️' : tone.id === 'dark' ? '🌙' : '🎨'}</span>
                </div>
                <div>
                  <p className={`text-[15px] font-semibold ${tone.id === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tone.label}</p>
                  <p className={`text-[12px] mt-0.5 ${tone.id === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>{tone.sub}</p>
                </div>
                <ArrowRight className={`w-4 h-4 ml-auto transition-colors ${tone.id === 'dark' ? 'text-white/30 group-hover:text-white/60' : 'text-gray-300 group-hover:text-gray-500'}`} />
              </button>
            ))}
          </div>
        )}

        {/* Step 5: Creative Intent */}
        {step === 5 && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2">
              {CREATIVE_INTENTS.map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => handleSelectIntent(intent)}
                  className={`flex flex-col p-4 rounded-xl border text-left transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group ${
                    intent.id === 'auto'
                      ? 'col-span-2 bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100'
                      : 'bg-white border-gray-100 hover:border-violet-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {intent.id === 'auto' && <Sparkles className="w-3.5 h-3.5 text-violet-500" />}
                    <p className="text-[13px] font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">{intent.label}</p>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{intent.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Post content */}
        {step === 6 && (
          <div className="flex-1 p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100">
              <FileText className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] text-violet-700 font-medium leading-relaxed">Paste your caption, blog post, or idea below.</p>
                <p className="text-[11px] text-violet-500/70 mt-0.5">The AI will analyze the meaning and create a visual that matches your message — not just illustrate keywords.</p>
              </div>
            </div>
            <textarea
              className="flex-1 w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[13px] text-gray-900 placeholder-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none transition-all"
              rows={6}
              placeholder="Example: Our new AI-powered design tool helps interior designers create stunning room concepts in minutes, not hours. Try it free today."
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              autoFocus
            />
            <button
              onClick={handleConfirm}
              className="w-full h-11 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white text-[13px] font-semibold transition-all shadow-sm shadow-violet-200/50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {postContent.trim() ? 'Generate from Post' : 'Generate Asset'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
