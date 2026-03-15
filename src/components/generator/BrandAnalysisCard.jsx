import React from 'react';
import { Globe, Palette, Users, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BrandAnalysisCard({ campaign }) {
  if (!campaign) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Globe className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{campaign.brand_name || 'Brand Analysis'}</h3>
          <p className="text-sm text-slate-500 truncate max-w-xs">{campaign.url}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Colors */}
        {campaign.brand_colors?.length > 0 && (
          <div className="flex items-start gap-3">
            <Palette className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Brand Colors</p>
              <div className="flex gap-2 flex-wrap">
                {campaign.brand_colors.map((color, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: color }} />
                    <span className="text-xs text-slate-500 font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Target Audience */}
        {campaign.target_audience && (
          <div className="flex items-start gap-3">
            <Users className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Target Audience</p>
              <p className="text-sm text-slate-700">{campaign.target_audience}</p>
            </div>
          </div>
        )}

        {/* Tone */}
        {campaign.tone_of_voice && (
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Tone of Voice</p>
              <p className="text-sm text-slate-700">{campaign.tone_of_voice}</p>
            </div>
          </div>
        )}

        {/* Description */}
        {campaign.description && (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Product Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{campaign.description}</p>
          </div>
        )}

        {/* Key Messages */}
        {campaign.key_messages?.length > 0 && (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Key Messages</p>
            <div className="flex flex-wrap gap-2">
              {campaign.key_messages.map((msg, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-600">{msg}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}