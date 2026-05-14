import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  AppendToTableWizardSection,
  BranchingWizardSection,
  ClassicWizardSection,
  ModalWizardSection,
} from './sections';

export function FormMultiStepPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('forms.multiStep.title')}
        description={t('forms.multiStep.subtitle')}
        className="mb-0"
      />

      <AppendToTableWizardSection />
      <ClassicWizardSection />
      <BranchingWizardSection />
      <ModalWizardSection />
    </div>
  );
}
