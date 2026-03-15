import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ANGLES = ['Product Launch','Problem/Solution','Social Proof','Feature Highlight','Brand Awareness','Educational','Emotional Story','Limited Offer'];

export default function CampaignEditPanel({ campaign, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...campaign });
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setDraft(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.AdCampaign.update(campaign.id, draft);
    toast.success('Campaign updated');
    onSave({ ...campaign, ...draft });
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
          <h2 className="font-semibold text-gray-900">Edit Campaign</h2>
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

        <div className="p-6 space-y-4">
          <Field label="Campaign Title">
            <input className={inputCls} value={draft.title || ''} onChange={e => update('title', e.target.value)} />
          </Field>

          <Field label="Strategy Angle">
            <select className={inputCls} value={draft.strategy_angle || ''} onChange={e => update('strategy_angle', e.target.value)}>
              {ANGLES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>

          <Field label="Key Message">
            <textarea className={`${inputCls} resize-none`} rows={2} value={draft.key_message || ''} onChange={e => update('key_message', e.target.value)} />
          </Field>

          <Field label="Target Audience">
            <input className={inputCls} value={draft.target_audience || ''} onChange={e => update('target_audience', e.target.value)} />
          </Field>

          <Field label="Tone of Voice">
            <input className={inputCls} value={draft.tone || ''} onChange={e => update('tone', e.target.value)} placeholder="e.g. Bold and urgent" />
          </Field>

          <Field label="Visual Direction">
            <textarea className={`${inputCls} resize-none`} rows={2} value={draft.visual_direction || ''} onChange={e => update('visual_direction', e.target.value)} />
          </Field>

          <Field label="Summary">
            <textarea className={`${inputCls} resize-none`} rows={3} value={draft.summary || ''} onChange={e => update('summary', e.target.value)} />
          </Field>
        </div>
      </motion.div>
    </motion.div>
  );
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}