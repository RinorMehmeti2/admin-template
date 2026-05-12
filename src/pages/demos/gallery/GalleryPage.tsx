import { Card } from '@/components/data-display/Card';
import { GalleryCardBody, GalleryCardHeader } from './components';

export function GalleryPage() {
  return (
    <div className="space-y-4">
      <Card>
        <GalleryCardHeader />
        <GalleryCardBody />
      </Card>
    </div>
  );
}
