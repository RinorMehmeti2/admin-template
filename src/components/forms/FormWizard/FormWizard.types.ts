import type { ReactNode } from 'react';
import type {
  FieldValues,
  Path,
  UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

export type WizardOrientation = 'horizontal' | 'vertical';

export type StepIndicatorVariant = 'numbered' | 'icons' | 'dots' | 'progress';

export type ResponsiveBreakpoint = 'sm' | 'md' | 'lg' | 'xl';

export interface StepRenderArgs<TValues extends FieldValues> {
  form: UseFormReturn<TValues>;
  goNext: () => Promise<boolean>;
  goBack: () => void;
  step: number;
  totalSteps: number;
}

/** Internal normalized step config. */
export interface NormalizedStep<TValues extends FieldValues> {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  schema?: z.ZodTypeAny;
  optional: boolean;
  clickable?: boolean;
  disabled: boolean;
  disabledReason?: string;
  hidden: boolean;
  render?: (args: StepRenderArgs<TValues>) => ReactNode;
  fields: ReadonlyArray<Path<TValues>>;
  isSummary?: boolean;
}

export interface FormWizardStepProps<TValues extends FieldValues = FieldValues> {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  schema?: z.ZodTypeAny;
  optional?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  hidden?: boolean;
  render?: (args: StepRenderArgs<TValues>) => ReactNode;
}

export interface FormWizardHandle<TValues extends FieldValues = FieldValues> {
  goToStep(id: string): boolean;
  goNext(): Promise<boolean>;
  goBack(): void;
  getCurrentStep(): string;
  getValues(): TValues;
  reset(): void;
  clearDraft(): void;
}

export interface PersistedDraft<TValues extends FieldValues> {
  values: Partial<TValues>;
  currentStepId: string;
  completedStepIds: string[];
}
