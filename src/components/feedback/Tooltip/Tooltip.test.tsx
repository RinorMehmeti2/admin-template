import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';
import { Button } from '@/components/primitives/Button';
import { runAxe } from '@/test-utils/a11y';

function Demo({ delay = 0 }: { delay?: number }) {
  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip>
        <TooltipTrigger>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe('Tooltip', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('does not render content while closed', () => {
    render(<Demo />);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows on hover after the delay', () => {
    render(<Demo delay={200} />);
    const trigger = screen.getByRole('button', { name: 'Hover me' });
    fireEvent.mouseEnter(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip text');
  });

  it('hides on mouseleave (after grace period)', () => {
    render(<Demo />);
    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows immediately on focus (no delay)', () => {
    render(<Demo delay={1000} />);
    const trigger = screen.getByRole('button');
    act(() => {
      trigger.focus();
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides on blur', () => {
    render(<Demo />);
    const trigger = screen.getByRole('button');
    act(() => {
      trigger.focus();
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    act(() => {
      trigger.blur();
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('Escape closes', () => {
    render(<Demo />);
    const trigger = screen.getByRole('button');
    act(() => {
      trigger.focus();
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    act(() => {
      const e = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
      document.dispatchEvent(e);
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('trigger gets aria-describedby pointing to the tooltip when open', () => {
    render(<Demo />);
    const trigger = screen.getByRole('button');
    expect(trigger.getAttribute('aria-describedby')).toBeNull();
    act(() => {
      trigger.focus();
    });
    const tip = screen.getByRole('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toContain(tip.getAttribute('id'));
  });

  it('has no a11y violations (open via focus)', async () => {
    // axe-core needs real timers; the suite uses fake timers for delay/grace.
    vi.useRealTimers();
    render(<Demo />);
    const trigger = screen.getByRole('button');
    act(() => {
      trigger.focus();
    });
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});
