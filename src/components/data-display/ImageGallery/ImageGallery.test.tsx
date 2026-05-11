import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { ImageGallery } from './ImageGallery';
import { Lightbox } from './Lightbox';
import type { GalleryImage } from './ImageGallery.types';

const IMAGES: ReadonlyArray<GalleryImage> = Array.from({ length: 4 }, (_, i) => ({
  id: `img-${i}`,
  src: `https://example.com/full-${i}.jpg`,
  thumbnail: `https://example.com/thumb-${i}.jpg`,
  alt: `Image ${i}`,
  caption: i % 2 === 0 ? `Caption ${i}` : undefined,
}));

const ONE: ReadonlyArray<GalleryImage> = [
  { id: 'solo', src: 'https://example.com/solo.jpg', alt: 'Solo image' },
];

describe('ImageGallery', () => {
  it('renders one thumbnail per image with lazy loading', () => {
    render(<ImageGallery images={IMAGES} />);
    const list = screen.getByRole('list', { name: 'Image gallery' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(4);
    const imgs = within(list).getAllByRole('img');
    for (const img of imgs) {
      expect(img).toHaveAttribute('loading', 'lazy');
    }
  });

  it('clicking a thumbnail opens the lightbox at that index', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={IMAGES} />);
    await user.click(screen.getByTestId('gallery-item-2'));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Image 2')).toBeInTheDocument();
    expect(within(dialog).getByText('3 / 4')).toBeInTheDocument();
  });

  it('honors a custom onImageClick (skips built-in lightbox)', async () => {
    const user = userEvent.setup();
    const onImageClick = vi.fn();
    render(<ImageGallery images={IMAGES} onImageClick={onImageClick} />);
    await user.click(screen.getByTestId('gallery-item-1'));
    expect(onImageClick).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ id: 'img-1' }),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('uses inline grid template for a fixed column count', () => {
    const { container } = render(<ImageGallery images={IMAGES} columns={3} />);
    const list = container.querySelector('ul');
    expect(list?.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
  });

  it('falls back to an auto-fill grid when no columns are provided', () => {
    const { container } = render(<ImageGallery images={IMAGES} minCellWidth={200} gap={12} />);
    const list = container.querySelector('ul');
    expect(list?.style.gridTemplateColumns).toBe('repeat(auto-fill, minmax(200px, 1fr))');
    expect(list?.style.gap).toBe('12px');
  });

  it('has no a11y violations (gallery only)', async () => {
    const { container } = render(<ImageGallery images={IMAGES} />);
    expect(await runAxe(container)).toHaveNoViolations();
  });
});

/* -------------------------------------------------------------------------- */
/*  Lightbox                                                                  */
/* -------------------------------------------------------------------------- */

function Controlled({
  initialIndex = 0,
  images = IMAGES,
  defaultOpen = true,
}: {
  initialIndex?: number;
  images?: ReadonlyArray<GalleryImage>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [index, setIndex] = useState(initialIndex);
  return (
    <>
      <button type="button" data-testid="lb-trigger" onClick={() => setOpen(true)}>
        open
      </button>
      <Lightbox
        images={images}
        index={index}
        open={open}
        onClose={() => setOpen(false)}
        onIndexChange={setIndex}
      />
    </>
  );
}

function getLightbox(): HTMLElement {
  return screen.getByTestId('lightbox');
}

describe('Lightbox', () => {
  it('renders the current image, caption, and counter', () => {
    render(<Controlled initialIndex={0} />);
    expect(within(getLightbox()).getByText('Image 0')).toBeInTheDocument();
    expect(within(getLightbox()).getByText('Caption 0')).toBeInTheDocument();
    expect(within(getLightbox()).getByText('1 / 4')).toBeInTheDocument();
  });

  it('ArrowRight / ArrowLeft navigate; thumbnails update aria-current', () => {
    render(<Controlled initialIndex={0} />);
    fireEvent.keyDown(getLightbox(), { key: 'ArrowRight' });
    expect(within(getLightbox()).getByText('Image 1')).toBeInTheDocument();
    fireEvent.keyDown(getLightbox(), { key: 'ArrowLeft' });
    expect(within(getLightbox()).getByText('Image 0')).toBeInTheDocument();
    expect(screen.getByTestId('lightbox-thumb-0')).toHaveAttribute('aria-current', 'true');
  });

  it('navigation wraps around at the boundaries', () => {
    render(<Controlled initialIndex={3} />);
    fireEvent.keyDown(getLightbox(), { key: 'ArrowRight' });
    expect(within(getLightbox()).getByText('Image 0')).toBeInTheDocument();
    fireEvent.keyDown(getLightbox(), { key: 'ArrowLeft' });
    expect(within(getLightbox()).getByText('Image 3')).toBeInTheDocument();
  });

  it('clicking the next/prev buttons changes the index', async () => {
    const user = userEvent.setup();
    render(<Controlled initialIndex={0} />);
    await user.click(screen.getByTestId('lightbox-next'));
    expect(within(getLightbox()).getByText('Image 1')).toBeInTheDocument();
    await user.click(screen.getByTestId('lightbox-prev'));
    expect(within(getLightbox()).getByText('Image 0')).toBeInTheDocument();
  });

  it('Escape closes the lightbox', () => {
    render(<Controlled />);
    expect(screen.queryByTestId('lightbox')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('lightbox')).toBeNull();
  });

  it('clicking the Close button closes the lightbox', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Close lightbox' }));
    expect(screen.queryByTestId('lightbox')).toBeNull();
  });

  it('+ / - keys zoom in/out; 0 resets', () => {
    render(<Controlled />);
    const lb = getLightbox();
    expect(lb).toHaveAttribute('data-zoom', '1.00');
    fireEvent.keyDown(lb, { key: '+' });
    expect(lb).toHaveAttribute('data-zoom', '1.50');
    fireEvent.keyDown(lb, { key: '+' });
    expect(lb).toHaveAttribute('data-zoom', '2.00');
    fireEvent.keyDown(lb, { key: '-' });
    expect(lb).toHaveAttribute('data-zoom', '1.50');
    fireEvent.keyDown(lb, { key: '0' });
    expect(lb).toHaveAttribute('data-zoom', '1.00');
  });

  it('zoom is clamped to [1, 4]', () => {
    render(<Controlled />);
    const lb = getLightbox();
    for (let i = 0; i < 20; i++) fireEvent.keyDown(lb, { key: '+' });
    expect(lb).toHaveAttribute('data-zoom', '4.00');
    for (let i = 0; i < 20; i++) fireEvent.keyDown(lb, { key: '-' });
    expect(lb).toHaveAttribute('data-zoom', '1.00');
  });

  it('clicking the image while at zoom 1 zooms to 2', () => {
    render(<Controlled />);
    const img = screen.getByTestId('lightbox-image');
    fireEvent.click(img);
    expect(getLightbox()).toHaveAttribute('data-zoom', '2.00');
  });

  it('clicking the image while zoomed resets to 1', () => {
    render(<Controlled />);
    const lb = getLightbox();
    fireEvent.keyDown(lb, { key: '+' });
    fireEvent.keyDown(lb, { key: '+' });
    expect(lb).toHaveAttribute('data-zoom', '2.00');
    // At zoom > 1, the click is processed via pointer up; img onClick is a no-op.
    // So zooming back uses the keyboard.
    fireEvent.keyDown(lb, { key: '0' });
    expect(lb).toHaveAttribute('data-zoom', '1.00');
  });

  it('wheeling up zooms in; wheeling down zooms out', () => {
    render(<Controlled />);
    const lb = getLightbox();
    const stage = screen.getByTestId('lightbox-image').parentElement!;
    fireEvent.wheel(stage, { deltaY: -100, clientX: 200, clientY: 200 });
    expect(parseFloat(lb.getAttribute('data-zoom') ?? '1')).toBeGreaterThan(1);
    fireEvent.wheel(stage, { deltaY: 100 });
    expect(lb).toHaveAttribute('data-zoom', '1.00');
  });

  it('moves focus inside the lightbox when opened', () => {
    render(
      <>
        <button type="button" data-testid="outside">
          outside
        </button>
        <Controlled />
      </>,
    );
    const lb = getLightbox();
    // useFocusTrap focuses the first focusable inside on activation.
    expect(lb.contains(document.activeElement)).toBe(true);
  });

  it('restores focus to the trigger when closed', async () => {
    const user = userEvent.setup();
    render(<Controlled defaultOpen={false} />);
    const trigger = screen.getByTestId('lb-trigger');
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    await user.click(trigger);
    expect(screen.getByTestId('lightbox')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await act(async () => {
      await Promise.resolve();
    });
    expect(document.activeElement).toBe(trigger);
  });

  it('single-image gallery hides prev/next and the thumbnail strip', () => {
    render(<Lightbox images={ONE} index={0} open onClose={() => {}} />);
    expect(screen.queryByTestId('lightbox-prev')).toBeNull();
    expect(screen.queryByTestId('lightbox-next')).toBeNull();
    expect(screen.queryByTestId('lightbox-thumb-0')).toBeNull();
    expect(screen.queryByText(/\/ /)).toBeNull();
  });

  it('clicking a thumbnail jumps to that image', async () => {
    const user = userEvent.setup();
    render(<Controlled initialIndex={0} />);
    await user.click(screen.getByTestId('lightbox-thumb-2'));
    expect(within(getLightbox()).getByText('Image 2')).toBeInTheDocument();
  });

  it('exposes a download link to the full-resolution source', () => {
    render(<Controlled />);
    const link = screen.getByRole('link', { name: 'Download image' });
    expect(link).toHaveAttribute('href', IMAGES[0]!.src);
    expect(link).toHaveAttribute('download');
  });

  it('has no a11y violations when open', async () => {
    render(<Controlled />);
    expect(
      await runAxe(document.body, { rules: { 'aria-allowed-attr': { enabled: true } } }),
    ).toHaveNoViolations();
  });
});
