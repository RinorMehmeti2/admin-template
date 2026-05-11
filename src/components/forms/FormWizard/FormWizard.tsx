/*
 * FormWizard — multi-step form pattern (the most-used component for the
 * admin tools this template targets).
 *
 * Stepper audit decision: src/components/navigation/Stepper is a
 * read-only display surface (no clicks, no focus model, no animated
 * connectors, no disabled-with-reason). Folding every wizard
 * requirement into it would couple display-only and interactive
 * concerns. So FormWizard owns its own indicator component
 * (FormWizardNav, internally a WizardStepper) and the existing
 * Stepper stays for timeline-style displays.
 */
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';
import { cn } from '@/lib/cn';
import { useId } from '@/hooks/useId';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/context/ToastProvider';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Form } from '@/components/forms/Form';
import { FormWizardNav, type NavStep, type NavStepStatus } from './FormWizardNav';
import { FormWizardFooter } from './FormWizardFooter';
import { FormWizardSummary } from './FormWizardSummary';
import { FormWizardStep } from './FormWizardStep';
import type {
  FormWizardHandle,
  FormWizardStepProps,
  NormalizedStep,
  PersistedDraft,
  ResponsiveBreakpoint,
  StepIndicatorVariant,
  WizardOrientation,
} from './FormWizard.types';

/* -------------------------------------------------------------------------- */

const BREAKPOINTS: Record<ResponsiveBreakpoint, string> = {
  sm: '(max-width: 639px)',
  md: '(max-width: 767px)',
  lg: '(max-width: 1023px)',
  xl: '(max-width: 1279px)',
};

const SUMMARY_STEP_ID = '__summary__';

export interface WizardI18nLabels {
  nextLabel?: ReactNode;
  backLabel?: ReactNode;
  submitLabel?: ReactNode;
  reviewLabel?: ReactNode;
  summaryTitle?: ReactNode;
  summaryDescription?: ReactNode;
  summaryHelpText?: string;
  restoreDialogTitle?: ReactNode;
  restoreDialogDescription?: ReactNode;
  restoreConfirmLabel?: string;
  restoreCancelLabel?: string;
  blockedToast?: (stepTitle: string) => string;
  compactSummaryText?: (current: number, total: number) => string;
}

export interface FormWizardProps<TSchema extends z.ZodObject<z.ZodRawShape>> {
  schema: TSchema;
  defaultValues: z.infer<TSchema> | DefaultValues<z.infer<TSchema>>;
  onSubmit: (values: z.infer<TSchema>) => void | Promise<void>;

  orientation?: WizardOrientation;
  onOrientationChange?: (orientation: WizardOrientation) => void;
  responsiveOrientation?: boolean;
  responsiveBreakpoint?: ResponsiveBreakpoint;

  persistKey?: string;
  autoRestore?: boolean;

  allowSkip?: boolean;
  showSummaryStep?: boolean;
  summaryRender?: (values: z.infer<TSchema>) => ReactNode;

  stepIndicatorVariant?: StepIndicatorVariant;
  compactBelow?: ResponsiveBreakpoint;

  labels?: WizardI18nLabels;

  className?: string;
  navClassName?: string;
  contentClassName?: string;

  ref?: Ref<FormWizardHandle<z.infer<TSchema>>>;
  children: ReactNode;
}

/* -------------------------------------------------------------------------- */

function getZodObjectKeys(schema: z.ZodTypeAny | undefined): string[] {
  if (schema === undefined) return [];
  const obj = schema as unknown as { shape?: Record<string, unknown> };
  if (obj.shape === undefined) return [];
  return Object.keys(obj.shape);
}

