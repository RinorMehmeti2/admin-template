import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { FileExplorer } from './FileExplorer';
import type { FileExplorerAction, FileNode } from './FileExplorer.types';

const ROOT: FileNode = {
  id: 'root',
  name: 'Workspace',
  kind: 'folder',
  children: [
    {
      id: 'docs',
      name: 'docs',
      kind: 'folder',
      children: [
        { id: 'readme', name: 'README.md', kind: 'file', size: 1024, mime: 'text/markdown' },
        { id: 'guide', name: 'guide.md', kind: 'file', size: 2048, mime: 'text/markdown' },
        { id: 'guide2', name: 'guide2.md', kind: 'file', size: 4096, mime: 'text/markdown' },
      ],
    },
    {
      id: 'src',
      name: 'src',
      kind: 'folder',
      children: [{ id: 'index', name: 'index.ts', kind: 'file', size: 512 }],
    },
    { id: 'empty', name: 'empty', kind: 'folder', children: [] },
    { id: 'pkg', name: 'package.json', kind: 'file', size: 256 },
  ],
};

function getRightPaneListbox(): HTMLElement {
  return screen.getByRole('listbox', { name: /Contents of/ });
}

function getRowByName(name: string): HTMLElement {
  return within(getRightPaneListbox()).getByRole('option', { name: new RegExp(name) });
}

