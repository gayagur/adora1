/**
 * Creative Engine Type Definitions & Shared Constants
 * Used by both frontend components and referenced by backend generation.
 */

// ─── Feedback Types ──────────────────────────────────────────────────────────
export const FEEDBACK_ACTIONS = {
  LIKE: 'like',
  DISLIKE: 'dislike',
  SAVE: 'save',
  HIDE: 'hide',
};

// ─── Creative Decision Categories ────────────────────────────────────────────
export const FORMAT_TYPES = ['text_first', 'ui_product', 'graphic_3d', 'realistic_photo', 'editorial_poster', 'minimal_concept'];
export const VISUAL_TYPES = ['realistic', 'graphic'];
export const COMPOSITION_TYPES = ['centered', 'left_subject', 'right_subject', 'full_bleed', 'split', 'asymmetric_editorial', 'overhead', 'macro_closeup'];
export const TEXT_DENSITY = ['heavy', 'light', 'none'];
export const CONTENT_TYPES = ['ui_product', 'people_lifestyle', 'product_object', 'interior_space', 'abstract_conceptual', 'process_journey', 'data_stats', 'editorial_typography'];

// ─── Feature Vector Dimensions (for similarity) ─────────────────────────────
export const FEATURE_DIMENSIONS = {
  format: FORMAT_TYPES,
  visualType: VISUAL_TYPES,
  composition: COMPOSITION_TYPES,
  textDensity: TEXT_DENSITY,
  contentType: CONTENT_TYPES,
};

/**
 * Build a feature vector from creative decisions.
 * Returns a normalized numeric array for cosine similarity.
 */
export function buildFeatureVector(decisions) {
  const vector = [];
  for (const [key, categories] of Object.entries(FEATURE_DIMENSIONS)) {
    for (const cat of categories) {
      vector.push(decisions[key] === cat ? 1 : 0);
    }
  }
  // Add angle index as a continuous feature (normalized to 0-1)
  if (decisions.angleIndex !== undefined) {
    vector.push(decisions.angleIndex / 16);
  }
  return vector;
}

/**
 * Cosine similarity between two feature vectors.
 */
export function cosineSimilarity(a, b) {
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

/**
 * Check if a new feature vector is too similar to any existing ones.
 * @param {number[]} newVector
 * @param {number[][]} existingVectors
 * @param {number} threshold - default 0.88
 * @returns {boolean} true if too similar (should reject)
 */
export function isTooSimilar(newVector, existingVectors, threshold = 0.88) {
  for (const existing of existingVectors) {
    if (cosineSimilarity(newVector, existing) > threshold) {
      return true;
    }
  }
  return false;
}

// ─── Brand Preference Defaults ───────────────────────────────────────────────
export function createEmptyPreferences() {
  return {
    formats: {},
    angles: {},
    visualTypes: {},
    compositions: {},
    contentTypes: {},
    textDensities: {},
  };
}

export function updatePreference(prefs, category, key, isPositive) {
  if (!prefs[category]) prefs[category] = {};
  if (!prefs[category][key]) {
    prefs[category][key] = { score: 0, likes: 0, dislikes: 0 };
  }
  const entry = prefs[category][key];
  if (isPositive) {
    entry.likes += 1;
    entry.score += 1;
  } else {
    entry.dislikes += 1;
    entry.score -= 1;
  }
  return prefs;
}

/**
 * Weighted random selection that blends preference scores with exploration.
 * @param {string[]} candidates - list of option keys
 * @param {Object} prefCategory - preference scores object for this category
 * @param {number} explorationRate - 0 to 1, how much randomness (default 0.3)
 * @returns {string} selected key
 */
export function weightedSelect(candidates, prefCategory = {}, explorationRate = 0.3) {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Random exploration
  if (Math.random() < explorationRate) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Preference-weighted selection
  const weights = candidates.map(key => {
    const pref = prefCategory[key];
    if (!pref) return 1; // neutral
    return Math.max(0.1, 1 + pref.score * 0.5); // bias by score, floor at 0.1
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;
  for (let i = 0; i < candidates.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}
