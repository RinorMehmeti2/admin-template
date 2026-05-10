import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Heart } from 'lucide-react';
import { runAxe } from '@/test-utils/a11y';
import { Rating } from './Rating';

function getRoot(): HTMLElement {
  return screen.getByRole('slider');
}

function getCells(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-index]'));
}

describe('Rating', () => {
  it('renders `max` icon cells', () => {
    const { container } = render(<Rating max={5} aria-label="Rate" />);
    expect(getCells(container).length).toBe(5);
  });

  it('click sets value to that star (1-indexed)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Rating max={5} onValueChange={onValueChange} aria-label="Rate" />,
    );
    const cells = getCells(container);
    await user.click(cells[2]!);
    expect(onValueChange).toHaveBeenLastCalledWith(3);
    expect(getRoot()).toHaveAttribute('aria-valuenow', '3');
  });

  it('click on currently selected value clears when allowClear=true', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Rating
        max={5}
        defaultValue={3}
        onValueChange={onValueChange}
        aria-label="Rate"
      />,
    );
    const cells = getCells(container);
    await user.click(cells[2]!);
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it('click on currently selected does NOT clear when allowClear=false', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Rating
        max={5}
        defaultValue={3}
        allowClear={false}
        onValueChange={onValueChange}
        aria-label="Rate"
      />,
    );
    const cells = getCells(container);
    await user.click(cells[2]!);
    expect(onValueChange).toHaveBeenLastCalledWith(3);
  });

  it('ArrowRight increments by step (1 or 0.5)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating defaultValue={1} onValueChange={onValueChange} aria-label="Rate" />);
    getRoot().focus();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenLastCalledWith(2);

    const onValueChange2 = vi.fn();
    render(
      <Rating
        defaultValue={1}
        allowHalf
        onValueChange={onValueChange2}
        aria-label="Half"
      />,
    );
    const halfRoot = screen.getByRole('slider', { name: 'Half' });
    halfRoot.focus();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange2).toHaveBeenLastCalledWith(1.5);
  });

  it('ArrowLeft decrements; clamps at 0', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating defaultValue={0} onValueChange={onValueChange} aria-label="Rate" />);
    getRoot().focus();
    await user.keyboard('{ArrowLeft}');
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it('Home/End jump to 0 and max', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Rating max={5} defaultValue={2} onValueChange={onValueChange} aria-label="Rate" />,
    );
    getRoot().focus();
    await user.keyboard('{End}');
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    await user.keyboard('{Home}');
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it('numeric keys set value directly', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating max={5} onValueChange={onValueChange} aria-label="Rate" />);
    getRoot().focus();
    await user.keyboard('3');
    expect(onValueChange).toHaveBeenLastCalledWith(3);
    await user.keyboard('0');
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it('numeric key above max is ignored', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating max={5} onValueChange={onValueChange} aria-label="Rate" />);
    getRoot().focus();
    await user.keyboard('9');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('readOnly blocks interaction but keeps slider role + value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Rating
        max={5}
        defaultValue={4}
        readOnly
        onValueChange={onValueChange}
        aria-label="Rate"
      />,
    );
    const cells = getCells(container);
    await user.click(cells[0]!);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(getRoot()).toHaveAttribute('aria-readonly', 'true');
  });

  it('disabled blocks interaction and removes tabindex', () => {
    render(<Rating disabled aria-label="Rate" />);
    expect(getRoot()).toHaveAttribute('aria-disabled', 'true');
    expect(getRoot()).toHaveAttribute('tabindex', '-1');
  });

  it('half-star click resolves by pointer x within cell', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Rating max={5} allowHalf onValueChange={onValueChange} aria-label="Rate" />,
    );
    const cells = getCells(container);
    const cell = cells[2]!;
    // jsdom returns a 0-sized rect; mock so the math is deterministic.
    cell.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 20, bottom: 20, width: 20, height: 20, x: 0, y: 0, toJSON() {} }) as DOMRect;
    // Click at x=5 → left half → 0.5 portion → value = 2 + 0.5 = 2.5
    await user.pointer({ target: cell, coords: { clientX: 5, clientY: 5 }, keys: '[MouseLeft]' });
    expect(onValueChange).toHaveBeenLastCalledWith(2.5);
  });

  it('custom icon component renders', () => {
    const { container } = render(
      <Rating max={3} icon={Heart} aria-label="Hearts" defaultValue={2} />,
    );
    expect(getCells(container).length).toBe(3);
  });

  it('exposes name as hidden input for forms', () => {
    const { container } = render(
      <Rating name="stars" defaultValue={4} aria-label="Rate" />,
    );
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).not.toBeNull();
    expect((hidden as HTMLInputElement).value).toBe('4');
    expect((hidden as HTMLInputElement).name).toBe('stars');
  });

  it('aria-valuetext reflects current value', () => {
    render(<Rating max={5} defaultValue={3} aria-label="Rate" />);
    expect(getRoot()).toHaveAttribute('aria-valuetext', '3 of 5');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <span id="rate-lbl">Rate</span>
        <Rating aria-labelledby="rate-lbl" defaultValue={3} />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
