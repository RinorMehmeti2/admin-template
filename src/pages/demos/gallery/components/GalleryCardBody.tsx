import { CardContent } from '@/components/data-display/Card';
import { ImageGallery } from '@/components/data-display/ImageGallery';
import { IMAGES } from '../data';

export function GalleryCardBody() {
  return (
    <CardContent>
      <ImageGallery images={IMAGES} aspectRatio="square" />
    </CardContent>
  );
}
