import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { Carousel } from './Carousel';

const slides = [
  { id: 'a', content: <div>Slide A</div> },
  { id: 'b', content: <div>Slide B</div> },
  { id: 'c', content: <div>Slide C</div> },
];

describe('Carousel', () => {
  it('renders all slides', () => {
    render(<Carousel slides={slides} aria-label="Stories" />);
    expect(screen.getByText('Slide A')).toBeInTheDocument();
    expect(screen.getByText('Slide B')).toBeInTheDocument();
    expect(screen.getByText('Slide C')).toBeInTheDocument();
  });

  it('exposes carousel role + label', () => {
    render(<Carousel slides={slides} aria-label="Stories" />);
    const region = screen.getByRole('region', { name: 'Stories' });
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('next button advances index', async () => {
    const onChange = vi.fn();
    render(<Carousel slides={slides} onIndexChange={onChange} aria-label="x" />);
    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('prev button moves back; loops at start when loop=true', async () => {
    const onChange = vi.fn();
    render(<Carousel slides={slides} onIndexChange={onChange} aria-label="x" />);
    await userEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('loop=false disables prev at index 0 and next at end', () => {
    render(<Carousel slides={slides} loop={false} aria-label="x" />);
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next slide' })).not.toBeDisabled();
  });

  it('arrow keys advance/retreat when slides have focus', async () => {
    const onChange = vi.fn();
    render(<Carousel slides={slides} onIndexChange={onChange} aria-label="x" />);
    const group = document.querySelector('[data-carousel-viewport]') as HTMLElement;
    group.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(1);
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('Home/End jump to bounds', async () => {
    const onChange = vi.fn();
    render(<Carousel slides={slides} onIndexChange={onChange} aria-label="x" />);
    const group = document.querySelector('[data-carousel-viewport]') as HTMLElement;
    group.focus();
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(2);
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('dots reflect and control current slide', async () => {
    const onChange = vi.fn();
    render(<Carousel slides={slides} onIndexChange={onChange} aria-label="x" />);
    const dots = screen.getAllByRole('tab');
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(dots[2]!);
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('hides arrows when showArrows=false', () => {
    render(<Carousel slides={slides} showArrows={false} aria-label="x" />);
    expect(screen.queryByRole('button', { name: 'Next slide' })).toBeNull();
  });

  it('hides dots when showDots=false', () => {
    render(<Carousel slides={slides} showDots={false} aria-label="x" />);
    expect(screen.queryByRole('tablist')).toBeNull();
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Carousel slides={slides} aria-label="Featured" />);
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
