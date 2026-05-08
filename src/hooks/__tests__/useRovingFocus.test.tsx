import { describe, it, expect } from 'vitest';
import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  RovingFocusGroup,
  useRovingFocusItem,
  type RovingFocusOrientation,
} from '@/hooks/useRovingFocus';

function Item({ index, label }: { index: number; label: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { tabIndex, onKeyDown, onFocus } = useRovingFocusItem(index, ref);
  return (
    <button ref={ref} tabIndex={tabIndex} onKeyDown={onKeyDown} onFocus={onFocus}>
      {label}
    </button>
  );
}

function Group({
  orientation,
  loop = true,
}: {
  orientation: RovingFocusOrientation;
  loop?: boolean;
}) {
  return (
    <RovingFocusGroup orientation={orientation} loop={loop}>
      <Item index={0} label="a" />
      <Item index={1} label="b" />
      <Item index={2} label="c" />
    </RovingFocusGroup>
  );
}

describe('useRovingFocus', () => {
  it('first item gets tabindex=0, others -1', () => {
    render(<Group orientation="horizontal" />);
    expect(screen.getByText('a')).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('b')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByText('c')).toHaveAttribute('tabindex', '-1');
  });

  it('horizontal: ArrowRight moves focus + flips tabindex', async () => {
    render(<Group orientation="horizontal" />);
    screen.getByText('a').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByText('b'));
    expect(screen.getByText('b')).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('a')).toHaveAttribute('tabindex', '-1');
  });

  it('horizontal: ArrowLeft moves backward', async () => {
    render(<Group orientation="horizontal" />);
    screen.getByText('b').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByText('a'));
  });

  it('vertical: ArrowDown/Up moves focus', async () => {
    render(<Group orientation="vertical" />);
    screen.getByText('a').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByText('b'));
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(screen.getByText('a'));
  });

  it('both: accepts all 4 arrows', async () => {
    render(<Group orientation="both" />);
    screen.getByText('a').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByText('b'));
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByText('c'));
  });

  it('loops at end when loop=true', async () => {
    render(<Group orientation="horizontal" loop />);
    screen.getByText('c').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByText('a'));
  });

  it('does not loop when loop=false', async () => {
    render(<Group orientation="horizontal" loop={false} />);
    screen.getByText('c').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByText('c'));
  });

  it('Home/End jump to first/last', async () => {
    render(<Group orientation="horizontal" />);
    screen.getByText('a').focus();
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByText('c'));
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(screen.getByText('a'));
  });
});
