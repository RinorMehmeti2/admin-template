import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { PlanBuilderSection, ProfileCardsSection } from './sections';

export function FormCardsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('forms.cards.title')}
        description={t('forms.cards.subtitle')}
        className="mb-0"
      />

      <ProfileCardsSection />
      <PlanBuilderSection />
    </div>
  );
}
