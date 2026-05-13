import { useTranslation } from 'react-i18next';
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
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('forms.validation.title')}</h2>
        <p className="max-w-3xl text-foreground-muted">{t('forms.validation.subtitle')}</p>
      </header>

      <SyncZodSection />
      <CrossFieldSection />
      <AsyncUniqueSection />
      <ServerErrorSection />
      <ConditionalSection />
      <ErrorSummarySection />
    </div>
  );
}
