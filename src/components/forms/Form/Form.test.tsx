import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, useForm } from './Form';
import { Input } from '@/components/forms/Input';
import { runAxe } from '@/test-utils/a11y';

function Demo({ onSubmit }: { onSubmit: (v: { email: string }) => void }) {
  const form = useForm<{ email: string }>({ defaultValues: { email: '' } });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <Input placeholder="email" {...form.register('email')} />
      <button type="submit">Submit</button>
    </Form>
  );
}

describe('Form', () => {
  it('handleSubmit fires onSubmit with values', async () => {
    const onSubmit = vi.fn();
    render(<Demo onSubmit={onSubmit} />);
    await userEvent.type(screen.getByPlaceholderText('email'), 'a@b.co');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.co' }),
      expect.anything(),
    );
  });

  it('renders a noValidate <form>', () => {
    const onSubmit = vi.fn();
    const { container } = render(<Demo onSubmit={onSubmit} />);
    expect(container.querySelector('form')).toHaveAttribute('novalidate');
  });

  it('has no a11y violations', async () => {
    const onSubmit = vi.fn();
    const { container } = render(<Demo onSubmit={onSubmit} />);
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
