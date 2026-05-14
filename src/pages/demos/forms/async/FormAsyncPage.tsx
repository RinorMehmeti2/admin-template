import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  AsyncSubmitSection,
  AutosaveSection,
  DirtyGuardSection,
  OptimisticUpdateSection,
  SuspenseDefaultsSection,
} from './sections';

export function FormAsyncPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('forms.async.title')}
        description={t('forms.async.subtitle')}
        className="mb-0"
      />

      <AsyncSubmitSection />
      <AutosaveSection />
      <DirtyGuardSection />
      <OptimisticUpdateSection />
      <SuspenseDefaultsSection />
    </div>
  );
}