function parseChildren<TValues extends FieldValues>(
  children: ReactNode,
): NormalizedStep<TValues>[] {
  const arr = Children.toArray(children);
  const result: NormalizedStep<TValues>[] = [];
  for (const child of arr) {
    if (!isValidElement(child)) continue;
    if (child.type !== FormWizardStep) continue;
    const props = child.props as FormWizardStepProps<TValues>;
    if (props.hidden === true) {
      // hidden steps are filtered out entirely so the schema slice
      // never references their fields and the indicator never shows.
      continue;
    }
    const fields = getZodObjectKeys(props.schema) as unknown as ReadonlyArray<Path<TValues>>;
    const normalized: NormalizedStep<TValues> = {
      id: props.id,
      title: props.title,
      optional: props.optional === true,
      disabled: props.disabled === true,
      hidden: false,
      fields,
    };
    if (props.description !== undefined) normalized.description = props.description;
    if (props.icon !== undefined) normalized.icon = props.icon;
    if (props.schema !== undefined) normalized.schema = props.schema;
    if (props.clickable !== undefined) normalized.clickable = props.clickable;
    if (props.disabledReason !== undefined) normalized.disabledReason = props.disabledReason;
    if (props.render !== undefined) normalized.render = props.render;
    result.push(normalized);
  }
  return result;
}

function readDraft<TValues extends FieldValues>(
  key: string | undefined,
): PersistedDraft<TValues> | null {
  if (key === undefined) return null;
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as PersistedDraft<TValues>;
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDraft<TValues extends FieldValues>(
  key: string,
  draft: PersistedDraft<TValues>,
): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    /* quota / private mode — drop silently */
  }
}

