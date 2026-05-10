import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { RangeSlider, type RangeSliderValue } from './RangeSlider';

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

describe('RangeSlider', () => {
  it('renders two thumbs with proper ARIA', () => {
    render(
      <RangeSlider
        defaultValue={[20, 80]}
        thumbAriaLabels={['Min', 'Max']}
        aria-label="Range"
      />,
    );
    const minThumb = screen.getByRole('slider', { name: 'Min' });
    const maxThumb = screen.getByRole('slider', { name: 'Max' });
    expect(minThumb).toHaveAttribute('aria-valuenow', '20');
    expect(maxThumb).toHaveAttribute('aria-valuenow', '80');
    // each thumb's range is bounded by the other thumb
    expect(minThumb).toHaveAttribute('aria-valuemax', '79');
    expect(maxThumb).toHaveAttribute('aria-valuemin', '21');
  });

  it('keyboard: each thumb moves independently', async () => {
    const user = userEvent.setup();
    render(<RangeSlider defaultValue={[10, 90]} thumbAriaLabels={['Min', 'Max']} />);
    const minThumb = screen.getByRole('slider', { name: 'Min' });
    const maxThumb = screen.getByRole('slider', { name: 'Max' });
    minThumb.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(minThumb).toHaveAttribute('aria-valuenow', '12');
    maxThumb.focus();
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(maxThumb).toHaveAttribute('aria-valuenow', '88');
  });

  it('thumbs cannot cross — clamped at minDistance from each other', async () => {
    const user = userEvent.setup();
    render(<RangeSlider defaultValue={[40, 41]} thumbAriaLabels={['Min', 'Max']} />);
    const minThumb = screen.getByRole('slider', { name: 'Min' });
    minThumb.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}');
    // Max stays at 41, min cannot exceed 40 (max - 1*step).
    expect(minThumb).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByRole('slider', { name: 'Max' })).toHaveAttribute('aria-valuenow', '41');
  });

  it('respects custom minDistance', async () => {
    const user = userEvent.setup();
    render(
      <RangeSlider
        defaultValue={[10, 90]}
        minDistance={20}
        thumbAriaLabels={['Min', 'Max']}
      />,
    );
    const minThumb = screen.getByRole('slider', { name: 'Min' });
    minThumb.focus();
    // Try to push past 90 - 20 = 70
    for (let i = 0; i < 100; i += 1) {
      await user.keyboard('{End}');
    }
    expect(minThumb).toHaveAttribute('aria-valuenow', '70');
  });

  it('controlled mode fires onValueChange with both thumbs', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Harness() {
      const [v, setV] = useState<RangeSliderValue>([20, 80]);
      return (
        <RangeSlider
          value={v}
          onValueChange={(next) => {
            onChange(next);
            setV(next);
          }}
          thumbAriaLabels={['Min', 'Max']}
        />
      );
    }
    render(<Harness />);
    screen.getByRole('slider', { name: 'Max' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith([20, 81]);
  });

  it('disabled: thumbs are not focusable, no key changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RangeSlider
        defaultValue={[20, 80]}
        disabled
        onValueChange={onChange}
        thumbAriaLabels={['Min', 'Max']}
      />,
    );
    const minThumb = screen.getByRole('slider', { name: 'Min' });
    expect(minThumb).toHaveAttribute('tabindex', '-1');
    expect(minThumb).toHaveAttribute('aria-disabled', 'true');
    minThumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('pointer: clicking the track moves the closest thumb', () => {
    const onChange = vi.fn();
    const { container } = render(
      <RangeSlider
        defaultValue={[20, 80]}
        onValueChange={onChange}
        thumbAriaLabels={['Min', 'Max']}
      />,
    );
    const track = container.querySelector<HTMLDivElement>('[class*="cursor-pointer"]')!;
    const [minThumb, maxThumb] = screen.getAllByRole('slider');
    stubPointerCapture(minThumb!);
    stubPointerCapture(maxThumb!);
    stubTrackRect(track, { left: 0, right: 200, width: 200, top: 0, bottom: 8, height: 8 });

    // Click at x=20 (10% → 10) → closer to min thumb (20)
    act(() => {
      track.dispatchEvent(pointer('pointerdown', 20, 4));
    });
    expect(onChange).toHaveBeenLastCalledWith([10, 80]);
    act(() => {
      window.dispatchEvent(pointer('pointerup', 20, 4));
    });

    onChange.mockClear();
    // Click at x=180 (90% → 90) → closer to max thumb (80)
    act(() => {
      track.dispatchEvent(pointer('pointerdown', 180, 4));
    });
    expect(onChange.mock.calls.at(-1)?.[0][1]).toBe(90);
  });

  it('pointer: dragging beyond the other thumb clamps at the gap', () => {
    const { container } = render(
      <RangeSlider
        defaultValue={[40, 60]}
        thumbAriaLabels={['Min', 'Max']}
      />,
    );
    const track = container.querySelector<HTMLDivElement>('[class*="cursor-pointer"]')!;
    const [minThumb] = screen.getAllByRole('slider');
    stubPointerCapture(minThumb!);
    stubTrackRect(track, { left: 0, right: 200, width: 200, top: 0, bottom: 8, height: 8 });

    act(() => {
      minThumb!.dispatchEvent(pointer('pointerdown', 80, 4));
    });
    // Try to drag min to x=180 (90)
    act(() => {
      window.dispatchEvent(pointer('pointermove', 180, 4));
    });
    expect(minThumb).toHaveAttribute('aria-valuenow', '59');
    act(() => {
      window.dispatchEvent(pointer('pointerup', 180, 4));
    });
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <RangeSlider
        defaultValue={[20, 80]}
        aria-label="Price range"
        thumbAriaLabels={['Min price', 'Max price']}
      />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
