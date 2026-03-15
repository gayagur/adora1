import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Mic2, Eye } from 'lucide-react';

const ANGLE_BADGE = {
  'Product Launch':   'bg-violet-50 text-violet-700',
  'Problem/Solution': 'bg-rose-50 text-rose-700',
  'Social Proof':     'bg-amber-50 text-amber-700',
  'Feature Highlight':'bg-cyan-50 text-cyan-700',
  'Brand Awareness':  'bg-emerald-50 text-emerald-700',
  'Educational':      'bg-blue-50 text-blue-700',
  'Emotional Story':  'bg-purple-50 text-purple-700',
  'Limited Offer':    'bg-orange-50 text-orange-700',
};

export default function CampaignHeader({ campaign, brandName, assetCount }) {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <Link to="/Dashboard" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> All Campaigns
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ANGLE_BADGE[campaign.strategy_angle] || 'bg-gray-50 text-gray-600'}`}>
                {campaign.strategy_angle}
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">{assetCount} asset{assetCount !== 1 ? 's' : ''}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1">{campaign.title}</h1>
            {brandName && <p className="text-sm text-gray-400">{brandName}</p>}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetaTile icon={Target} label="Key Message" value={campaign.key_message} />
          <MetaTile icon={Users} label="Audience" value={campaign.target_audience} />
          <MetaTile icon={Mic2} label="Tone" value={campaign.tone} />
          <MetaTile icon={Eye} label="Visual Direction" value={campaign.visual_direction} />
        </div>
      </div>
    </div>
  );
}

function MetaTile({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="bg-gray-50 rounded-xl p-3.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      </div>
      <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{value}</p>
    </div>
  );
}