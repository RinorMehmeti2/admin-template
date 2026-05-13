import { useTranslation } from 'react-i18next';
import { PlanBuilderSection, ProfileCardsSection } from './sections';

export function FormCardsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('forms.cards.title')}</h2>
        <p className="max-w-3xl text-foreground-muted">{t('forms.cards.subtitle')}</p>
      </header>

      <ProfileCardsSection />
      <PlanBuilderSection />
    </div>
  );
}
