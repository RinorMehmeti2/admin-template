import { useTranslation } from 'react-i18next';
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
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('forms.async.title')}</h2>
        <p className="max-w-3xl text-foreground-muted">{t('forms.async.subtitle')}</p>
      </header>

      <AsyncSubmitSection />
      <AutosaveSection />
      <DirtyGuardSection />
      <OptimisticUpdateSection />
      <SuspenseDefaultsSection />
    </div>
  );
}
