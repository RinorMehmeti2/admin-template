import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders default', () => {
    render(<Textarea placeholder="Bio" />);
    const ta = screen.getByPlaceholderText('Bio');
    expect(ta.tagName).toBe('TEXTAREA');
    expect(ta).toHaveClass('border-border');
  });

  it('error variant', () => {
    render(<Textarea variant="error" placeholder="x" />);
    const ta = screen.getByPlaceholderText('x');
    expect(ta).toHaveAttribute('aria-invalid', 'true');
    expect(ta).toHaveClass('border-danger');
  });

  it('disabled', () => {
    render(<Textarea disabled placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toBeDisabled();
  });

  it('readonly', () => {
    render(<Textarea readOnly value="x" onChange={() => undefined} />);
    expect(screen.getByDisplayValue('x')).toHaveAttribute('readonly');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('user can type', async () => {
    render(<Textarea placeholder="x" />);
    const ta = screen.getByPlaceholderText('x');
    await userEvent.type(ta, 'multi\nline');
    expect(ta).toHaveValue('multi\nline');
  });

  it('autoResize sets height inline style', async () => {
    render(<Textarea autoResize placeholder="x" defaultValue="content" />);
    const ta = screen.getByPlaceholderText('x') as HTMLTextAreaElement;
    // wait a frame for rAF
    await new Promise((r) => setTimeout(r, 30));
    expect(ta.style.height).not.toBe('');
  });
});
