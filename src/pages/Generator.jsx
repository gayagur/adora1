import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import GeneratorControls from '../components/generator/GeneratorControls';
import LoadingState from '../components/generator/LoadingState';
import BrandAnalysisCard from '../components/generator/BrandAnalysisCard';
import AdCard from '../components/generator/AdCard';

const AD_STYLES = ['modern startup', 'emotional storytelling', 'problem-solution', 'bold disruptive', 'minimal premium'];

export default function Generator() {
  const [url, setUrl] = useState('');
  const [tone, setTone] = useState('professional');
  const [platform, setPlatform] = useState('all');
  const [status, setStatus] = useState('idle'); // idle | analyzing | generating | completed | error
  const [campaign, setCampaign] = useState(null);
  const [ads, setAds] = useState([]);

  const analyzeAndGenerate = async () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    setStatus('analyzing');
    setAds([]);
    setCampaign(null);

    // Step 1: Analyze the website
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this website URL and extract brand information. URL: ${cleanUrl}

Extract the following:
- brand_name: The name of the brand/company
- brand_colors: Array of 2-4 hex color codes that represent the brand (based on common brand colors or what you know about the brand)
- description: A concise description of the product/service (2-3 sentences)
- target_audience: Who is the target audience
- tone_of_voice: The brand's communication style
- key_messages: Array of 3-5 key marketing messages or value propositions

Be specific and actionable. If you can identify the brand, use your knowledge about it.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          brand_name: { type: "string" },
          brand_colors: { type: "array", items: { type: "string" } },
          description: { type: "string" },
          target_audience: { type: "string" },
          tone_of_voice: { type: "string" },
          key_messages: { type: "array", items: { type: "string" } }
        }
      }
    });

    const brandData = {
      url: cleanUrl,
      ...analysisResult,
      status: 'generating',
      selected_tone: tone,
      selected_platform: platform
    };

    setCampaign(brandData);
    setStatus('generating');

    // Step 2: Generate ads
    const adResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a world-class marketing creative director. Generate 5 advertisement variations for this brand.

Brand Information:
- Name: ${brandData.brand_name}
- Description: ${brandData.description}
- Target Audience: ${brandData.target_audience}
- Tone of Voice: ${brandData.tone_of_voice}
- Key Messages: ${brandData.key_messages?.join(', ')}
- Brand Colors: ${brandData.brand_colors?.join(', ')}
- Requested Tone: ${tone}
- Target Platform: ${platform === 'all' ? 'All platforms' : platform}

Generate 5 ads with these styles: ${AD_STYLES.join(', ')}

For EACH ad provide:
1. style: one of the styles listed above
2. headline: A punchy, attention-grabbing headline (max 10 words)
3. ad_description: Short ad description for ad platforms (1-2 sentences)
4. caption: A complete social media post caption including:
   - Engaging opening hook
   - Product/service explanation
   - Value proposition
   - Call to action
   - 3-5 relevant hashtags
5. platform: best suited platform (instagram, facebook, linkedin, tiktok, youtube)
6. format: image aspect ratio (1:1, 9:16, or 16:9)
7. image_prompt: A detailed prompt to generate a marketing visual for this ad. The visual should be modern, clean, and professional. Describe the visual composition, colors, elements, and style. Do NOT include any text in the image.

