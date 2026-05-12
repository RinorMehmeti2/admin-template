import type { GalleryImage } from '@/components/data-display/ImageGallery';

/*
 * Deterministic placeholders via picsum.photos — seed in the URL guarantees
 * the same image is returned across loads, which keeps the demo stable
 * without bundling real photographs in the repo.
 */
function pic(seed: number, w: number, h: number): string {
  return `https://picsum.photos/seed/admin-template-${seed}/${w}/${h}`;
}

export const IMAGES: ReadonlyArray<GalleryImage> = Array.from({ length: 12 }, (_, i) => ({
  id: `photo-${i}`,
  src: pic(i + 1, 1600, 1067),
  thumbnail: pic(i + 1, 480, 320),
  alt: `Photograph ${i + 1}`,
  caption:
    i % 3 === 0
      ? `Photograph ${i + 1} — taken with a 35mm prime, ISO 200, f/2.8.`
      : undefined,
}));
