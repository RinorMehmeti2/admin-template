import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  AsyncUniqueSection,
  ConditionalSection,
  CrossFieldSection,
  ErrorSummarySection,
  ServerErrorSection,
  SyncZodSection,
} from './sections';

export function FormValidationPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('forms.validation.title')}
        description={t('forms.validation.subtitle')}
        className="mb-0"
      />

      <SyncZodSection />
      <CrossFieldSection />
      <AsyncUniqueSection />
      <ServerErrorSection />
      <ConditionalSection />
      <ErrorSummarySection />
    </div>
  );
}
