import { useCallback, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { Lightbox } from './Lightbox';
import type { GalleryAspect, ImageGalleryProps } from './ImageGallery.types';

/*
 * Notes on virtualization:
 *
 * For ~hundreds of images, the native `loading="lazy"` attribute on each
 * thumbnail keeps memory and bandwidth in check — the browser only fetches
 * images near the viewport. Beyond that (low thousands), the layout cost of
 * rendering every thumbnail node becomes the bottleneck. At that scale,
 * consumers should wrap the grid in `@tanstack/react-virtual` (not included
 * in deps today — flag it on the PR if the use-case warrants adding it).
 */

const ASPECT: Record<GalleryAspect, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  natural: '',
};

export function ImageGallery({
  images,
  columns,
  minCellWidth = 160,
  gap = 8,
  aspectRatio = 'square',
  onImageClick,
  disableLightbox = false,
  showDownload = true,
  showThumbnails = true,
  className,
  'aria-label': ariaLabel = 'Image gallery',
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleClick = useCallback(
    (index: number) => {
      const image = images[index];
      if (image === undefined) return;
      if (onImageClick !== undefined) {
        onImageClick(index, image);
        return;
      }
      if (!disableLightbox) {
        setLightboxIndex(index);
      }
    },
    [images, onImageClick, disableLightbox],
  );

  const gridStyle: CSSProperties = {
    gridTemplateColumns:
      typeof columns === 'number'
        ? `repeat(${columns}, minmax(0, 1fr))`
        : `repeat(auto-fill, minmax(${minCellWidth}px, 1fr))`,
    gap: `${gap}px`,
  };

  return (
    <>
      <ul
        aria-label={ariaLabel}
        className={cn('grid w-full', className)}
        style={gridStyle}
      >
        {images.map((img, i) => (
          <li key={img.id} className="m-0 p-0">
            <button
              type="button"
              onClick={() => handleClick(i)}
              aria-label={img.alt}
              data-testid={`gallery-item-${i}`}
              className={cn(
                'group relative block w-full overflow-hidden rounded-md border border-border bg-surface-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                ASPECT[aspectRatio],
              )}
            >
              <img
                src={img.thumbnail ?? img.src}
                alt={img.alt}
                loading="lazy"
                className={cn(
                  'h-full w-full object-cover transition-transform duration-200',
                  'group-hover:scale-105',
                  aspectRatio === 'natural' && 'h-auto',
                )}
              />
              {img.caption !== undefined ? (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-foreground/60 px-2 py-1 text-left text-xs text-background opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {img.caption}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {!disableLightbox && onImageClick === undefined ? (
        <Lightbox
          images={images}
          index={lightboxIndex ?? 0}
          open={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={(i) => setLightboxIndex(i)}
          showDownload={showDownload}
          showThumbnails={showThumbnails}
        />
      ) : null}
    </>
  );
}
