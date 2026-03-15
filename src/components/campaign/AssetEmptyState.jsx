import React from 'react';
import { Plus } from 'lucide-react';

const PLATFORM_EMPTIES = {
  instagram: { icon: '📸', title: 'No Instagram posts yet', sub: 'Create your first feed post for this campaign' },
  facebook:  { icon: '📘', title: 'No Facebook posts yet', sub: 'Add a Facebook creative for this campaign' },
  linkedin:  { icon: '💼', title: 'No LinkedIn content yet', sub: 'Build professional content for this campaign' },
  tiktok:    { icon: '🎵', title: 'No TikTok concepts yet', sub: 'Generate a short-form video concept' },
  youtube:   { icon: '▶️', title: 'No YouTube assets yet', sub: 'Create a banner or video brief' },
  twitter:   { icon: '🐦', title: 'No X posts yet', sub: 'Write a tweet for this campaign' },
  general:   { icon: '🖼', title: 'No display assets yet', sub: 'Generate a banner ad' },
};

export default function AssetEmptyState({ platform, onAdd }) {
  const info = PLATFORM_EMPTIES[platform] || PLATFORM_EMPTIES.general;
  return (
    <button
      onClick={onAdd}
      className="group col-span-full flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50/30 transition-all"
    >
      <span className="text-3xl mb-3">{info.icon}</span>
      <p className="text-sm font-medium text-gray-500 group-hover:text-violet-700 transition-colors">{info.title}</p>
      <p className="text-xs text-gray-400 mt-1">{info.sub}</p>
      <div className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 group-hover:bg-violet-100 text-xs font-medium text-gray-500 group-hover:text-violet-700 transition-all">
        <Plus className="w-3.5 h-3.5" /> Add asset
      </div>
    </button>
  );
}