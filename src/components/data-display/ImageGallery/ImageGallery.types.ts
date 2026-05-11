export interface GalleryImage {
  id: string;
  src: string;
  /** Optional optimized thumbnail. Falls back to `src` when omitted. */
  thumbnail?: string | undefined;
  alt: string;
  caption?: string | undefined;
  /** Hint for grid aspect-ratio reservations; not enforced. */
  width?: number | undefined;
  height?: number | undefined;
}

export type GalleryAspect = 'square' | 'video' | 'natural';

export interface ImageGalleryProps {
  images: ReadonlyArray<GalleryImage>;
  /**
   * Fixed column count. Omit for an auto-fill grid that fits as many cells
   * of `~160px` minimum width as fit in the container (responsive by default).
   */
  columns?: number;
  /** Minimum cell width in px used by the auto-fill grid. Default 160. */
  minCellWidth?: number;
  /** Gap between cells in px. Default 8. */
  gap?: number;
  aspectRatio?: GalleryAspect;
  /**
   * Override the click handler. When omitted, clicking a thumbnail opens
   * the built-in Lightbox at the clicked index.
   */
  onImageClick?: (index: number, image: GalleryImage) => void;
  /** Hide the built-in Lightbox even with no `onImageClick` override. */
  disableLightbox?: boolean;
  showDownload?: boolean;
  showThumbnails?: boolean;
  className?: string;
  'aria-label'?: string;
}

export interface LightboxProps {
  images: ReadonlyArray<GalleryImage>;
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  showDownload?: boolean;
  showThumbnails?: boolean;
  className?: string;
}
