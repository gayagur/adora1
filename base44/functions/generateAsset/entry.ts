import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function doGenerate(base44, assetId, option, campaign, brand) {
  const isCarousel = option.asset_type === 'carousel';
  const imageOrientation = option.asset_type === 'story' || option.asset_type === 'reel'
    ? 'Vertical composition.'
    : option.asset_type === 'banner' ? 'Wide horizontal layout.' : 'Square composition.';

  const baseImagePrompt = `Premium marketing creative for ${brand?.brand_name || 'a brand'}. Brand colors: ${brand?.brand_colors?.join(', ')}. Modern, high quality, no text. ${imageOrientation}`;
  const existingRefs = brand?.image_assets?.length > 0 ? brand.image_assets.slice(0, 2) : undefined;

  const copyResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a creative director. Generate a single ${option.label || option.asset_type} for this campaign.

Campaign: ${campaign?.title}
Strategy Angle: ${campaign?.strategy_angle}
Key Message: ${campaign?.key_message}
Tone: ${campaign?.tone}
Target Audience: ${campaign?.target_audience}
Visual Direction: ${campaign?.visual_direction}

Brand: ${brand?.brand_name}
Brand Description: ${brand?.description}
Brand Tone: ${brand?.tone_of_voice}
Brand Colors: ${brand?.brand_colors?.join(', ')}

Platform: ${option.platform}
Content Type: ${option.asset_type}
Format: ${option.format}

Generate:
- headline: short, punchy headline (max 10 words)
- ad_copy: 1-2 sentence copy for the ad
- full_caption: complete social media caption with hook, value prop, CTA, and 3-5 hashtags
- cta: call-to-action text (e.g. "Learn More", "Try Free", "Shop Now")
- visual_prompt: detailed AI image generation prompt. Modern premium marketing visual. NO text in image. Use brand colors. ${imageOrientation}`,
    response_json_schema: {
      type: "object",
      properties: {
        headline: { type: "string" },
        ad_copy: { type: "string" },
        full_caption: { type: "string" },
        cta: { type: "string" },
        visual_prompt: { type: "string" }
      }
    }
  });

  const firstImageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
    prompt: baseImagePrompt,
    existing_image_urls: existingRefs
  });

  const images = [firstImageResult.url];

  if (isCarousel) {
    const carouselFrames = [
      `Slide 2 of 4 - Problem statement visual: ${copyResult.visual_prompt}. Brand colors: ${brand?.brand_colors?.join(', ')}. No text. High quality.`,
      `Slide 3 of 4 - Solution/benefit visual: ${copyResult.visual_prompt}. Brand colors: ${brand?.brand_colors?.join(', ')}. No text. High quality.`,
      `Slide 4 of 4 - Call to action / result visual: ${copyResult.visual_prompt}. Brand colors: ${brand?.brand_colors?.join(', ')}. No text. High quality.`,
    ];
    for (const prompt of carouselFrames) {
      const res = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt, existing_image_urls: existingRefs });
      images.push(res.url);
    }
  }

  await base44.asServiceRole.entities.CampaignAsset.update(assetId, {
    ...copyResult,
    preview_image: images[0],
    carousel_images: isCarousel ? images : [],
    status: 'ready',
  });

  console.log(`Asset ${assetId} generated successfully`);
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { assetId, option, campaign, brand } = await req.json();

  // Run generation fully — do NOT detach, let the function complete
  // The frontend invoke call has its own timeout handling; the backend will finish regardless
  try {
    await doGenerate(base44, assetId, option, campaign, brand);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Generation failed:', error.message);
    try {
      await base44.asServiceRole.entities.CampaignAsset.update(assetId, { status: 'error' });
    } catch (_) { /* ignore */ }
    return Response.json({ error: error.message }, { status: 500 });
  }
});