import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

interface BrandStyle {
  archetype: string;
  colorTendency: string;
  visualIdentity: string;
  compositionStyle: string;
  emotionalSignature: string;
  temperature: string;
  preferredAngles: string[];
  avoidAngles: string[];
}

interface MessageAnalysis {
  coreMessage: string;
  emotionalTone: string;
  visualStrategy: 'literal' | 'metaphorical' | 'contextual' | 'product_led' | 'abstract';
  textShouldBeHero: boolean;
}

interface CreativeDecision {
  angleId: string;
  angleName: string;
  format: string;
  visualType: string;
  composition: string;
  textDensity: string;
  contentType: string;
  focalPoint: string;
  sceneDescription: string;
  negativeSpaceStrategy: string;
  visualStyle: string;
}

interface FeatureVector {
  format: string;
  visualType: string;
  composition: string;
  textDensity: string;
  contentType: string;
  angleId: string;
  angleIndex: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: CONTENT ANGLE LIBRARY (16 universal angles)
// ═══════════════════════════════════════════════════════════════════════════════

const CONTENT_ANGLES = [
  {
    id: 'product_hero',
    name: 'Product Hero',
    concept: 'The product, service, or offering as the clear focal point',
    visualFocus: 'product or service element centered or offset against clean backdrop — sharp detail, intentional lighting, premium feel',
    moodKeywords: 'premium, focused, aspirational, clean, hero',
    forbid: 'cluttered scenes, people overshadowing product, text overlays',
    contentType: 'product_object',
  },
  {
    id: 'product_in_use',
    name: 'Product in Context',
    visualFocus: 'hands or person interacting with the product naturally — phone, laptop, tool, physical product — in a real environment',
    concept: 'A real person using the product or service in their natural environment',
    moodKeywords: 'authentic, relatable, human, editorial',
    forbid: 'fake UI, cluttered screens, stock photo feel, harsh lighting',
    contentType: 'people_lifestyle',
  },
  {
    id: 'lifestyle_moment',
    name: 'Lifestyle Moment',
    concept: 'People genuinely enjoying a moment related to the brand value',
    visualFocus: 'candid lifestyle scene — person or people in a warm, real moment. Golden hour light, real emotions, beautiful environment.',
    moodKeywords: 'emotional, warm, authentic, aspirational',
    forbid: 'posed stock photography, fake smiles, generic setups',
    contentType: 'people_lifestyle',
  },
  {
    id: 'environmental_portrait',
    name: 'Environmental Portrait',
    concept: 'A person embedded in their meaningful environment — the space tells the story',
    visualFocus: 'wide environmental portrait — subject sits or stands naturally in a workspace, studio, or designed space. Shallow depth of field.',
    moodKeywords: 'authentic, narrative, cinematic, warm, editorial',
    forbid: 'studio backdrop, posed headshots, generic office',
    contentType: 'people_lifestyle',
  },
  {
    id: 'before_after',
    name: 'Before / After',
    concept: 'Visual transformation showing the impact of the product or service',
    visualFocus: 'split-panel composition: left side chaotic/old/raw, right side transformed/new/refined — unified color palette',
    moodKeywords: 'contrast, transformation, dramatic, editorial',
    forbid: 'text overlays, labels, arrows, UI elements',
    contentType: 'process_journey',
  },
  {
    id: 'process_journey',
    name: 'Process / Journey',
    concept: 'Visual storytelling of a progression from start to finish',
    visualFocus: 'sequential grid or flow showing progression: idea → development → refinement → result. Clean editorial style.',
    moodKeywords: 'narrative, process, transformation, craft',
    forbid: 'text labels, arrows with words, infographic style',
    contentType: 'process_journey',
  },
  {
    id: 'typography_editorial',
    name: 'Bold Editorial',
    concept: 'A typographic creative with powerful visual hierarchy and a single accent element',
    visualFocus: 'ultra-clean background, generous whitespace, one geometric or brand accent element. No photography.',
    moodKeywords: 'bold, minimal, editorial, premium, typographic',
    forbid: 'photography, busy backgrounds, decorative elements, clip art',
    contentType: 'editorial_typography',
  },
  {
    id: 'abstract_3d',
    name: 'Abstract / 3D Conceptual',
    concept: 'Abstract visualization that embodies the brand concept',
    visualFocus: 'abstract 3D forms, geometric compositions, or surreal scenes that metaphorically represent the brand message — minimal, precise, striking',
    moodKeywords: 'futuristic, minimal, precise, modern, abstract',
    forbid: 'cluttered interfaces, generic sci-fi, harsh neons, clichéd imagery',
    contentType: 'abstract_conceptual',
  },
  {
    id: 'macro_detail',
    name: 'Macro Detail',
    concept: 'Extreme close-up on a material, texture, or detail that tells the brand story',
    visualFocus: 'macro photography — extreme zoom on a premium surface, material, or element. Dramatic side-light, shallow depth.',
    moodKeywords: 'intimate, textural, premium, sensory, cinematic',
    forbid: 'wide shots, people, text, generic surfaces',
    contentType: 'product_object',
  },
  {
    id: 'overhead_flatlay',
    name: 'Overhead Flat-Lay',
    concept: 'Carefully arranged brand-relevant objects from directly above',
    visualFocus: 'top-down view of curated objects on a clean surface — tools, materials, products — intentional negative space between items.',
    moodKeywords: 'organized, curated, editorial, clean, intentional',
    forbid: 'cluttered arrangements, random objects, dark moody lighting',
    contentType: 'product_object',
  },
  {
    id: 'duality_contrast',
    name: 'Duality / Contrast',
    concept: 'Two opposing concepts reflected against each other',
    visualFocus: 'visual duality — left vs right: old/new, analog/digital, chaos/order. Strong center divide, one color palette unites them.',
    moodKeywords: 'dramatic, conceptual, editorial, contrast, narrative',
    forbid: 'text labels, arrows, obvious infographic elements',
    contentType: 'abstract_conceptual',
  },
  {
    id: 'gradient_atmosphere',
    name: 'Gradient Atmosphere',
    concept: 'A rich color environment with a single striking focal element',
    visualFocus: 'smooth gradient background from brand colors — a single 3D object, product, or silhouette as focal point. Dramatic lighting.',
    moodKeywords: 'premium, modern, brand-forward, minimal, bold',
    forbid: 'multiple objects, cluttered elements, text, generic shapes',
    contentType: 'abstract_conceptual',
  },
  {
    id: 'film_still',
    name: 'Cinematic Frame',
    concept: 'A single cinematic frame that could be from a high-budget production',
    visualFocus: 'cinematic color grade, one strong subject in atmospheric setting, shallow depth of field, subtle film grain.',
    moodKeywords: 'cinematic, atmospheric, editorial, premium, moody',
    forbid: 'bright flat colors, flat lighting, stock photo feel, direct product placement',
    contentType: 'people_lifestyle',
  },
  {
    id: 'portal_window',
    name: 'Portal / Window',
    concept: 'A frame within the frame revealing the brand world',
    visualFocus: 'a physical or conceptual window/portal/arch — through it we see the brand world. Frame in the real world, view reveals branded scene.',
    moodKeywords: 'conceptual, inviting, editorial, discovery, premium',
    forbid: 'generic stock frames, obvious compositing, text overlays',
    contentType: 'abstract_conceptual',
  },
  {
    id: 'motion_energy',
    name: 'Motion / Energy',
    concept: 'Dynamic energy and movement captured in a single frame',
    visualFocus: 'subject in motion — fabric flowing, particles scattering, liquid moving, hands in action. Motion blur on environment, sharp on subject.',
    moodKeywords: 'dynamic, energetic, alive, editorial, premium',
    forbid: 'static posed subjects, stock photography, cluttered backgrounds',
    contentType: 'people_lifestyle',
  },
  {
    id: 'data_social_proof',
    name: 'Data / Social Proof',
    concept: 'Metrics, numbers, or proof points visualized beautifully',
    visualFocus: 'clean visualization of data, metrics, or social proof — rendered as elegant 3D charts, floating numbers, or sculptural data forms.',
    moodKeywords: 'precise, modern, authoritative, clean, trustworthy',
    forbid: 'clipart charts, generic infographics, busy dashboards, text-heavy',
    contentType: 'data_stats',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: VISUAL STYLES & FORMATS
// ═══════════════════════════════════════════════════════════════════════════════

const VISUAL_STYLES = [
  'editorial magazine — strong focal subject, asymmetric composition, rich lighting, magazine-quality depth of field',
  'cinematic lifestyle — wide angle, film color grade, golden hour, one subject in intentional environment',
  'product hero — subject centered or offset, clean complementary background, sharp detail, premium studio lighting',
  'soft neutral aesthetic — one clear object or scene, muted warm tones, gentle shadows, serene and purposeful',
  'modern tech — one element as hero, dark or light background, precise composition, glowing accents',
  'collage / layered — overlapping elements with clear visual hierarchy, one dominant subject, editorial depth',
  'architectural minimal — clean lines, one strong subject, intentional negative space as part of the scene',
  'bold editorial — strong contrast, one unmistakable focal point, graphic yet real, premium brand feel',
  'warm documentary — natural light, candid angles, real textures, slightly desaturated, authentic and raw',
  'high fashion — dramatic compositions, strong shadows, color blocking, editorial perfection',
];

const FORMAT_TYPES = ['text_first', 'ui_product', 'graphic_3d', 'realistic_photo', 'editorial_poster', 'minimal_concept'];
const COMPOSITIONS = ['centered', 'left_subject', 'right_subject', 'full_bleed', 'split', 'asymmetric_editorial', 'overhead', 'macro_closeup'];
const TEXT_DENSITIES = ['heavy', 'light', 'none'];
const CONTENT_TYPE_LIST = ['ui_product', 'people_lifestyle', 'product_object', 'interior_space', 'abstract_conceptual', 'process_journey', 'data_stats', 'editorial_typography'];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: BRAND ANALYSIS (Universal — no hardcoded brand logic)
// ═══════════════════════════════════════════════════════════════════════════════

function classifyBrandArchetype(industry: string, description: string, visualNotes: string): BrandStyle {
  const text = `${industry} ${description} ${visualNotes}`.toLowerCase();

  // Score-based classification — each archetype gets scored by keyword matches
  const archetypes: Record<string, { keywords: RegExp; colorTendency: string; visualIdentity: string; compositionStyle: string; emotionalSignature: string; temperature: string; preferredAngles: string[]; avoidAngles: string[] }> = {
    'saas_tech': {
      keywords: /saas|software|tech|app\b|platform|api|cloud|ai\b|artificial|startup|devtool|developer|analytics|automation|dashboard|crm|erp/,
      colorTendency: 'cool blues, purples, or brand-specific',
      visualIdentity: 'clean, precise, product-focused',
      compositionStyle: 'geometric, minimal, precise',
      emotionalSignature: 'professional, innovative, trustworthy',
      temperature: 'cool',
      preferredAngles: ['product_hero', 'product_in_use', 'abstract_3d', 'gradient_atmosphere', 'data_social_proof'],
      avoidAngles: ['lifestyle_moment', 'macro_detail'],
    },
    'ecommerce_product': {
      keywords: /shop|store|ecommerce|e-commerce|retail|fashion|clothing|jewelry|beauty|cosmetic|skincare|accessories|brand|luxury|boutique/,
      colorTendency: 'brand-driven, often warm or luxurious',
      visualIdentity: 'product-centric, aspirational, editorial',
      compositionStyle: 'product-hero, lifestyle, editorial',
      emotionalSignature: 'aspirational, desirable, premium',
      temperature: 'warm-to-neutral',
      preferredAngles: ['product_hero', 'lifestyle_moment', 'macro_detail', 'overhead_flatlay', 'film_still'],
      avoidAngles: ['abstract_3d', 'data_social_proof'],
    },
    'creative_agency': {
      keywords: /agency|creative|design|branding|marketing|studio|media|advertising|digital agency|production/,
      colorTendency: 'bold, high-contrast, or refined',
      visualIdentity: 'experimental, editorial, conceptual',
      compositionStyle: 'asymmetric, bold, editorial',
      emotionalSignature: 'bold, creative, confident',
      temperature: 'dynamic',
      preferredAngles: ['typography_editorial', 'duality_contrast', 'portal_window', 'film_still', 'motion_energy'],
      avoidAngles: ['data_social_proof'],
    },
    'health_wellness': {
      keywords: /health|wellness|fitness|yoga|meditation|nutrition|organic|natural|supplement|mental health|therapy|mindful/,
      colorTendency: 'natural greens, warm earth tones, soft pastels',
      visualIdentity: 'natural, serene, human-centered',
      compositionStyle: 'natural, open, breathing room',
      emotionalSignature: 'calm, nurturing, trustworthy',
      temperature: 'warm',
      preferredAngles: ['lifestyle_moment', 'environmental_portrait', 'motion_energy', 'macro_detail'],
      avoidAngles: ['abstract_3d', 'data_social_proof', 'typography_editorial'],
    },
    'education_learning': {
      keywords: /education|learning|course|training|school|university|teach|tutoring|online course|academy|bootcamp|skill/,
      colorTendency: 'warm, approachable, professional',
      visualIdentity: 'clear, approachable, inspiring',
      compositionStyle: 'structured, clear, warm',
      emotionalSignature: 'inspiring, supportive, trustworthy',
      temperature: 'warm',
      preferredAngles: ['product_in_use', 'process_journey', 'environmental_portrait', 'lifestyle_moment', 'data_social_proof'],
      avoidAngles: ['gradient_atmosphere', 'portal_window'],
    },
    'finance_professional': {
      keywords: /finance|banking|invest|insurance|accounting|legal|consult|advisory|wealth|fintech|payment|crypto/,
      colorTendency: 'dark navy, deep green, gold accents',
      visualIdentity: 'precise, premium, authoritative',
      compositionStyle: 'structured, premium, confident',
      emotionalSignature: 'trustworthy, authoritative, premium',
      temperature: 'cool',
      preferredAngles: ['typography_editorial', 'gradient_atmosphere', 'data_social_proof', 'product_hero'],
      avoidAngles: ['lifestyle_moment', 'motion_energy'],
    },
    'food_hospitality': {
      keywords: /food|restaurant|cafe|coffee|bakery|hotel|hospitality|travel|tourism|dining|chef|recipe|catering/,
      colorTendency: 'warm, appetizing, rich',
      visualIdentity: 'sensory, warm, inviting',
      compositionStyle: 'lifestyle, overhead, macro',
      emotionalSignature: 'inviting, sensory, warm',
      temperature: 'warm',
      preferredAngles: ['macro_detail', 'overhead_flatlay', 'lifestyle_moment', 'environmental_portrait', 'film_still'],
      avoidAngles: ['abstract_3d', 'data_social_proof', 'typography_editorial'],
    },
    'interior_architecture': {
      keywords: /interior|furniture|home|decor|architect|real estate|property|renovation|landscape|construction/,
      colorTendency: 'warm neutrals, earthy, refined',
      visualIdentity: 'editorial, spatial, atmospheric',
      compositionStyle: 'architectural, editorial, spacious',
      emotionalSignature: 'aspirational, refined, warm',
      temperature: 'warm-neutral',
      preferredAngles: ['lifestyle_moment', 'before_after', 'macro_detail', 'film_still', 'environmental_portrait'],
      avoidAngles: ['abstract_3d', 'data_social_proof'],
    },
    'lifestyle_consumer': {
      keywords: /lifestyle|blog|travel|social|community|subscription|membership|content|creator|influencer|personal brand/,
      colorTendency: 'vibrant or curated pastels',
      visualIdentity: 'lifestyle, authentic, curated',
      compositionStyle: 'candid, warm, editorial',
      emotionalSignature: 'relatable, aspirational, authentic',
      temperature: 'warm',
      preferredAngles: ['lifestyle_moment', 'environmental_portrait', 'film_still', 'motion_energy', 'overhead_flatlay'],
      avoidAngles: ['data_social_proof', 'gradient_atmosphere'],
    },
  };

  // Score each archetype
  let bestArchetype = 'general';
  let bestScore = 0;
  for (const [key, config] of Object.entries(archetypes)) {
    const matches = text.match(config.keywords);
    const score = matches ? matches.length : 0;
    if (score > bestScore) {
      bestScore = score;
      bestArchetype = key;
    }
  }

  if (bestScore === 0) {
    return {
      archetype: 'general',
      colorTendency: 'brand-driven',
      visualIdentity: 'adaptable, clean',
      compositionStyle: 'balanced, clean, intentional',
      emotionalSignature: 'professional, clear',
      temperature: 'neutral',
      preferredAngles: [],
      avoidAngles: [],
    };
  }

  const matched = archetypes[bestArchetype];
  return {
    archetype: bestArchetype,
    colorTendency: matched.colorTendency,
    visualIdentity: matched.visualIdentity,
    compositionStyle: matched.compositionStyle,
    emotionalSignature: matched.emotionalSignature,
    temperature: matched.temperature,
    preferredAngles: matched.preferredAngles,
    avoidAngles: matched.avoidAngles,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: FEATURE EMBEDDING & SIMILARITY
// ═══════════════════════════════════════════════════════════════════════════════

function buildFeatureVector(decision: CreativeDecision): number[] {
  const vector: number[] = [];

  // One-hot encode format (6 dims)
  for (const f of FORMAT_TYPES) vector.push(decision.format === f ? 1 : 0);
  // One-hot encode visualType (2 dims)
  vector.push(decision.visualType === 'realistic' ? 1 : 0);
  vector.push(decision.visualType === 'graphic' ? 1 : 0);
  // One-hot encode composition (8 dims)
  for (const c of COMPOSITIONS) vector.push(decision.composition === c ? 1 : 0);
  // One-hot encode textDensity (3 dims)
  for (const t of TEXT_DENSITIES) vector.push(decision.textDensity === t ? 1 : 0);
  // One-hot encode contentType (8 dims)
  for (const ct of CONTENT_TYPE_LIST) vector.push(decision.contentType === ct ? 1 : 0);
  // Angle as normalized index (1 dim)
  const angleIdx = CONTENT_ANGLES.findIndex(a => a.id === decision.angleId);
  vector.push(angleIdx >= 0 ? angleIdx / CONTENT_ANGLES.length : 0.5);

  return vector;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function isTooSimilar(newVec: number[], existingVecs: number[][], threshold = 0.88): boolean {
  for (const existing of existingVecs) {
    if (cosineSimilarity(newVec, existing) > threshold) return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: VARIATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

interface VariationState {
  usedAngleIds: string[];
  usedFormats: string[];
  usedCompositions: string[];
  usedVisualTypes: string[];
  usedContentTypes: string[];
  featureVectors: number[][];
}

function buildVariationState(existingAssets: any[]): VariationState {
  const state: VariationState = {
    usedAngleIds: [],
    usedFormats: [],
    usedCompositions: [],
    usedVisualTypes: [],
    usedContentTypes: [],
    featureVectors: [],
  };

  for (const asset of existingAssets) {
    if (!asset.style_features) continue;
    const features = typeof asset.style_features === 'string'
      ? JSON.parse(asset.style_features)
      : asset.style_features;

    if (features.angleId) state.usedAngleIds.push(features.angleId);
    if (features.format) state.usedFormats.push(features.format);
    if (features.composition) state.usedCompositions.push(features.composition);
    if (features.visualType) state.usedVisualTypes.push(features.visualType);
    if (features.contentType) state.usedContentTypes.push(features.contentType);
    if (features.featureVector) state.featureVectors.push(features.featureVector);
  }

  return state;
}

function selectAngle(
  variationState: VariationState,
  brandStyle: BrandStyle,
  creativeIntent: string | null,
  assetIndex: number,
  campaignSeed: number,
  brandPrefs: any
): { angle: typeof CONTENT_ANGLES[0]; angleIndex: number } {
  let candidates = [...CONTENT_ANGLES];

  // 1. Remove avoided angles for this brand archetype
  if (brandStyle.avoidAngles.length > 0) {
    candidates = candidates.filter(a => !brandStyle.avoidAngles.includes(a.id));
  }

  // 2. Apply creative intent filter if specified
  const intentAngleMap: Record<string, string[]> = {
    'product': ['product_hero', 'product_in_use', 'overhead_flatlay', 'macro_detail', 'before_after'],
    'lifestyle': ['lifestyle_moment', 'environmental_portrait', 'film_still', 'motion_energy'],
    'editorial': ['typography_editorial', 'duality_contrast', 'gradient_atmosphere', 'portal_window'],
    'data': ['data_social_proof', 'typography_editorial', 'gradient_atmosphere', 'process_journey'],
    'abstract': ['abstract_3d', 'gradient_atmosphere', 'portal_window', 'duality_contrast', 'motion_energy'],
  };

  if (creativeIntent && creativeIntent !== 'auto' && intentAngleMap[creativeIntent]) {
    const preferredIds = intentAngleMap[creativeIntent];
    candidates.sort((a, b) => {
      const aP = preferredIds.includes(a.id) ? 0 : 1;
      const bP = preferredIds.includes(b.id) ? 0 : 1;
      return aP - bP;
    });
  } else if (brandStyle.preferredAngles.length > 0) {
    // Sort preferred angles to front
    candidates.sort((a, b) => {
      const aIdx = brandStyle.preferredAngles.indexOf(a.id);
      const bIdx = brandStyle.preferredAngles.indexOf(b.id);
      if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
      if (aIdx >= 0) return -1;
      if (bIdx >= 0) return 1;
      return 0;
    });
  }

  // 3. Deprioritize already-used angles for diversity
  if (variationState.usedAngleIds.length > 0) {
    const usedCounts: Record<string, number> = {};
    variationState.usedAngleIds.forEach(id => { usedCounts[id] = (usedCounts[id] || 0) + 1; });
    candidates.sort((a, b) => {
      return (usedCounts[a.id] || 0) - (usedCounts[b.id] || 0);
    });
  }

  // 4. Apply brand preference weighting (70% preference, 30% exploration)
  const anglePrefs = brandPrefs?.angles || {};
  if (Object.keys(anglePrefs).length > 0 && Math.random() > 0.3) {
    candidates.sort((a, b) => {
      const aScore = anglePrefs[a.id]?.score || 0;
      const bScore = anglePrefs[b.id]?.score || 0;
      return bScore - aScore; // higher score first
    });
  }

  // 5. Pick using deterministic rotation among top candidates
  const topN = Math.min(candidates.length, 6);
  const idx = (assetIndex + campaignSeed) % topN;
  const angle = candidates[idx];
  const angleIndex = CONTENT_ANGLES.findIndex(a => a.id === angle.id);

  return { angle, angleIndex };
}

function selectCreativeDecision(
  angle: typeof CONTENT_ANGLES[0],
  angleIndex: number,
  variationState: VariationState,
  brandStyle: BrandStyle,
  forcedVisualStyle: string | null,
  assetIndex: number,
  campaignSeed: number,
  brandPrefs: any
): CreativeDecision {
  // Select format — avoid repeats, prefer unused
  const formatPicker = (seed: number) => {
    const unused = FORMAT_TYPES.filter(f => !variationState.usedFormats.includes(f));
    const pool = unused.length > 0 ? unused : FORMAT_TYPES;
    return pool[seed % pool.length];
  };

  // Select composition — avoid repeats
  const compositionPicker = (seed: number) => {
    const unused = COMPOSITIONS.filter(c => !variationState.usedCompositions.includes(c));
    const pool = unused.length > 0 ? unused : COMPOSITIONS;
    return pool[seed % pool.length];
  };

  // Select text density — based on angle and content type
  const textDensityPicker = () => {
    if (angle.id === 'typography_editorial') return 'heavy';
    if (angle.id === 'data_social_proof') return 'light';
    if (['macro_detail', 'film_still', 'motion_energy'].includes(angle.id)) return 'none';
    // Avoid repeating the same density
    const densityCounts: Record<string, number> = {};
    variationState.usedContentTypes.forEach(t => { densityCounts[t] = (densityCounts[t] || 0) + 1; });
    const unused = TEXT_DENSITIES.filter(d => !variationState.usedFormats.includes(d));
    return unused.length > 0 ? unused[(assetIndex + campaignSeed) % unused.length] : TEXT_DENSITIES[(assetIndex + campaignSeed) % TEXT_DENSITIES.length];
  };

  const visualType = forcedVisualStyle || (angle.contentType === 'abstract_conceptual' || angle.contentType === 'editorial_typography' || angle.contentType === 'data_stats' ? 'graphic' : 'realistic');

  const format = formatPicker(assetIndex * 7 + campaignSeed);
  const composition = compositionPicker(assetIndex * 11 + campaignSeed + 3);
  const textDensity = textDensityPicker();

  const visualStyleIdx = (assetIndex * 3 + campaignSeed + 1) % VISUAL_STYLES.length;

  return {
    angleId: angle.id,
    angleName: angle.name,
    format,
    visualType,
    composition,
    textDensity,
    contentType: angle.contentType,
    focalPoint: '', // Filled by LLM
    sceneDescription: '', // Filled by LLM
    negativeSpaceStrategy: '', // Filled by LLM
    visualStyle: VISUAL_STYLES[visualStyleIdx],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

function buildCreativeDirectionPrompt(
  brand: any,
  campaign: any,
  postContent: string | null,
  decision: CreativeDecision,
  angle: typeof CONTENT_ANGLES[0],
  brandStyle: BrandStyle,
  formatInstruction: string,
  forcedVisualStyle: string | null,
  creativeIntent: string | null,
): string {
  const brandColors = brand?.brand_colors?.join(', ') || 'inferred from brand identity';
  const primaryColor = brand?.brand_colors?.[0] || 'inferred from brand';

  const postSection = postContent ? `
POST / CAPTION PROVIDED BY USER:
"${postContent}"

CRITICAL — POST CONTENT ANALYSIS (do this BEFORE anything else):
1. Extract the CORE MESSAGE — what is the user really communicating? (1 sentence)
2. Identify the EMOTIONAL TONE — inspiring? urgent? playful? authoritative? warm? provocative?
3. Determine the VALUE PROPOSITION — what benefit or promise is embedded?
4. Choose VISUAL TRANSLATION STRATEGY:
   - LITERAL: show the actual thing described
   - METAPHORICAL: represent the feeling or concept through analogy
   - CONTEXTUAL: show the world/environment the message lives in
   - PRODUCT-LED: product/service as hero, message implied by context
   - ABSTRACT: emotional/conceptual visualization of the idea
5. Decide: should TEXT be the visual hero, or should the IMAGE carry the meaning?
6. The final image must FEEL like this post when you look at it — not just illustrate random words.

DO NOT just pick keywords from the post and describe them as a scene.
TRANSLATE the meaning into a visual a creative director would approve.` : '';

  return `You are a world-class creative director at a top global agency.
You create premium, visually stunning marketing assets that feel intentional, not generated.

YOU MUST COMPLETE ALL STEPS BEFORE WRITING THE IMAGE PROMPT.

═══ BRAND ═══
- Name: ${brand?.brand_name || 'Unknown Brand'}
- Website: ${brand?.url || ''}
- Instagram: ${brand?.social_instagram || ''}
- Facebook: ${brand?.social_facebook || ''}
- LinkedIn: ${brand?.social_linkedin || ''}
- Description: ${brand?.description || 'Not available'}
- Industry: ${brand?.industry || 'Unknown'}
- Target Audience: ${brand?.target_audience || 'General'}
- Tone of Voice: ${brand?.tone_of_voice || 'professional'}
- Brand Colors: ${brandColors}
- Primary Color: ${primaryColor}
- Visual Style Notes: ${brand?.visual_style_notes || 'not available'}
- Brand Archetype: ${brandStyle.archetype}
- Visual Identity: ${brandStyle.visualIdentity}
- Color Tendency: ${brandStyle.colorTendency}
- Emotional Signature: ${brandStyle.emotionalSignature}
- Temperature: ${brandStyle.temperature}

═══ CAMPAIGN ═══
- Title: ${campaign?.title || ''}
- Strategy: ${campaign?.strategy_angle || ''}
- Key Message: ${campaign?.key_message || ''}
- Visual Direction: ${campaign?.visual_direction || ''}

═══ ASSET BRIEF ═══
${postSection}
- Creative Intent: ${creativeIntent || 'auto'}${creativeIntent && creativeIntent !== 'auto' ? ` (user explicitly chose ${creativeIntent}-focused creative)` : ''}
- Content Angle: ${angle.name} — ${angle.concept}
- Visual Focus: ${angle.visualFocus}
- Mood: ${angle.moodKeywords}
- Forbidden: ${angle.forbid}
- Platform Format: ${formatInstruction}

═══ PRE-DECIDED CREATIVE PARAMETERS (you must use these) ═══
- Visual Type: ${forcedVisualStyle ? forcedVisualStyle.toUpperCase() + ' (user forced)' : decision.visualType.toUpperCase() + ' (system selected)'}
- Composition: ${decision.composition}
- Text Density: ${decision.textDensity}
- Content Type: ${decision.contentType}
- Format Approach: ${decision.format}
- Visual Style: ${decision.visualStyle}

═══ STEP 1: BRAND ANALYSIS ═══

Analyze this specific brand. What makes it UNIQUE? Consider:
1. Visual identity — is it photographic, graphic, illustrative, or mixed?
2. Color DNA — dominant colors, warm vs cool, saturated vs muted
3. Content patterns — what type of imagery fits this brand?
4. Emotional tone — premium / playful / technical / warm / bold / minimal?
5. Brand temperature — warm inviting OR cool precise OR something specific?

CRITICAL: Adapt to THIS brand. Do NOT apply a generic aesthetic.
A ${brandStyle.temperature} ${brandStyle.archetype} brand needs ${brandStyle.compositionStyle} compositions.

═══ STEP 2: BRAND RULES (write 6-10 specific rules) ═══

Convert your analysis into strict rules. Format:
- NEVER use [X] — because this brand is [Y]
- ALWAYS prefer [Z] — because the brand identity is [W]
- Colors must be [specific guidance]
- Compositions should [specific guidance]
- Photography/graphics should feel [specific guidance]

All rules MUST come from the actual brand analysis. NOT generic "clean aesthetic".

═══ STEP 3: SCENE DESIGN ═══

Design the exact scene for the image:
1. FOCAL POINT: What is the single most important element? Be specific.
2. SCENE: Describe the full scene — setting, lighting, perspective, atmosphere
3. NEGATIVE SPACE: Where will breathing room be? What creates it?
   - Must be INSIDE the image through natural composition
   - Examples: clean wall behind subject, soft bokeh, open sky, empty surface, gradient light
   - NEVER add frames, cards, boxes, or external margins
   - Think like a photographer composing a magazine cover
4. VALIDATE: Does this match the brand rules from Step 2?

═══ STEP 4: GENERATE ═══

Write the final image prompt based on ALL decisions above.

COMPOSITION MANDATE:
- Subject to ONE SIDE, opposite side naturally open
- Negative space from real scene elements (wall, blur, sky, surface)
- ONE clear focal point — never a collage
- Intentional placement, lighting, framing
- "Minimal" = clean and purposeful, NOT empty or meaningless

${decision.visualType === 'graphic' ? `GRAPHIC STYLE MANDATE:
- Pick ONE unexpected direction that fits THIS brand specifically
- Options: floating 3D mockup, abstract material composition, isometric illustration,
  cinematic split (half photo/half graphic), data visualization as sculpture,
  surreal brand scene, exploded view, gradient + focal object, blueprint aesthetic
- Must be PREMIUM, PRECISE, and BRAND-AUTHENTIC
- ONE clear hero element — never random shapes
- Reference quality: Stripe, Apple, Linear, Figma campaigns
- NEVER: cartoon, clipart, flat generic illustration, random abstract geometry` : ''}

${decision.visualType === 'realistic' ? `REALISTIC STYLE MANDATE:
- Natural or studio lighting appropriate to this brand
- Premium scenes with clear subject and sense of place
- Tone matches brand temperature: ${brandStyle.temperature}
- Always: a person, product, space, or meaningful scene
- Never: blurry abstract, generic stock, AI-generated poster feel` : ''}

${decision.textDensity === 'heavy' ? `TEXT-HEAVY LAYOUT:
- 40-50% of image is intentional negative space for text overlay
- Subject positioned to leave clean, open area
- Open area must be natural (wall, sky, surface, gradient) — NOT a box or frame` : ''}

ABSOLUTE FORBIDDEN:
- Text, words, labels, or captions rendered in the image
- Editor UI, canvas borders, toolbars, chrome
- Mixing graphic + realistic in one image
- Screenshot-inside-poster or image-on-card layout
- Image pasted onto a larger background/canvas
- Generic AI poster or stock photo feel
- Crowded backgrounds with no breathing room
- ${angle.forbid}

Format: ${formatInstruction}

═══ RETURN JSON ═══
1. brand_summary: 2-3 sentence analysis specific to THIS brand (not generic)
2. brand_rules: array of 6-10 rules specific to THIS brand
3. visual_decision: "[Type] [Text Density] [Composition] [Negative Space Strategy]"
4. headline: max 7 words, scroll-stopping, specific to brand message
5. subheadline: 10-14 words supporting headline
6. cta: 2-4 word action text
7. full_caption: social caption with hook, value prop, CTA, 3-5 hashtags
8. image_generation_prompt: complete scene description a photographer could execute
9. focal_point: what is the single main visual element
10. scene_description: brief description of the full scene
11. negative_space_location: where in the image the breathing room is`;
}

function buildImagePrompt(
  creativeDirection: any,
  decision: CreativeDecision,
  angle: typeof CONTENT_ANGLES[0],
  brandColors: string,
  primaryColor: string,
  formatInstruction: string,
  backgroundStyle: string,
  backgroundTone: string,
  brandStyle: BrandStyle,
): string {
  return `${creativeDirection.image_generation_prompt}

VISUAL STYLE: ${decision.visualStyle}
CONTENT ANGLE: ${angle.name} — ${angle.visualFocus}
BRAND PALETTE: ${brandColors} (primary: ${primaryColor})
BRAND TEMPERATURE: ${brandStyle.temperature}
FORMAT: ${formatInstruction}

COMPOSITION RULES — NON-NEGOTIABLE:
- Empty space for text MUST BE PART OF THE IMAGE — natural composition, not added frames
- Subject to ONE SIDE, opposite side naturally open (wall, blur, sky, surface, gradient)
- Think editorial photographer composing magazine cover
- NEVER split image into "photo box + text box"
- NEVER add external margins, cards, frames, or canvas layouts
- Result must look like a real photograph or premium graphic — not a template

BACKGROUND:
${backgroundStyle === 'none' ? 'ISOLATED: Pure white or transparent. No scene. Subject alone.' : backgroundStyle === 'minimal' ? 'MINIMAL: Soft, clean, neutral. Solid color or subtle gradient. No busy environment.' : 'FULL: Rich environment fills the frame. Subject exists within a real, atmospheric place.'}

TONE:
${backgroundTone === 'light' ? 'LIGHT: White, cream, off-white, or soft pastel. Bright and airy. NO dark backgrounds.' : backgroundTone === 'dark' ? 'DARK: Deep black, charcoal, navy, or muted dark. Moody and dramatic. NO light backgrounds.' : `BRAND: Background built from brand palette. Dominant: ${primaryColor}. Full: ${brandColors}. Do NOT default to black or white.`}

${decision.visualType === 'graphic' ? `GRAPHIC RENDERING:
- Main subject in sharp 3D perspective
- Realistic shadows for depth
- Background: blurred environment OR rich gradient — not flat solid
- Secondary depth elements at ~30% opacity
- Premium SaaS/brand launch visual quality` : ''}

ABSOLUTE REQUIREMENTS:
- ZERO text, words, labels in the image
- ZERO editor UI, canvas borders, toolbars
- ZERO screenshot-in-poster layout
- ZERO image-pasted-on-background layout
- ZERO generic stock or AI poster feel
- Image must feel: ${angle.moodKeywords}
- Production quality: top-tier brand studio output
- Forbidden: ${angle.forbid}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: QUALITY SCORING
// ═══════════════════════════════════════════════════════════════════════════════

function scoreCreativeDirection(direction: any, brandStyle: BrandStyle): number {
  let score = 50; // baseline

  // Has meaningful brand summary (not generic)
  if (direction.brand_summary && direction.brand_summary.length > 50) score += 10;

  // Has enough brand rules
  if (direction.brand_rules && direction.brand_rules.length >= 6) score += 10;

  // Headline is short enough
  if (direction.headline) {
    const wordCount = direction.headline.split(' ').length;
    if (wordCount <= 7) score += 10;
    if (wordCount > 10) score -= 20;
  }

  // Has image prompt
  if (direction.image_generation_prompt && direction.image_generation_prompt.length > 100) score += 10;

  // Has CTA
  if (direction.cta && direction.cta.split(' ').length <= 4) score += 5;

  // Has caption
  if (direction.full_caption && direction.full_caption.length > 50) score += 5;

  return Math.min(100, Math.max(0, score));
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: MUTATION (for regeneration loop)
// ═══════════════════════════════════════════════════════════════════════════════

function mutateDecision(decision: CreativeDecision, attempt: number): CreativeDecision {
  const mutated = { ...decision };

  // Rotate through different mutation strategies
  switch (attempt % 5) {
    case 0:
      mutated.composition = COMPOSITIONS[(COMPOSITIONS.indexOf(decision.composition) + 1) % COMPOSITIONS.length];
      break;
    case 1:
      mutated.visualType = decision.visualType === 'realistic' ? 'graphic' : 'realistic';
      break;
    case 2:
      mutated.contentType = CONTENT_TYPE_LIST[(CONTENT_TYPE_LIST.indexOf(decision.contentType) + 1) % CONTENT_TYPE_LIST.length];
      break;
    case 3:
      mutated.format = FORMAT_TYPES[(FORMAT_TYPES.indexOf(decision.format) + 1) % FORMAT_TYPES.length];
      break;
    case 4:
      mutated.textDensity = TEXT_DENSITIES[(TEXT_DENSITIES.indexOf(decision.textDensity) + 1) % TEXT_DENSITIES.length];
      break;
  }

  return mutated;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: BRAND PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════════

async function loadBrandPreferences(base44: any, brandId: string): Promise<any> {
  try {
    const brands = await base44.asServiceRole.entities.Brand.filter({ id: brandId });
    const brand = brands[0];
    if (brand?.preferences) {
      return typeof brand.preferences === 'string' ? JSON.parse(brand.preferences) : brand.preferences;
    }
  } catch (_) { /* ignore */ }
  return {};
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: MAIN ORCHESTRATION — CreativeEngine.run()
// ═══════════════════════════════════════════════════════════════════════════════

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

async function run(
  base44: any,
  assetId: string,
  option: any,
  campaign: any,
  brand: any,
  postContent: string | null,
  forcedVisualStyle: string | null,
  backgroundStyle: string,
  backgroundTone: string,
  creativeIntent: string | null,
) {
  const assetType = option.asset_type;
  const platform = option.platform;

  const formatInstruction = assetType === 'story' || assetType === 'reel'
    ? 'Vertical 9:16 format. Mobile-first. Top-to-bottom visual flow.'
    : assetType === 'banner'
    ? 'Wide 16:9 horizontal banner. Left-to-right reading flow.'
    : 'Square 1:1 format. Centered or asymmetric composition. Mobile-optimized.';

  const brandColors = brand?.brand_colors?.join(', ') || 'inferred from brand';
  const primaryColor = brand?.brand_colors?.[0] || 'inferred from brand';
  const campaignSeed = hashString((campaign?.id || '') + (brand?.id || ''));

  // ── Step 1: Brand Analysis ─────────────────────────────────────────────────
  const brandStyle = classifyBrandArchetype(
    brand?.industry || '',
    brand?.description || '',
    brand?.visual_style_notes || ''
  );
  console.log(`[Engine] Brand archetype: ${brandStyle.archetype}, temp: ${brandStyle.temperature}`);

  // ── Step 2: Load Variation State ───────────────────────────────────────────
  let existingAssets: any[] = [];
  try {
    existingAssets = await base44.asServiceRole.entities.CampaignAsset.filter({ campaign_id: campaign?.id || '' });
    existingAssets = existingAssets.filter((a: any) => a.id !== assetId);
  } catch (_) { /* ignore */ }

  const variationState = buildVariationState(existingAssets);

  // ── Step 3: Load Brand Preferences ─────────────────────────────────────────
  const brandPrefs = await loadBrandPreferences(base44, brand?.id || '');

  // ── Step 4: Select Angle ───────────────────────────────────────────────────
  const { angle, angleIndex } = selectAngle(
    variationState, brandStyle, creativeIntent,
    existingAssets.length, campaignSeed, brandPrefs
  );
  console.log(`[Engine] Angle: ${angle.name} (idx: ${angleIndex})`);

  // ── Step 5: Create Decision ────────────────────────────────────────────────
  let decision = selectCreativeDecision(
    angle, angleIndex, variationState, brandStyle,
    forcedVisualStyle, existingAssets.length, campaignSeed, brandPrefs
  );

  // ── Step 6: Diversity Check + Regeneration Loop ────────────────────────────
  const MAX_ATTEMPTS = 5;
  let decisionVector = buildFeatureVector(decision);
  let attempt = 0;

  while (isTooSimilar(decisionVector, variationState.featureVectors) && attempt < MAX_ATTEMPTS) {
    attempt++;
    console.log(`[Engine] Decision too similar (attempt ${attempt}), mutating...`);
    decision = mutateDecision(decision, attempt);
    decisionVector = buildFeatureVector(decision);
  }

  console.log(`[Engine] Decision: format=${decision.format}, vis=${decision.visualType}, comp=${decision.composition}, text=${decision.textDensity}, content=${decision.contentType}`);

  // ── Step 7: Creative Direction via LLM ─────────────────────────────────────
  const prompt = buildCreativeDirectionPrompt(
    brand, campaign, postContent, decision, angle,
    brandStyle, formatInstruction, forcedVisualStyle, creativeIntent
  );

  const creativeDirection = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
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
        focal_point: { type: 'string' },
        scene_description: { type: 'string' },
        negative_space_location: { type: 'string' },
      },
      required: ['brand_summary', 'brand_rules', 'visual_decision', 'headline', 'subheadline', 'cta', 'full_caption', 'image_generation_prompt'],
    },
  });

  // ── Step 8: Quality Check ──────────────────────────────────────────────────
  const qualityScore = scoreCreativeDirection(creativeDirection, brandStyle);
  console.log(`[Engine] Quality score: ${qualityScore}/100`);
  console.log(`[Engine] Brand: ${creativeDirection.brand_summary?.slice(0, 80)}...`);
  console.log(`[Engine] Headline: "${creativeDirection.headline}"`);

  // ── Step 9: Image Generation ───────────────────────────────────────────────
  const existingRefs = brand?.image_assets?.length > 0 ? brand.image_assets.slice(0, 2) : undefined;

  const finalPrompt = buildImagePrompt(
    creativeDirection, decision, angle,
    brandColors, primaryColor, formatInstruction,
    backgroundStyle, backgroundTone, brandStyle
  );

  // For product/tech angles, inject real screenshots as reference
  const screenAngles = ['product_in_use', 'process_journey', 'data_social_proof'];
  const useScreenshots = screenAngles.includes(angle.id) && brand?.image_assets?.length > 0;
  const imageRefs = useScreenshots ? brand.image_assets.slice(0, 2) : existingRefs;

  const screenAddition = useScreenshots
    ? '\n\nREFERENCE IMAGES: These are real screenshots of the brand website. Use as screen content on any device. Integrate naturally.'
    : '';

  const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
    prompt: finalPrompt + screenAddition,
    existing_image_urls: imageRefs,
  });

  // ── Step 10: Carousel Extra Slides ─────────────────────────────────────────
  const images = [imageResult.url];
  if (assetType === 'carousel') {
    const usedId = angle.id;
    const carouselAngles = CONTENT_ANGLES
      .filter(a => a.id !== usedId && !brandStyle.avoidAngles.includes(a.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    for (const slideAngle of carouselAngles) {
      const slidePrompt = `${creativeDirection.image_generation_prompt}

Slide ${images.length + 1} of carousel for ${brand?.brand_name || 'the brand'}.
Angle: ${slideAngle.name} — ${slideAngle.visualFocus}
Mood: ${slideAngle.moodKeywords}

BRAND PALETTE: ${brandColors}
FORMAT: ${formatInstruction}
STYLE: ${decision.visualStyle}
BRAND RULES: ${creativeDirection.brand_rules?.join('. ')}

ZERO text. ZERO editor UI. ZERO stock photo feel. ZERO image-on-card layout.
Forbidden: ${slideAngle.forbid}
Production quality. Top-tier brand studio.`;

      const res = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: slidePrompt,
        existing_image_urls: existingRefs,
      });
      images.push(res.url);
    }
  }

  // ── Step 11: Save with Feature Data ────────────────────────────────────────
  const styleFeatures: FeatureVector = {
    format: decision.format,
    visualType: decision.visualType,
    composition: decision.composition,
    textDensity: decision.textDensity,
    contentType: decision.contentType,
    angleId: angle.id,
    angleIndex,
  };

  await base44.asServiceRole.entities.CampaignAsset.update(assetId, {
    headline: creativeDirection.headline,
    ad_copy: creativeDirection.subheadline,
    full_caption: creativeDirection.full_caption,
    cta: creativeDirection.cta,
    visual_prompt: creativeDirection.image_generation_prompt,
    preview_image: images[0],
    carousel_images: assetType === 'carousel' ? images : [],
    status: 'ready',
    style_features: JSON.stringify(styleFeatures),
  });

  console.log(`[Engine] Asset ${assetId} done — ${brandStyle.archetype}/${angle.name}/${decision.format}/${decision.composition}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: HTTP HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

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

  run(base44, assetId, option, campaign, brand, postContent, forcedVisualStyle, backgroundStyle, backgroundTone, creativeIntent)
    .catch(async (error) => {
      console.error('[Engine] Generation failed:', error.message);
      try {
        await base44.asServiceRole.entities.CampaignAsset.update(assetId, { status: 'error' });
      } catch (_) { /* ignore */ }
    });

  return Response.json({ success: true, message: 'Generation started' });
});
