import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  CompoundRowsSection,
  InCardSection,
  NestedRepeaterSection,
  SimpleListSection,
} from './sections';

export function FormRepeaterPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('forms.repeater.title')}
        description={t('forms.repeater.subtitle')}
        className="mb-0"
      />

      <SimpleListSection />
      <CompoundRowsSection />
      <InCardSection />
      <NestedRepeaterSection />
    </div>
  );
}
