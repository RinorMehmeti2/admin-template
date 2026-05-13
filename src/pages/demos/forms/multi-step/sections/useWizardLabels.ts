import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { WizardI18nLabels } from '@/components/forms/FormWizard';

/** Translated label bundle shared across the multi-step demos. */
export function useWizardLabels(submitLabel?: string): WizardI18nLabels {
  const { t } = useTranslation();
  return useMemo<WizardI18nLabels>(
    () => ({
      nextLabel: t('forms.wizard.next'),
      backLabel: t('forms.wizard.back'),
      submitLabel: submitLabel ?? t('forms.wizard.submit'),
      summaryTitle: t('forms.wizard.summaryTitle'),
      summaryDescription: t('forms.wizard.summaryDescription'),
      summaryHelpText: t('forms.wizard.summaryHelp'),
      restoreDialogTitle: t('forms.wizard.restoreTitle'),
      restoreDialogDescription: t('forms.wizard.restoreDescription'),
      restoreConfirmLabel: t('forms.wizard.restoreConfirm'),
      restoreCancelLabel: t('forms.wizard.restoreCancel'),
      blockedToast: (step: string) => t('forms.wizard.blockedToast', { step }),
      compactSummaryText: (current: number, total: number) =>
        t('forms.wizard.compactSummary', { current, total }),
    }),
    [t, submitLabel],
  );
}
