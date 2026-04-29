/**
 * bunny-image-library.mjs
 * Assigns hero images to articles from the Bunny CDN library.
 * Library images: /library/lib-01.webp through /library/lib-40.webp
 * Each article gets a unique URL: /images/{article-slug}.webp
 *
 * Credentials are hardcoded per spec (Section 4 of addendum).
 */

// Conscious-elder Bunny CDN credentials
const BUNNY_STORAGE_ZONE = 'conscious-elder';
const BUNNY_API_KEY = 'f6dbc11c-20dc-4c15-a39faabe3d28-a766-4a87';
const BUNNY_PULL_ZONE = 'https://conscious-elder.b-cdn.net';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';

/**
 * Assigns a hero image to an article by:
 * 1. Randomly selecting one of the 40 library images
 * 2. Downloading it from the pull zone
 * 3. Re-uploading it to /images/{slug}.webp for a unique indexable URL
 *
 * Falls back to a direct library URL if the copy fails.
 *
 * @param {string} slug - The article slug (used as the destination filename)
 * @returns {Promise<string>} - The public CDN URL for the article's hero image
 */
export async function assignHeroImage(slug) {
  const libNum = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
  const sourceFile = `lib-${libNum}.webp`;
  const destFile = `${slug}.webp`;

  try {
    // Download the library image via the pull zone
    const sourceUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    const downloadRes = await fetch(sourceUrl);
    if (!downloadRes.ok) {
      throw new Error(`Download failed: ${downloadRes.status} ${sourceUrl}`);
    }
    const imageBuffer = await downloadRes.arrayBuffer();

    // Upload to /images/{slug}.webp in the storage zone
    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/images/${destFile}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'image/webp',
      },
      body: imageBuffer,
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed: ${uploadRes.status} ${uploadUrl}`);
    }

    const finalUrl = `${BUNNY_PULL_ZONE}/images/${destFile}`;
    console.log(`[BunnyLib] Hero assigned: ${finalUrl}`);
    return finalUrl;

  } catch (err) {
    // Fallback: link directly to the library image (still valid, just not unique)
    const fallbackUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    console.warn(`[BunnyLib] Copy failed for "${slug}", using fallback: ${fallbackUrl}`, err.message);
    return fallbackUrl;
  }
}

/**
 * Returns the pull zone base URL for constructing other asset URLs.
 */
export function getBunnyPullZone() {
  return BUNNY_PULL_ZONE;
}

/**
 * Uploads any arbitrary WebP buffer to Bunny CDN at a given path.
 * @param {string} path - Relative path within the storage zone (e.g., 'images/my-photo.webp')
 * @param {ArrayBuffer|Buffer} buffer - Image data
 * @returns {Promise<string>} - Public CDN URL
 */
export async function uploadToBunny(path, buffer) {
  const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${path}`;
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_API_KEY,
      'Content-Type': 'image/webp',
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`Bunny upload failed: ${res.status} ${uploadUrl}`);
  return `${BUNNY_PULL_ZONE}/${path}`;
}
