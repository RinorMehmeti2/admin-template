import type { ReactNode } from 'react';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/lib/cn';

export interface FormWizardFooterProps {
  canGoBack: boolean;
  isFinal: boolean;
  isSubmitting: boolean;
  backLabel: ReactNode;
  nextLabel: ReactNode;
  submitLabel: ReactNode;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  className?: string;
}

export function FormWizardFooter({
  canGoBack,
  isFinal,
  isSubmitting,
  backLabel,
  nextLabel,
  submitLabel,
  onBack,
  onNext,
  onSubmit,
  className,
}: FormWizardFooterProps) {
  return (
    <div
      data-testid="wizard-footer"
      className={cn(
        'mt-6 flex items-center justify-end gap-2 border-t border-border pt-4',
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={!canGoBack || isSubmitting}
        data-testid="wizard-back"
      >
        {backLabel}
      </Button>
      {isFinal ? (
        <Button
          type="button"
          variant="primary"
          onClick={onSubmit}
          isLoading={isSubmitting}
          data-testid="wizard-submit"
        >
          {submitLabel}
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          onClick={onNext}
          disabled={isSubmitting}
          data-testid="wizard-next"
        >
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
