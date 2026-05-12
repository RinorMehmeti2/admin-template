import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DetailsCard, FilesCard } from './components';
import { TREE } from './data';
import { findById } from './model';

export function TreePage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);
  const selectedNode = selected[0] !== undefined ? findById(TREE, selected[0]) : undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('demos.tree.title')}</h1>
        <p className="mt-1 text-foreground-muted">{t('demos.tree.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_1fr]">
        <FilesCard selected={selected} setSelected={setSelected} />
        <DetailsCard selectedNode={selectedNode} />
      </div>
    </div>
  );
}
