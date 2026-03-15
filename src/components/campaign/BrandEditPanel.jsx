import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, Save, Instagram, Linkedin, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BrandEditPanel({ brand, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...brand });
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setDraft(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Brand.update(brand.id, {
      social_instagram: draft.social_instagram,
      social_facebook: draft.social_facebook,
      social_linkedin: draft.social_linkedin,
    });
    toast.success('Brand updated');
    onSave({ ...brand, ...draft });
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Edit Brand</h2>
            <p className="text-xs text-gray-400">{brand.brand_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-xs text-gray-400 mb-4">
            Paste links to your social pages. The AI will analyze your visual style to generate more consistent creatives.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Instagram</label>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <input
                  className={inputCls}
                  value={draft.social_instagram || ''}
                  onChange={e => update('social_instagram', e.target.value)}
                  placeholder="https://instagram.com/yourbrand"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Facebook</label>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <input
                  className={inputCls}
                  value={draft.social_facebook || ''}
                  onChange={e => update('social_facebook', e.target.value)}
                  placeholder="https://facebook.com/yourbrand"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">LinkedIn</label>
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-600 shrink-0" />
                <input
                  className={inputCls}
                  value={draft.social_linkedin || ''}
                  onChange={e => update('social_linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourbrand"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const inputCls = 'flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all';