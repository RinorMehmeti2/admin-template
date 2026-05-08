import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders children', () => {
    render(<Container>hi</Container>);
    expect(screen.getByText('hi')).toBeInTheDocument();
  });

  it.each([
    ['sm', 'max-w-3xl'],
    ['md', 'max-w-5xl'],
    ['lg', 'max-w-7xl'],
    ['xl', 'max-w-[96rem]'],
    ['full', 'max-w-none'],
  ] as const)('size=%s', (size, signal) => {
    render(<Container size={size} data-testid="c">x</Container>);
    expect(screen.getByTestId('c')).toHaveClass(signal);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Container ref={ref}>x</Container>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
