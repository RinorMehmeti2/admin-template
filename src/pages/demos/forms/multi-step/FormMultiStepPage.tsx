import { useTranslation } from 'react-i18next';
import {
  AppendToTableWizardSection,
  BranchingWizardSection,
  ClassicWizardSection,
  ModalWizardSection,
} from './sections';

export function FormMultiStepPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('forms.multiStep.title')}</h2>
        <p className="max-w-3xl text-foreground-muted">{t('forms.multiStep.subtitle')}</p>
      </header>

      <AppendToTableWizardSection />
      <ClassicWizardSection />
      <BranchingWizardSection />
      <ModalWizardSection />
    </div>
  );
}
