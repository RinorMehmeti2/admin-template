import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';
import { Input } from '@/components/forms/Input';
import { Checkbox } from '@/components/forms/Checkbox';
import { runAxe } from '@/test-utils/a11y';

describe('FormField', () => {
  it('renders label and links it to the input via htmlFor/id', () => {
    render(
      <FormField label="Email">
        <Input placeholder="x" />
      </FormField>,
    );
    const input = screen.getByPlaceholderText('x');
    const label = screen.getByText('Email').closest('label')!;
    expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
    expect(input.getAttribute('id')).not.toBeNull();
  });

  it('renders description and wires aria-describedby', () => {
    render(
      <FormField label="Email" description="Where you sign in.">
        <Input placeholder="x" />
      </FormField>,
    );
    const input = screen.getByPlaceholderText('x');
    const desc = screen.getByText('Where you sign in.');
    expect(input.getAttribute('aria-describedby')).toContain(desc.getAttribute('id'));
  });

  it('renders error and wires aria-invalid + aria-describedby', () => {
    render(
      <FormField label="Email" error="Required">
        <Input placeholder="x" />
      </FormField>,
    );
    const input = screen.getByPlaceholderText('x');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toContain(
      screen.getByText('Required').getAttribute('id'),
    );
    expect(input).toHaveClass('border-danger');
  });

  it('error region uses role=alert', () => {
    render(
      <FormField label="x" error="bad">
        <Input placeholder="x" />
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('bad');
  });

  it('description AND error are both in aria-describedby (space-separated)', () => {
    render(
      <FormField label="x" description="hint" error="bad">
        <Input placeholder="x" />
      </FormField>,
    );
    const input = screen.getByPlaceholderText('x');
    const ids = input.getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(ids.length).toBe(2);
  });

  it('required adds an asterisk to the label', () => {
    render(
      <FormField label="Email" required>
        <Input placeholder="x" />
      </FormField>,
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('works with Checkbox (non-text input)', () => {
    render(
      <FormField label="Agree" error="must agree">
        <Checkbox />
      </FormField>,
    );
    const cb = screen.getByRole('checkbox');
    expect(cb).toHaveAttribute('aria-invalid', 'true');
    expect(cb.getAttribute('aria-describedby')).toContain(
      screen.getByText('must agree').getAttribute('id'),
    );
  });

  it('respects an explicit id on the field', () => {
    render(
      <FormField id="my-field" label="x">
        <Input placeholder="x" />
      </FormField>,
    );
    expect(screen.getByPlaceholderText('x')).toHaveAttribute('id', 'my-field');
  });

  it('hideLabel keeps the label in DOM but visually hidden (sr-only)', () => {
    render(
      <FormField label="hidden-label" hideLabel>
        <Input placeholder="x" />
      </FormField>,
    );
    const label = screen.getByText('hidden-label').closest('label')!;
    expect(label).toHaveClass('sr-only');
  });

  it('has no a11y violations (label + description + error)', async () => {
    const { container } = render(
      <div>
        <FormField label="Email" description="Where you sign in." required>
          <Input placeholder="x" />
        </FormField>
        <FormField label="Pass" error="Required">
          <Input placeholder="y" />
        </FormField>
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
