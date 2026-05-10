import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { runAxe } from '@/test-utils/a11y';

describe('Card', () => {
  it('renders with default variant', () => {
    render(<Card data-testid="card">x</Card>);
    const c = screen.getByTestId('card');
    expect(c).toBeInTheDocument();
    expect(c).toHaveClass('bg-surface');
  });

  it.each([
    ['outlined', 'border-border'],
    ['elevated', 'shadow-md'],
  ] as const)('variant=%s applies signal', (variant, signal) => {
    render(
      <Card variant={variant} data-testid="card">
        x
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass(signal);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>x</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    render(
      <Card className="custom" data-testid="card">
        x
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass('custom');
  });

  it('composes header/title/description/content/footer', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Title', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Foot')).toBeInTheDocument();
  });

  it('has no a11y violations (composed)', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
