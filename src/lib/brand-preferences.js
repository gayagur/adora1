/**
 * Brand Preference Management
 * Handles reading/writing brand-level learning from user feedback.
 */
import { base44 } from '@/api/base44Client';
import { createEmptyPreferences, updatePreference } from './creative-types';

/**
 * Load preferences for a brand. Returns default if none exist.
 */
export async function loadBrandPreferences(brandId) {
  try {
    const brands = await base44.entities.Brand.filter({ id: brandId });
    const brand = brands[0];
    if (brand?.preferences) {
      return typeof brand.preferences === 'string'
        ? JSON.parse(brand.preferences)
        : brand.preferences;
    }
  } catch (_) { /* ignore */ }
  return createEmptyPreferences();
}

/**
 * Save preferences to the brand entity.
 */
export async function saveBrandPreferences(brandId, preferences) {
  try {
    await base44.entities.Brand.update(brandId, {
      preferences: JSON.stringify(preferences),
    });
  } catch (e) {
    console.error('Failed to save brand preferences:', e);
  }
}

/**
 * Record feedback for an asset and update brand preferences.
 * @param {string} brandId
 * @param {Object} asset - the CampaignAsset object
 * @param {'like'|'dislike'|'save'|'hide'|null} action - null means cleared
 */
export async function recordFeedback(brandId, asset, action) {
  // Update asset feedback field — set to empty string if null (clearing feedback)
  try {
    await base44.entities.CampaignAsset.update(asset.id, {
      feedback: action || '',
    });
  } catch (e) {
    console.error('Failed to update asset feedback:', e);
    return;
  }

  // Only update brand preferences for meaningful actions
  const isPositive = action === 'like' || action === 'save';
  const isNegative = action === 'dislike' || action === 'hide';
  if (!isPositive && !isNegative) return;

  try {
    // Load and update brand preferences
    const prefs = await loadBrandPreferences(brandId);

    // Extract features from asset (may not exist on older assets)
    let features = {};
    try {
      features = asset.style_features
        ? (typeof asset.style_features === 'string' ? JSON.parse(asset.style_features) : asset.style_features)
        : {};
    } catch (_) { /* ignore parse errors */ }

    if (features.format) updatePreference(prefs, 'formats', features.format, isPositive);
    if (features.angleId) updatePreference(prefs, 'angles', features.angleId, isPositive);
    if (features.visualType) updatePreference(prefs, 'visualTypes', features.visualType, isPositive);
    if (features.composition) updatePreference(prefs, 'compositions', features.composition, isPositive);
    if (features.contentType) updatePreference(prefs, 'contentTypes', features.contentType, isPositive);
    if (features.textDensity) updatePreference(prefs, 'textDensities', features.textDensity, isPositive);

    await saveBrandPreferences(brandId, prefs);
  } catch (e) {
    console.error('Failed to update brand preferences:', e);
  }
}
