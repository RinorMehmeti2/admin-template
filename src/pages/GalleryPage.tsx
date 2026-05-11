import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import { ImageGallery } from '@/components/data-display/ImageGallery';
import type { GalleryImage } from '@/components/data-display/ImageGallery';

/*
 * Deterministic placeholders via picsum.photos — seed in the URL guarantees
 * the same image is returned across loads, which keeps the demo stable
 * without bundling real photographs in the repo.
 */
function pic(seed: number, w: number, h: number): string {
  return `https://picsum.photos/seed/admin-template-${seed}/${w}/${h}`;
}

const IMAGES: ReadonlyArray<GalleryImage> = Array.from({ length: 12 }, (_, i) => ({
  id: `photo-${i}`,
  src: pic(i + 1, 1600, 1067),
  thumbnail: pic(i + 1, 480, 320),
  alt: `Photograph ${i + 1}`,
  caption:
    i % 3 === 0
      ? `Photograph ${i + 1} — taken with a 35mm prime, ISO 200, f/2.8.`
      : undefined,
}));

export function GalleryPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Image gallery</CardTitle>
          <CardDescription>
            Responsive grid with hover captions, lazy-loaded thumbnails, and a full-screen
            lightbox. Keyboard: ←/→ navigate · +/− zoom · 0 reset · Esc close. Click the image
            to toggle zoom; drag to pan while zoomed; wheel to zoom at the cursor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageGallery images={IMAGES} aspectRatio="square" />
        </CardContent>
      </Card>
    </div>
  );
}
