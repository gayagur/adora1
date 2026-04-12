import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ─── Content Angle Library ────────────────────────────────────────────────────
const CONTENT_ANGLES = [
  {
    id: 'interior_inspiration',
    name: 'Interior Inspiration',
    concept: 'A beautifully designed space that feels aspirational and warm',
    visualFocus: 'wide editorial shot of a stunning interior — warm lighting, natural textures, curated objects, soft shadows',
    moodKeywords: 'aspirational, warm, serene, premium, lifestyle',
    forbid: 'people, tech, UI, text, posters',
  },
  {
    id: 'before_after',
    name: 'Before / After',
    concept: 'Visual transformation of a space — cluttered chaos vs designed calm',
    visualFocus: 'split-panel composition: left side dim chaotic room, right side the same room transformed — warm minimal elegant',
    moodKeywords: 'contrast, transformation, dramatic, editorial',
    forbid: 'text overlays, labels, arrows, UI elements',
  },
  {
    id: 'product_in_use',
    name: 'Product in Use',
    concept: 'A real person interacting with the platform from their home or studio',
    visualFocus: 'close-up of hands holding a phone or laptop with a clean minimal interior design app UI visible on screen, warm home environment in the background',
    moodKeywords: 'human, relatable, premium, editorial, tech-meets-home',
    forbid: 'fake UI, cluttered screens, stock photo feel, harsh lighting',
  },
  {
    id: 'creator_side',
    name: 'Creator / Craftsman',
    concept: 'The human behind the design — a craftsman, architect, or designer at work',
    visualFocus: 'workshop or studio scene — hands working on a wooden scale model, architectural sketches, or material swatches. Warm studio light, dust particles in beam',
    moodKeywords: 'authentic, crafted, warm, cinematic, artisan',
    forbid: 'tech, screens, UI, digital elements',
  },
  {
    id: 'ai_tech',
    name: 'AI / Tech Visualization',
    concept: 'Abstract visualization of intelligence meets interior design',
    visualFocus: 'clean dark surface with glowing abstract network nodes forming a room floor plan, or a split showing raw data becoming a beautifully lit 3D room — minimal, modern, tech-forward',
    moodKeywords: 'futuristic, minimal, precise, modern, abstract',
    forbid: 'cluttered interfaces, generic sci-fi, harsh neons, clichéd AI imagery',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    concept: 'People genuinely enjoying their designed space — emotional and warm',
    visualFocus: 'candid lifestyle moment — couple reading on a linen sofa, child playing on a warm rug, person having morning coffee in a sun-lit designed room. Golden hour light.',
    moodKeywords: 'emotional, warm, authentic, slow living, aspirational',
    forbid: 'posed stock photography, fake smiles, generic setups',
  },
  {
    id: 'typography',
    name: 'Graphic / Typography',
    concept: 'A bold typographic ad creative with a single powerful message',
    visualFocus: 'ultra-clean cream or warm neutral background, one large editorial serif or sans-serif headline, generous whitespace, a single thin geometric accent line. No photography.',
    moodKeywords: 'bold, minimal, editorial, Apple-like, premium',
    forbid: 'photography, busy backgrounds, decorative elements, clip art',
  },
  {
    id: 'process_journey',
    name: 'Process / Journey',
    concept: 'Visual storytelling of the design journey from idea to delivered space',
    visualFocus: 'four-panel or sequential grid showing: a rough sketch → a 3D room render → a material swatch selection → the finished real room. Clean editorial style, warm tones.',
    moodKeywords: 'narrative, process, transformation, craft, journey',
    forbid: 'text labels, arrows with words, infographic style, UI screenshots',
  },
];

const VISUAL_STYLES = [
  'minimal premium — generous white space, one focal element, editorial clarity',
  'editorial magazine — asymmetric composition, rich detail, magazine-quality lighting',
  'bold typography — strong typographic hierarchy, minimal imagery, graphic design focus',
  'cinematic lifestyle — wide angle, film-like color grade, golden hour, emotional depth',
  'product-focused — clean background, product hero, sharp detail',
  'soft neutral aesthetic — beige, cream, warm grays, gentle shadows, spa-like calm',
  'modern tech — dark background, precise grid, glowing accents, clean interface feel',
  'collage / layered — overlapping elements, textural richness, editorial depth',
];

