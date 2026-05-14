import { ExampleBlock } from '@/components/data-display';
import { ImageGallery } from '@/components/data-display/ImageGallery';
import { IMAGES } from './data';

const code = `<ImageGallery images={IMAGES} aspectRatio="square" />`;

export function GalleryPage() {
  return (
    <div className="space-y-4">
      <ExampleBlock
        title="Image gallery"
        description="Responsive grid with hover captions, lazy-loaded thumbnails, and a full-screen lightbox. Keyboard: ←/→ navigate · +/− zoom · 0 reset · Esc close. Click the image to toggle zoom; drag to pan while zoomed; wheel to zoom at the cursor."
        code={code}
      >
        <ImageGallery images={IMAGES} aspectRatio="square" />
      </ExampleBlock>
    </div>
  );
}
