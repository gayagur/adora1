// Professional layout templates with design constraints
// All positions in % of canvas, respecting grid and safe areas

const GRID = {
  columns: 12,
  safeMargin: 10, // % from edges
  gutter: 2,      // % between columns
};

const SAFE_AREA = {
  top: GRID.safeMargin,
  left: GRID.safeMargin,
  right: 100 - GRID.safeMargin,
  bottom: 100 - GRID.safeMargin,
  width: 80,
  height: 80,
};

// Convert grid column to percentage
const colToPercent = (col) => GRID.safeMargin + (col * 100) / GRID.columns;
const colWidth = (cols) => (cols * 100) / GRID.columns;

export const LAYOUT_TEMPLATES = {
  hero: {
    name: 'Hero',
    description: 'Screenshot top, headline bottom',
    constraints: {
      image: { minWidth: 70, maxWidth: 90, minHeight: 50, maxHeight: 70 },
      headline: { minFontSize: 32, maxFontSize: 56, maxWords: 7 },
      subtext: { minFontSize: 14, maxFontSize: 18, maxWords: 20 },
    },
    defaults: {
      image: { x: 50, y: 8, width: 80, height: 60, centered: true },
      headline: { x: 10, y: 70, width: 80, fontSize: 44, wordLimit: 6 },
      subtext: { x: 10, y: 80, width: 75, fontSize: 16, wordLimit: 15 },
      cta: { x: 10, y: 90, fontSize: 14 },
      logo: { x: 10, y: 5, size: 8, position: 'top-left' },
    },
    rules: [
      'Image fills top 60-70% of canvas',
      'Headline always at bottom, bold and large',
      'Logo top-left corner',
      'Safe spacing maintained everywhere',
      'No text overlays on image',
    ],
  },

  split: {
    name: 'Split',
    description: 'Text left, image right',
    constraints: {
      image: { minWidth: 40, maxWidth: 50, minHeight: 70, maxHeight: 90 },
      headline: { minFontSize: 28, maxFontSize: 44, maxWords: 8 },
      subtext: { minFontSize: 13, maxFontSize: 16, maxWords: 25 },
    },
    defaults: {
      headline: { x: 10, y: 25, width: 38, fontSize: 40, wordLimit: 7 },
      subtext: { x: 10, y: 45, width: 35, fontSize: 15, wordLimit: 20 },
      cta: { x: 10, y: 70, fontSize: 14 },
      image: { x: 52, y: 10, width: 38, height: 80, rounded: true, shadow: true },
      logo: { x: 10, y: 5, size: 7, position: 'top-left' },
    },
    rules: [
      'Text occupies left 40%, image right 40%',
      '10% margins on both sides',
      'Image has rounded corners and shadow',
      'Headline and subtext stack vertically',
      'CTA button below text',
    ],
  },

  centered: {
    name: 'Centered Product',
    description: 'Image center, text around it',
    constraints: {
      image: { minWidth: 50, maxWidth: 70, minHeight: 50, maxHeight: 70 },
      headline: { minFontSize: 36, maxFontSize: 52, maxWords: 6 },
      subtext: { minFontSize: 14, maxFontSize: 17, maxWords: 18 },
    },
    defaults: {
      image: { x: 15, y: 20, width: 70, height: 55, centered: true, rounded: true, shadow: true },
      headline: { x: 50, y: 8, width: 100, fontSize: 48, wordLimit: 6, centered: true },
      subtext: { x: 50, y: 78, width: 100, fontSize: 16, wordLimit: 15, centered: true },
      cta: { x: 50, y: 88, fontSize: 14, centered: true },
      logo: { x: 5, y: 3, size: 6, position: 'top-left' },
    },
    rules: [
      'Image centered both horizontally and vertically',
      'Headline above image, centered, bold',
      'Subtext below image, centered',
      'CTA at bottom, centered',
      'Symmetrical and balanced composition',
    ],
  },

  story: {
    name: 'Story',
    description: 'Full-screen, vertical focus (9:16)',
    constraints: {
      image: { minWidth: 90, maxWidth: 100, minHeight: 60, maxHeight: 85 },
      headline: { minFontSize: 28, maxFontSize: 40, maxWords: 5 },
      subtext: { minFontSize: 12, maxFontSize: 15, maxWords: 12 },
    },
    defaults: {
      image: { x: 0, y: 10, width: 100, height: 65, fullHeight: true },
      headline: { x: 10, y: 78, width: 80, fontSize: 32, wordLimit: 5 },
      subtext: { x: 10, y: 87, width: 80, fontSize: 13, wordLimit: 10 },
      cta: { x: 50, y: 95, fontSize: 13, centered: true },
      logo: { x: 10, y: 5, size: 7, position: 'top-left' },
    },
    rules: [
      'Full-width image background',
      'Text overlay at bottom with semi-transparent bg',
      'Minimal text, maximum impact',
      'Call-to-action prominent',
      'Safe margins on sides',
    ],
  },
};

export const validateElementPlacement = (element, template, canvas) => {
  const constraints = template.constraints[element.type];
  if (!constraints) return { valid: true };

  const errors = [];

  // Check safe area
  if (element.x < SAFE_AREA.top || element.x + element.width > SAFE_AREA.right) {
    errors.push('Element outside safe area');
  }

  if (element.y < SAFE_AREA.top || element.y + element.height > SAFE_AREA.bottom) {
    errors.push('Element violates vertical safe area');
  }

  // Check constraints
  if (constraints.minWidth && element.width < constraints.minWidth) {
    errors.push(`Minimum width: ${constraints.minWidth}%`);
  }
  if (constraints.maxWidth && element.width > constraints.maxWidth) {
    errors.push(`Maximum width: ${constraints.maxWidth}%`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const getSnapToGrid = (value) => {
  const step = 100 / GRID.columns;
  return Math.round(value / step) * step;
};

export const enforceGridAlignment = (x, y) => {
  return {
    x: getSnapToGrid(x),
    y: getSnapToGrid(y),
  };
};

export const getSafeAreaBounds = () => {
  return SAFE_AREA;
};

export const getTemplateRules = (templateId) => {
  const template = LAYOUT_TEMPLATES[templateId];
  return template ? template.rules : [];
};