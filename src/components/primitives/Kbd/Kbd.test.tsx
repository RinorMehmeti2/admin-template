import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Kbd } from './Kbd';

describe('Kbd', () => {
  it('renders a semantic <kbd> element', () => {
    render(<Kbd>Enter</Kbd>);
    const el = screen.getByText('Enter');
    expect(el.tagName).toBe('KBD');
  });

  it('merges className', () => {
    render(<Kbd className="extra">⌘K</Kbd>);
    expect(screen.getByText('⌘K')).toHaveClass('extra');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLElement>();
    render(<Kbd ref={ref}>x</Kbd>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('KBD');
  });
});
