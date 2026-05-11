import type { FieldValues } from 'react-hook-form';
import type { FormWizardStepProps } from './FormWizard.types';

/*
 * FormWizardStep is a config carrier — it never renders DOM itself.
 * <FormWizard> walks its children via Children.toArray, reads each
 * Step's props, and renders the right one inside its own panel.
 */
export function FormWizardStep<TValues extends FieldValues = FieldValues>(
  _props: FormWizardStepProps<TValues>,
): null {
  return null;
}

FormWizardStep.displayName = 'FormWizardStep';
