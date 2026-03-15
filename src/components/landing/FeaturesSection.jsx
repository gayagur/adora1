import React from 'react';
import { Globe, Palette, Layers, Copy, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Globe,
    title: 'Smart Website Analysis',
    description: 'AI extracts brand identity, colors, imagery, and messaging from any URL automatically.'
  },
  {
    icon: Palette,
    title: 'Brand-Matched Creatives',
    description: 'Visuals generated using your actual brand colors, style, and tone of voice.'
  },
  {
    icon: Layers,
    title: 'Multi-Platform Formats',
    description: 'Square, vertical, and horizontal formats for Instagram, TikTok, YouTube, and more.'
  },
  {
    icon: Copy,
    title: 'Ready-to-Post Captions',
    description: 'Complete social media captions with hooks, CTAs, and hashtags — just copy and paste.'
  },
  {
    icon: Download,
    title: 'Instant Downloads',
    description: 'Download all visuals and export your complete marketing pack in one click.'
  },
  {
    icon: RefreshCw,
    title: 'Unlimited Variations',
    description: 'Regenerate ads with different styles, tones, and creative approaches.'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Everything you need to create ads
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            From analysis to publish-ready creatives — all automated.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                <feature.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}