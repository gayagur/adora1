import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'playful', label: 'Playful' },
  { value: 'bold', label: 'Bold' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'minimal', label: 'Minimal' },
];

const platforms = [
  { value: 'all', label: 'All Platforms' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
];

export default function GeneratorControls({ tone, platform, onToneChange, onPlatformChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="min-w-[160px]">
        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Tone</label>
        <Select value={tone} onValueChange={onToneChange}>
          <SelectTrigger className="h-10 rounded-xl border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tones.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[160px]">
        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Platform</label>
        <Select value={platform} onValueChange={onPlatformChange}>
          <SelectTrigger className="h-10 rounded-xl border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {platforms.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}