Make each ad unique and compelling. The captions should feel natural and optimized for social media.`,
      response_json_schema: {
        type: "object",
        properties: {
          ads: {
            type: "array",
            items: {
              type: "object",
              properties: {
                style: { type: "string" },
                headline: { type: "string" },
                ad_description: { type: "string" },
                caption: { type: "string" },
                platform: { type: "string" },
                format: { type: "string" },
                image_prompt: { type: "string" }
              }
            }
          }
        }
      }
    });

    const generatedAds = adResult.ads || [];
    setAds(generatedAds);

    // Step 3: Generate images for each ad (in parallel)
    const imagePromises = generatedAds.map(async (ad, i) => {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Professional marketing advertisement visual. ${ad.image_prompt}. Brand colors: ${brandData.brand_colors?.join(', ')}. Style: clean, modern, minimalist marketing design similar to Stripe or Apple ads. No text overlays. High quality.`
      });
      return { ...ad, image_url: result.url };
    });

    const adsWithImages = await Promise.all(imagePromises);
    setAds(adsWithImages);

    // Save campaign
    const savedCampaign = await base44.entities.Campaign.create({
      ...brandData,
      ads: adsWithImages.map(({ image_prompt, ...rest }) => rest),
      status: 'completed'
    });

    setCampaign({ ...brandData, id: savedCampaign.id, ads: adsWithImages, status: 'completed' });
    setStatus('completed');
    toast.success('Ads generated successfully!');
  };

  const regenerateAd = async (index) => {
    if (!campaign) return;
    const ad = ads[index];
    toast.info('Regenerating ad...');

    const adResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a world-class marketing creative director. Generate a SINGLE new advertisement variation.

Brand: ${campaign.brand_name}
Description: ${campaign.description}
Target Audience: ${campaign.target_audience}
Style to use: ${ad.style}
Tone: ${tone}
Platform: ${ad.platform}
Format: ${ad.format}

Create a completely NEW and DIFFERENT ad from this previous one:
Previous headline: ${ad.headline}

Provide: style, headline, ad_description, caption (with hook, explanation, value prop, CTA, hashtags), platform, format, image_prompt (detailed visual description, no text).`,
      response_json_schema: {
        type: "object",
        properties: {
          style: { type: "string" },
          headline: { type: "string" },
          ad_description: { type: "string" },
          caption: { type: "string" },
          platform: { type: "string" },
          format: { type: "string" },
          image_prompt: { type: "string" }
        }
      }
    });

    const imageResult = await base44.integrations.Core.GenerateImage({
      prompt: `Professional marketing advertisement visual. ${adResult.image_prompt}. Brand colors: ${campaign.brand_colors?.join(', ')}. Style: clean, modern, minimalist. No text. High quality.`
    });

    const newAd = { ...adResult, image_url: imageResult.url };
    const newAds = [...ads];
    newAds[index] = newAd;
    setAds(newAds);

    if (campaign.id) {
      await base44.entities.Campaign.update(campaign.id, {
        ads: newAds.map(({ image_prompt, ...rest }) => rest)
      });
    }

    toast.success('Ad regenerated!');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Generate Ads
            </h1>
            <p className="mt-3 text-slate-500">
              Paste a URL and get publish-ready ads in seconds
            </p>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200 text-base"
                    disabled={status === 'analyzing' || status === 'generating'}
                    onKeyDown={(e) => e.key === 'Enter' && analyzeAndGenerate()}
                  />
                </div>
                <Button
                  onClick={analyzeAndGenerate}
                  disabled={status === 'analyzing' || status === 'generating'}
                  className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 gap-2 shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300"
                >
                  {(status === 'analyzing' || status === 'generating') ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Generate
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-4">
                <GeneratorControls
                  tone={tone}
                  platform={platform}
                  onToneChange={setTone}
                  onPlatformChange={setPlatform}
                />
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {(status === 'analyzing' || status === 'generating') && ads.length === 0 && (
            <LoadingState status={status} />
          )}

          {/* Brand Analysis */}
          {campaign && status !== 'analyzing' && (
            <div className="mb-8">
              <BrandAnalysisCard campaign={campaign} />
            </div>
          )}

          {/* Ads Grid */}
          {ads.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Generated Ads
                  <span className="text-slate-400 font-normal text-base ml-2">({ads.length})</span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad, i) => (
                  <AdCard
                    key={i}
                    ad={ad}
                    index={i}
                    onRegenerate={regenerateAd}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}