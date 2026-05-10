import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { TagInput } from './TagInput';

function getInput(): HTMLInputElement {
  // No combobox role unless suggestions; query by label / placeholder instead.
  const inputs = document.querySelectorAll('input');
  if (inputs.length === 0) throw new Error('no input rendered');
  return inputs[0] as HTMLInputElement;
}

describe('TagInput', () => {
  it('renders existing tags as chips', () => {
    render(<TagInput aria-label="tags" defaultValue={['a', 'b']} />);
    expect(screen.getByRole('button', { name: /^a/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^b/ })).toBeInTheDocument();
  });

  it('comma commits a tag', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TagInput aria-label="tags" onValueChange={onValueChange} />);
    const input = getInput();
    await user.click(input);
    await user.type(input, 'react,');
    expect(onValueChange).toHaveBeenLastCalledWith(['react']);
    expect(input.value).toBe('');
  });

  it('Enter commits a tag', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TagInput aria-label="tags" onValueChange={onValueChange} />);
    const input = getInput();
    await user.click(input);
    await user.type(input, 'typescript');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['typescript']);
  });

  it('Backspace on empty input removes last chip', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TagInput aria-label="tags" defaultValue={['a', 'b']} onValueChange={onValueChange} />,
    );
    const input = getInput();
    await user.click(input);
    await user.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenLastCalledWith(['a']);
  });

  it('ArrowLeft on empty input focuses last chip', async () => {
    const user = userEvent.setup();
    render(<TagInput aria-label="tags" defaultValue={['alpha', 'beta']} />);
    const input = getInput();
    await user.click(input);
    await user.keyboard('{ArrowLeft}');
    const beta = screen.getByRole('button', { name: /^beta/ });
    expect(beta).toHaveFocus();
  });

  it('ArrowLeft/ArrowRight navigate between chips', async () => {
    const user = userEvent.setup();
    render(<TagInput aria-label="tags" defaultValue={['a', 'b', 'c']} />);
    const input = getInput();
    await user.click(input);
    await user.keyboard('{ArrowLeft}'); // focuses 'c'
    expect(screen.getByRole('button', { name: /^c/ })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: /^b/ })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: /^c/ })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(input).toHaveFocus();
  });

  it('Backspace on chip removes it and returns focus to input', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TagInput
        aria-label="tags"
        defaultValue={['a', 'b', 'c']}
        onValueChange={onValueChange}
      />,
    );
    const input = getInput();
    await user.click(input);
    await user.keyboard('{ArrowLeft}'); // focus c
    await user.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b']);
    expect(input).toHaveFocus();
  });

  it('Escape on chip returns to input', async () => {
    const user = userEvent.setup();
    render(<TagInput aria-label="tags" defaultValue={['a', 'b']} />);
    const input = getInput();
    await user.click(input);
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: /^b/ })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(input).toHaveFocus();
  });

  it('paste splits multi-tag content', () => {
    const onValueChange = vi.fn();
    render(<TagInput aria-label="tags" onValueChange={onValueChange} />);
    const input = getInput();
    fireEvent.focus(input);
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => 'a, b, c\nd',
      },
    });
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b', 'c', 'd']);
  });

  it('validate rejects invalid tokens', async () => {
    const onValueChange = vi.fn();
    const onInvalid = vi.fn();
    const user = userEvent.setup();
    const validate = (raw: string): string | null => {
      const trimmed = raw.trim();
      return /^[a-z]+$/.test(trimmed) ? trimmed : null;
    };
    render(
      <TagInput
        aria-label="tags"
        validate={validate}
        onValueChange={onValueChange}
        onInvalid={onInvalid}
      />,
    );
    const input = getInput();
    await user.click(input);
    await user.type(input, '123');
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalledWith('123');

    await user.clear(input);
    await user.type(input, 'good');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['good']);
  });

  it('rejects duplicates by default', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TagInput aria-label="tags" defaultValue={['a']} onValueChange={onValueChange} />,
    );
    const input = getInput();
    await user.click(input);
    await user.type(input, 'a');
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('allowDuplicates accepts duplicates', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TagInput
        aria-label="tags"
        defaultValue={['a']}
        allowDuplicates
        onValueChange={onValueChange}
      />,
    );
    const input = getInput();
    await user.click(input);
    await user.type(input, 'a');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'a']);
  });

  it('maxTags enforced', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TagInput
        aria-label="tags"
        defaultValue={['a', 'b']}
        maxTags={2}
        onValueChange={onValueChange}
      />,
    );
    const input = getInput();
    await user.click(input);
    await user.type(input, 'c');
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('disabled state hides X and disables interaction', () => {
    render(<TagInput aria-label="tags" defaultValue={['a']} disabled />);
    const chip = screen.getByRole('button', { name: 'a' });
    expect(chip).toBeDisabled();
    expect(getInput()).toBeDisabled();
  });

  it('readOnly chips have no remove affordance', () => {
    render(<TagInput aria-label="tags" defaultValue={['a']} readOnly />);
    const chip = screen.getByRole('button', { name: 'a' });
    // Read-only chip uses bare label as aria-label (no "press Backspace…" hint).
    expect(chip).toHaveAccessibleName('a');
  });

  it('with suggestions: ArrowDown opens, Enter commits active suggestion', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TagInput
        aria-label="tags"
        suggestions={['frontend', 'backend', 'design']}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['backend']);
  });

  it('with suggestions: typing filters and Enter commits filtered match', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TagInput
        aria-label="tags"
        suggestions={['react', 'redux', 'angular']}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'red');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['redux']);
  });

  it('with suggestions: combobox role exposes correct ARIA', () => {
    render(
      <TagInput
        aria-label="tags"
        suggestions={['a', 'b']}
        defaultValue={[]}
      />,
    );
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('email validation example', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    const validate = (raw: string): string | null => {
      const trimmed = raw.trim();
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null;
    };
    render(<TagInput aria-label="emails" validate={validate} onValueChange={onValueChange} />);
    const input = getInput();
    await user.click(input);
    await user.type(input, 'not-an-email');
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, 'a@b.co');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['a@b.co']);
  });

  it('controlled mode', async () => {
    function Harness() {
      const [v, setV] = useState<string[]>([]);
      return (
        <TagInput<string>
          aria-label="tags"
          value={v}
          onValueChange={setV}
        />
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    const input = getInput();
    await user.click(input);
    await user.type(input, 'x,y,');
    expect(screen.getByRole('button', { name: /^x/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^y/ })).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="t1" id="t1-label">
          Tags
        </label>
        <TagInput id="t1" aria-labelledby="t1-label" defaultValue={['a', 'b']} />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
