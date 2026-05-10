import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { Slider } from './Slider';

function pointer(type: string, clientX: number, clientY: number): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    clientX,
    clientY,
    button: 0,
  });
}

function stubPointerCapture(el: Element) {
  (el as HTMLElement).setPointerCapture = vi.fn();
  (el as HTMLElement).releasePointerCapture = vi.fn();
}

function stubTrackRect(track: Element, rect: Partial<DOMRect>) {
  const r: DOMRect = {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect;
  (track as HTMLElement).getBoundingClientRect = () => r;
}

describe('Slider', () => {
  it('renders a slider with correct ARIA defaults', () => {
    render(<Slider aria-label="Volume" defaultValue={30} />);
    const thumb = screen.getByRole('slider', { name: 'Volume' });
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
    expect(thumb).toHaveAttribute('aria-valuenow', '30');
    expect(thumb).toHaveAttribute('aria-orientation', 'horizontal');
    expect(thumb).toHaveAttribute('tabindex', '0');
  });

  it('respects controlled value + onValueChange', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [v, setV] = useState(50);
      return <Slider aria-label="x" value={v} onValueChange={setV} />;
    }
    render(<Harness />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '51');
  });

  it('keyboard: arrow keys step +/- 1', async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="x" defaultValue={50} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '51');
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(thumb).toHaveAttribute('aria-valuenow', '49');
  });

  it('keyboard: PageUp/PageDown step by 10x step', async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="x" defaultValue={50} step={2} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{PageUp}');
    expect(thumb).toHaveAttribute('aria-valuenow', '70');
    await user.keyboard('{PageDown}');
    expect(thumb).toHaveAttribute('aria-valuenow', '50');
  });

  it('keyboard: Shift+Arrow steps by 10x step', async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="x" defaultValue={50} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(thumb).toHaveAttribute('aria-valuenow', '60');
  });

  it('keyboard: Home / End jump to min / max', async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="x" defaultValue={50} min={5} max={95} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{Home}');
    expect(thumb).toHaveAttribute('aria-valuenow', '5');
    await user.keyboard('{End}');
    expect(thumb).toHaveAttribute('aria-valuenow', '95');
  });

  it('clamps to min/max', async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="x" defaultValue={1} min={0} max={3} step={1} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '3');
  });

  it('snaps to step', async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="x" defaultValue={0} step={5} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '5');
  });

  it('disabled: keyboard does nothing, tabindex=-1', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider aria-label="x" defaultValue={50} disabled onValueChange={onChange} />);
    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-disabled', 'true');
    expect(thumb).toHaveAttribute('tabindex', '-1');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('orientation=vertical: ArrowUp increases, ArrowDown decreases', async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="x" defaultValue={50} orientation="vertical" />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowUp}');
    expect(thumb).toHaveAttribute('aria-valuenow', '51');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(thumb).toHaveAttribute('aria-valuenow', '49');
  });

  it('invert: ArrowRight decreases', async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="x" defaultValue={50} invert />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '49');
  });

  it('formatValue sets aria-valuetext', () => {
    render(<Slider aria-label="x" defaultValue={42} formatValue={(v) => `${v}%`} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '42%');
  });

  it('pointer: clicking the track jumps the value to the cursor', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider aria-label="x" defaultValue={0} min={0} max={100} onValueChange={onChange} />,
    );
    const track = container.querySelector<HTMLDivElement>('[class*="cursor-pointer"]')!;
    const thumb = screen.getByRole('slider');
    stubPointerCapture(thumb);
    stubTrackRect(track, { left: 0, right: 200, width: 200, top: 0, bottom: 8, height: 8 });

    act(() => {
      track.dispatchEvent(pointer('pointerdown', 50, 4));
    });
    // 50/200 = 25% → 25
    expect(onChange).toHaveBeenLastCalledWith(25);
  });

  it('pointer: dragging updates value continuously', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider aria-label="x" defaultValue={0} min={0} max={100} onValueChange={onChange} />,
    );
    const track = container.querySelector<HTMLDivElement>('[class*="cursor-pointer"]')!;
    const thumb = screen.getByRole('slider');
    stubPointerCapture(thumb);
    stubTrackRect(track, { left: 0, right: 200, width: 200, top: 0, bottom: 8, height: 8 });

    act(() => {
      thumb.dispatchEvent(pointer('pointerdown', 0, 4));
    });
    act(() => {
      window.dispatchEvent(pointer('pointermove', 100, 4));
    });
    expect(onChange).toHaveBeenLastCalledWith(50);
    act(() => {
      window.dispatchEvent(pointer('pointermove', 250, 4));
    });
    // clamped to 100
    expect(onChange).toHaveBeenLastCalledWith(100);
    act(() => {
      window.dispatchEvent(pointer('pointerup', 250, 4));
    });
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Slider aria-label="Volume" defaultValue={40} />);
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
