/**
 * Badge generation helper.
 *
 * When a site passes a re-audit with an acceptable number of violations,
 * we mint an SVG badge that can be embedded on their site.  This module
 * returns a data: URL for simplicity.  In a real app you might upload
 * the SVG to S3 and return its URL instead.
 */

export async function mintBadge(domain, report) {
  // Basic SVG badge; customize styles as needed
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="80" role="img" aria-label="WCAG badge"><rect width="250" height="80" fill="#1A73E8"/><text x="125" y="45" fill="#fff" font-family="Arial, sans-serif" font-size="18" text-anchor="middle">WCAG 2.2 AA – Partial</text></svg>`;
  // Encode as base64 data URI
  const buffer = Buffer.from(svg);
  const badgeUrl = `data:image/svg+xml;base64,${buffer.toString('base64')}`;
  return badgeUrl;
}