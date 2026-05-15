import { CardDescription, CardHeader, CardTitle } from '@/components/data-display/Card';

export function GalleryCardHeader() {
  return (
    <CardHeader>
      <CardTitle className="text-base">Browse photos</CardTitle>
      <CardDescription>
        Click the image to toggle zoom; drag to pan while zoomed; wheel to zoom at the cursor.
      </CardDescription>
    </CardHeader>
  );
}
