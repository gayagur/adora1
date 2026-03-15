import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Globe, Calendar, ImageIcon, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';

export default function Campaigns() {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date', 50),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Campaigns</h1>
            <p className="mt-2 text-slate-500">Your previously generated ad campaigns</p>
          </motion.div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No campaigns yet</h3>
              <p className="text-slate-500 mb-6">Generate your first ads to see them here</p>
              <Link
                to="/Generator"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
              >
                Create Campaign
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/CampaignDetail?id=${c.id}`}>
                    <div className="group rounded-2xl border border-slate-200 bg-white hover:shadow-lg hover:border-slate-300 transition-all duration-300 overflow-hidden">
                      {/* Thumbnail */}
                      <div className="h-40 bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center relative overflow-hidden">
                        {c.ads?.[0]?.image_url ? (
                          <img src={c.ads[0].image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Globe className="w-10 h-10 text-indigo-300" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900 truncate">{c.brand_name || 'Campaign'}</h3>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {c.ads?.length || 0} ads
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 truncate mb-3">{c.url}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {c.created_date ? format(new Date(c.created_date), 'MMM d, yyyy') : '—'}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}