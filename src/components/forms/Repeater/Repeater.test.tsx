import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { Repeater } from './Repeater';
import { Input } from '@/components/forms/Input';

interface Row {
  name: string;
}

function Controlled({ onChange }: { onChange?: (items: Row[]) => void }) {
  const [items, setItems] = useState<Row[]>([{ name: 'one' }]);
  return (
    <Repeater
      label="Entries"
      items={items}
      onChange={(v) => {
        setItems(v);
        onChange?.(v);
      }}
      createItem={() => ({ name: '' })}
      renderItem={({ item, update, index }) => (
        <Input
          aria-label={`Row ${index + 1} name`}
          value={item.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      )}
    />
  );
}

describe('Repeater', () => {
  it('renders initial rows', () => {
    render(<Controlled />);
    expect(screen.getByRole('textbox', { name: 'Row 1 name' })).toHaveValue('one');
  });

  it('add button appends a new blank row', async () => {
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Add row' }));
    expect(screen.getByRole('textbox', { name: 'Row 2 name' })).toBeInTheDocument();
  });

  it('remove button drops the row', async () => {
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Add row' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove row 1' }));
    expect(screen.queryByDisplayValue('one')).toBeNull();
  });

  it('move up swaps with previous row', async () => {
    const onChange = vi.fn();
    function TwoRows() {
      const [items, setItems] = useState<Row[]>([{ name: 'a' }, { name: 'b' }]);
      return (
        <Repeater
          items={items}
          onChange={(v) => {
            setItems(v);
            onChange(v);
          }}
          createItem={() => ({ name: '' })}
          renderItem={({ item }) => <span>{item.name}</span>}
        />
      );
    }
    render(<TwoRows />);
    await userEvent.click(screen.getByRole('button', { name: 'Move row 2 up' }));
    expect(onChange).toHaveBeenLastCalledWith([{ name: 'b' }, { name: 'a' }]);
  });

  it('respects max — Add button disabled at max', async () => {
    render(
      <Repeater
        items={[{ name: 'a' }, { name: 'b' }]}
        onChange={() => {}}
        createItem={() => ({ name: '' })}
        max={2}
        renderItem={({ item }) => <span>{item.name}</span>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Add row' })).toBeDisabled();
  });

  it('respects min — Remove disabled at min', () => {
    render(
      <Repeater
        items={[{ name: 'a' }]}
        onChange={() => {}}
        createItem={() => ({ name: '' })}
        min={1}
        renderItem={({ item }) => <span>{item.name}</span>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Remove row 1' })).toBeDisabled();
  });

  it('backfills to min on mount', () => {
    const onChange = vi.fn();
    render(
      <Repeater
        defaultItems={[]}
        onChange={onChange}
        createItem={() => ({ name: '' })}
        min={2}
        renderItem={({ item }) => <span>{item.name}</span>}
      />,
    );
    expect(onChange).toHaveBeenCalledWith([{ name: '' }, { name: '' }]);
  });

  it('renders error message with role=alert', () => {
    render(
      <Repeater
        items={[{ name: '' }]}
        onChange={() => {}}
        createItem={() => ({ name: '' })}
        error="At least one is required"
        renderItem={({ item }) => <span>{item.name || 'blank'}</span>}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('At least one is required');
  });

  it('hides reorder + remove when disabled by props', () => {
    render(
      <Repeater
        items={[{ name: 'a' }]}
        onChange={() => {}}
        createItem={() => ({ name: '' })}
        reorderable={false}
        removable={false}
        addable={false}
        renderItem={({ item }) => <span>{item.name}</span>}
      />,
    );
    expect(screen.queryByRole('button', { name: /move/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /remove/i })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add row' })).toBeNull();
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Controlled />);
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
