import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ACCESS_KEY = Deno.env.get('SCREENSHOTONE_ACCESS_KEY');

const SECTIONS = [
  { label: 'Hero',         scroll_to: 0,    full_page: false },
  { label: 'Product',      scroll_to: 800,  full_page: false },
  { label: 'Features',     scroll_to: 1600, full_page: false },
  { label: 'Social Proof', scroll_to: 2400, full_page: false },
  { label: 'Full Page',    scroll_to: 0,    full_page: true  },
];

function buildScreenshotUrl(url, options = {}) {
  const params = new URLSearchParams({
    access_key: ACCESS_KEY,
    url,
    format: 'jpg',
    image_quality: '85',
    viewport_width: '1440',
    viewport_height: '900',
    block_ads: 'true',
    block_cookie_banners: 'true',
    block_trackers: 'true',
    delay: '3',
    timeout: '40',
  });

  if (options.full_page) {
    params.set('full_page', 'true');
  } else if (options.scroll_to > 0) {
    params.set('scroll_into_view_adjust_top', '0');
    params.set('scroll_to', String(options.scroll_to));
  }

  return `https://api.screenshotone.com/take?${params.toString()}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Capture all sections in parallel
    const results = await Promise.all(
      SECTIONS.map(async (section) => {
        try {
          const screenshotUrl = buildScreenshotUrl(url, {
            full_page: section.full_page,
            scroll_to: section.scroll_to,
          });

          // Fetch the screenshot binary
          const imgResponse = await fetch(screenshotUrl);
          if (!imgResponse.ok) {
            const errorText = await imgResponse.text();
            console.error(`Failed to capture ${section.label}: ${imgResponse.status} ${errorText}`);
            return { section: section.label, image_url: null, error: errorText };
          }

          const blob = await imgResponse.blob();
          const file = new File([blob], `screenshot-${section.label.toLowerCase().replace(/\s+/g, '-')}.jpg`, { type: 'image/jpeg' });

          // Upload to storage
          const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({ file });

          return { section: section.label, image_url: uploaded.file_url };
        } catch (err) {
          console.error(`Error capturing ${section.label}:`, err.message);
          return { section: section.label, image_url: null, error: err.message };
        }
      })
    );

    return Response.json({ screenshots: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});