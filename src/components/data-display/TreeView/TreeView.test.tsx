import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { TreeView } from './TreeView';
import type { TreeNode } from './TreeView.types';
import { useState } from 'react';

const NODES: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.tsx' },
          { id: 'card', label: 'Card.tsx' },
        ],
      },
      {
        id: 'hooks',
        label: 'hooks',
        children: [{ id: 'useDisclosure', label: 'useDisclosure.ts' }],
      },
      { id: 'main', label: 'main.tsx' },
    ],
  },
  {
    id: 'package',
    label: 'package.json',
  },
];

function getItem(label: string): HTMLElement {
  const el = screen.getByRole('treeitem', { name: new RegExp(`^\\s*${label}\\s*$`) });
  return el;
}

describe('TreeView', () => {
  it('renders root with role=tree and items as treeitems', () => {
    render(<TreeView items={NODES} aria-label="Files" defaultExpandedIds={['src']} />);
    const tree = screen.getByRole('tree', { name: 'Files' });
    expect(tree).toBeInTheDocument();
    expect(within(tree).getAllByRole('treeitem').length).toBeGreaterThan(0);
  });

  it('exposes ARIA level / posinset / setsize / expanded', () => {
    render(<TreeView items={NODES} defaultExpandedIds={['src']} />);
    const src = getItem('src');
    expect(src).toHaveAttribute('aria-level', '1');
    expect(src).toHaveAttribute('aria-posinset', '1');
    expect(src).toHaveAttribute('aria-setsize', '2');
    expect(src).toHaveAttribute('aria-expanded', 'true');
    const components = getItem('components');
    expect(components).toHaveAttribute('aria-level', '2');
    expect(components).toHaveAttribute('aria-expanded', 'false');
  });

  it('hides collapsed children from the visible tree', () => {
    render(<TreeView items={NODES} aria-label="t" />);
    expect(screen.queryByRole('treeitem', { name: /components/ })).not.toBeInTheDocument();
  });

  it('ArrowRight expands; ArrowLeft collapses', async () => {
    const user = userEvent.setup();
    render(<TreeView items={NODES} aria-label="t" />);
    const src = getItem('src');
    src.focus();
    await user.keyboard('{ArrowRight}');
    expect(getItem('src')).toHaveAttribute('aria-expanded', 'true');
    expect(getItem('components')).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(getItem('src')).toHaveAttribute('aria-expanded', 'false');
  });

  it('ArrowDown / ArrowUp move across visible nodes', async () => {
    const user = userEvent.setup();
    render(<TreeView items={NODES} defaultExpandedIds={['src']} aria-label="t" />);
    getItem('src').focus();
    await user.keyboard('{ArrowDown}');
    expect(getItem('components')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(getItem('hooks')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(getItem('components')).toHaveFocus();
  });

  it('ArrowRight on expanded folder moves to first child', async () => {
    const user = userEvent.setup();
    render(<TreeView items={NODES} defaultExpandedIds={['src']} aria-label="t" />);
    getItem('src').focus();
    await user.keyboard('{ArrowRight}');
    expect(getItem('components')).toHaveFocus();
  });

  it('ArrowLeft on a leaf moves to parent', async () => {
    const user = userEvent.setup();
    render(<TreeView items={NODES} defaultExpandedIds={['src']} aria-label="t" />);
    getItem('main.tsx').focus();
    await user.keyboard('{ArrowLeft}');
    expect(getItem('src')).toHaveFocus();
  });

  it('Home / End jump to first / last visible nodes', async () => {
    const user = userEvent.setup();
    render(<TreeView items={NODES} defaultExpandedIds={['src']} aria-label="t" />);
    getItem('hooks').focus();
    await user.keyboard('{End}');
    expect(getItem('package.json')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(getItem('src')).toHaveFocus();
  });

  it('typeahead jumps to matching label', async () => {
    const user = userEvent.setup();
    render(<TreeView items={NODES} defaultExpandedIds={['src']} aria-label="t" />);
    getItem('src').focus();
    await user.keyboard('h');
    expect(getItem('hooks')).toHaveFocus();
  });

  it('asterisk expands all siblings of focused node', async () => {
    const user = userEvent.setup();
    render(<TreeView items={NODES} defaultExpandedIds={['src']} aria-label="t" />);
    getItem('components').focus();
    await user.keyboard('*');
    expect(getItem('components')).toHaveAttribute('aria-expanded', 'true');
    expect(getItem('hooks')).toHaveAttribute('aria-expanded', 'true');
  });

  it('selectionMode=single sets aria-selected and fires onSelectedChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TreeView
        items={NODES}
        selectionMode="single"
        defaultExpandedIds={['src']}
        onSelectedChange={onChange}
        aria-label="t"
      />,
    );
    getItem('main.tsx').focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['main']);
    expect(getItem('main.tsx')).toHaveAttribute('aria-selected', 'true');
  });

  it('selectionMode=multiple toggles via Space, cascades to descendants', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [sel, setSel] = useState<string[]>([]);
      return (
        <TreeView
          items={NODES}
          selectionMode="multiple"
          defaultExpandedIds={['src', 'components']}
          selectedIds={sel}
          onSelectedChange={setSel}
          aria-label="t"
        />
      );
    }
    render(<Harness />);
    getItem('components').focus();
    await user.keyboard(' ');
    expect(getItem('components')).toHaveAttribute('aria-selected', 'true');
    expect(getItem('Button.tsx')).toHaveAttribute('aria-selected', 'true');
    expect(getItem('Card.tsx')).toHaveAttribute('aria-selected', 'true');
    // unrelated node not selected
    expect(getItem('main.tsx')).toHaveAttribute('aria-selected', 'false');
  });

  it('selectionMode=none fires onNodeActivate on Enter', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(
      <TreeView
        items={NODES}
        defaultExpandedIds={['src']}
        onNodeActivate={onActivate}
        aria-label="t"
      />,
    );
    getItem('main.tsx').focus();
    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate.mock.calls[0]![0]).toMatchObject({ id: 'main' });
  });

  it('disabled nodes do not toggle selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const items: TreeNode[] = [{ id: 'a', label: 'a', disabled: true }];
    render(
      <TreeView
        items={items}
        selectionMode="single"
        onSelectedChange={onChange}
        aria-label="t"
      />,
    );
    const a = getItem('a');
    expect(a).toHaveAttribute('aria-disabled', 'true');
    a.focus();
    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('async load fires onLoadChildren the first time an empty folder expands', async () => {
    const user = userEvent.setup();
    const onLoad = vi.fn();
    const items: TreeNode[] = [{ id: 'lazy', label: 'lazy', isLeaf: false }];
    render(<TreeView items={items} onLoadChildren={onLoad} aria-label="t" />);
    getItem('lazy').focus();
    await user.keyboard('{ArrowRight}');
    expect(onLoad).toHaveBeenCalledTimes(1);
    // collapse + re-expand should NOT load again
    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowRight}');
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('only the focused treeitem has tabIndex=0', () => {
    render(<TreeView items={NODES} defaultExpandedIds={['src']} aria-label="t" />);
    const items = screen.getAllByRole('treeitem');
    const tabbables = items.filter((el) => el.getAttribute('tabindex') === '0');
    expect(tabbables.length).toBe(1);
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <TreeView items={NODES} defaultExpandedIds={['src']} selectionMode="single" aria-label="Files" />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
