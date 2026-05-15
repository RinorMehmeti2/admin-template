import { Card } from '@/components/data-display/Card';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { GalleryCardBody, GalleryCardHeader } from './components';

export function GalleryPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <SimsPageHeader
        title="Image gallery"
        description="Responsive grid with hover captions, lazy-loaded thumbnails, and a full-screen lightbox. Keyboard: ←/→ navigate · +/− zoom · 0 reset · Esc close."
      />
      <Card variant="outlined">
        <GalleryCardHeader />
        <GalleryCardBody />
      </Card>
    </div>
  );
}
