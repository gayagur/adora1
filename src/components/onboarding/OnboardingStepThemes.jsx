import React from 'react';
import { ArrowRight, Sparkles, Loader2, Rocket, AlertCircle, Star, Zap, Megaphone, Heart, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const ANGLE_META = {
  'Product Launch':   { icon: Rocket,       desc: 'Introduce your product to the market with excitement and clear value.' },
  'Problem/Solution': { icon: AlertCircle,  desc: 'Lead with the pain point your audience faces, then position your product as the answer.' },
  'Social Proof':     { icon: Star,         desc: 'Let your customers do the talking. Highlight reviews, case studies, and success stories.' },
  'Feature Highlight':{ icon: Zap,          desc: 'Showcase a specific capability that differentiates you from the competition.' },
  'Brand Awareness':  { icon: Megaphone,    desc: 'Build recognition and trust by communicating your brand story and mission.' },
  'Educational':      { icon: BookOpen,     desc: 'Provide genuine value through insights and teach your audience something useful.' },
  'Emotional Story':  { icon: Heart,        desc: 'Connect on a human level through storytelling, transformation, and emotion.' },
  'Limited Offer':    { icon: Clock,        desc: 'Create urgency with a time-sensitive offer or exclusive deal that drives action.' },
};

export default function OnboardingStepThemes({ themes, generating, brandName, onOpen }) {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          {generating ? 'Building campaign strategies…' : 'Campaign strategies'}
        </h1>
        <p className="text-gray-400 text-sm">
          {generating
            ? `Crafting strategic directions for ${brandName || 'your brand'}…`
            : `${themes.length} strategies generated for ${brandName || 'your brand'}. Select one to start building assets.`}
        </p>
      </div>

      {generating && themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full bg-violet-100 animate-ping opacity-30" />
            <div className="relative w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-1">Generating strategic angles…</p>
            <p className="text-xs text-gray-400">This takes about 15 seconds</p>
          </div>
          <div className="flex gap-1">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme, i) => {
            const meta = ANGLE_META[theme.strategy_angle] || { icon: Sparkles, desc: theme.summary };
            const IconComp = meta.icon;
            return (
              <motion.div
                key={theme.id || i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-pointer flex flex-col"
                onClick={() => onOpen(theme.id)}
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-violet-50 flex items-center justify-center mb-5 transition-colors">
                  <IconComp className="w-4.5 h-4.5 text-gray-400 group-hover:text-violet-600 transition-colors" style={{ width: 18, height: 18 }} />
                </div>

                {/* Angle label */}
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">{theme.strategy_angle}</p>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2">{theme.title}</h3>

                {/* Strategy desc */}
                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{meta.desc}</p>

                {/* Summary from AI */}
                {theme.summary && (
                  <p className="text-xs text-gray-400 leading-relaxed mb-5 line-clamp-2 border-l-2 border-gray-100 pl-3">{theme.summary}</p>
                )}

                {/* Meta pills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {theme.suggested_channels?.slice(0, 3).map(ch => (
                    <span key={ch} className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] text-gray-500 font-medium">{ch}</span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">{theme.tone}</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 group-hover:text-violet-600 transition-colors">
                    Open Campaign <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}