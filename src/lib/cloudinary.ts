/**
 * Cloudinary & Image URL Utilities
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'kre7pjni';

/**
 * Returns a full display URL for an image.
 * Accepts a Cloudinary publicId (e.g. "1_m9fjpj"), a full Cloudinary URL, or a standard HTTP/local URL.
 */
export function getImageUrl(publicIdOrUrl?: string): string {
  if (!publicIdOrUrl) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://') || publicIdOrUrl.startsWith('/')) {
    return publicIdOrUrl;
  }

  // It's a Cloudinary publicId
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicIdOrUrl}`;
}
