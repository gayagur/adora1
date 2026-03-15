import React from 'react';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ANGLE_COLORS = {
  'Product Launch':   'bg-violet-50 text-violet-700 border-violet-200',
  'Problem/Solution': 'bg-rose-50 text-rose-700 border-rose-200',
  'Social Proof':     'bg-amber-50 text-amber-700 border-amber-200',
  'Feature Highlight':'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Brand Awareness':  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Educational':      'bg-blue-50 text-blue-700 border-blue-200',
  'Emotional Story':  'bg-purple-50 text-purple-700 border-purple-200',
  'Limited Offer':    'bg-orange-50 text-orange-700 border-orange-200',
};

const ANGLE_DOTS = {
  'Product Launch':   'bg-violet-500',
  'Problem/Solution': 'bg-rose-500',
  'Social Proof':     'bg-amber-500',
  'Feature Highlight':'bg-cyan-500',
  'Brand Awareness':  'bg-emerald-500',
  'Educational':      'bg-blue-500',
  'Emotional Story':  'bg-purple-500',
  'Limited Offer':    'bg-orange-500',
};

export default function OnboardingStepThemes({ themes, generating, brandName, onOpen }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          {generating ? 'Generating campaign themes…' : 'Campaign themes ready'}
        </h1>
        <p className="text-gray-500 text-sm">
          {generating
            ? `Creating strategic campaign directions for ${brandName || 'your brand'}…`
            : `${themes.length} campaign${themes.length !== 1 ? 's' : ''} generated for ${brandName || 'your brand'}. Open one to start building assets.`}
        </p>
      </div>

      {generating && themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full bg-violet-100 animate-ping opacity-40" />
            <div className="relative w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-violet-600 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-1.5">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <p className="text-sm text-gray-400">Crafting strategic campaign angles…</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {themes.map((theme, i) => (
            <motion.div
              key={theme.id || i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-violet-200 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => onOpen(theme.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${ANGLE_COLORS[theme.strategy_angle] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${ANGLE_DOTS[theme.strategy_angle] || 'bg-gray-400'}`} />
                    {theme.strategy_angle}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-violet-50 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-[15px] mb-1.5 leading-snug">{theme.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{theme.summary}</p>

              {/* Meta */}
              <div className="space-y-1.5">
                {theme.key_message && (
                  <MetaRow label="Key message" value={theme.key_message} />
                )}
                {theme.suggested_channels?.length > 0 && (
                  <MetaRow label="Channels" value={theme.suggested_channels.join(', ')} />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-gray-400 shrink-0 w-20">{label}</span>
      <span className="text-gray-600 line-clamp-1">{value}</span>
    </div>
  );
}