import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';

export default function CampaignHeader({ campaign, brandName, assetCount, onEdit, onEditBrand }) {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="max-w-[1200px] mx-auto px-5 py-4">
        <Link to="/Dashboard" className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 mb-3 transition-colors font-medium">
          <ArrowLeft className="w-3 h-3" /> Campaigns
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6c5ce7]/70">{campaign.strategy_angle}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
              <span className="text-[10px] text-gray-400">{assetCount} asset{assetCount !== 1 ? 's' : ''}</span>
            </div>
            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">{campaign.title}</h1>
            {brandName && <p className="text-[12px] text-gray-400 mt-0.5">{brandName}</p>}
          </div>
          <div className="flex gap-1.5 shrink-0">
            {onEditBrand && (
              <button onClick={onEditBrand} className="flex items-center gap-1 h-[28px] px-2.5 rounded-md border border-gray-200 text-[11px] font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                <Pencil className="w-3 h-3" /> Brand
              </button>
            )}
            {onEdit && (
              <button onClick={onEdit} className="flex items-center gap-1 h-[28px] px-2.5 rounded-md border border-gray-200 text-[11px] font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                <Pencil className="w-3 h-3" /> Campaign
              </button>
            )}
          </div>
        </div>

        {/* Meta tiles — compact row */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
          {campaign.key_message && <MetaItem label="Message" value={campaign.key_message} />}
          {campaign.target_audience && <MetaItem label="Audience" value={campaign.target_audience} />}
          {campaign.tone && <MetaItem label="Tone" value={campaign.tone} />}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-300 mb-0.5">{label}</p>
      <p className="text-[11px] text-gray-500 line-clamp-1">{value}</p>
    </div>
  );
}
