import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { DetailsCard, FilesCard } from './components';
import { TREE } from './data';
import { findById } from './model';

export function TreePage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);
  const selectedNode = selected[0] !== undefined ? findById(TREE, selected[0]) : undefined;

  return (
    <div className="mx-auto max-w-[1400px]">
      <SimsPageHeader title={t('demos.tree.title')} description={t('demos.tree.subtitle')} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        <FilesCard selected={selected} setSelected={setSelected} />
        <DetailsCard selectedNode={selectedNode} />
      </div>
    </div>
  );
}
