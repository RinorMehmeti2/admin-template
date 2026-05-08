import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

function Demo(props: React.ComponentProps<typeof Select>) {
  return (
    <Select {...props}>
      <option value="a">Alpha</option>
      <option value="b">Beta</option>
      <option value="c">Gamma</option>
    </Select>
  );
}

describe('Select', () => {
  it('renders a native select with options', () => {
    render(<Demo />);
    const sel = screen.getByRole('combobox');
    expect(sel.tagName).toBe('SELECT');
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('error variant', () => {
    render(<Demo variant="error" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('combobox')).toHaveClass('border-danger');
  });

  it('disabled', () => {
    render(<Demo disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ] as const)('selectSize=%s', (size, signal) => {
    render(<Demo selectSize={size} />);
    expect(screen.getByRole('combobox')).toHaveClass(signal);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select ref={ref}>
        <option value="a">a</option>
      </Select>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it('user can change value', async () => {
    render(<Demo defaultValue="a" />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b');
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('b');
  });
});
