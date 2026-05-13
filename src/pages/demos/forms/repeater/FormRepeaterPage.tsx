import { useTranslation } from 'react-i18next';
import {
  CompoundRowsSection,
  InCardSection,
  NestedRepeaterSection,
  SimpleListSection,
} from './sections';

export function FormRepeaterPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('forms.repeater.title')}</h2>
        <p className="max-w-3xl text-foreground-muted">{t('forms.repeater.subtitle')}</p>
      </header>

      <SimpleListSection />
      <CompoundRowsSection />
      <InCardSection />
      <NestedRepeaterSection />
    </div>
  );
}
