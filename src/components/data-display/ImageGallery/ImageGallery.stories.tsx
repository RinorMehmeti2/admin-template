import { useState } from 'react';
import { ImageGallery } from './ImageGallery';
import { Lightbox } from './Lightbox';
import type { GalleryImage } from './ImageGallery.types';
import { Button } from '@/components/primitives/Button';

export default { title: 'Data Display/ImageGallery', component: ImageGallery };

/*
 * Picsum delivers deterministic placeholders keyed by `?random=N` — same N
 * always returns the same image, so the stories are stable.
 */
function pic(id: number, w: number, h: number): string {
  return `https://picsum.photos/seed/admin-${id}/${w}/${h}`;
}

const TWELVE: ReadonlyArray<GalleryImage> = Array.from({ length: 12 }, (_, i) => ({
  id: `i-${i}`,
  src: pic(i + 1, 1200, 900),
  thumbnail: pic(i + 1, 480, 360),
  alt: `Sample photograph ${i + 1}`,
  caption: i % 3 === 0 ? `Sample photograph #${i + 1}` : undefined,
}));

const MIXED: ReadonlyArray<GalleryImage> = [
  { id: 'm1', src: pic(20, 1200, 600), thumbnail: pic(20, 600, 300), alt: 'Wide panorama' },
  { id: 'm2', src: pic(21, 600, 1200), thumbnail: pic(21, 300, 600), alt: 'Tall portrait' },
  { id: 'm3', src: pic(22, 900, 900), thumbnail: pic(22, 450, 450), alt: 'Square crop' },
  { id: 'm4', src: pic(23, 1600, 900), thumbnail: pic(23, 800, 450), alt: 'Cinematic shot' },
  { id: 'm5', src: pic(24, 1200, 800), thumbnail: pic(24, 600, 400), alt: 'Landscape view' },
  { id: 'm6', src: pic(25, 800, 1200), thumbnail: pic(25, 400, 600), alt: 'Vertical scene' },
];

const SOLO: ReadonlyArray<GalleryImage> = [
  {
    id: 'solo',
    src: pic(99, 1600, 1000),
    alt: 'Single hero image',
    caption: 'Only one image — the lightbox should not render prev/next arrows or the thumb strip.',
  },
];

export function TwelveImages() {
  return (
    <div className="space-y-3 p-6">
      <p className="text-sm text-foreground-muted">
        Click any thumbnail to open the lightbox. ArrowLeft / ArrowRight navigate; +/- zoom; 0
        resets; Escape closes; drag-to-pan while zoomed.
      </p>
      <ImageGallery images={TWELVE} />
    </div>
  );
}

export function WithFixedColumns() {
  return (
    <div className="p-6">
      <ImageGallery images={TWELVE} columns={4} gap={12} />
    </div>
  );
}

export function MixedAspectRatios() {
  return (
    <div className="space-y-3 p-6">
      <p className="text-sm text-foreground-muted">
        Thumbnails crop to a square grid; the lightbox shows each image at its native aspect.
      </p>
      <ImageGallery images={MIXED} aspectRatio="square" />
    </div>
  );
}

export function NaturalAspect() {
  return (
    <div className="p-6">
      <ImageGallery images={MIXED} aspectRatio="natural" />
    </div>
  );
}

export function SingleImage() {
  return (
    <div className="p-6">
      <p className="mb-3 text-sm text-foreground-muted">
        With a single image, the lightbox renders without navigation arrows or the thumbnail
        strip — only the image, caption, download, and close controls.
      </p>
      <ImageGallery images={SOLO} columns={1} />
    </div>
  );
}

export function CustomOnClick() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div className="space-y-3 p-6">
      <p className="text-sm text-foreground-muted">
        Override <code>onImageClick</code> to suppress the built-in lightbox and handle clicks
        yourself (e.g. navigate to a detail route).
      </p>
      <ImageGallery
        images={TWELVE.slice(0, 6)}
        onImageClick={(i, img) => setLast(`#${i} → ${img.alt}`)}
      />
      {last !== null ? (
        <p className="text-sm text-foreground">Last clicked: {last}</p>
      ) : null}
    </div>
  );
}

export function ManyImages() {
  // 60 images, browser-native lazy loading keeps memory in check.
  const many: ReadonlyArray<GalleryImage> = Array.from({ length: 60 }, (_, i) => ({
    id: `m-${i}`,
    src: pic(100 + i, 1200, 900),
    thumbnail: pic(100 + i, 320, 240),
    alt: `Photo ${i + 1}`,
  }));
  return (
    <div className="p-6">
      <ImageGallery images={many} minCellWidth={140} />
    </div>
  );
}

export function LightboxStandalone() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Open lightbox at index 4</Button>
      <Lightbox
        images={TWELVE}
        index={index === 0 ? 4 : index}
        open={open}
        onClose={() => setOpen(false)}
        onIndexChange={setIndex}
      />
    </div>
  );
}
