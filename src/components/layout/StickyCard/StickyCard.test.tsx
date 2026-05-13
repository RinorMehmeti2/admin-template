import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { StickyCard, StickyStack } from './StickyCard';

beforeEach(() => {
  // jsdom lacks IntersectionObserver — stub so the effect cleanup works.
  class IO {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
  }
  (
    globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }
  ).IntersectionObserver = IO as unknown as typeof IntersectionObserver;
});

describe('StickyCard', () => {
  it('renders children', () => {
    render(
      <div>
        <StickyCard>Hello</StickyCard>
      </div>,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies position:sticky + top offset', () => {
    render(
      <div>
        <StickyCard offset={64} data-testid="sc">
          x
        </StickyCard>
      </div>,
    );
    const card = screen.getByTestId('sc');
    expect(card.style.position).toBe('sticky');
    expect(card.style.top).toBe('64px');
  });

  it('side=bottom uses bottom offset', () => {
    render(
      <div>
        <StickyCard side="bottom" offset={20} data-testid="sc">
          x
        </StickyCard>
      </div>,
    );
    const card = screen.getByTestId('sc');
    expect(card.style.bottom).toBe('20px');
  });

  it('merges className', () => {
    render(
      <div>
        <StickyCard className="custom" data-testid="sc">
          x
        </StickyCard>
      </div>,
    );
    expect(screen.getByTestId('sc')).toHaveClass('custom');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <main>
        <StickyCard>card body</StickyCard>
      </main>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});

describe('StickyStack', () => {
  it('renders children with increasing top offsets', () => {
    render(
      <StickyStack offset={10} gap={20}>
        <div data-testid="c0">A</div>
        <div data-testid="c1">B</div>
        <div data-testid="c2">C</div>
      </StickyStack>,
    );
    expect(screen.getByTestId('c0').style.top).toBe('10px');
    expect(screen.getByTestId('c1').style.top).toBe('30px');
    expect(screen.getByTestId('c2').style.top).toBe('50px');
  });

  it('z-index ascends per card', () => {
    render(
      <StickyStack>
        <div data-testid="c0">A</div>
        <div data-testid="c1">B</div>
      </StickyStack>,
    );
    expect(Number(screen.getByTestId('c1').style.zIndex)).toBeGreaterThan(
      Number(screen.getByTestId('c0').style.zIndex),
    );
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <main>
        <StickyStack>
          <div>a</div>
          <div>b</div>
        </StickyStack>
      </main>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
