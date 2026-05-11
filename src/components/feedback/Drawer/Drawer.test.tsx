import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from './Drawer';
import { Button } from '@/components/primitives/Button';
import { runAxe } from '@/test-utils/a11y';

function Demo({
  side = 'right' as const,
  onOpenChange,
  defaultOpen = false,
}: {
  side?: 'left' | 'right' | 'top' | 'bottom';
  onOpenChange?: (o: boolean) => void;
  defaultOpen?: boolean;
}) {
  return (
    <Drawer side={side} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger>
        <Button>Open</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>Edit your settings.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <input data-testid="inside" placeholder="x" />
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

describe('Drawer', () => {
  it('opens via the trigger', async () => {
    render(<Demo />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('aria-modal=true and aria wired', () => {
    render(<Demo defaultOpen />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.getAttribute('aria-labelledby')).toBe(
      screen.getByText('Settings').getAttribute('id'),
    );
  });

  it('Escape closes', async () => {
    const onOpenChange = vi.fn();
    render(<Demo defaultOpen onOpenChange={onOpenChange} />);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('overlay click closes', async () => {
    const onOpenChange = vi.fn();
    render(<Demo defaultOpen onOpenChange={onOpenChange} />);
    await userEvent.click(document.body);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('inside click does NOT close', async () => {
    const onOpenChange = vi.fn();
    render(<Demo defaultOpen onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByTestId('inside'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('locks body scroll', () => {
    document.body.style.overflow = '';
    render(<Demo defaultOpen />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it.each(['left', 'right', 'top', 'bottom'] as const)('side=%s positions the panel', (side) => {
    render(<Demo side={side} defaultOpen />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has no a11y violations (open)', async () => {
    render(<Demo defaultOpen />);
    expect(await runAxe(document.body)).toHaveNoViolations();
  });

  describe('responsive prop (mobile)', () => {
    const ORIGINAL_MATCH_MEDIA = window.matchMedia;
    beforeEach(() => {
      // Force "mobile" viewport via matchMedia mock.
      window.matchMedia = ((query: string): MediaQueryList => {
        const matches = query.includes('max-width: 767px');
        return {
          matches,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        } as unknown as MediaQueryList;
      }) as typeof window.matchMedia;
    });
    afterEach(() => {
      window.matchMedia = ORIGINAL_MATCH_MEDIA;
    });

    it('switches to bottom-sheet mode on mobile (default responsive=true)', () => {
      render(<Demo defaultOpen />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('data-drawer-mode', 'bottom-sheet');
      expect(screen.getByRole('button', { name: 'Drag to dismiss' })).toBeInTheDocument();
    });

    it('responsive={false} keeps the side anchoring', () => {
      render(
        <Drawer side="left" defaultOpen responsive={false}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Nav</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>x</DrawerBody>
          </DrawerContent>
        </Drawer>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('data-drawer-mode');
      expect(screen.queryByRole('button', { name: 'Drag to dismiss' })).toBeNull();
    });
  });
});