// Deterministically rotate angles + styles so every batch is diverse
function pickAngleAndStyle(assetIndex, campaignSeed) {
  const angleIdx = (assetIndex + campaignSeed) % CONTENT_ANGLES.length;
  const styleIdx = (assetIndex * 3 + campaignSeed) % VISUAL_STYLES.length;
  return {
    angle: CONTENT_ANGLES[angleIdx],
    visualStyle: VISUAL_STYLES[styleIdx],
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ─── Core generation ─────────────────────────────────────────────────────────
async function doGenerate(base44, assetId, option, campaign, brand) {
  const assetType = option.asset_type;
  const platform = option.platform;

  const formatInstruction = assetType === 'story' || assetType === 'reel'
    ? 'Vertical 9:16 format. Mobile-first. Top-to-bottom visual flow.'
    : assetType === 'banner'
    ? 'Wide 16:9 horizontal banner. Left-to-right reading flow.'
    : 'Square 1:1 format. Centered or asymmetric composition. Mobile-optimized.';

  const brandColors = brand?.brand_colors?.join(', ') || 'warm beige, cream, terracotta, warm white';
  const primaryColor = brand?.brand_colors?.[0] || '#C8A882';

  // Seed from campaign+brand so same campaign always cycles the same way
  const campaignSeed = hashString((campaign?.id || '') + (brand?.id || ''));

  // Pull existing assets to know how many have been made → determine angle index
  let existingCount = 0;
  try {
    const existing = await base44.asServiceRole.entities.CampaignAsset.filter({ campaign_id: campaign?.id || '' });
    existingCount = existing.filter(a => a.id !== assetId).length;
  } catch (_) { /* ignore */ }

  const { angle, visualStyle } = pickAngleAndStyle(existingCount, campaignSeed);

  console.log(`Asset ${assetId}: angle="${angle.name}", style="${visualStyle}"`);

  // ─── STAGE A: Creative Direction ──────────────────────────────────────────
  const creativeDirection = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a world-class performance creative director for a premium interior design brand.

BRAND CONTEXT:
- Brand: ${brand?.brand_name || 'DEXO Interior Studio'}
- Description: ${brand?.description || 'AI-powered interior design platform'}
- Industry: ${brand?.industry || 'Interior Design / Home Tech'}
- Target Audience: ${brand?.target_audience || 'Design-conscious homeowners and architects'}
- Tone: ${brand?.tone_of_voice || 'warm, premium, calm, editorial'}
- Brand Colors: ${brandColors}

CAMPAIGN:
- Title: ${campaign?.title || ''}
- Strategy: ${campaign?.strategy_angle || ''}
- Key Message: ${campaign?.key_message || ''}
- Visual Direction: ${campaign?.visual_direction || ''}

THIS ASSET'S CREATIVE BRIEF:
- Content Angle: ${angle.name}
- Angle Concept: ${angle.concept}
- Visual Focus: ${angle.visualFocus}
- Mood: ${angle.moodKeywords}
- Forbidden Elements: ${angle.forbid}

VISUAL STYLE FOR THIS IMAGE: ${visualStyle}

AD FORMAT: ${platform} ${assetType} — ${formatInstruction}

---

Your job: write the COMPLETE creative brief for ONE high-converting ad in this angle.

Return:
1. headline: max 7 words, scroll-stopping, honest to the angle
2. subheadline: 10-14 words supporting the headline
3. cta: short action-oriented button text
4. full_caption: complete social caption with hook, value, CTA, 3-5 hashtags
5. image_generation_prompt: The final image AI prompt. Must produce a FINISHED premium ad visual.
   - Visual style: ${visualStyle}
   - Content angle: ${angle.visualFocus}
   - Format: ${formatInstruction}
   - Brand palette: warm beige, cream, terracotta, natural wood tones
   - ABSOLUTE RULES for the image prompt:
     * NO text, labels, words, or captions in the image
     * NO editor UI, canvas chrome, resize handles, selection boxes
     * NO screenshot-in-poster effect
     * NO stock photo feel — must look like real editorial photography or premium CGI
     * NO generic AI poster aesthetic
     * Forbidden in this angle: ${angle.forbid}
     * Must feel: ${angle.moodKeywords}
     * The image must look like it was shot by a professional photographer or rendered by a top design studio`,
    response_json_schema: {
      type: 'object',
      properties: {
        headline: { type: 'string' },
        subheadline: { type: 'string' },
        cta: { type: 'string' },
        full_caption: { type: 'string' },
        image_generation_prompt: { type: 'string' },
      },
      required: ['headline', 'subheadline', 'cta', 'full_caption', 'image_generation_prompt'],
    },
  });

  console.log(`Creative: angle=${angle.name}, headline="${creativeDirection.headline}"`);

  // ─── STAGE B: Image Render ────────────────────────────────────────────────
  const existingRefs = brand?.image_assets?.length > 0 ? brand.image_assets.slice(0, 2) : undefined;

  const finalPrompt = `${creativeDirection.image_generation_prompt}

VISUAL STYLE: ${visualStyle}
CONTENT ANGLE: ${angle.name} — ${angle.visualFocus}
BRAND PALETTE: warm beige, cream, terracotta, natural linen, warm oak wood
FORMAT: ${formatInstruction}

ABSOLUTE REQUIREMENTS:
- ZERO text, words, labels, or captions anywhere in the image
- ZERO editor UI, canvas borders, toolbars, or chrome
- ZERO screenshot-in-poster layout
- ZERO generic stock photo or AI-generated poster feel
- ZERO harsh colors — only warm, premium, editorial tones
- ZERO of these forbidden elements: ${angle.forbid}
- The image must feel: ${angle.moodKeywords}
- Production quality: looks like it was made by a top-tier brand studio`;

  // For angles that show a screen/device — inject real website screenshots as reference
  const screenAngles = ['product_in_use', 'process_journey', 'ai_tech'];
  const useScreenshots = screenAngles.includes(angle.id) && brand?.image_assets?.length > 0;
  const imageRefs = useScreenshots
    ? brand.image_assets.slice(0, 2)  // real website screenshots from onboarding
    : existingRefs;

  const screenPromptAddition = useScreenshots
    ? `\n\nIMPORTANT: The reference images provided are REAL screenshots of the brand's actual website. Use them as the UI/screen content shown on the device in the image. The screen should show these actual pages — not fabricated UI. Integrate them naturally into the scene.`
    : '';

  const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
    prompt: finalPrompt + screenPromptAddition,
    existing_image_urls: imageRefs,
  });

  // ─── Carousel extra slides ────────────────────────────────────────────────
  const images = [imageResult.url];
  if (assetType === 'carousel') {
    const carouselAngles = CONTENT_ANGLES.filter(a => a.id !== angle.id).slice(0, 3);
    for (const slideAngle of carouselAngles) {
      const res = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: `${slideAngle.visualFocus}. Brand palette: warm beige, cream, terracotta, natural wood. ${formatInstruction}. Style: ${visualStyle}. ZERO text, ZERO editor UI, ZERO stock photo feel. Forbidden: ${slideAngle.forbid}. Must feel: ${slideAngle.moodKeywords}. Premium, editorial, production-quality.`,
        existing_image_urls: existingRefs,
      });
      images.push(res.url);
    }
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  await base44.asServiceRole.entities.CampaignAsset.update(assetId, {
    headline: creativeDirection.headline,
    ad_copy: creativeDirection.subheadline,
    full_caption: creativeDirection.full_caption,
    cta: creativeDirection.cta,
    visual_prompt: creativeDirection.image_generation_prompt,
    preview_image: images[0],
    carousel_images: assetType === 'carousel' ? images : [],
    status: 'ready',
  });

  console.log(`Asset ${assetId} done — angle: ${angle.name}, style: ${visualStyle}`);
}

// ─── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { assetId, option, campaign, brand } = await req.json();

  // Fire-and-forget: return immediately so frontend never times out.
  // The backend continues running and updates the entity when done.
  // The frontend discovers the result via polling (refetchInterval).
  doGenerate(base44, assetId, option, campaign, brand).catch(async (error) => {
    console.error('Generation failed:', error.message);
    try {
      await base44.asServiceRole.entities.CampaignAsset.update(assetId, { status: 'error' });
    } catch (_) { /* ignore */ }
  });

  return Response.json({ success: true, message: 'Generation started' });
});