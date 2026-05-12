import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type StepIndicatorVariant,
  type WizardOrientation,
} from '@/components/forms/FormWizard';
import { DraftHint, WizardControls, WizardDemo } from './components';

export function WizardPage() {
  const { t } = useTranslation();

  const [orientation, setOrientation] = useState<WizardOrientation>('horizontal');
  const [variant, setVariant] = useState<StepIndicatorVariant>('numbered');

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('wizardDemo.title')}
        </h1>
        <p className="text-sm text-foreground-muted">
          {t('wizardDemo.description')}
        </p>
      </header>

      <WizardControls
        orientation={orientation}
        setOrientation={setOrientation}
        variant={variant}
        setVariant={setVariant}
      />

      <WizardDemo orientation={orientation} variant={variant} />

      <DraftHint />
    </div>
  );
}
