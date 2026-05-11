import { describe, it, expect, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from './BottomSheet';
import { Button } from '@/components/primitives/Button';

function Demo({
  snapPoints,
  onOpenChange,
  onSnapChange,
}: {
  snapPoints?: ReadonlyArray<number>;
  onOpenChange?: (open: boolean) => void;
  onSnapChange?: (n: number) => void;
}) {
  const sheetProps: React.ComponentProps<typeof BottomSheet> = { children: null as never };
  if (snapPoints !== undefined) sheetProps.snapPoints = snapPoints;
  if (onOpenChange !== undefined) sheetProps.onOpenChange = onOpenChange;
  if (onSnapChange !== undefined) sheetProps.onSnapChange = onSnapChange;
  return (
    <BottomSheet {...sheetProps}>
      <BottomSheetTrigger>
        <Button>Open</Button>
      </BottomSheetTrigger>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>Test</BottomSheetTitle>
        </BottomSheetHeader>
        <BottomSheetBody>Hello</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
}

function firePointer(
  el: Element | Window,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  opts: { clientX: number; clientY: number; pointerId?: number },
) {
  const ev = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent;
  Object.defineProperty(ev, 'pointerId', { value: opts.pointerId ?? 1 });
  Object.defineProperty(ev, 'pointerType', { value: 'touch' });
  Object.defineProperty(ev, 'clientX', { value: opts.clientX });
  Object.defineProperty(ev, 'clientY', { value: opts.clientY });
  Object.defineProperty(ev, 'button', { value: 0 });
  act(() => {
    el.dispatchEvent(ev);
  });
}

describe('BottomSheet', () => {
  it('opens via trigger and shows title', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog', { name: 'Test' })).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Demo onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('renders a grab handle by default', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('button', { name: 'Drag to resize' })).toBeInTheDocument();
  });

  it('dragging handle up snaps to higher snap point', async () => {
    const onSnapChange = vi.fn();
    const user = userEvent.setup();
    render(<Demo snapPoints={[25, 90]} onSnapChange={onSnapChange} />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const handle = screen.getByRole('button', { name: 'Drag to resize' });
    firePointer(handle, 'pointerdown', { clientX: 100, clientY: 600 });
    firePointer(window, 'pointermove', { clientX: 100, clientY: 200 }); // pulled up 400px
    firePointer(window, 'pointerup', { clientX: 100, clientY: 200 });
    expect(onSnapChange).toHaveBeenCalledWith(90);
  });

  it('swipe-down past lowest snap dismisses', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<Demo snapPoints={[25, 90]} onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const handle = screen.getByRole('button', { name: 'Drag to resize' });
    firePointer(handle, 'pointerdown', { clientX: 100, clientY: 200 });
    // Pull down a lot — past lowest snap (25vh) + threshold.
    firePointer(window, 'pointermove', { clientX: 100, clientY: 800 });
    firePointer(window, 'pointerup', { clientX: 100, clientY: 800 });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('snap points default to [50, 90]', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-snap', '50');
  });

  it('has no axe violations when open', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});
