import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function doGenerate(base44, assetId, option, campaign, brand) {
  const isCarousel = option.asset_type === 'carousel';
  const assetType = option.asset_type;
  const platform = option.platform;

  const formatInstruction = assetType === 'story' || assetType === 'reel'
    ? 'Vertical 9:16 format. Mobile-first. Top-to-bottom visual hierarchy.'
    : assetType === 'banner'
    ? 'Wide 16:9 horizontal banner. Left-to-right reading flow.'
    : 'Square 1:1 format. Centered composition. Mobile-optimized.';

  const brandColors = brand?.brand_colors?.join(', ') || '#6366f1, #1e1e2e';
  const primaryColor = brand?.brand_colors?.[0] || '#6366f1';
  const secondaryColor = brand?.brand_colors?.[1] || '#1e1e2e';
  const existingRefs = brand?.image_assets?.length > 0 ? brand.image_assets.slice(0, 2) : undefined;

  // ─── STAGE A: Creative Direction ────────────────────────────────────────────
  // Think like an ad creative director, not a content writer.
  // Produce a full creative brief before touching any image generation.
  const creativeDirection = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a world-class performance marketing creative director at a top-tier startup studio.
Your job is to create a REAL paid social ad — not a website screenshot, not a template, not a poster.

You will analyze the brand and campaign below, then produce a complete creative brief for a single high-converting ad asset.

---
BRAND:
- Name: ${brand?.brand_name || 'Unknown Brand'}
- Description: ${brand?.description || ''}
- Industry: ${brand?.industry || ''}
- Target Audience: ${brand?.target_audience || campaign?.target_audience || ''}
- Tone of Voice: ${brand?.tone_of_voice || ''}
- Key Messages: ${brand?.key_messages?.join(', ') || ''}
- Brand Colors: ${brandColors}

CAMPAIGN:
- Title: ${campaign?.title || ''}
- Strategy Angle: ${campaign?.strategy_angle || ''}
- Key Message: ${campaign?.key_message || ''}
- Tone: ${campaign?.tone || ''}
- Target Audience: ${campaign?.target_audience || ''}
- Visual Direction: ${campaign?.visual_direction || ''}

AD FORMAT:
- Platform: ${platform}
- Type: ${assetType}
- Format: ${formatInstruction}
---

Now produce a creative brief with:

1. ad_angle: The ONE strategic angle for this ad (e.g. "pain-point relief", "social proof", "aspirational outcome", "product demo moment")
2. headline: A short, punchy hook. Max 8 words. Must stop the scroll. No generic SaaS clichés.
3. subheadline: One supporting sentence (10–15 words). Adds clarity or tension to the headline.
4. cta: The call-to-action button text. Short, action-oriented (e.g. "Try Free", "See How It Works", "Get Started")
5. full_caption: Complete social caption — hook, value prop, CTA, 3-5 hashtags.
6. focal_point: What is the SINGLE dominant visual element? (e.g. "abstract network of glowing nodes", "clean floating product card on dark background", "3D icon of a shield", "bold typographic poster")
7. composition_plan: Describe the spatial layout. Where is the focal point? Where does the eye travel? What's in the background?
8. visual_style: Describe the visual style in detail — colors, lighting, mood, texture, finish (e.g. "dark glass morphism with violet glow", "minimal white with editorial typography", "bold flat color blocks with geometric shapes")
9. image_generation_prompt: The FINAL detailed prompt for the image AI. This must produce a REAL finished ad visual — not a screenshot, not a template, not an editor UI. Think: Apple ad, Stripe launch visual, Linear product moment.

CRITICAL RULES FOR image_generation_prompt:
- The image must look like a FINISHED, PRODUCTION-READY paid social ad
- ${formatInstruction}
- Use brand colors: ${brandColors}
- ZERO text, labels, or words in the image
- ZERO browser chrome, editor chrome, resize handles, canvas toolbars, pointer cursors
- ZERO "screenshot inside poster" effect — no raw website pasted in the center
- ZERO slide-deck or PowerPoint look
- ZERO generic stock photo aesthetics
- If showing product UI: show only the most powerful, cropped, enlarged, visually refined fragment — treated as hero art, not a screenshot
- The visual must be immediately readable and impactful in under 1 second
- Premium, modern, scroll-stopping — like a real ad from a VC-backed startup with a top design team`,
    response_json_schema: {
      type: "object",
      properties: {
        ad_angle: { type: "string" },
        headline: { type: "string" },
        subheadline: { type: "string" },
        cta: { type: "string" },
        full_caption: { type: "string" },
        focal_point: { type: "string" },
        composition_plan: { type: "string" },
        visual_style: { type: "string" },
        image_generation_prompt: { type: "string" }
      },
      required: ["headline", "subheadline", "cta", "full_caption", "image_generation_prompt"]
    }
  });

  console.log(`Creative direction for ${assetId}:`, JSON.stringify({
    angle: creativeDirection.ad_angle,
    headline: creativeDirection.headline,
    focal_point: creativeDirection.focal_point,
  }));

  // ─── STAGE B: Final Image Render ─────────────────────────────────────────────
  // Use the creative brief to render a real finished ad image.
  const finalImagePrompt = `${creativeDirection.image_generation_prompt}

COMPOSITION: ${creativeDirection.composition_plan || ''}
VISUAL STYLE: ${creativeDirection.visual_style || ''}
FOCAL POINT: ${creativeDirection.focal_point || ''}
BRAND COLORS: Primary ${primaryColor}, Secondary ${secondaryColor}
FORMAT: ${formatInstruction}

ABSOLUTE RULES — VIOLATIONS WILL RUIN THE OUTPUT:
- NO text of any kind in the image — no labels, no captions, no UI text, no words
- NO editor UI, canvas borders, resize handles, drag handles, selection boxes, or tooltips
- NO browser frames unless intentionally stylized as a product moment (e.g., floating browser card with blur)
- NO screenshot-inside-poster layout — no raw full-page website pasted in the center
- NO slideshow, PowerPoint, or presentation template feel
- NO tiny unreadable interface clutter
- NO generic stock photography
- NO awkward empty dead space
- If showing UI: crop aggressively, zoom in, show only the most compelling fragment, rendered beautifully
- Output must look like a REAL paid social advertisement created by a world-class design team
- Premium, intentional, production-ready`;

  const firstImageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
    prompt: finalImagePrompt,
    existing_image_urls: existingRefs
  });

  const images = [firstImageResult.url];

  // ─── CAROUSEL: Additional slides ─────────────────────────────────────────────
  if (isCarousel) {
    const carouselSlides = [
      {
        role: "Problem slide",
        direction: `Show the PAIN or PROBLEM the audience faces. Dark, tense mood. Abstract visual metaphor. Same style: ${creativeDirection.visual_style}. Brand colors: ${brandColors}. No text. No editor UI.`
      },
      {
        role: "Solution/benefit slide",
        direction: `Show the TRANSFORMATION or BENEFIT after using the product. Hopeful, elevated mood. Same focal point style: ${creativeDirection.focal_point}. Brand colors: ${brandColors}. No text. No editor UI.`
      },
      {
        role: "Proof/CTA slide",
        direction: `Show CONFIDENCE and OUTCOME — a moment of success, social proof, or decisive action. Strong, premium visual. Same style: ${creativeDirection.visual_style}. Brand colors: ${brandColors}. No text. No editor UI.`
      }
    ];

    for (const slide of carouselSlides) {
      const res = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: `${slide.role}: ${slide.direction}\n\nFormat: ${formatInstruction}\nAbsolutely NO text, NO editor chrome, NO screenshot-in-poster. Finished premium ad visual.`,
        existing_image_urls: existingRefs
      });
      images.push(res.url);
    }
  }

  // ─── Save result ──────────────────────────────────────────────────────────────
  await base44.asServiceRole.entities.CampaignAsset.update(assetId, {
    headline: creativeDirection.headline,
    ad_copy: creativeDirection.subheadline,
    full_caption: creativeDirection.full_caption,
    cta: creativeDirection.cta,
    visual_prompt: creativeDirection.image_generation_prompt,
    preview_image: images[0],
    carousel_images: isCarousel ? images : [],
    status: 'ready',
  });

  console.log(`Asset ${assetId} generated successfully — angle: ${creativeDirection.ad_angle}`);
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { assetId, option, campaign, brand } = await req.json();

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