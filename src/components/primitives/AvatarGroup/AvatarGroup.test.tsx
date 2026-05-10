import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { AvatarGroup } from './AvatarGroup';

const PEOPLE = [
  { name: 'Ada Lovelace' },
  { name: 'Bob Marley' },
  { name: 'Cher Cher' },
  { name: 'Diego Velazquez' },
  { name: 'Eve Einstein' },
  { name: 'Felix Mendelssohn' },
  { name: 'Grace Hopper' },
];

describe('AvatarGroup', () => {
  it('renders all items when count is <= max', () => {
    render(<AvatarGroup items={PEOPLE.slice(0, 3)} max={5} aria-label="team" />);
    const group = screen.getByRole('group', { name: 'team' });
    expect(group.querySelectorAll('[role="img"]').length).toBe(3);
    expect(screen.queryByText(/^\+\d+$/)).toBeNull();
  });

  it('truncates to max and renders overflow chip with +N', () => {
    render(<AvatarGroup items={PEOPLE} max={3} aria-label="team" />);
    const group = screen.getByRole('group', { name: 'team' });
    // 3 visible avatars + 1 overflow chip (also role=img by default)
    expect(group.querySelectorAll('[role="img"]').length).toBe(4);
    expect(screen.getByText('+4')).toBeInTheDocument();
    expect(screen.getByLabelText('4 more')).toBeInTheDocument();
  });

  it('overflow chip becomes a button and calls onOverflowClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<AvatarGroup items={PEOPLE} max={3} onOverflowClick={onClick} />);
    const btn = screen.getByRole('button', { name: '4 more' });
    await user.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('overflow chip is a non-interactive span when no handler is supplied', () => {
    render(<AvatarGroup items={PEOPLE} max={3} />);
    expect(screen.queryByRole('button', { name: '4 more' })).toBeNull();
    expect(screen.getByLabelText('4 more').tagName).toBe('SPAN');
  });

  it('supports a custom overflowLabel renderer', () => {
    render(
      <AvatarGroup
        items={PEOPLE}
        max={2}
        overflowLabel={(n) => `${n} more`}
        aria-label="team"
      />,
    );
    expect(screen.getByText('5 more')).toBeInTheDocument();
  });

  it('default order: leftmost (first DOM child) gets highest z-index', () => {
    render(<AvatarGroup items={PEOPLE.slice(0, 4)} max={5} aria-label="team" />);
    const items = Array.from(
      screen.getByRole('group', { name: 'team' }).querySelectorAll<HTMLElement>('[role="img"]'),
    );
    const zs = items.map((el) => Number(el.style.zIndex));
    // Strictly decreasing
    for (let i = 1; i < zs.length; i += 1) {
      expect(zs[i - 1]! > zs[i]!).toBe(true);
    }
  });

  it('reverseOrder flips z-stack so the rightmost DOM child is on top', () => {
    render(
      <AvatarGroup items={PEOPLE.slice(0, 4)} max={5} reverseOrder aria-label="team" />,
    );
    const items = Array.from(
      screen.getByRole('group', { name: 'team' }).querySelectorAll<HTMLElement>('[role="img"]'),
    );
    const zs = items.map((el) => Number(el.style.zIndex));
    for (let i = 1; i < zs.length; i += 1) {
      expect(zs[i - 1]! < zs[i]!).toBe(true);
    }
  });

  it('each visible avatar carries the ring class that masks the one behind', () => {
    render(<AvatarGroup items={PEOPLE.slice(0, 3)} aria-label="team" />);
    const items = Array.from(
      screen.getByRole('group', { name: 'team' }).querySelectorAll<HTMLElement>('[role="img"]'),
    );
    for (const el of items) {
      expect(el.className).toMatch(/ring-2/);
      expect(el.className).toMatch(/ring-background/);
    }
  });

  it('overflow chip uses the same shape/size as its siblings', () => {
    render(<AvatarGroup items={PEOPLE} max={2} size="lg" aria-label="team" />);
    const chip = screen.getByLabelText('5 more');
    expect(chip.className).toMatch(/h-12/);
    expect(chip.className).toMatch(/w-12/);
    expect(chip.className).toMatch(/rounded-full/);
  });

  it('first DOM child has ml-0 so the group does not visually overflow on the left', () => {
    render(<AvatarGroup items={PEOPLE.slice(0, 2)} aria-label="team" />);
    const first = screen
      .getByRole('group', { name: 'team' })
      .querySelector<HTMLElement>('[role="img"]');
    expect(first?.className).toMatch(/ml-0/);
  });

  it('forwards ref to the wrapper element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<AvatarGroup ref={ref} items={PEOPLE.slice(0, 2)} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className on the wrapper', () => {
    render(
      <AvatarGroup items={PEOPLE.slice(0, 2)} className="extra-class" aria-label="team" />,
    );
    expect(screen.getByRole('group', { name: 'team' }).className).toMatch(/extra-class/);
  });

  it('preserves consumer-supplied avatar style alongside computed z-index', () => {
    render(
      <AvatarGroup
        items={[
          { name: 'A', style: { opacity: 0.5 } },
          { name: 'B' },
        ]}
        aria-label="team"
      />,
    );
    const first = screen
      .getByRole('group', { name: 'team' })
      .querySelector<HTMLElement>('[role="img"]');
    expect(first?.style.opacity).toBe('0.5');
    expect(first?.style.zIndex).not.toBe('');
  });

  it('has no a11y violations (truncated + button overflow)', async () => {
    const { container } = render(
      <AvatarGroup items={PEOPLE} max={3} onOverflowClick={() => {}} aria-label="team" />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
