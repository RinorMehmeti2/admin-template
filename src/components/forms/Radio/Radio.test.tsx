import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { Radio } from './Radio';
import { RadioGroup } from '@/components/forms/RadioGroup';

describe('Radio', () => {
  it('renders standalone with name + value', () => {
    render(
      <Radio name="x" value="a">
        Alpha
      </Radio>,
    );
    const r = screen.getByRole('radio', { name: 'Alpha' }) as HTMLInputElement;
    expect(r.name).toBe('x');
    expect(r.value).toBe('a');
  });

  it('inside group: clicking selects this value', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup name="g" defaultValue="a" onValueChange={onValueChange}>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('reflects checked state from group context', () => {
    render(
      <RadioGroup name="g" value="b" onValueChange={() => undefined}>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'A' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
  });

  it('disabled prop disables only this radio', () => {
    render(
      <RadioGroup name="g" defaultValue="a">
        <Radio value="a">A</Radio>
        <Radio value="b" disabled>
          B
        </Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'A' })).not.toBeDisabled();
    expect(screen.getByRole('radio', { name: 'B' })).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Radio name="x" value="a" ref={ref}>
        A
      </Radio>,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('has no a11y violations (inside group)', async () => {
    const { container } = render(
      <RadioGroup name="g" defaultValue="a" aria-label="Pick one">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
