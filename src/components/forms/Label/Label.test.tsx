import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { Label } from './Label';

describe('Label', () => {
  it('renders children', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders required asterisk when required=true', () => {
    render(<Label required>Email</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
    // asterisk is decorative
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('does NOT render asterisk by default', () => {
    render(<Label>Email</Label>);
    expect(screen.queryByText('*')).toBeNull();
  });

  it('forwards htmlFor', () => {
    const { container } = render(<Label htmlFor="my-input">x</Label>);
    expect(container.querySelector('label')).toHaveAttribute('for', 'my-input');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLLabelElement>();
    render(<Label ref={ref}>x</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('merges className', () => {
    render(<Label className="custom">x</Label>);
    expect(screen.getByText('x').closest('label')).toHaveClass('custom');
  });

  it('has no a11y violations (label + required associated)', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="x" required>
          Email
        </Label>
        <input id="x" />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
