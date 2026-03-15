import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '../components/layout/Navbar';
import BrandAnalysisCard from '../components/generator/BrandAnalysisCard';
import AdCard from '../components/generator/AdCard';

export default function CampaignDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => base44.entities.Campaign.list().then(list => list.find(c => c.id === id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-slate-500">Campaign not found</p>
          <Link to="/Campaigns">
            <Button variant="outline" className="mt-4">Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/Campaigns" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            {campaign.brand_name || 'Campaign'}
          </h1>
          <p className="text-slate-500 mb-8">{campaign.url}</p>

          <div className="mb-8">
            <BrandAnalysisCard campaign={campaign} />
          </div>

          {campaign.ads?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Ads <span className="text-slate-400 font-normal text-base ml-1">({campaign.ads.length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaign.ads.map((ad, i) => (
                  <AdCard key={i} ad={ad} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}