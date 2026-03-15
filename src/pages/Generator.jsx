import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Globe, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import StepIndicator from '../components/generator/StepIndicator';
import BrandSetupForm from '../components/generator/BrandSetupForm';
import LoadingState from '../components/generator/LoadingState';
import BrandAnalysisCard from '../components/generator/BrandAnalysisCard';
import AdCard from '../components/generator/AdCard';

const AD_STYLES = ['modern startup', 'emotional storytelling', 'problem-solution', 'bold disruptive', 'minimal premium'];

export default function Generator() {
  const [step, setStep] = useState(0); // 0: URL, 1: Brand Setup, 2: Results
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [brandData, setBrandData] = useState(null);
  const [tone, setTone] = useState('professional');
  const [platform, setPlatform] = useState('all');
  const [ads, setAds] = useState([]);
  const [savedCampaignId, setSavedCampaignId] = useState(null);

  // Step 0 → 1: Analyze website
  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL');
      return;
    }
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;

    setAnalyzing(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this website URL and extract brand information. URL: ${cleanUrl}

Extract:
- brand_name: brand/company name
- brand_colors: Array of 2-4 hex color codes representing the brand
- description: concise product/service description (2-3 sentences)
- target_audience: who is the target audience
- tone_of_voice: brand communication style
- key_messages: array of 3-5 key marketing messages or value propositions

Be specific. Use your knowledge about well-known brands if you recognize them.`,
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

    setBrandData({ url: cleanUrl, ...result, user_images: [] });
    setAnalyzing(false);
    setStep(1);
  };

  // Step 1 → 2: Generate ads
  const handleGenerate = async () => {
    setGenerating(true);
    setStep(2);
    setAds([]);

    const imageContext = brandData.user_images?.length > 0
      ? `\nThe user has provided ${brandData.user_images.length} reference image(s) of their product/brand. Use them as visual inspiration for the ads.`
      : '';

    // Generate ad copy
    const adResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a world-class marketing creative director. Generate 5 advertisement variations.

Brand:
- Name: ${brandData.brand_name}
- Description: ${brandData.description}
- Target Audience: ${brandData.target_audience}
- Tone of Voice: ${brandData.tone_of_voice}
- Key Messages: ${brandData.key_messages?.join(', ')}
- Brand Colors: ${brandData.brand_colors?.join(', ')}
- Requested Tone: ${tone}
- Target Platform: ${platform === 'all' ? 'All platforms' : platform}
${imageContext}

Generate 5 ads, one for each style: ${AD_STYLES.join(', ')}

For EACH ad:
1. style: one of the styles above
2. headline: punchy headline, max 10 words
3. ad_description: 1-2 sentence ad description
4. caption: complete social media post with hook, explanation, value prop, CTA, 3-5 hashtags
5. platform: best suited platform (instagram, facebook, linkedin, tiktok, youtube)
6. format: 1:1, 9:16, or 16:9
7. image_prompt: detailed visual prompt for AI image generation — modern, clean, professional marketing visual. No text in image. ${
  brandData.user_images?.length > 0
    ? 'Incorporate the visual style and product elements from the brand reference images provided.'
    : ''
}`,
      file_urls: brandData.user_images?.length > 0 ? brandData.user_images : undefined,
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

    // Generate images in parallel
    const imagePromises = generatedAds.map(async (ad) => {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Professional marketing advertisement visual. ${ad.image_prompt}. Brand colors: ${brandData.brand_colors?.join(', ')}. Style: clean, modern, minimalist marketing design similar to Stripe or Apple ads. No text overlays. High quality.`,
        existing_image_urls: brandData.user_images?.length > 0 ? brandData.user_images.slice(0, 2) : undefined
      });
      return { ...ad, image_url: result.url };
    });

    const adsWithImages = await Promise.all(imagePromises);
    setAds(adsWithImages);

    const saved = await base44.entities.Campaign.create({
      ...brandData,
      ads: adsWithImages.map(({ image_prompt, ...rest }) => rest),
      status: 'completed',
      selected_tone: tone,
      selected_platform: platform
    });
    setSavedCampaignId(saved.id);
    setGenerating(false);
    toast.success('Ads ready!');
  };

  const regenerateAd = async (index) => {
    const ad = ads[index];
    toast.info('Regenerating...');

    const adResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a NEW and DIFFERENT single ad for:
Brand: ${brandData.brand_name}
Description: ${brandData.description}
Style: ${ad.style}
Tone: ${tone}
Platform: ${ad.platform}

Previous headline (make something different): ${ad.headline}

Return: style, headline, ad_description, caption (hook + explanation + value prop + CTA + hashtags), platform, format, image_prompt.`,
      response_json_schema: {
        type: "object",
        properties: {
          style: { type: "string" }, headline: { type: "string" },
          ad_description: { type: "string" }, caption: { type: "string" },
          platform: { type: "string" }, format: { type: "string" },
          image_prompt: { type: "string" }
        }
      }
    });

    const imageResult = await base44.integrations.Core.GenerateImage({
      prompt: `Professional marketing ad visual. ${adResult.image_prompt}. Brand colors: ${brandData.brand_colors?.join(', ')}. Clean, modern, no text. High quality.`,
      existing_image_urls: brandData.user_images?.length > 0 ? brandData.user_images.slice(0, 2) : undefined
    });

    const newAds = [...ads];
    newAds[index] = { ...adResult, image_url: imageResult.url };
    setAds(newAds);

    if (savedCampaignId) {
      await base44.entities.Campaign.update(savedCampaignId, {
        ads: newAds.map(({ image_prompt, ...rest }) => rest)
      });
    }
    toast.success('Ad regenerated!');
  };

  const startOver = () => {
    setStep(0);
    setUrl('');
    setBrandData(null);
    setAds([]);
    setSavedCampaignId(null);
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Generate Ads</h1>
            <p className="mt-3 text-slate-500">Paste a URL, customize your brand, and get publish-ready ads</p>
          </motion.div>

          <StepIndicator currentStep={step} />

          <AnimatePresence mode="wait">

            {/* STEP 0: URL Input */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-xl mx-auto"
              >
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
                    <Globe className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Enter your website</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    We'll analyze your brand automatically — you can review and edit everything before generating.
                  </p>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-slate-200 text-base"
                        disabled={analyzing}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                      />
                    </div>
                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 gap-2 shadow-lg shadow-indigo-200"
                    >
                      {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <><span>Analyze</span><ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </div>
                  {analyzing && (
                    <p className="text-xs text-indigo-500 mt-4 flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing website and extracting brand info...
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 1: Brand Setup */}
            {step === 1 && brandData && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    ✅ Brand analyzed — review and customize before generating
                  </p>
                  <button onClick={startOver} className="text-xs text-slate-400 hover:text-slate-600 underline">
                    Start over
                  </button>
                </div>
                <BrandSetupForm
                  brandData={brandData}
                  onUpdate={setBrandData}
                  onGenerate={handleGenerate}
                  tone={tone}
                  platform={platform}
                  onToneChange={setTone}
                  onPlatformChange={setPlatform}
                />
              </motion.div>
            )}

            {/* STEP 2: Results */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Loading */}
                {generating && ads.length === 0 && <LoadingState status="generating" />}

                {/* Partial/Complete results */}
                {ads.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-slate-900">
                        Generated Ads
                        <span className="text-slate-400 font-normal text-base ml-2">({ads.length})</span>
                        {generating && (
                          <span className="ml-3 text-sm font-normal text-indigo-500 inline-flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> generating images...
                          </span>
                        )}
                      </h2>
                      <button onClick={startOver} className="text-sm text-slate-400 hover:text-slate-700 underline transition-colors">
                        New campaign
                      </button>
                    </div>

                    {brandData && <div className="mb-8"><BrandAnalysisCard campaign={brandData} /></div>}

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {ads.map((ad, i) => (
                        <AdCard key={i} ad={ad} index={i} onRegenerate={!generating ? regenerateAd : undefined} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}