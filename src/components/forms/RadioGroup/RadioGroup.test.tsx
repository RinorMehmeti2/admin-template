import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from './RadioGroup';
import { Radio } from '@/components/forms/Radio';
import { runAxe } from '@/test-utils/a11y';

function Demo(props: Partial<React.ComponentProps<typeof RadioGroup>>) {
  return (
    <RadioGroup name="theme" {...props}>
      <Radio value="light">Light</Radio>
      <Radio value="dark">Dark</Radio>
      <Radio value="system">System</Radio>
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('renders a radiogroup with three radios sharing the same name', () => {
    render(<Demo />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios).toHaveLength(3);
    radios.forEach((r) => expect(r.name).toBe('theme'));
  });

  it('controlled value reflects props', () => {
    render(<Demo value="dark" onValueChange={() => undefined} />);
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Light' })).not.toBeChecked();
  });

  it('uncontrolled defaultValue selects on mount', () => {
    render(<Demo defaultValue="system" />);
    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
  });

  it('clicking a radio fires onValueChange', async () => {
    const onValueChange = vi.fn();
    render(<Demo defaultValue="light" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(onValueChange).toHaveBeenCalledWith('dark');
  });

  it('disabled blocks interaction on every child radio', async () => {
    const onValueChange = vi.fn();
    render(<Demo disabled onValueChange={onValueChange} />);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    radios.forEach((r) => expect(r).toBeDisabled());
    await userEvent.click(radios[1]!);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('exposes aria-label when provided', () => {
    render(<Demo aria-label="Theme" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Theme');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Demo aria-label="Theme" defaultValue="light" />);
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
