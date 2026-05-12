import { useTranslation } from 'react-i18next';
import {
  type StepIndicatorVariant,
  type WizardOrientation,
} from '@/components/forms/FormWizard';
import { Button } from '@/components/primitives/Button';
import { VARIANTS } from '../data';

interface WizardControlsProps {
  orientation: WizardOrientation;
  setOrientation: (value: WizardOrientation) => void;
  variant: StepIndicatorVariant;
  setVariant: (value: StepIndicatorVariant) => void;
}

export function WizardControls({
  orientation,
  setOrientation,
  variant,
  setVariant,
}: WizardControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {t('wizardDemo.orientationLabel')}:
        </span>
        <Button
          size="sm"
          variant={orientation === 'horizontal' ? 'primary' : 'outline'}
          onClick={() => setOrientation('horizontal')}
        >
          {t('wizardDemo.orientationHorizontal')}
        </Button>
        <Button
          size="sm"
          variant={orientation === 'vertical' ? 'primary' : 'outline'}
          onClick={() => setOrientation('vertical')}
        >
          {t('wizardDemo.orientationVertical')}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {t('wizardDemo.variantLabel')}:
        </span>
        {VARIANTS.map((v) => (
          <Button
            key={v}
            size="sm"
            variant={variant === v ? 'primary' : 'outline'}
            onClick={() => setVariant(v)}
          >
            {v}
          </Button>
        ))}
      </div>
    </div>
  );
}