function eraseDraft(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

function defaultBlockedToast(stepTitle: string): string {
  return `Complete step "${stepTitle}" first.`;
}

function defaultCompactSummary(current: number, total: number): string {
  return `Step ${current} of ${total}`;
}

/* -------------------------------------------------------------------------- */

export function FormWizard<TSchema extends z.ZodObject<z.ZodRawShape>>({
  schema,
  defaultValues,
  onSubmit,
  orientation: orientationProp,
  onOrientationChange,
  responsiveOrientation,
  responsiveBreakpoint = 'md',
  persistKey,
  autoRestore,
  allowSkip,
  showSummaryStep,
  summaryRender,
  stepIndicatorVariant = 'numbered',
  compactBelow,
  labels,
  className,
  navClassName,
  contentClassName,
  ref,
  children,
}: FormWizardProps<TSchema>) {
  type TValues = z.infer<TSchema>;

  const { toast } = useToast();

  const wizardId = useId('wizard');
  const panelIdFor = useCallback(
    (stepId: string) => `${wizardId}-panel-${stepId}`,
    [wizardId],
  );
  const indicatorIdFor = useCallback(
    (stepId: string) => `${wizardId}-tab-${stepId}`,
    [wizardId],
  );

  const baseSteps = useMemo(() => parseChildren<TValues>(children), [children]);

  const allSteps = useMemo<NormalizedStep<TValues>[]>(() => {
    if (showSummaryStep === true) {
      const summary: NormalizedStep<TValues> = {
        id: SUMMARY_STEP_ID,
        title: labels?.summaryTitle ?? 'Review',
        optional: false,
        disabled: false,
        hidden: false,
        fields: [],
        isSummary: true,
      };
      if (labels?.summaryDescription !== undefined) summary.description = labels.summaryDescription;
      return [...baseSteps, summary];
    }
    return baseSteps;
  }, [baseSteps, showSummaryStep, labels?.summaryTitle, labels?.summaryDescription]);

  // ───── responsive orientation ─────
  const responsiveQuery = BREAKPOINTS[responsiveBreakpoint];
  const isNarrow = useMediaQuery(responsiveQuery);
  const effectiveOrientation: WizardOrientation =
    responsiveOrientation === true && isNarrow
      ? 'vertical'
      : (orientationProp ?? 'horizontal');

  useEffect(() => {
    if (onOrientationChange !== undefined && responsiveOrientation === true) {
      onOrientationChange(effectiveOrientation);
    }
  }, [effectiveOrientation, onOrientationChange, responsiveOrientation]);

  // ───── compact mode ─────
  const compactQuery = compactBelow !== undefined ? BREAKPOINTS[compactBelow] : null;
  const compactMatched = useMediaQuery(compactQuery ?? '(max-width: 0px)');
  const isCompact = compactQuery !== null && compactMatched;

  // ───── form ─────
  const form = useForm<TValues>({
    defaultValues: defaultValues as DefaultValues<TValues>,
    shouldUnregister: false,
  });

  // ───── step state ─────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<ReadonlySet<string>>(new Set<string>());
  const [errorIds, setErrorIds] = useState<ReadonlySet<string>>(new Set<string>());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ───── draft restore ─────
  const [restoreOpen, setRestoreOpen] = useState(false);
  const draftRef = useRef<PersistedDraft<TValues> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    const draft = readDraft<TValues>(persistKey);
    if (draft === null) return;
    draftRef.current = draft;
    if (autoRestore === true) {
      applyDraft(draft);
    } else {
      setRestoreOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyDraft(draft: PersistedDraft<TValues>): void {
    form.reset(draft.values as TValues);
    const idx = allSteps.findIndex((s) => s.id === draft.currentStepId);
    setCurrentIndex(idx >= 0 ? idx : 0);
    setCompletedIds(new Set(draft.completedStepIds));
  }

  // ───── persistence on change ─────
  const watched = form.watch();
  const debouncedValues = useDebouncedValue(watched, 500);
  const isDirty = form.formState.isDirty;
  useEffect(() => {
    if (persistKey === undefined) return;
    if (!mountedRef.current) return;
    if (restoreOpen) return; // don't persist while user hasn't decided
    if (!isDirty) return; // don't persist untouched defaults
    const cur = allSteps[currentIndex];
    if (cur === undefined) return;
    const draft: PersistedDraft<TValues> = {
      values: debouncedValues as Partial<TValues>,
      currentStepId: cur.id,
      completedStepIds: Array.from(completedIds),
    };
    writeDraft(persistKey, draft);
  }, [
    debouncedValues,
    currentIndex,
    completedIds,
    persistKey,
    allSteps,
    restoreOpen,
    isDirty,
  ]);

  // ───── per-step validation ─────
  const validateStep = useCallback(
    async (idx: number): Promise<boolean> => {
      if (allowSkip === true) return true;
      const step = allSteps[idx];
      if (step === undefined) return true;
      if (step.isSummary === true) return true;
      if (step.schema === undefined || step.fields.length === 0) return true;

      const allValues = form.getValues();
      const slice: Record<string, unknown> = {};
      for (const f of step.fields) {
        slice[f as string] = (allValues as Record<string, unknown>)[f as string];
      }
      const parsed = step.schema.safeParse(slice);
      if (parsed.success) {
        form.clearErrors(step.fields as Parameters<typeof form.clearErrors>[0]);
        setErrorIds((prev) => {
          if (!prev.has(step.id)) return prev;
          const next = new Set(prev);
          next.delete(step.id);
          return next;
        });
        return true;
      }

      form.clearErrors(step.fields as Parameters<typeof form.clearErrors>[0]);
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === 'string') {
          form.setError(path as Path<TValues>, { type: 'zod', message: issue.message });
        }
      }
      setErrorIds((prev) => {
        const next = new Set(prev);
        next.add(step.id);
        return next;
      });
      return false;
    },
    [allSteps, allowSkip, form],
  );

  // ───── navigation ─────
  const isPriorChainValid = useCallback(
    (targetIdx: number): boolean => {
      for (let i = 0; i < targetIdx; i++) {
        const s = allSteps[i];
        if (s === undefined) continue;
        if (!completedIds.has(s.id)) return false;
      }
      return true;
    },
    [allSteps, completedIds],
  );

  const goBack = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(async (): Promise<boolean> => {
    const cur = allSteps[currentIndex];
    if (cur === undefined) return false;
    const ok = await validateStep(currentIndex);
    if (!ok) return false;
    setCompletedIds((prev) => {
      if (prev.has(cur.id)) return prev;
      const next = new Set(prev);
      next.add(cur.id);
      return next;
    });
    if (currentIndex < allSteps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    return true;
  }, [allSteps, currentIndex, validateStep]);

  const goToStep = useCallback(
    (id: string): boolean => {
      const idx = allSteps.findIndex((s) => s.id === id);
      if (idx === -1) return false;
      const target = allSteps[idx];
      if (target === undefined) return false;
      if (target.disabled) return false;
      if (idx === currentIndex) return true;
      if (idx < currentIndex) {
        // backward jump is always allowed for a non-disabled step
        setCurrentIndex(idx);
        return true;
      }
      // forward jump
      if (!isPriorChainValid(idx)) {
        const blocker = findFirstUncompletedBefore(allSteps, idx, completedIds);
        if (blocker !== null) {
          const title =
            typeof blocker.title === 'string'
              ? blocker.title
              : String((blocker.title as { toString?: () => string } | null)?.toString?.() ?? blocker.id);
          const blockedFn = labels?.blockedToast ?? defaultBlockedToast;
          toast.warning(blockedFn(title));
        }
        return false;
      }
      setCurrentIndex(idx);
      return true;
    },
    [allSteps, currentIndex, isPriorChainValid, completedIds, toast, labels?.blockedToast],
  );

  const handleStepClick = useCallback(
    (id: string) => {
      const step = allSteps.find((s) => s.id === id);
      if (step === undefined) return;
      if (step.disabled) return;
      if (step.clickable === false) return;
      goToStep(id);
    },
    [allSteps, goToStep],
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const values = form.getValues();
      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        // map errors and route to first error's step
        form.clearErrors();
        let firstErrorStepIdx = -1;
        for (const issue of parsed.error.issues) {
          const field = issue.path[0];
          if (typeof field !== 'string') continue;
          form.setError(field as Path<TValues>, { type: 'zod', message: issue.message });
          if (firstErrorStepIdx === -1) {
            const owning = allSteps.findIndex((s) => s.fields.includes(field as Path<TValues>));
            if (owning >= 0) firstErrorStepIdx = owning;
          }
        }
        if (firstErrorStepIdx >= 0) {
          setCurrentIndex(firstErrorStepIdx);
          const owningStep = allSteps[firstErrorStepIdx];
          if (owningStep !== undefined) {
            setErrorIds((prev) => {
              const next = new Set(prev);
              next.add(owningStep.id);
              return next;
            });
          }
        }
        return;
      }
      await onSubmit(parsed.data as z.infer<TSchema>);
      if (persistKey !== undefined) eraseDraft(persistKey);
    } finally {
      setIsSubmitting(false);
    }
  }, [allSteps, form, onSubmit, persistKey, schema]);

  const clearDraft = useCallback(() => {
    if (persistKey !== undefined) eraseDraft(persistKey);
  }, [persistKey]);

  // ───── imperative handle ─────
  useImperativeHandle(
    ref,
    () => ({
      goToStep,
      goNext,
      goBack,
      getCurrentStep: () => allSteps[currentIndex]?.id ?? '',
      getValues: () => form.getValues(),
      reset: () => {
        form.reset();
        setCurrentIndex(0);
        setCompletedIds(new Set());
        setErrorIds(new Set());
      },
      clearDraft,
    }),
    [allSteps, currentIndex, form, goBack, goNext, goToStep, clearDraft],
  );

  // ───── nav model ─────
  const navSteps = useMemo<NavStep[]>(() => {
    return allSteps.map((s, i): NavStep => {
      const isCurrent = i === currentIndex;
      const isComplete = completedIds.has(s.id);
      const isError = errorIds.has(s.id);
      const status: NavStepStatus = isCurrent
        ? 'active'
        : isError
          ? 'error'
          : isComplete
            ? 'complete'
            : 'idle';
      const visited = isComplete || i <= currentIndex;
      const defaultClickable = visited || isPriorChainValid(i);
      const clickable = s.disabled ? false : (s.clickable ?? defaultClickable);
      const nav: NavStep = {
        id: s.id,
        title: s.title,
        status,
        disabled: s.disabled,
        clickable,
        optional: s.optional,
      };
      if (s.description !== undefined) nav.description = s.description;
      if (s.icon !== undefined) nav.icon = s.icon;
      if (s.disabledReason !== undefined) nav.disabledReason = s.disabledReason;
      return nav;
    });
  }, [allSteps, currentIndex, completedIds, errorIds, isPriorChainValid]);

  // ───── render ─────
  const currentStep = allSteps[currentIndex];
  const isFinal = currentIndex === allSteps.length - 1;
  const totalSteps = allSteps.length;

  const renderArgs = {
    form: form as UseFormReturn<TValues>,
    goNext,
    goBack,
    step: currentIndex,
    totalSteps,
  };

  const summaryHelpText =
    labels?.summaryHelpText ?? 'Review your entries before submitting.';

  const content: ReactNode =
    currentStep === undefined
      ? null
      : currentStep.isSummary === true
        ? summaryRender !== undefined
          ? summaryRender(form.getValues() as z.infer<TSchema>)
          : (
            <FormWizardSummary
              values={form.getValues() as TValues}
              summaryLabel={summaryHelpText}
            />
          )
        : currentStep.render !== undefined
          ? currentStep.render(renderArgs)
          : null;

  const compactSummaryFn = labels?.compactSummaryText ?? defaultCompactSummary;

  const layoutCls =
    effectiveOrientation === 'vertical' && !isCompact
      ? 'grid grid-cols-[14rem_minmax(0,1fr)] gap-8 items-start'
      : 'flex flex-col gap-6';

  return (
    <div
      className={cn('w-full', layoutCls, className)}
      data-orientation={effectiveOrientation}
      data-compact={isCompact ? 'true' : 'false'}
      data-testid="form-wizard"
    >
      <div className={cn('min-w-0', navClassName)} data-print="hide">
        <FormWizardNav
          steps={navSteps}
          currentIndex={currentIndex}
          orientation={effectiveOrientation}
          variant={stepIndicatorVariant}
          compact={isCompact && effectiveOrientation === 'horizontal'}
          panelIdFor={panelIdFor}
          indicatorIdFor={indicatorIdFor}
          onStepClick={handleStepClick}
          compactSummary={compactSummaryFn(currentIndex + 1, totalSteps)}
        />
      </div>

      <div className={cn('min-w-0 flex-1', contentClassName)}>
        <Form
          form={form}
          onSubmit={() => {
            void handleSubmit();
          }}
        >
          {allSteps.map((s, i) => {
            const active = i === currentIndex;
            const panelContent =
              i === currentIndex ? content : null;
            return (
              <div
                key={s.id}
                role="tabpanel"
                id={panelIdFor(s.id)}
                aria-labelledby={indicatorIdFor(s.id)}
                hidden={!active}
                tabIndex={active ? 0 : -1}
                className={active ? 'pt-6 focus-visible:outline-none' : ''}
                data-testid={active ? 'wizard-panel-active' : undefined}
              >
                {active ? panelContent : null}
              </div>
            );
          })}

          <FormWizardFooter
            canGoBack={currentIndex > 0}
            isFinal={isFinal}
            isSubmitting={isSubmitting}
            backLabel={labels?.backLabel ?? 'Back'}
            nextLabel={labels?.nextLabel ?? 'Next'}
            submitLabel={labels?.submitLabel ?? 'Submit'}
            onBack={goBack}
            onNext={() => {
              void goNext();
            }}
            onSubmit={() => {
              void handleSubmit();
            }}
          />
        </Form>
      </div>

      {persistKey !== undefined ? (
        <ConfirmDialog
          open={restoreOpen}
          onOpenChange={(open) => {
            if (!open) {
              // discarded
              eraseDraft(persistKey);
              draftRef.current = null;
            }
            setRestoreOpen(open);
          }}
          title={labels?.restoreDialogTitle ?? 'Restore draft?'}
          description={
            labels?.restoreDialogDescription ??
            'We found unfinished work. Restore where you left off, or discard it?'
          }
          confirmLabel={labels?.restoreConfirmLabel ?? 'Restore'}
          cancelLabel={labels?.restoreCancelLabel ?? 'Discard'}
          onConfirm={() => {
            if (draftRef.current !== null) applyDraft(draftRef.current);
            setRestoreOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function findFirstUncompletedBefore<TValues extends FieldValues>(
  steps: ReadonlyArray<NormalizedStep<TValues>>,
  beforeIdx: number,
  completed: ReadonlySet<string>,
): NormalizedStep<TValues> | null {
  for (let i = 0; i < beforeIdx; i++) {
    const s = steps[i];
    if (s === undefined) continue;
    if (!completed.has(s.id)) return s;
  }
  return null;
}

// Re-exports
export { FormWizardStep } from './FormWizardStep';
export type {
  FormWizardHandle,
  FormWizardStepProps,
  StepIndicatorVariant,
  WizardOrientation,
} from './FormWizard.types';
