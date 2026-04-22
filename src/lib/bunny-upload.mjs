/**
 * Bunny CDN upload helper.
 * Storage zone: conscious-elder
 * Pull zone: https://conscious-elder.b-cdn.net
 * Hostname: ny.storage.bunnycdn.com
 */

const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'conscious-elder';
const BUNNY_API_KEY = process.env.BUNNY_API_KEY || '';
const BUNNY_PULL_ZONE_URL = process.env.BUNNY_PULL_ZONE_URL || 'https://conscious-elder.b-cdn.net';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';

/**
 * Upload a file buffer to Bunny CDN storage.
 * @param {string} remotePath - Path within the storage zone, e.g. 'images/hero-1.webp'
 * @param {Buffer|Uint8Array} buffer - File content
 * @param {string} contentType - MIME type, e.g. 'image/webp'
 * @returns {Promise<string>} - Public CDN URL
 */
export async function uploadToBunny(remotePath, buffer, contentType = 'image/webp') {
  if (!BUNNY_API_KEY) {
    throw new Error('BUNNY_API_KEY not set');
  }

  const url = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${remotePath}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_API_KEY,
      'Content-Type': contentType,
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Bunny upload failed: ${res.status} ${text}`);
  }

  return `${BUNNY_PULL_ZONE_URL}/${remotePath}`;
}

/**
 * Build a Bunny CDN URL for a given path.
 * @param {string} remotePath - Path within the storage zone
 * @returns {string} - Public CDN URL
 */
export function bunnyUrl(remotePath) {
  return `${BUNNY_PULL_ZONE_URL}/${remotePath}`;
}

/**
 * Font URLs hosted on Bunny CDN (WOFF2 format).
 * Upload fonts to Bunny storage zone at these paths.
 */
export const FONT_URLS = {
  loraRegular: `${BUNNY_PULL_ZONE_URL}/fonts/lora-regular.woff2`,
  loraMedium: `${BUNNY_PULL_ZONE_URL}/fonts/lora-medium.woff2`,
  loraBold: `${BUNNY_PULL_ZONE_URL}/fonts/lora-bold.woff2`,
  loraItalic: `${BUNNY_PULL_ZONE_URL}/fonts/lora-italic.woff2`,
  interRegular: `${BUNNY_PULL_ZONE_URL}/fonts/inter-regular.woff2`,
  interMedium: `${BUNNY_PULL_ZONE_URL}/fonts/inter-medium.woff2`,
  interSemiBold: `${BUNNY_PULL_ZONE_URL}/fonts/inter-semibold.woff2`,
};
