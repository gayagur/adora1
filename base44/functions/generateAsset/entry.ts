import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ─── Content Angle Library (16 angles for maximum diversity) ─────────────────
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
    concept: 'Visual transformation — chaos vs designed calm',
    visualFocus: 'split-panel composition: left side dim chaotic scene, right side the same scene transformed — warm, minimal, elegant',
    moodKeywords: 'contrast, transformation, dramatic, editorial',
    forbid: 'text overlays, labels, arrows, UI elements',
  },
  {
    id: 'product_in_use',
    name: 'Product in Use',
    concept: 'A real person interacting with the product naturally',
    visualFocus: 'close-up of hands holding a phone or laptop with a clean app UI visible on screen, warm environment in background',
    moodKeywords: 'human, relatable, premium, editorial, tech-meets-life',
    forbid: 'fake UI, cluttered screens, stock photo feel, harsh lighting',
  },
  {
    id: 'creator_side',
    name: 'Creator / Craftsman',
    concept: 'The human behind the work — a craftsman, architect, or designer at work',
    visualFocus: 'workshop or studio scene — hands working on materials, sketches, or tools. Warm studio light, dust particles in beam',
    moodKeywords: 'authentic, crafted, warm, cinematic, artisan',
    forbid: 'tech, screens, UI, digital elements',
  },
  {
    id: 'ai_tech',
    name: 'AI / Tech Visualization',
    concept: 'Abstract visualization of intelligence meets practical application',
    visualFocus: 'clean dark surface with glowing abstract network nodes forming a meaningful pattern, or split showing raw data becoming a beautifully rendered output — minimal, modern, tech-forward',
    moodKeywords: 'futuristic, minimal, precise, modern, abstract',
    forbid: 'cluttered interfaces, generic sci-fi, harsh neons, clichéd AI imagery',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    concept: 'People genuinely enjoying a moment — emotional and warm',
    visualFocus: 'candid lifestyle moment — person reading, working, or having coffee in a beautifully designed space. Golden hour light.',
    moodKeywords: 'emotional, warm, authentic, slow living, aspirational',
    forbid: 'posed stock photography, fake smiles, generic setups',
  },
  {
    id: 'typography',
    name: 'Graphic / Typography',
    concept: 'A bold typographic creative with a single powerful visual element',
    visualFocus: 'ultra-clean cream or warm neutral background, generous whitespace, a single thin geometric accent. No photography.',
    moodKeywords: 'bold, minimal, editorial, Apple-like, premium',
    forbid: 'photography, busy backgrounds, decorative elements, clip art',
  },
  {
    id: 'process_journey',
    name: 'Process / Journey',
    concept: 'Visual storytelling of a journey from idea to result',
    visualFocus: 'four-panel or sequential grid showing progression: sketch → render → refinement → finished result. Clean editorial style, warm tones.',
    moodKeywords: 'narrative, process, transformation, craft, journey',
    forbid: 'text labels, arrows with words, infographic style, UI screenshots',
  },
  {
    id: 'macro_detail',
    name: 'Macro Detail',
    concept: 'Extreme close-up on a material, texture, or detail that tells the brand story',
    visualFocus: 'macro photography or extreme zoom on a single premium material — wood grain, fabric weave, metal finish, glass edge — lit with dramatic side-light. The texture becomes a landscape.',
    moodKeywords: 'intimate, textural, premium, sensory, cinematic',
    forbid: 'wide shots, people, text, generic surfaces',
  },
  {
    id: 'overhead_flatlay',
    name: 'Overhead Flat-Lay',
    concept: 'Carefully arranged brand-relevant objects from directly above',
    visualFocus: 'top-down view of curated objects arranged on a clean surface — tools, materials, devices, samples — intentional negative space between items. Clean, bright, editorial.',
    moodKeywords: 'organized, curated, editorial, clean, intentional',
    forbid: 'cluttered arrangements, random objects, dark moody lighting',
  },
  {
    id: 'environmental_portrait',
    name: 'Environmental Portrait',
    concept: 'A person deeply embedded in their environment — the space tells the story',
    visualFocus: 'wide environmental portrait — subject sits or stands naturally in a designed workspace, studio, or meaningful space. The environment and the person tell the story together. Shallow depth of field on background.',
    moodKeywords: 'authentic, narrative, cinematic, warm, editorial',
    forbid: 'studio backdrop, posed headshots, generic office settings',
  },
  {
    id: 'duality_contrast',
    name: 'Duality / Contrast',
    concept: 'Two opposing concepts reflected against each other',
    visualFocus: 'visual duality — left vs right, top vs bottom: analog/digital, chaos/order, old/new, raw/refined. Strong center divide, each side tells its own story, one color palette unites them.',
    moodKeywords: 'dramatic, conceptual, editorial, contrast, narrative',
    forbid: 'text labels, arrows, obvious infographic elements',
  },
  {
    id: 'gradient_atmosphere',
    name: 'Gradient Atmosphere',
    concept: 'A strong color gradient environment with a single focal element',
    visualFocus: 'rich, smooth gradient background from brand colors — a single 3D object, product, or silhouette floats as the focal point. Dramatic lighting, premium feel, minimal but striking.',
    moodKeywords: 'premium, modern, brand-forward, minimal, bold',
    forbid: 'multiple objects, cluttered elements, text, generic shapes',
  },
  {
    id: 'film_still',
    name: 'Cinematic Film Still',
    concept: 'A single cinematic frame extracted from a high-budget film',
    visualFocus: 'ultra-wide aspect ratio feel, cinematic color grade (teal-orange or muted cool tones), one strong subject in an atmospheric setting, shallow depth of field, film grain. The brand is implied, not shown.',
    moodKeywords: 'cinematic, atmospheric, editorial, premium, moody',
    forbid: 'bright colors, flat lighting, stock photo feel, direct product shots',
  },
  {
    id: 'portal_window',
    name: 'Portal / Window',
    concept: 'A frame within the frame revealing the brand world inside',
    visualFocus: 'a physical or conceptual window/portal/arch/doorway — through it we see the brand world. The frame is in the real world (concrete, wood, stone), the view through it reveals a beautiful branded scene.',
    moodKeywords: 'conceptual, inviting, editorial, discovery, premium',
    forbid: 'generic stock frames, obvious compositing, text overlays',
  },
  {
    id: 'motion_energy',
    name: 'Motion / Energy',
    concept: 'A subject captured in implied motion with dynamic energy',
    visualFocus: 'a single subject in motion — fabric flowing, particles scattering, liquid splashing, hands in action — captured with implied speed. Motion blur on the environment, sharp on the subject. Dynamic, energetic, alive.',
    moodKeywords: 'dynamic, energetic, alive, editorial, premium',
    forbid: 'static posed subjects, stock photography, cluttered backgrounds',
  },
];

