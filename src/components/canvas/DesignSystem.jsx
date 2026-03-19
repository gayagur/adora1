// ─── Premium Design System ────────────────────────────────────────────────────
// Agency-level design tokens and layout presets

export const DESIGN_TOKENS = {
  // Typography scale (strict hierarchy)
  type: {
    display: { size: 80, lineHeight: 0.95, weight: 700, tracking: '-0.03em' },
    headline: { size: 64, lineHeight: 1.0, weight: 700, tracking: '-0.025em' },
    title: { size: 48, lineHeight: 1.1, weight: 700, tracking: '-0.02em' },
    subheadline: { size: 32, lineHeight: 1.2, weight: 500, tracking: '-0.01em' },
    body: { size: 18, lineHeight: 1.6, weight: 400, tracking: '0em' },
    label: { size: 12, lineHeight: 1.4, weight: 600, tracking: '0.08em' },
  },

  // 8px grid spacing
  space: {
    xs: 8, sm: 16, md: 24, lg: 40, xl: 64, '2xl': 96, '3xl': 120,
  },

  // Color palettes
  palettes: {
    light: {
      bg: '#FAFAF8',
      bgAlt: '#F4F3EF',
      surface: '#FFFFFF',
      text: '#0A0A0A',
      textMuted: '#6B6B6B',
      textSubtle: '#9A9A9A',
      border: 'rgba(0,0,0,0.08)',
    },
    dark: {
      bg: '#08080A',
      bgAlt: '#0F0F13',
      surface: '#16161A',
      text: '#F8F8F6',
      textMuted: '#9A9A9A',
      textSubtle: '#5A5A5A',
      border: 'rgba(255,255,255,0.08)',
    },
  },

  // Allowed fonts
  fonts: {
    sora: "'Sora', sans-serif",
    manrope: "'Manrope', sans-serif",
    jakarta: "'Plus Jakarta Sans', sans-serif",
    dmSans: "'DM Sans', sans-serif",
    inter: "'Inter', sans-serif",
    playfair: "'Playfair Display', serif",
  },
};

// ─── Layout Presets ────────────────────────────────────────────────────────────
export const LAYOUT_PRESETS = {
  hero: {
    id: 'hero',
    name: 'Hero',
    description: 'Bold headline + visual right',
    icon: '◧',
    elements: {
      pill: { x: 8, y: 10, show: true },
      headline: { x: 8, y: 18, width: 48, fontSize: 80 },
      subtext: { x: 8, y: 68, width: 42, fontSize: 20 },
      cta: { x: 8, y: 82 },
      image: { x: 50, y: 0, width: 50 },
    },
    colorMode: 'light',
  },
  split: {
    id: 'split',
    name: 'Split',
    description: 'Text left, visual right',
    icon: '◫',
    elements: {
      pill: { x: 8, y: 8, show: true },
      headline: { x: 8, y: 20, width: 42, fontSize: 64 },
      subtext: { x: 8, y: 66, width: 38, fontSize: 18 },
      cta: { x: 8, y: 82 },
      image: { x: 52, y: 5, width: 44 },
    },
    colorMode: 'light',
  },
  centered: {
    id: 'centered',
    name: 'Centered',
    description: 'Full-bleed, centered composition',
    icon: '◼',
    elements: {
      pill: { x: 50, y: 8, show: true, centered: true },
      headline: { x: 50, y: 22, width: 80, fontSize: 72, centered: true },
      subtext: { x: 50, y: 60, width: 55, fontSize: 20, centered: true },
      cta: { x: 50, y: 76, centered: true },
      image: { x: 10, y: 5, width: 80 },
    },
    colorMode: 'dark',
  },
  device: {
    id: 'device',
    name: 'Device',
    description: 'Screenshot in device mockup',
    icon: '⊡',
    elements: {
      pill: { x: 8, y: 8, show: true },
      headline: { x: 8, y: 20, width: 44, fontSize: 56 },
      subtext: { x: 8, y: 66, width: 40, fontSize: 18 },
      cta: { x: 8, y: 80 },
      image: { x: 48, y: 2, width: 52 },
    },
    colorMode: 'dark',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Typography-first, no image',
    icon: '—',
    elements: {
      pill: { x: 8, y: 10, show: true },
      headline: { x: 8, y: 25, width: 80, fontSize: 96 },
      subtext: { x: 8, y: 75, width: 50, fontSize: 22 },
      cta: { x: 8, y: 88 },
      image: null,
    },
    colorMode: 'light',
  },
};

// ─── Font Presets ──────────────────────────────────────────────────────────────
export const FONT_PRESETS = [
  { id: 'modern', label: 'Modern', headline: "'Sora', sans-serif", body: "'Inter', sans-serif" },
  { id: 'editorial', label: 'Editorial', headline: "'Playfair Display', serif", body: "'DM Sans', sans-serif" },
  { id: 'bold', label: 'Bold', headline: "'Manrope', sans-serif", body: "'Manrope', sans-serif" },
  { id: 'clean', label: 'Clean', headline: "'Plus Jakarta Sans', sans-serif", body: "'Plus Jakarta Sans', sans-serif" },
  { id: 'minimal', label: 'Minimal', headline: "'DM Sans', sans-serif", body: "'DM Sans', sans-serif" },
];

// ─── Aspect Ratios ─────────────────────────────────────────────────────────────
export const ASPECT_RATIOS = [
  { id: 'square', label: 'Square', w: 1080, h: 1080, pad: 100, display: '1:1' },
  { id: 'landscape', label: 'Landscape', w: 1200, h: 628, pad: 52.33, display: '1.9:1' },
  { id: 'story', label: 'Story', w: 1080, h: 1920, pad: 177.78, display: '9:16' },
  { id: '4x5', label: 'Portrait', w: 1080, h: 1350, pad: 125, display: '4:5' },
];

// ─── Google Fonts URL ──────────────────────────────────────────────────────────
export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&display=swap";