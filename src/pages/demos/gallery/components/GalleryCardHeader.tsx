import { CardDescription, CardHeader, CardTitle } from '@/components/data-display/Card';

export function GalleryCardHeader() {
  return (
    <CardHeader>
      <CardTitle>Image gallery</CardTitle>
      <CardDescription>
        Responsive grid with hover captions, lazy-loaded thumbnails, and a full-screen
        lightbox. Keyboard: ←/→ navigate · +/− zoom · 0 reset · Esc close. Click the image
        to toggle zoom; drag to pan while zoomed; wheel to zoom at the cursor.
      </CardDescription>
    </CardHeader>
  );
}
