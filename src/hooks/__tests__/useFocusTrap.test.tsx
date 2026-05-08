import { describe, it, expect } from 'vitest';
import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFocusTrap } from '@/hooks/useFocusTrap';

function TrapDemo({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { active });
  return (
    <div>
      <button>before</button>
      <div ref={ref} data-testid="trap">
        <button>first</button>
        <button>second</button>
        <button>last</button>
      </div>
      <button>after</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('moves focus to first focusable when activated', () => {
    render(<TrapDemo active />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'first' }));
  });

  it('Tab from last wraps to first', async () => {
    render(<TrapDemo active />);
    screen.getByRole('button', { name: 'last' }).focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'first' }));
  });

  it('Shift+Tab from first wraps to last', async () => {
    render(<TrapDemo active />);
    screen.getByRole('button', { name: 'first' }).focus();
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'last' }));
  });

  it('returns focus to previously focused element on deactivate', () => {
    const outside = document.createElement('button');
    outside.textContent = 'returner';
    document.body.appendChild(outside);
    outside.focus();

    const { rerender } = render(<TrapDemo active />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'first' }));

    rerender(<TrapDemo active={false} />);
    expect(document.activeElement).toBe(outside);

    outside.remove();
  });

  it('excludes elements with data-focus-trap-ignore', async () => {
    function Demo() {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, { active: true });
      return (
        <div ref={ref}>
          <button>a</button>
          <button data-focus-trap-ignore>ignored</button>
          <button>b</button>
        </div>
      );
    }
    render(<Demo />);
    // initial focus should land on the first non-ignored button
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'a' }));
    // Tab from b should wrap to a (skipping ignored)
    screen.getByRole('button', { name: 'b' }).focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'a' }));
  });
});
