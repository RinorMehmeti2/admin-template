import { useTranslation } from 'react-i18next';
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
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('forms.layouts.title')}</h2>
        <p className="max-w-3xl text-foreground-muted">{t('forms.layouts.subtitle')}</p>
      </header>

      <SingleColumnLayout />
      <TwoColumnLayout />
      <SectionedSidebarLayout />
      <InlineLayout />
      <CompactDensityLayout />
    </div>
  );
}