// ─── Visual Styles (expanded for greater variety) ────────────────────────────
const VISUAL_STYLES = [
  'editorial magazine — strong focal subject, asymmetric composition, rich warm lighting, magazine-quality depth of field',
  'cinematic lifestyle — wide angle, film-like color grade, golden hour, one clear subject in intentional environment',
  'product hero — subject centered or offset, clean complementary background, sharp detail, premium studio lighting',
  'soft neutral aesthetic — one clear object or scene, beige/cream/warm gray tones, gentle shadows, serene and purposeful',
  'modern tech — one UI or product element as hero, dark or light background, precise composition, glowing accents',
  'collage / layered — overlapping real elements with clear visual hierarchy, one dominant subject, editorial depth',
  'architectural minimal — clean lines, one strong subject, intentional negative space as part of the scene',
  'bold editorial — strong contrast, one unmistakable focal point, graphic yet real, premium brand feel',
  'warm documentary — natural light, candid angles, real textures, slightly desaturated, authentic and raw',
  'high fashion — dramatic poses or compositions, strong shadows, color blocking, editorial perfection',
];

// ─── Brand Archetype System ─────────────────────────────────────────────────
const BRAND_ARCHETYPES = {
  'saas_tech': {
    preferredAngles: ['product_in_use', 'ai_tech', 'gradient_atmosphere', 'typography'],
    colorTendency: 'cool',
    compositionStyle: 'clean, geometric, precise',
    avoidAngles: ['interior_inspiration', 'creator_side'],
  },
  'lifestyle_consumer': {
    preferredAngles: ['lifestyle', 'environmental_portrait', 'film_still', 'motion_energy'],
    colorTendency: 'warm',
    compositionStyle: 'candid, natural, warm',
    avoidAngles: ['ai_tech', 'gradient_atmosphere'],
  },
  'ecommerce_product': {
    preferredAngles: ['product_in_use', 'overhead_flatlay', 'macro_detail', 'before_after'],
    colorTendency: 'brand-driven',
    compositionStyle: 'product-focused, clean, aspirational',
    avoidAngles: ['ai_tech', 'portal_window'],
  },
  'interior_design': {
    preferredAngles: ['interior_inspiration', 'before_after', 'creator_side', 'macro_detail'],
    colorTendency: 'warm neutral',
    compositionStyle: 'editorial, architectural, warm',
    avoidAngles: ['ai_tech', 'gradient_atmosphere'],
  },
  'creative_agency': {
    preferredAngles: ['typography', 'duality_contrast', 'portal_window', 'film_still'],
    colorTendency: 'bold',
    compositionStyle: 'experimental, editorial, bold',
    avoidAngles: ['lifestyle', 'interior_inspiration'],
  },
  'health_wellness': {
    preferredAngles: ['lifestyle', 'environmental_portrait', 'macro_detail', 'motion_energy'],
    colorTendency: 'warm natural',
    compositionStyle: 'natural, serene, warm',
    avoidAngles: ['ai_tech', 'typography'],
  },
  'education': {
    preferredAngles: ['product_in_use', 'process_journey', 'environmental_portrait', 'lifestyle'],
    colorTendency: 'warm professional',
    compositionStyle: 'approachable, clear, warm',
    avoidAngles: ['gradient_atmosphere', 'macro_detail'],
  },
  'finance_professional': {
    preferredAngles: ['typography', 'gradient_atmosphere', 'ai_tech', 'product_in_use'],
    colorTendency: 'cool professional',
    compositionStyle: 'precise, premium, clean',
    avoidAngles: ['creator_side', 'interior_inspiration'],
  },
  'general': {
    preferredAngles: [],
    colorTendency: 'brand-driven',
    compositionStyle: 'balanced, clean, intentional',
    avoidAngles: [],
  },
};

