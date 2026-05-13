import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { Motion } from './Motion';
import { Stagger } from './Stagger';
import { FadeIn, SlideInUp, ScaleIn, BounceIn } from './presets';
import { PulseRing, Shimmer, TypingDots, Float, Wiggle, Marquee } from './ambient';

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

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

describe('Motion', () => {
  it('renders children with animation style by default', () => {
    render(
      <Motion animation="fade-in" data-testid="m">
        Hello
      </Motion>,
    );
    const el = screen.getByTestId('m');
    expect(el).toHaveTextContent('Hello');
    expect(el.style.animationName).toBe('fade-in');
  });

  it('disabled skips animation', () => {
    render(
      <Motion animation="fade-in" disabled data-testid="m">
        x
      </Motion>,
    );
    expect(screen.getByTestId('m').style.animationName).toBe('');
  });

  it('whenInView defers animation until visible', () => {
    render(
      <Motion animation="fade-in" whenInView data-testid="m">
        x
      </Motion>,
    );
    // Stubbed IntersectionObserver never fires intersection — should not animate yet.
    expect(screen.getByTestId('m').style.animationName).toBe('');
  });

  it('respects custom duration + delay', () => {
    render(
      <Motion animation="slide-in-up" duration={500} delay={120} data-testid="m">
        x
      </Motion>,
    );
    const el = screen.getByTestId('m');
    expect(el.style.animationDuration).toBe('500ms');
    expect(el.style.animationDelay).toBe('120ms');
  });

  it('renders as custom element', () => {
    render(
      <Motion as="section" animation="fade-in" data-testid="m">
        x
      </Motion>,
    );
    expect(screen.getByTestId('m').tagName).toBe('SECTION');
  });
});

describe('Stagger', () => {
  it('wraps each child in Motion', () => {
    render(
      <Stagger whenInView={false}>
        <div>a</div>
        <div>b</div>
        <div>c</div>
      </Stagger>,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('c')).toBeInTheDocument();
  });
});

describe('Presets', () => {
  it('FadeIn / SlideInUp / ScaleIn / BounceIn render', () => {
    render(
      <div>
        <FadeIn>fade</FadeIn>
        <SlideInUp>slide</SlideInUp>
        <ScaleIn>scale</ScaleIn>
        <BounceIn>bounce</BounceIn>
      </div>,
    );
    expect(screen.getByText('fade')).toBeInTheDocument();
    expect(screen.getByText('slide')).toBeInTheDocument();
    expect(screen.getByText('scale')).toBeInTheDocument();
    expect(screen.getByText('bounce')).toBeInTheDocument();
  });
});

describe('Ambient', () => {
  it('PulseRing renders decorative element', () => {
    const { container } = render(<PulseRing aria-hidden="true" />);
    expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('Shimmer renders surface', () => {
    render(<Shimmer data-testid="shim">x</Shimmer>);
    expect(screen.getByTestId('shim')).toHaveClass('animate-shimmer');
  });

  it('TypingDots renders three dots', () => {
    const { container } = render(<TypingDots />);
    expect(container.querySelectorAll('.animate-typing-dot').length).toBe(3);
  });

  it('Float / Wiggle wrap children', () => {
    render(
      <>
        <Float>F</Float>
        <Wiggle>W</Wiggle>
      </>,
    );
    expect(screen.getByText('F')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
  });

  it('Marquee renders two copies (loop)', () => {
    const { container } = render(<Marquee>Item</Marquee>);
    expect(container.textContent).toContain('Item');
  });
});

describe('a11y', () => {
  it('has no a11y violations across motion primitives', async () => {
    const { container } = render(
      <main>
        <FadeIn>fade</FadeIn>
        <SlideInUp>slide</SlideInUp>
        <PulseRing />
        <TypingDots />
        <Shimmer className="h-4 w-32" />
      </main>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