describe('FileExplorer', () => {
  it('renders root contents in the right pane', () => {
    render(<FileExplorer root={ROOT} />);
    const list = getRightPaneListbox();
    expect(within(list).getByRole('option', { name: /docs/ })).toBeInTheDocument();
    expect(within(list).getByRole('option', { name: /src/ })).toBeInTheDocument();
    expect(within(list).getByRole('option', { name: /package\.json/ })).toBeInTheDocument();
  });

  it('renders only folders in the tree (no files)', () => {
    render(<FileExplorer root={ROOT} />);
    const tree = screen.getByRole('tree', { name: 'Folders' });
    expect(within(tree).getByRole('treeitem', { name: /docs/ })).toBeInTheDocument();
    expect(within(tree).queryByRole('treeitem', { name: /package\.json/ })).toBeNull();
  });

  it('clicking a tree folder navigates the right pane', async () => {
    const user = userEvent.setup();
    const onPath = vi.fn();
    render(<FileExplorer root={ROOT} onSelectedPathChange={onPath} />);
    const tree = screen.getByRole('tree', { name: 'Folders' });
    await user.click(within(tree).getByRole('treeitem', { name: /docs/ }));
    expect(onPath).toHaveBeenCalledWith(['docs']);
    expect(getRowByName('README.md')).toBeInTheDocument();
    expect(getRowByName('guide.md')).toBeInTheDocument();
  });

  it('double-clicking a folder in the right pane navigates into it', async () => {
    const user = userEvent.setup();
    render(<FileExplorer root={ROOT} />);
    await user.dblClick(getRowByName('docs'));
    expect(getRowByName('README.md')).toBeInTheDocument();
  });

  it('breadcrumbs navigate back up the tree', async () => {
    const user = userEvent.setup();
    render(<FileExplorer root={ROOT} defaultSelectedPath={['docs']} />);
    // Heading row shows docs files.
    expect(getRowByName('README.md')).toBeInTheDocument();
    // Click root crumb.
    await user.click(screen.getByTestId('fe-crumb-root'));
    // Back at root → package.json visible.
    expect(getRowByName('package\\.json')).toBeInTheDocument();
  });

  it('toggles between list and grid view modes', async () => {
    const user = userEvent.setup();
    render(<FileExplorer root={ROOT} />);
    // List view renders the Name/Size/Modified header.
    expect(screen.getByText('Name')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Grid view' }));
    // Header gone in grid view.
    expect(screen.queryByText('Name')).toBeNull();
    // Tile testid present.
    expect(screen.getByTestId('fe-tile-docs')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'List view' }));
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('shift-click selects a contiguous range; ctrl-click toggles', () => {
    render(<FileExplorer root={ROOT} defaultSelectedPath={['docs']} />);
    const readme = getRowByName('README.md');
    const guide = getRowByName('guide.md');
    const guide2 = getRowByName('guide2.md');

    // Plain click → only README selected.
    fireEvent.click(readme);
    expect(readme).toHaveAttribute('aria-selected', 'true');
    expect(guide).toHaveAttribute('aria-selected', 'false');

    // Shift-click guide2 → range [README..guide2] all selected.
    fireEvent.click(guide2, { shiftKey: true });
    expect(readme).toHaveAttribute('aria-selected', 'true');
    expect(guide).toHaveAttribute('aria-selected', 'true');
    expect(guide2).toHaveAttribute('aria-selected', 'true');

    // Ctrl-click guide → toggle off; anchor moves but range stays minus guide.
    fireEvent.click(guide, { ctrlKey: true });
    expect(guide).toHaveAttribute('aria-selected', 'false');
    expect(readme).toHaveAttribute('aria-selected', 'true');
    expect(guide2).toHaveAttribute('aria-selected', 'true');
  });

  it('multiSelect=false ignores modifiers and keeps single selection', () => {
    render(
      <FileExplorer root={ROOT} defaultSelectedPath={['docs']} multiSelect={false} />,
    );
    const readme = getRowByName('README.md');
    const guide = getRowByName('guide.md');
    fireEvent.click(readme);
    fireEvent.click(guide, { shiftKey: true });
    fireEvent.click(guide, { ctrlKey: true });
    // Only guide remains selected.
    expect(readme).toHaveAttribute('aria-selected', 'false');
    expect(guide).toHaveAttribute('aria-selected', 'true');
  });

  it('clears selection when the folder path changes', async () => {
    const user = userEvent.setup();
    render(<FileExplorer root={ROOT} defaultSelectedPath={['docs']} />);
    fireEvent.click(getRowByName('README.md'));
    expect(getRowByName('README.md')).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByTestId('fe-crumb-root'));
    // Back at root, nothing selected.
    expect(screen.queryByRole('option', { selected: true })).toBeNull();
  });

  it('context menu opens, lists actions, fires onAction with the current selection', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<FileExplorer root={ROOT} defaultSelectedPath={['docs']} onAction={onAction} />);
    const guide = getRowByName('guide.md');
    fireEvent.click(guide);
    fireEvent.contextMenu(guide);
    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Open' })).toBeInTheDocument();
    await user.click(within(menu).getByRole('menuitem', { name: 'Open' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0]![0]).toBe('open');
    const passed = onAction.mock.calls[0]![1] as FileNode[];
    expect(passed).toHaveLength(1);
    expect(passed[0]!.id).toBe('guide');
  });

  it('right-click on a non-selected item replaces selection before opening menu', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<FileExplorer root={ROOT} defaultSelectedPath={['docs']} onAction={onAction} />);
    // First select README, then right-click guide.
    fireEvent.click(getRowByName('README.md'));
    fireEvent.contextMenu(getRowByName('guide.md'));
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Open' }));
    const passed = onAction.mock.calls[0]![1] as FileNode[];
    expect(passed).toHaveLength(1);
    expect(passed[0]!.id).toBe('guide');
  });

  it('right-click on an already-selected item keeps the multi-selection', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<FileExplorer root={ROOT} defaultSelectedPath={['docs']} onAction={onAction} />);
    fireEvent.click(getRowByName('README.md'));
    fireEvent.click(getRowByName('guide.md'), { ctrlKey: true });
    fireEvent.contextMenu(getRowByName('guide.md'));
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Open' }));
    const passed = onAction.mock.calls[0]![1] as FileNode[];
    expect(passed.map((n) => n.id).sort()).toEqual(['guide', 'readme']);
  });

  it('honors custom actions and disabled predicates', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const actions: ReadonlyArray<FileExplorerAction> = [
      { id: 'share', label: 'Share' },
      {
        id: 'bulk',
        label: 'Bulk move',
        disabled: (sel) => sel.length < 2,
      },
    ];
    render(
      <FileExplorer
        root={ROOT}
        defaultSelectedPath={['docs']}
        actions={actions}
        onAction={onAction}
      />,
    );
    fireEvent.click(getRowByName('README.md'));
    fireEvent.contextMenu(getRowByName('README.md'));
    const bulk = within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Bulk move' });
    expect(bulk).toHaveAttribute('data-disabled', 'true');
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Share' }));
    expect(onAction).toHaveBeenCalledWith('share', expect.arrayContaining([expect.objectContaining({ id: 'readme' })]));
  });

  it('empty folder shows EmptyState', async () => {
    const user = userEvent.setup();
    render(<FileExplorer root={ROOT} />);
    await user.click(
      within(screen.getByRole('tree', { name: 'Folders' })).getByRole('treeitem', {
        name: /empty/,
      }),
    );
    expect(screen.getByText('Empty folder')).toBeInTheDocument();
  });

  it('lazy-loads folder children via onLoadChildren', async () => {
    const onLoad = vi.fn();

    function Harness() {
      const [root, setRoot] = useState<FileNode>({
        id: 'root',
        name: 'Workspace',
        kind: 'folder',
        children: [
          // Folder with no children yet — will fire onLoadChildren on expand.
          { id: 'lazy', name: 'lazy', kind: 'folder' },
        ],
      });
      return (
        <FileExplorer
          root={root}
          onLoadChildren={(node) => {
            onLoad(node.id);
            // Simulate resolved fetch.
            setRoot((prev) => ({
              ...prev,
              children: [
                {
                  id: 'lazy',
                  name: 'lazy',
                  kind: 'folder',
                  children: [{ id: 'late', name: 'late.txt', kind: 'file', size: 10 }],
                },
              ],
            }));
          }}
        />
      );
    }

    const user = userEvent.setup();
    render(<Harness />);
    // Expand via tree → fires load.
    const treeItem = screen.getByRole('treeitem', { name: /lazy/ });
    treeItem.focus();
    await user.keyboard('{ArrowRight}');
    expect(onLoad).toHaveBeenCalledWith('lazy');
    // After load resolves, the new child folder/file is reachable via navigation.
    await user.click(treeItem);
    expect(getRowByName('late\\.txt')).toBeInTheDocument();
  });

  it('has no a11y violations on default render', async () => {
    const { container } = render(<FileExplorer root={ROOT} />);
    // `nested-interactive` is disabled: SplitLayout follows the WAI-ARIA
    // window-splitter pattern (collapse button inside the focusable
    // separator) — same carve-out as SplitLayout's own test.
    expect(
      await runAxe(container, { rules: { 'nested-interactive': { enabled: false } } }),
    ).toHaveNoViolations();
  });

  it('has no a11y violations with context menu open', async () => {
    render(<FileExplorer root={ROOT} defaultSelectedPath={['docs']} />);
    fireEvent.click(getRowByName('README.md'));
    fireEvent.contextMenu(getRowByName('README.md'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(
      await runAxe(document.body, { rules: { 'nested-interactive': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
