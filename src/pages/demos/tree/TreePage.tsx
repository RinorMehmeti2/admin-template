import { useState } from 'react';
import { DetailsCard, FilesCard } from './components';
import { TREE } from './data';
import { findById } from './model';

export function TreePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const selectedNode = selected[0] !== undefined ? findById(TREE, selected[0]) : undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">TreeView</h1>
        <p className="mt-1 text-foreground-muted">
          File-explorer pattern. Use arrow keys to navigate, Enter to open, type to jump.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_1fr]">
        <FilesCard selected={selected} setSelected={setSelected} />
        <DetailsCard selectedNode={selectedNode} />
      </div>
    </div>
  );
}
