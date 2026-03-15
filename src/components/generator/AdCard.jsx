import React, { useState } from 'react';
import { Copy, Download, RefreshCw, ChevronDown, ChevronUp, Check, Instagram, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const platformIcons = {
  instagram: '📸',
  facebook: '📘',
  linkedin: '💼',
  tiktok: '🎵',
  youtube: '▶️',
};

const styleColors = {
  'modern startup': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'emotional storytelling': 'bg-rose-50 text-rose-700 border-rose-200',
  'problem-solution': 'bg-amber-50 text-amber-700 border-amber-200',
  'bold disruptive': 'bg-orange-50 text-orange-700 border-orange-200',
  'minimal premium': 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function AdCard({ ad, index, onRegenerate }) {
  const [showCaption, setShowCaption] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCaption = () => {
    navigator.clipboard.writeText(ad.caption);
    setCopied(true);
    toast.success('Caption copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async () => {
    if (!ad.image_url) return;
    try {
      const response = await fetch(ad.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ad-${ad.style?.replace(/\s/g, '-')}-${ad.format || 'square'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Image downloaded');
    } catch {
      toast.error('Failed to download image');
    }
  };

  const formatLabel = {
    '1:1': 'Square · Feed',
    '9:16': 'Vertical · Stories',
    '16:9': 'Horizontal · YouTube',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300"
    >
      {/* Image Preview */}
      <div className="relative bg-slate-50">
        {ad.image_url ? (
          <img
            src={ad.image_url}
            alt={ad.headline}
            className="w-full aspect-square object-cover"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50">
            <MonitorPlay className="w-12 h-12 text-indigo-300" />
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {ad.platform && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs shadow-sm">
              {platformIcons[ad.platform] || '📱'} {ad.platform}
            </Badge>
          )}
          {ad.format && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs shadow-sm">
              {formatLabel[ad.format] || ad.format}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Style badge */}
        {ad.style && (
          <Badge variant="outline" className={`text-xs mb-3 ${styleColors[ad.style] || 'bg-slate-50 text-slate-600'}`}>
            {ad.style}
          </Badge>
        )}

        {/* Headline */}
        <h3 className="font-semibold text-slate-900 text-lg leading-tight mb-2">
          {ad.headline}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed mb-4">
          {ad.ad_description}
        </p>

        {/* Caption toggle */}
        <button
          onClick={() => setShowCaption(!showCaption)}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors mb-4"
        >
          {showCaption ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showCaption ? 'Hide caption' : 'View full caption'}
        </button>

        {showCaption && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
          >
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ad.caption}</p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyCaption}
            className="flex-1 gap-2 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </Button>
          {ad.image_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadImage}
              className="flex-1 gap-2 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          )}
          {onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRegenerate(index)}
              className="gap-2 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}