import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { runAxe } from '@/test-utils/a11y';
import { Combobox, ComboboxContent, ComboboxTrigger } from './Combobox';

interface Country {
  code: string;
  name: string;
}

const COUNTRIES: ReadonlyArray<Country> = [
  { code: 'us', name: 'United States' },
  { code: 'ca', name: 'Canada' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
];

function SingleDemo({
  onChange,
  defaultValue,
}: {
  onChange?: (v: string | ReadonlyArray<string>) => void;
  defaultValue?: string;
}) {
  return (
    <Combobox<Country>
      items={COUNTRIES}
      getItemLabel={(c) => c.name}
      getItemValue={(c) => c.code}
      defaultValue={defaultValue}
      onValueChange={onChange}
    >
      <ComboboxTrigger placeholder="Pick a country" />
      <ComboboxContent />
    </Combobox>
  );
}

function ControlledDemo() {
  const [v, setV] = useState<string | ReadonlyArray<string>>('ca');
  return (
    <>
      <div data-testid="value">{Array.isArray(v) ? v.join(',') : v}</div>
      <Combobox<Country>
        items={COUNTRIES}
        getItemLabel={(c) => c.name}
        getItemValue={(c) => c.code}
        value={v}
        onValueChange={setV}
      >
        <ComboboxTrigger placeholder="Pick" />
        <ComboboxContent />
      </Combobox>
    </>
  );
}

function MultiDemo({ onChange }: { onChange?: (v: string | ReadonlyArray<string>) => void }) {
  return (
    <Combobox<Country>
      items={COUNTRIES}
      getItemLabel={(c) => c.name}
      getItemValue={(c) => c.code}
      multiple
      onValueChange={onChange}
    >
      <ComboboxTrigger placeholder="Pick countries" />
      <ComboboxContent />
    </Combobox>
  );
}

function CreatableDemo({ onCreate }: { onCreate: (q: string) => void }) {
  return (
    <Combobox<Country>
      items={COUNTRIES}
      getItemLabel={(c) => c.name}
      getItemValue={(c) => c.code}
      creatable
      onCreate={onCreate}
    >
      <ComboboxTrigger placeholder="Pick or create" />
      <ComboboxContent />
    </Combobox>
  );
}

function AsyncDemo({ loading }: { loading: boolean }) {
  const [items, setItems] = useState<Country[]>([]);
  return (
    <Combobox<Country>
      items={items}
      getItemLabel={(c) => c.name}
      getItemValue={(c) => c.code}
      loading={loading}
      onSearch={(q) => {
        setItems(COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())));
      }}
    >
      <ComboboxTrigger placeholder="Search" />
      <ComboboxContent />
    </Combobox>
  );
}

describe('Combobox — single select', () => {
  it('renders the trigger with combobox role', () => {
    render(<SingleDemo />);
    const cb = screen.getByRole('combobox');
    expect(cb).toBeInTheDocument();
    expect(cb).toHaveAttribute('aria-expanded', 'false');
    expect(cb).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('opens on focus and shows the listbox', async () => {
    const user = userEvent.setup();
    render(<SingleDemo />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
  });

  it('filters options when typing', async () => {
    const user = userEvent.setup();
    render(<SingleDemo />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'can');
    expect(screen.getByRole('option', { name: /Canada/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Germany/ })).toBeNull();
  });

  it('selects via Enter and closes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SingleDemo onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'ger');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('de');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });

  it('selects via mouse click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SingleDemo onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Australia/ }));
    expect(onChange).toHaveBeenCalledWith('au');
  });

  it('navigates with ArrowDown / ArrowUp / Home / End', async () => {
    const user = userEvent.setup();
    render(<SingleDemo />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    const lb = screen.getByRole('listbox');
    const firstOptionId = lb.getAttribute('aria-activedescendant');
    expect(firstOptionId).toBeTruthy();

    await user.keyboard('{ArrowDown}');
    expect(lb.getAttribute('aria-activedescendant')).not.toBe(firstOptionId);

    await user.keyboard('{End}');
    const last = screen.getAllByRole('option').at(-1);
    expect(lb.getAttribute('aria-activedescendant')).toBe(last?.id);

    await user.keyboard('{Home}');
    expect(lb.getAttribute('aria-activedescendant')).toBe(firstOptionId);
  });

  it('Escape closes', async () => {
    const user = userEvent.setup();
    render(<SingleDemo />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('shows selected label when closed', async () => {
    const user = userEvent.setup();
    render(<SingleDemo defaultValue="ca" />);
    const input = screen.getByRole<HTMLInputElement>('combobox');
    expect(input.value).toBe('Canada');
    await user.click(input);
    expect(input.value).toBe('');
  });

  it('shows empty message when no matches', async () => {
    const user = userEvent.setup();
    render(<SingleDemo />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'xyzzz');
    expect(screen.getByRole('status')).toHaveTextContent(/No results/);
  });

  it('controlled value reflects external changes', async () => {
    const user = userEvent.setup();
    render(<ControlledDemo />);
    expect(screen.getByTestId('value')).toHaveTextContent('ca');
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Germany/ }));
    expect(screen.getByTestId('value')).toHaveTextContent('de');
  });
});

describe('Combobox — multi select', () => {
  it('appends selections and renders chips', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MultiDemo onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /United States/ }));
    expect(onChange).toHaveBeenLastCalledWith(['us']);
    await user.click(screen.getByRole('option', { name: /Germany/ }));
    expect(onChange).toHaveBeenLastCalledWith(['us', 'de']);
    expect(screen.getByLabelText(/Remove United States/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Remove Germany/)).toBeInTheDocument();
  });

  it('Backspace on empty input removes the last chip', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MultiDemo onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /United States/ }));
    await user.click(screen.getByRole('option', { name: /Germany/ }));
    onChange.mockClear();
    await user.keyboard('{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith(['us']);
  });

  it('toggling an already-selected option removes it', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MultiDemo onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /United States/ }));
    await user.click(screen.getByRole('option', { name: /United States/ }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('Combobox — creatable', () => {
  it('shows a Create option when no exact match', async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreatableDemo onCreate={onCreate} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Brazil');
    const createOpt = screen.getByRole('option', { name: /Create.*Brazil/ });
    expect(createOpt).toBeInTheDocument();
    await user.click(createOpt);
    expect(onCreate).toHaveBeenCalledWith('Brazil');
  });

  it('does not show Create when an exact match exists', async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreatableDemo onCreate={onCreate} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Canada');
    expect(screen.queryByRole('option', { name: /Create.*Canada/ })).toBeNull();
  });
});

describe('Combobox — a11y', () => {
  it('has no a11y violations (closed + open listbox)', async () => {
    const user = userEvent.setup();
    const { container } = render(<SingleDemo />);
    expect(await runAxe(container)).toHaveNoViolations();
    await user.click(screen.getByRole('combobox'));
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});

describe('Combobox — async + states', () => {
  it('shows loading state when loading prop is true', async () => {
    const user = userEvent.setup();
    render(<AsyncDemo loading />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('status')).toHaveTextContent(/Loading/i);
  });

  it('renders items returned via onSearch when loading=false', async () => {
    const user = userEvent.setup();
    render(<AsyncDemo loading={false} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'germ');
    expect(await screen.findByRole('option', { name: /Germany/ })).toBeInTheDocument();
  });
});