// ─── Creative Intent Mapping ─────────────────────────────────────────────────
const INTENT_ANGLE_MAP = {
  'product': ['product_in_use', 'overhead_flatlay', 'macro_detail', 'before_after'],
  'lifestyle': ['lifestyle', 'environmental_portrait', 'film_still', 'motion_energy'],
  'editorial': ['typography', 'duality_contrast', 'gradient_atmosphere', 'portal_window'],
  'data': ['ai_tech', 'typography', 'gradient_atmosphere', 'process_journey'],
  'abstract': ['gradient_atmosphere', 'portal_window', 'duality_contrast', 'motion_energy'],
};

// ─── Helper: Classify brand archetype from industry ─────────────────────────
function classifyBrand(industry, description) {
  const text = `${industry} ${description}`.toLowerCase();
  if (text.match(/saas|software|tech|app|platform|api|cloud|ai |artificial/)) return 'saas_tech';
  if (text.match(/interior|furniture|home|decor|design studio|architect/)) return 'interior_design';
  if (text.match(/shop|store|ecommerce|e-commerce|retail|fashion|clothing|jewelry|beauty/)) return 'ecommerce_product';
  if (text.match(/agency|creative|design|branding|marketing|studio/)) return 'creative_agency';
  if (text.match(/health|wellness|fitness|yoga|meditation|nutrition|organic/)) return 'health_wellness';
  if (text.match(/education|learning|course|training|school|university|teach/)) return 'education';
  if (text.match(/finance|banking|invest|insurance|accounting|legal|consult/)) return 'finance_professional';
  if (text.match(/lifestyle|blog|travel|food|restaurant|cafe|hotel/)) return 'lifestyle_consumer';
  return 'general';
}

