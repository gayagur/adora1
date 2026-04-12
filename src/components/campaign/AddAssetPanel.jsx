import React, { useState } from 'react';
import { X, Plus, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ASSET_OPTIONS = [
  { platform: 'instagram', asset_type: 'post', label: 'Instagram Post', icon: '📸', sub: '1:1 feed', format: '1:1' },
  { platform: 'instagram', asset_type: 'story', label: 'Instagram Story', icon: '📱', sub: '9:16 full-screen', format: '9:16' },
  { platform: 'instagram', asset_type: 'reel', label: 'Reel Concept', icon: '🎬', sub: 'Short-form video', format: '9:16' },
  { platform: 'instagram', asset_type: 'carousel', label: 'Carousel Post', icon: '🎠', sub: 'Multi-slide', format: '1:1' },
  { platform: 'facebook', asset_type: 'post', label: 'Facebook Post', icon: '📘', sub: 'Feed post', format: '16:9' },
  { platform: 'facebook', asset_type: 'ad', label: 'Facebook Ad', icon: '🎯', sub: 'Paid creative', format: '1:1' },
  { platform: 'linkedin', asset_type: 'post', label: 'LinkedIn Post', icon: '💼', sub: 'Professional', format: '1:1' },
  { platform: 'linkedin', asset_type: 'banner', label: 'LinkedIn Banner', icon: '🏷', sub: 'Header image', format: '4:1' },
  { platform: 'tiktok', asset_type: 'video_concept', label: 'TikTok Concept', icon: '🎵', sub: 'Video script', format: '9:16' },
  { platform: 'youtube', asset_type: 'banner', label: 'YouTube Banner', icon: '▶️', sub: 'Channel art', format: '16:9' },
  { platform: 'twitter', asset_type: 'post', label: 'X / Twitter Post', icon: '🐦', sub: 'Short text + visual', format: '16:9' },
  { platform: 'general', asset_type: 'banner', label: 'Display Banner', icon: '🖼', sub: 'Web banner', format: '16:9' },
];

const VISUAL_STYLES = [
  {
    id: 'realistic',
    label: 'Realistic',
    sub: 'Photography, lifestyle, interiors, people',
    icon: '📷',
  },
  {
    id: 'graphic',
    label: 'Graphic / 3D',
    sub: 'UI illustrations, abstract, 3D objects',
    icon: '🎨',
  },
];

const BACKGROUND_OPTIONS = [
  {
    id: 'rich',
    label: 'Full Background',
    sub: 'Scene, environment, or rich backdrop fills the frame',
    icon: '🖼',
  },
  {
    id: 'minimal',
    label: 'Minimal Background',
    sub: 'Clean, simple, or soft neutral background',
    icon: '⬜',
  },
  {
    id: 'none',
    label: 'No Background',
    sub: 'Subject isolated on white or transparent background',
    icon: '✂️',
  },
];

export default function AddAssetPanel({ onAdd, onClose }) {
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [selectedStyle, setSelectedStyle] = React.useState(null);
  const [selectedBackground, setSelectedBackground] = React.useState(null);
  const [postContent, setPostContent] = React.useState('');

  const handleSelectAsset = (opt) => {
    setSelectedOption(opt);
  };

  const handleSelectStyle = (style) => {
    setSelectedStyle(style);
  };

  const handleSelectBackground = (bg) => {
    setSelectedBackground(bg);
  };

  const handleConfirm = () => {
    onAdd({ ...selectedOption, visual_style: selectedStyle.id, background: selectedBackground?.id || 'rich', post_content: postContent.trim() || null });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 340 }}
        className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: 'min(80vh, 600px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            {selectedBackground ? (
              <>
                <button onClick={() => setSelectedBackground(null)} className="text-xs text-violet-500 hover:text-violet-700 font-medium mb-0.5">← Back</button>
                <h3 className="font-semibold text-gray-900">Add a Post or Idea</h3>
                <p className="text-xs text-gray-400 mt-0.5">Optional — helps the AI match your message</p>
              </>
            ) : selectedStyle ? (
              <>
                <button onClick={() => setSelectedStyle(null)} className="text-xs text-violet-500 hover:text-violet-700 font-medium mb-0.5">← Back</button>
                <h3 className="font-semibold text-gray-900">Background Style</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedOption?.label}</p>
              </>
            ) : selectedOption ? (
              <>
                <button onClick={() => setSelectedOption(null)} className="text-xs text-violet-500 hover:text-violet-700 font-medium mb-0.5">← Back</button>
                <h3 className="font-semibold text-gray-900">Choose Visual Style</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedOption.label}</p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900">Add Content</h3>
                <p className="text-xs text-gray-400 mt-0.5">Choose a platform and content type</p>
              </>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {selectedBackground ? (
          <div className="flex-1 p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-50 border border-violet-100">
              <FileText className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
              <p className="text-xs text-violet-700 leading-relaxed">Paste your caption, blog post, or idea below. The AI will match the visual to your message.</p>
            </div>
            <textarea
              className="flex-1 w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none transition-all"
              rows={6}
              placeholder="Paste your caption, idea, or message here..."
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              autoFocus
            />
            <button
              onClick={handleConfirm}
              className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
            >
              {postContent.trim() ? 'Generate from Post' : 'Generate without Post'}
            </button>
          </div>
        ) : selectedStyle ? (
          <div className="flex-1 p-5 flex flex-col gap-3 justify-center">
            {BACKGROUND_OPTIONS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => handleSelectBackground(bg)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-violet-50 hover:border-violet-200 border border-transparent text-left transition-all group"
              >
                <span className="text-3xl shrink-0">{bg.icon}</span>
                <div>
                  <p className="text-base font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">{bg.label}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{bg.sub}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 p-5 flex flex-col gap-3 justify-center">
            {VISUAL_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => handleSelectStyle(style)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-violet-50 hover:border-violet-200 border border-transparent text-left transition-all group"
              >
                <span className="text-3xl shrink-0">{style.icon}</span>
                <div>
                  <p className="text-base font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">{style.label}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{style.sub}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}