import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  CompactDensityLayout,
  InlineLayout,
  SectionedSidebarLayout,
  SingleColumnLayout,
  TwoColumnLayout,
} from './sections';

export function FormLayoutsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('forms.layouts.title')}
        description={t('forms.layouts.subtitle')}
        className="mb-0"
      />

      <SingleColumnLayout />
      <TwoColumnLayout />
      <SectionedSidebarLayout />
      <InlineLayout />
      <CompactDensityLayout />
    </div>
  );
}