// ─── Smart angle + style picker with diversity ──────────────────────────────
function pickAngleAndStyle(assetIndex, campaignSeed, archetype, creativeIntent, usedAngleIds) {
  let candidateAngles = [...CONTENT_ANGLES];

  // If user specified a creative intent, prefer those angles
  if (creativeIntent && creativeIntent !== 'auto' && INTENT_ANGLE_MAP[creativeIntent]) {
    const preferredIds = INTENT_ANGLE_MAP[creativeIntent];
    candidateAngles.sort((a, b) => {
      const aPreferred = preferredIds.includes(a.id) ? 0 : 1;
      const bPreferred = preferredIds.includes(b.id) ? 0 : 1;
      return aPreferred - bPreferred;
    });
  }
  // Otherwise, use brand archetype preferences
  else if (archetype && BRAND_ARCHETYPES[archetype]) {
    const arch = BRAND_ARCHETYPES[archetype];
    // Remove angles the archetype should avoid
    if (arch.avoidAngles.length > 0) {
      candidateAngles = candidateAngles.filter(a => !arch.avoidAngles.includes(a.id));
    }
    // Boost preferred angles to front
    if (arch.preferredAngles.length > 0) {
      candidateAngles.sort((a, b) => {
        const aIdx = arch.preferredAngles.indexOf(a.id);
        const bIdx = arch.preferredAngles.indexOf(b.id);
        if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
        if (aIdx >= 0) return -1;
        if (bIdx >= 0) return 1;
        return 0;
      });
    }
  }

  // Deprioritize already-used angles for diversity
  if (usedAngleIds.length > 0) {
    candidateAngles.sort((a, b) => {
      const aUsed = usedAngleIds.includes(a.id) ? 1 : 0;
      const bUsed = usedAngleIds.includes(b.id) ? 1 : 0;
      return aUsed - bUsed;
    });
  }

  // Pick from candidates using deterministic rotation
  const angleIdx = (assetIndex + campaignSeed) % candidateAngles.length;
  const angle = candidateAngles[angleIdx];

  // Style rotation
  const styleIdx = (assetIndex * 3 + campaignSeed + 1) % VISUAL_STYLES.length;
  const visualStyle = VISUAL_STYLES[styleIdx];

  return { angle, visualStyle };
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
async function doGenerate(base44, assetId, option, campaign, brand, postContent, forcedVisualStyle, backgroundStyle, backgroundTone, creativeIntent) {
  const assetType = option.asset_type;
  const platform = option.platform;

  const formatInstruction = assetType === 'story' || assetType === 'reel'
    ? 'Vertical 9:16 format. Mobile-first. Top-to-bottom visual flow.'
    : assetType === 'banner'
    ? 'Wide 16:9 horizontal banner. Left-to-right reading flow.'
    : 'Square 1:1 format. Centered or asymmetric composition. Mobile-optimized.';

  const brandColors = brand?.brand_colors?.join(', ') || 'warm beige, cream, terracotta, warm white';
  const primaryColor = brand?.brand_colors?.[0] || '#C8A882';

  const campaignSeed = hashString((campaign?.id || '') + (brand?.id || ''));

  // Classify brand archetype
  const archetype = classifyBrand(brand?.industry || '', brand?.description || '');

  // Pull existing assets to determine angle index + used angles
  let existingCount = 0;
  let usedAngleIds = [];
  try {
    const existing = await base44.asServiceRole.entities.CampaignAsset.filter({ campaign_id: campaign?.id || '' });
    const others = existing.filter(a => a.id !== assetId);
    existingCount = others.length;
    // Track used angles from visual_prompt to avoid repetition
    usedAngleIds = others
      .map(a => a.visual_prompt || '')
      .map(prompt => {
        const match = CONTENT_ANGLES.find(angle => prompt.toLowerCase().includes(angle.id.replace('_', ' ')));
        return match?.id;
      })
      .filter(Boolean);
  } catch (_) { /* ignore */ }

  const { angle, visualStyle } = pickAngleAndStyle(existingCount, campaignSeed, archetype, creativeIntent, usedAngleIds);

  console.log(`Asset ${assetId}: archetype="${archetype}", angle="${angle.name}", style="${visualStyle}", intent="${creativeIntent || 'auto'}"`);

  // ─── STAGE A: Creative Direction ──────────────────────────────────────────
  const postAnalysisSection = postContent ? `
POST / CAPTION PROVIDED BY USER:
"${postContent}"

CRITICAL: This post is the PRIMARY source of truth for this asset.
Before generating the image prompt, you MUST:
1. Extract the CORE MESSAGE — what is the user really trying to communicate?
2. Identify the EMOTIONAL TONE — is it inspiring? urgent? playful? authoritative? warm?
3. Decide the VISUAL TRANSLATION STRATEGY:
   - Should the visual be LITERAL (showing the actual thing described)?
   - Should it be METAPHORICAL (representing the feeling or concept abstractly)?
   - Should it be CONTEXTUAL (showing the world/environment the message lives in)?
   - Should it be PRODUCT-LED (the product/service as hero with the message implied)?
4. Determine if TEXT should be the hero or if the IMAGE should carry the message
5. The final image must FEEL like this post when you look at it — not just illustrate random words from it

DO NOT just pick keywords from the post and describe them as a scene.
TRANSLATE the meaning into a visual that a creative director would be proud of.` : '';

  const creativeDirection = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a world-class brand strategist and creative director at a top agency.

YOU MUST COMPLETE ALL 4 STEPS BEFORE WRITING THE IMAGE PROMPT.

---

BRAND INFORMATION:
- Brand Name: ${brand?.brand_name || 'Unknown Brand'}
- Website: ${brand?.url || ''}
- Instagram: ${brand?.social_instagram || ''}
- Facebook: ${brand?.social_facebook || ''}
- LinkedIn: ${brand?.social_linkedin || ''}
- Description: ${brand?.description || 'No description available'}
- Industry: ${brand?.industry || 'Unknown industry'}
- Target Audience: ${brand?.target_audience || 'General audience'}
- Tone of Voice: ${brand?.tone_of_voice || 'professional, clear'}
- Brand Colors: ${brandColors}
- Primary Color: ${primaryColor}
- Visual Style Notes: ${brand?.visual_style_notes || 'not available'}
- Brand Archetype: ${archetype} (${BRAND_ARCHETYPES[archetype]?.compositionStyle || 'balanced'})

CAMPAIGN:
- Title: ${campaign?.title || ''}
- Strategy: ${campaign?.strategy_angle || ''}
- Key Message: ${campaign?.key_message || ''}
- Visual Direction: ${campaign?.visual_direction || ''}

THIS ASSET BRIEF:
${postAnalysisSection}
- Creative Intent: ${creativeIntent || 'auto'} ${creativeIntent && creativeIntent !== 'auto' ? `(User specifically requested ${creativeIntent}-focused creative)` : ''}
- Content Angle: ${angle.name} — ${angle.concept}
- Visual Focus: ${angle.visualFocus}
- Mood: ${angle.moodKeywords}
- Forbidden: ${angle.forbid}
- Platform: ${platform} ${assetType} — ${formatInstruction}

===

STEP 1 — ANALYZE THE BRAND (use internet context provided):

Based on ALL brand information above AND what you can find about this brand online:
1. Visual Identity: Is it realistic/photographic OR graphic/illustrated/3D? What's the feel?
2. Color DNA: dominant colors, warm vs cool, saturated vs muted, background tones
3. Composition Patterns: text-heavy or visual-heavy? editorial or product-centric?
4. Content Type: people / product / UI / abstract / spaces / nature?
5. Emotional Signature: premium / playful / technical / creative / warm / clinical?
6. Brand Temperature: warm and inviting OR cool and precise OR somewhere specific?

CRITICAL: If this is a ${archetype} brand, respect the typical visual language of that category.
Do NOT apply a warm lifestyle aesthetic to a cold SaaS brand, or a tech aesthetic to a warm lifestyle brand.

===

STEP 2 — BUILD BRAND RULES (MANDATORY — write 6-10 rules):

Convert analysis into strict, specific rules. Examples:
- NEVER use warm tones — this is a cool, precise tech brand
- ALWAYS keep compositions clean with deliberate negative space
- Prefer subject-offset compositions over centered
- Colors must be drawn from: [specific palette]
- Photography style should feel editorial, not stock
- Backgrounds should be [specific guidance]

All rules must come from the actual brand analysis. NOT generic "nice aesthetic".
These rules are LAW for the image prompt.

===

STEP 3 — CHOOSE CREATIVE DIRECTION (must follow brand rules):

${forcedVisualStyle ? `IMPORTANT: User chose visual type = "${forcedVisualStyle.toUpperCase()}". You MUST use this. Do not override.` : 'Decide: Visual Type = Realistic OR Graphic (pick one based on brand analysis, no mixing)'}

- Text Strategy: pick one based on the brand and post content:
  A (Text-Heavy): 40-50% of image is intentional negative space for headline
  B (Visual-First): image dominates, text is a secondary overlay
  C (No Text): image carries the entire message alone

- Composition: pick exactly ONE:
  • Subject left, clean space right — for headline placement
  • Subject right, clean space left — editorial asymmetric
  • Centered subject with surrounding breathing room
  • Full-bleed image with soft gradient zone for text
  • Minimal poster layout — mostly space, one striking element
  • Asymmetrical editorial — diagonal energy, offset elements
  • Bird's eye / overhead — looking down at arranged elements
  • Extreme close-up with depth — macro detail, background blur

- Negative Space Strategy: describe WHERE in the image negative space will be and WHAT creates it naturally (wall, sky, blur, surface, gradient, etc.)

Validate: do your decisions match the brand rules? If not — revise.

===

STEP 4 — GENERATE:

Write the final image prompt based on ALL decisions above.

EVERY IMAGE — REGARDLESS OF STYLE — MUST HAVE:
- ONE clear focal point: a product, person, scene, object, or element
- Intentional composition: the subject is deliberately placed, lit, and framed
- Visual meaning: the image communicates something real about the brand
- Negative space INSIDE the image: achieved through natural scene composition
- "Minimal" means clean and uncluttered, NOT empty or meaningless

NEGATIVE SPACE RULES — CRITICAL:
- The empty space for text MUST BE PART OF THE IMAGE ITSELF
- It is created by natural elements: a clean wall behind a subject, soft bokeh background, open sky, empty desk surface, gradient lighting, defocused area
- Subject goes to ONE SIDE of the frame, opposite side is naturally open
- NEVER create negative space by adding a blank card/box/frame around the image
- NEVER split the image into "photo zone" + "text zone"
- Think like an editorial photographer composing a magazine cover shot

${forcedVisualStyle === 'graphic' ? `GRAPHIC STYLE RULES:
- Pick ONE unexpected direction that fits the brand:
  1. Floating 3D product/UI mockup above a blurred real environment
  2. Abstract 3D material composition — geometric forms embodying the brand
  3. Isometric 3D illustration of the service in use
  4. Cinematic split — half photographic, half graphic, seamlessly merged
  5. Data visualization as beautiful 3D sculpture
  6. Surreal brand scene — core concept made literal poetically
  7. Exploded view — components floating in formation
  8. Macro material study in hyper-detail
  9. Portal composition — frame within frame
  10. Gradient atmosphere — rich gradient + single 3D focal element
  11. Blueprint/technical drawing with one full-color element
  12. Infinite depth — repeating elements creating perspective tunnel
- Must be PREMIUM, PRECISE, and BRAND-AUTHENTIC
- ONE clear hero element — not a collage, not random shapes
- Reference quality: Stripe, Apple, Linear, Airbnb, Figma campaign visuals
- NEVER: cartoon, clipart, flat generic illustration, random abstract geometry` : ''}

${forcedVisualStyle === 'realistic' || !forcedVisualStyle ? `REALISTIC STYLE RULES:
- Natural lighting, intentional composition
- Premium scenes with a clear subject and sense of place
- Warm or cool tones per brand rules (do NOT default to warm)
- Always: a person, room, object, or meaningful scene
- Never: blurry abstract, generic stock, AI-generated poster` : ''}

TYPOGRAPHY AWARENESS — if headline is part of the output:
- Maximum 7 words in headline. Shorter is better.
- No broken words at line breaks
- No giant text blobs that fill the entire frame
- Headline should have clear hierarchy: big headline, smaller subline
- Text placement must respect the negative space strategy above

ABSOLUTE FORBIDDEN IN IMAGE:
- Any text, words, labels, captions rendered in the image
- Editor UI, canvas borders, toolbars, chrome
- Mixing graphic + realistic styles
- Crowded backgrounds with no breathing room
- Generic AI poster feel or "stock photo generated by AI" look
- Screenshot-inside-poster or image-on-card layout
- ${angle.forbid}

Format: ${formatInstruction}

===

RETURN JSON:
1. brand_summary: 2-3 sentence brand analysis (specific, not generic)
2. brand_rules: array of 6-10 rule strings (specific to THIS brand)
3. visual_decision: one line: [Type: Graphic/Realistic] [Text: Heavy/Minimal/None] [Layout: ___] [Negative Space: ___]
4. headline: max 7 words, scroll-stopping, specific to the brand message
5. subheadline: 10-14 words supporting headline
6. cta: short action button text (2-4 words)
7. full_caption: social caption with hook, value proposition, CTA, 3-5 relevant hashtags
8. image_generation_prompt: final detailed prompt — opens with visual_decision, describes composition precisely, specifies exact style, references brand colors, no ambiguity. Must be a complete scene description that a photographer or artist could execute.`,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        brand_summary: { type: 'string' },
        brand_rules: { type: 'array', items: { type: 'string' } },
        visual_decision: { type: 'string' },
        headline: { type: 'string' },
        subheadline: { type: 'string' },
        cta: { type: 'string' },
        full_caption: { type: 'string' },
        image_generation_prompt: { type: 'string' },
      },
      required: ['brand_summary', 'brand_rules', 'visual_decision', 'headline', 'subheadline', 'cta', 'full_caption', 'image_generation_prompt'],
    },
  });

  console.log('Brand summary:', creativeDirection.brand_summary);
  console.log('Brand rules:', creativeDirection.brand_rules?.join(' | '));
  console.log('Creative decision:', creativeDirection.visual_decision);
  console.log(`Creative: angle=${angle.name}, headline="${creativeDirection.headline}"`);

  // ─── STAGE B: Image Render ────────────────────────────────────────────────
  const existingRefs = brand?.image_assets?.length > 0 ? brand.image_assets.slice(0, 2) : undefined;

  const finalPrompt = `${creativeDirection.image_generation_prompt}

VISUAL STYLE: ${visualStyle}
CONTENT ANGLE: ${angle.name} — ${angle.visualFocus}
BRAND PALETTE: ${brandColors} (primary: ${primaryColor})
FORMAT: ${formatInstruction}

COMPOSITION RULES — CRITICAL:
- The empty space for text MUST BE PART OF THE IMAGE ITSELF — achieved through natural composition
- Place the subject to ONE SIDE of the frame, leaving the opposite side naturally open
- The open side must be a real element: clean wall, soft blur, open sky, empty surface, gradient lighting, defocused depth
- Think like an editorial photographer: compose so the scene itself provides breathing room
- The empty space should feel intentional — like the photographer deliberately left room
- NEVER split the image into image-box + white-box
- NEVER add external margins, cards, frames, or canvas-style layouts
- The result must look like a real photograph or real graphic — not a mockup or template

BACKGROUND REQUIREMENT:
${backgroundStyle === 'none' ? 'ISOLATED SUBJECT: Pure white or transparent background. No scene, no environment. Subject alone, cleanly cut out.' : backgroundStyle === 'minimal' ? 'MINIMAL BACKGROUND: Soft, clean, neutral. Solid color, subtle gradient, or very light texture. No busy environment.' : 'FULL BACKGROUND: Rich environment fills the entire frame. Subject exists within a real, atmospheric place.'}

BACKGROUND TONE:
${backgroundTone === 'light' ? 'LIGHT TONE: White, cream, off-white, light gray, or soft pastel. Bright, airy, clean. NO dark backgrounds.' : backgroundTone === 'dark' ? 'DARK TONE: Deep black, charcoal, navy, or dark muted. Moody, dramatic, premium. NO light/white backgrounds.' : `BRAND COLORS: Background built from brand palette. Dominant: ${primaryColor}. Full palette: ${brandColors}. Do NOT default to black or white.`}

${forcedVisualStyle === 'graphic' ? `GRAPHIC RENDERING:
- Main subject in sharp 3D perspective — slightly rotated, floating
- Realistic drop shadow beneath floating elements
- Background: real blurred environment OR rich gradient — NOT a flat solid color
- Secondary panels behind hero for depth (30% opacity or more blurred)
- Screen/UI content must look real and functional
- Result must feel like a premium SaaS product launch visual` : ''}

ABSOLUTE REQUIREMENTS:
- ZERO text, words, labels, or captions in the image
- ZERO editor UI, canvas borders, toolbars
- ZERO screenshot-in-poster layout
- ZERO generic stock photo or AI poster feel
- ZERO of these: ${angle.forbid}
- The image must feel: ${angle.moodKeywords}
- Production quality: top-tier brand studio output`;

  // For angles showing screens — inject real website screenshots
  const screenAngles = ['product_in_use', 'process_journey', 'ai_tech'];
  const useScreenshots = screenAngles.includes(angle.id) && brand?.image_assets?.length > 0;
  const imageRefs = useScreenshots ? brand.image_assets.slice(0, 2) : existingRefs;

  const screenPromptAddition = useScreenshots
    ? `\n\nIMPORTANT: The reference images are REAL screenshots of the brand's website. Use them as screen content on any device shown. Integrate naturally.`
    : '';

  const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
    prompt: finalPrompt + screenPromptAddition,
    existing_image_urls: imageRefs,
  });

  // ─── Carousel extra slides (with full brand context) ──────────────────────
  const images = [imageResult.url];
  if (assetType === 'carousel') {
    // Pick 3 different angles for carousel diversity
    const usedId = angle.id;
    const carouselAngles = CONTENT_ANGLES
      .filter(a => a.id !== usedId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    for (const slideAngle of carouselAngles) {
      const slidePrompt = `${creativeDirection.image_generation_prompt}

This is slide ${images.length + 1} of a carousel for ${brand?.brand_name || 'the brand'}.
Content angle for this slide: ${slideAngle.name} — ${slideAngle.visualFocus}
Mood: ${slideAngle.moodKeywords}

BRAND PALETTE: ${brandColors}
FORMAT: ${formatInstruction}
STYLE: ${visualStyle}

MUST follow brand rules: ${creativeDirection.brand_rules?.join('. ')}

ZERO text. ZERO editor UI. ZERO stock photo feel.
Forbidden: ${slideAngle.forbid}
Production quality. Premium brand studio output.`;

      const res = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: slidePrompt,
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

  console.log(`Asset ${assetId} done — archetype: ${archetype}, angle: ${angle.name}, style: ${visualStyle}`);
}

// ─── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { assetId, option, campaign, brand } = await req.json();
  const forcedVisualStyle = option?.visual_style || null;
  const postContent = option?.post_content || null;
  const backgroundStyle = option?.background || 'rich';
  const backgroundTone = option?.background_tone || 'brand';
  const creativeIntent = option?.creative_intent || 'auto';

  doGenerate(base44, assetId, option, campaign, brand, postContent, forcedVisualStyle, backgroundStyle, backgroundTone, creativeIntent).catch(async (error) => {
    console.error('Generation failed:', error.message);
    try {
      await base44.asServiceRole.entities.CampaignAsset.update(assetId, { status: 'error' });
    } catch (_) { /* ignore */ }
  });

  return Response.json({ success: true, message: 'Generation started' });
});
