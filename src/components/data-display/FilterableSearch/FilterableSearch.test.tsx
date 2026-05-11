import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { FilterableSearch } from './FilterableSearch';
import type { ActiveFilter, FilterDef } from './FilterableSearch.types';

const FILTERS: ReadonlyArray<FilterDef> = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  {
    id: 'tags',
    label: 'Tags',
    type: 'multi-select',
    options: [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ],
  },
  { id: 'note', label: 'Note', type: 'text', placeholder: 'contains…' },
];

describe('FilterableSearch', () => {
  it('renders search input and add filter button', () => {
    render(<FilterableSearch filters={FILTERS} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add filter/i })).toBeInTheDocument();
  });

  it('typing fires onQueryChange (debounced)', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    render(
      <FilterableSearch filters={FILTERS} onQueryChange={onQueryChange} debounceMs={0} />,
    );
    const input = screen.getByRole('searchbox');
    await user.type(input, 'hi');
    await waitFor(() => {
      expect(onQueryChange).toHaveBeenLastCalledWith('hi');
    });
  });

  it('Enter fires onSubmit with current query', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<FilterableSearch filters={FILTERS} onSubmit={onSubmit} />);
    const input = screen.getByRole('searchbox');
    await user.type(input, 'abc{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('abc');
  });

  it('opens filter menu listing available filters', async () => {
    const user = userEvent.setup();
    render(<FilterableSearch filters={FILTERS} />);
    await user.click(screen.getByRole('button', { name: /add filter/i }));
    const menu = await screen.findByRole('menu');
    expect(menu).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Tags' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Note' })).toBeInTheDocument();
  });

  it('selecting from menu adds chip and opens its editor', async () => {
    const user = userEvent.setup();
    render(<FilterableSearch filters={FILTERS} />);
    await user.click(screen.getByRole('button', { name: /add filter/i }));
    await user.click(screen.getByRole('menuitem', { name: 'Status' }));
    expect(screen.getByRole('button', { name: /edit status filter/i })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Status' })).toBeInTheDocument();
  });

  it('removes chip via X button', async () => {
    const user = userEvent.setup();
    render(
      <FilterableSearch
        filters={FILTERS}
        defaultActiveFilters={[{ id: 'status', value: 'active' }]}
      />,
    );
    expect(screen.getByRole('button', { name: /edit status filter/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remove status filter/i }));
    expect(screen.queryByRole('button', { name: /edit status filter/i })).toBeNull();
  });

  it('toggles editor on chip click', async () => {
    const user = userEvent.setup();
    render(
      <FilterableSearch
        filters={FILTERS}
        defaultActiveFilters={[{ id: 'status', value: 'active' }]}
      />,
    );
    const trigger = screen.getByRole('button', { name: /edit status filter/i });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Status' })).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByRole('dialog', { name: 'Status' })).toBeNull();
  });

  it('select editor picks value and closes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterableSearch
        filters={FILTERS}
        defaultActiveFilters={[{ id: 'status', value: '' }]}
        onActiveFiltersChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: /edit status filter/i }));
    await user.click(screen.getByRole('radio', { name: 'Active' }));
    expect(onChange).toHaveBeenCalledWith([{ id: 'status', value: 'active' }]);
    expect(screen.queryByRole('dialog', { name: 'Status' })).toBeNull();
  });

  it('multi-select editor toggles values without closing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterableSearch
        filters={FILTERS}
        defaultActiveFilters={[{ id: 'tags', value: [] }]}
        onActiveFiltersChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: /edit tags filter/i }));
    const alpha = screen.getByRole('checkbox', { name: 'Alpha' });
    await user.click(alpha);
    expect(onChange).toHaveBeenLastCalledWith([{ id: 'tags', value: ['a'] }]);
    expect(screen.getByRole('dialog', { name: 'Tags' })).toBeInTheDocument();
  });

  it('text editor commits on change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterableSearch
        filters={FILTERS}
        defaultActiveFilters={[{ id: 'note', value: '' }]}
        onActiveFiltersChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: /edit note filter/i }));
    const input = screen.getByRole('textbox', { name: 'Note' });
    await user.type(input, 'foo');
    expect(onChange).toHaveBeenLastCalledWith([{ id: 'note', value: 'foo' }]);
  });

  it('Escape closes the editor and returns focus to chip trigger', async () => {
    const user = userEvent.setup();
    render(
      <FilterableSearch
        filters={FILTERS}
        defaultActiveFilters={[{ id: 'status', value: 'active' }]}
      />,
    );
    const trigger = screen.getByRole('button', { name: /edit status filter/i });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Status' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Status' })).toBeNull();
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it('add-filter button disables when all filters are active', () => {
    render(
      <FilterableSearch
        filters={FILTERS.slice(0, 1)}
        defaultActiveFilters={[{ id: 'status', value: 'active' }]}
      />,
    );
    expect(screen.getByRole('button', { name: /add filter/i })).toBeDisabled();
  });

  it('keyboard navigates chips with Tab', async () => {
    const user = userEvent.setup();
    render(
      <FilterableSearch
        filters={FILTERS}
        defaultActiveFilters={[
          { id: 'status', value: 'active' },
          { id: 'note', value: 'x' },
        ]}
      />,
    );
    const searchInput = screen.getByRole('searchbox');
    searchInput.focus();
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /edit status filter/i }),
    );
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /remove status filter/i }),
    );
  });

  it('controlled mode reflects external activeFilters', async () => {
    function Demo() {
      const [active, setActive] = useState<ReadonlyArray<ActiveFilter>>([]);
      return (
        <div>
          <FilterableSearch
            filters={FILTERS}
            activeFilters={active}
            onActiveFiltersChange={setActive}
          />
          <button onClick={() => setActive([{ id: 'note', value: 'hi' }])}>seed</button>
        </div>
      );
    }
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole('button', { name: 'seed' }));
    expect(screen.getByRole('button', { name: /edit note filter/i })).toBeInTheDocument();
  });

  it('has no axe violations (closed)', async () => {
    const { container } = render(<FilterableSearch filters={FILTERS} />);
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('has no axe violations (editor open)', async () => {
    const user = userEvent.setup();
    render(
      <FilterableSearch
        filters={FILTERS}
        defaultActiveFilters={[{ id: 'status', value: 'active' }]}
      />,
    );
    await user.click(screen.getByRole('button', { name: /edit status filter/i }));
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});
