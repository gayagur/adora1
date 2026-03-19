import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import AppShell from '../components/ui/AppShell';
import OnboardingStepURL from '../components/onboarding/OnboardingStepURL';
import OnboardingStepBrand from '../components/onboarding/OnboardingStepBrand';
import OnboardingStepVisuals from '../components/onboarding/OnboardingStepVisuals';
import OnboardingStepThemes from '../components/onboarding/OnboardingStepThemes';
import OnboardingStepStrategy from '../components/onboarding/OnboardingStepStrategy';

// Steps: 0=URL, 1=Brand, 2=Visuals, 3=Strategy, 4=Themes
const STEPS = ['Analyze', 'Brand', 'Visuals', 'Strategy', 'Campaigns'];

export default function Onboarding() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initialUrl = urlParams.get('url') || '';

  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingThemes, setGeneratingThemes] = useState(false);

  const [url, setUrl] = useState(initialUrl);
  const [brandData, setBrandData] = useState(null);
  const [brandId, setBrandId] = useState(null);
  const [selectedVisuals, setSelectedVisuals] = useState([]);
  const [strategyData, setStrategyData] = useState(null);
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    if (initialUrl) handleAnalyze(initialUrl);
  }, []);

  const handleAnalyze = async (targetUrl) => {
    const cleanUrl = (targetUrl || url).trim().startsWith('http')
      ? (targetUrl || url).trim()
      : 'https://' + (targetUrl || url).trim();

    setAnalyzing(true);

    // Take a screenshot first so the LLM can visually extract colors
    let screenshotUrl = null;
    try {
      const ssRes = await base44.functions.invoke('captureScreenshots', { url: cleanUrl });
      screenshotUrl = ssRes?.data?.screenshots?.[0]?.image_url || null;
    } catch (e) {
      // screenshot failed — continue without it
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a brand analyst. Analyze this website and extract brand information.
URL: ${cleanUrl}
${screenshotUrl ? '\nA screenshot of the homepage is attached. Use it to accurately identify the brand colors, logo, and visual style.' : ''}

Extract:
- brand_name: company/brand name
- brand_colors: 3-5 EXACT hex color codes that represent the brand's visual identity. Look at: primary buttons, headings, nav bar background, hero section, links, and key accents. Return the actual dominant colors you see, NOT generic guesses. Format: ["#RRGGBB", ...]
- logo_url: the direct URL of the brand logo image (full absolute URL or null)
- description: what the product or service does (2-3 sentences)
- target_audience: precise description of who they serve
- tone_of_voice: communication style (e.g. "Professional and authoritative")
- key_messages: array of 4-5 distinct value propositions or marketing messages
- industry: the industry/vertical (e.g. "SaaS", "E-commerce", "Fintech")`,
      add_context_from_internet: true,
      file_urls: screenshotUrl ? [screenshotUrl] : undefined,
      response_json_schema: {
        type: "object",
        properties: {
          brand_name: { type: "string" },
          brand_colors: { type: "array", items: { type: "string" } },
          logo_url: { type: "string" },
          description: { type: "string" },
          target_audience: { type: "string" },
          tone_of_voice: { type: "string" },
          key_messages: { type: "array", items: { type: "string" } },
          industry: { type: "string" }
        }
      }
    });

    setBrandData({ url: cleanUrl, ...result, image_assets: [] });
    setAnalyzing(false);
    setStep(1);
  };

  const handleBrandConfirm = async (updatedBrand) => {
    setBrandData(updatedBrand);
    setStep(2);
  };

  const handleVisualsConfirm = async (visuals) => {
    setSelectedVisuals(visuals);
    const merged = { ...brandData, image_assets: [...(brandData.image_assets || []), ...visuals] };
    setBrandData(merged);
    const saved = await base44.entities.Brand.create(merged);
    setBrandId(saved.id);
    setStep(3);
  };

  const handleStrategyConfirm = async (strategy) => {
    setStrategyData(strategy);
    setStep(4);
    setGeneratingThemes(true);
    await generateThemes(brandId, brandData, strategy);
  };

  const generateThemes = async (bId, brand, strategy = null) => {
    // If social links provided, analyze visual style first
    let visualStyleNotes = brand.visual_style_notes || '';
    const socialLinks = [brand.social_instagram, brand.social_facebook, brand.social_linkedin].filter(Boolean);
    if (socialLinks.length > 0 && !visualStyleNotes) {
      const styleResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the visual and marketing style of this brand based on their social media presence.

Brand: ${brand.brand_name}
Social pages: ${socialLinks.join(', ')}

Based on these pages, describe:
- color_palette: the dominant colors used
- typography_style: bold/minimal/serif/etc
- layout_style: how they arrange content (centered/split/product-focused/etc)
- visual_tone: dark/light/vibrant/minimal
- content_style: product shots/lifestyle/illustration/screenshot-based
- marketing_tone: the emotional/messaging tone of their ads

Return a concise style guide that can inform ad creative generation.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            color_palette: { type: "string" },
            typography_style: { type: "string" },
            layout_style: { type: "string" },
            visual_tone: { type: "string" },
            content_style: { type: "string" },
            marketing_tone: { type: "string" }
          }
        }
      });
      visualStyleNotes = Object.entries(styleResult).map(([k, v]) => `${k}: ${v}`).join('\n');
      await base44.entities.Brand.update(bId, { visual_style_notes: visualStyleNotes });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a senior marketing strategist. Generate 6 distinct campaign themes for this brand.

Brand: ${brand.brand_name}
Product/Service: ${brand.description}
Audience: ${brand.target_audience}
Tone: ${brand.tone_of_voice}
Key Messages: ${brand.key_messages?.join(', ')}
Industry: ${brand.industry}${visualStyleNotes ? `\n\nBrand Visual Style (from social analysis):\n${visualStyleNotes}\n\nIMPORTANT: Use the visual style notes above to inform the visual_direction field for each campaign theme.` : ''}${strategy?.intent ? `\n\nUser Campaign Intent:\n"${strategy.intent}"` : ''}${strategy?.content ? `\n\nSource Content (use this as the primary basis for messaging):\n${strategy.content.slice(0, 2000)}` : ''}${strategy?.hooks?.length > 0 ? `\n\nPre-generated Hooks to incorporate:\n${strategy.hooks.map(h => `• ${h.text} (${h.style})`).join('\n')}` : ''}${strategy?.strategic_direction ? `\n\nStrategic Direction:\n${strategy.strategic_direction}` : ''}${strategy?.suggested_tone ? `\n\nSuggested Tone: ${strategy.suggested_tone}` : ''}

IMPORTANT: The user has provided specific campaign intent and source content above. ALL 6 campaign themes MUST be deeply rooted in this direction. Do not generate generic themes — each theme should directly reflect the user's stated focus.

Generate 6 strategic campaign themes. Each should be a DIFFERENT angle within the user's stated direction.

For EACH theme return:
- title: short campaign name (3-5 words)
- strategy_angle: one of: "Product Launch" | "Problem/Solution" | "Social Proof" | "Feature Highlight" | "Brand Awareness" | "Educational" | "Emotional Story" | "Limited Offer"
- summary: 1-2 sentence strategic description of this campaign angle
- target_audience: specific segment for this campaign
- tone: e.g. "Bold and urgent", "Warm and empathetic"
- key_message: the one central message this campaign should communicate
- visual_direction: brief art direction note
- suggested_channels: array of 2-3 best platforms for this campaign`,
      response_json_schema: {
        type: "object",
        properties: {
          themes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                strategy_angle: { type: "string" },
                summary: { type: "string" },
                target_audience: { type: "string" },
                tone: { type: "string" },
                key_message: { type: "string" },
                visual_direction: { type: "string" },
                suggested_channels: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    const saved = await Promise.all(
      (result.themes || []).map(t => base44.entities.AdCampaign.create({ ...t, brand_id: bId }))
    );
    setThemes(saved);
    setGeneratingThemes(false);
  };

  const handleOpenCampaign = (campaignId) => {
    navigate(`/Campaign?id=${campaignId}&brand=${brandId}`);
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#F7F7F8] pt-10 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <OnboardingProgress step={step} steps={STEPS} />
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <OnboardingStepURL url={url} setUrl={setUrl} onAnalyze={() => handleAnalyze()} analyzing={analyzing} />
              </motion.div>
            )}
            {step === 1 && brandData && (
              <motion.div key="s1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <OnboardingStepBrand brandData={brandData} onUpdate={setBrandData} onBack={() => setStep(0)} onConfirm={handleBrandConfirm} />
              </motion.div>
            )}
            {step === 2 && brandData && (
              <motion.div key="s2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <OnboardingStepVisuals brandData={brandData} onBack={() => setStep(1)} onConfirm={handleVisualsConfirm} />
              </motion.div>
            )}
            {step === 3 && brandData && (
              <motion.div key="s3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <OnboardingStepStrategy brandData={brandData} onBack={() => setStep(2)} onConfirm={handleStrategyConfirm} />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <OnboardingStepThemes themes={themes} generating={generatingThemes} brandName={brandData?.brand_name} onOpen={handleOpenCampaign} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}

function OnboardingProgress({ step, steps }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              i < step ? 'bg-violet-600 text-white' :
              i === step ? 'bg-violet-600 text-white ring-4 ring-violet-100' :
              'bg-gray-200 text-gray-400'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i <= step ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px transition-all ${i < step ? 'bg-violet-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}