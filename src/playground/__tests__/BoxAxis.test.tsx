import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { BoxAxis } from '../StyleOverlay';

describe('BoxAxis', () => {
  it('writes both sides of an axis when the linked input changes', async () => {
    const onChange = vi.fn();
    render(
      <BoxAxis
        label="Padding"
        unit="px"
        values={[undefined, undefined, undefined, undefined]}
        onChange={onChange}
      />,
    );

    const xInput = screen.getByLabelText('Padding horizontal');
    await userEvent.clear(xInput);
    await userEvent.type(xInput, '8');

    const lastCall = onChange.mock.calls.at(-1);
    expect(lastCall).toBeDefined();
    if (lastCall === undefined) return;
    const [top, right, bottom, left] = lastCall;
    expect(left).toBe(8);
    expect(right).toBe(8);
    expect(top).toBeUndefined();
    expect(bottom).toBeUndefined();
  });

  it('switches into per-side mode and edits a single side', async () => {
    const onChange = vi.fn();
    render(
      <BoxAxis
        label="Padding"
        unit="px"
        values={[4, 4, 4, 4]}
        onChange={onChange}
        initialMode="side"
      />,
    );

    onChange.mockClear();
    const topInput = screen.getByLabelText('Padding T');
    // Controlled input pinned by parent: fire a synthetic change instead of
    // simulating keystrokes, since the parent never updates `values` here.
    fireEvent.change(topInput, { target: { value: '12' } });

    const last = onChange.mock.calls.at(-1);
    expect(last).toBeDefined();
    if (last === undefined) return;
    expect(last[0]).toBe(12);
    expect(last[1]).toBe(4);
    expect(last[2]).toBe(4);
    expect(last[3]).toBe(4);
  });

  it('collapses per-side back to axis-link by taking the larger value', async () => {
    const onChange = vi.fn();
    render(
      <BoxAxis
        label="Margin"
        unit="px"
        values={[12, 6, 4, 3]}
        onChange={onChange}
        initialMode="side"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /axis link/i }));

    const last = onChange.mock.calls.at(-1);
    expect(last).toBeDefined();
    if (last === undefined) return;
    expect(last[0]).toBe(12);
    expect(last[2]).toBe(12);
    expect(last[1]).toBe(6);
    expect(last[3]).toBe(6);
  });

  it('passes axe in both modes', async () => {
    const { container, rerender } = render(
      <BoxAxis label="Padding" unit="px" values={[2, 2, 2, 2]} onChange={() => undefined} />,
    );
    await runAxe(container);

    rerender(
      <BoxAxis
        label="Padding"
        unit="px"
        values={[2, 2, 2, 2]}
        onChange={() => undefined}
        initialMode="side"
      />,
    );
    await runAxe(container);
  });
});
