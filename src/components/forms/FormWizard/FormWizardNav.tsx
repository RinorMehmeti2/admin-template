import {
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { RovingFocusGroup, useRovingFocusItem } from '@/hooks/useRovingFocus';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/feedback/Tooltip';
import type {
  StepIndicatorVariant,
  WizardOrientation,
} from './FormWizard.types';

/*
 * FormWizardNav (the WizardStepper).
 *
 * Why this exists instead of composing src/components/navigation/Stepper:
 * the existing Stepper is read-only (no clicks, no focus, no animated
 * progress connectors, no disabled-with-reason). Bringing every wizard
 * requirement into it would couple display-only and interactive
 * concerns and re-flow every Stepper caller. So FormWizard owns its own
 * indicator component; Stepper continues to ship the read-only timeline
 * surface.
 */

export type NavStepStatus = 'idle' | 'active' | 'complete' | 'error';

export interface NavStep {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  status: NavStepStatus;
  disabled: boolean;
  disabledReason?: string;
  clickable: boolean;
  optional: boolean;
}

export interface FormWizardNavProps {
  steps: ReadonlyArray<NavStep>;
  currentIndex: number;
  orientation: WizardOrientation;
  variant: StepIndicatorVariant;
  compact: boolean;
  panelIdFor: (stepId: string) => string;
  indicatorIdFor: (stepId: string) => string;
  onStepClick: (stepId: string) => void;
  compactSummary?: ReactNode;
  ariaLabel?: string;
}

export function FormWizardNav(props: FormWizardNavProps) {
  const {
    steps,
    currentIndex,
    orientation,
    variant,
    compact,
    panelIdFor,
    indicatorIdFor,
    onStepClick,
    compactSummary,
    ariaLabel,
  } = props;

  if (compact && orientation === 'horizontal') {
    const current = steps[currentIndex];
    const percent =
      steps.length > 1
        ? Math.round((currentIndex / Math.max(steps.length - 1, 1)) * 100)
        : 0;
    return (
      <div
        className="space-y-2"
        role="status"
        aria-label={ariaLabel ?? 'Wizard progress'}
        data-testid="wizard-nav-compact"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-foreground">
            {compactSummary}
          </span>
          {current !== undefined ? (
            <span className="truncate text-sm text-foreground-muted">
              {current.title}
            </span>
          ) : null}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-200"
            style={{ width: `${percent}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }

  return (
    <RovingFocusGroup
      orientation={orientation}
      loop={false}
      defaultIndex={Math.max(0, currentIndex)}
    >
      <div
        role="tablist"
        aria-label={ariaLabel ?? 'Wizard steps'}
        aria-orientation={orientation}
        className={cn(
          'flex',
          orientation === 'horizontal'
            ? 'w-full items-start'
            : 'flex-col items-stretch',
        )}
        data-testid="wizard-nav"
      >
        {steps.map((step, i) => (
          <NavItemRow
            key={step.id}
            step={step}
            index={i}
            isLast={i === steps.length - 1}
            currentIndex={currentIndex}
            orientation={orientation}
            variant={variant}
            compactLabels={variant === 'dots' || variant === 'progress'}
            panelId={panelIdFor(step.id)}
            indicatorId={indicatorIdFor(step.id)}
            onActivate={() => onStepClick(step.id)}
          />
        ))}
      </div>
      {variant === 'progress' ? (
        <ProgressBar currentIndex={currentIndex} totalSteps={steps.length} />
      ) : null}
    </RovingFocusGroup>
  );
}

/* -------------------------------------------------------------------------- */

interface NavItemRowProps {
  step: NavStep;
  index: number;
  isLast: boolean;
  currentIndex: number;
  orientation: WizardOrientation;
  variant: StepIndicatorVariant;
  compactLabels: boolean;
  panelId: string;
  indicatorId: string;
  onActivate: () => void;
}

function NavItemRow({
  step,
  index,
  isLast,
  currentIndex,
  orientation,
  variant,
  compactLabels,
  panelId,
  indicatorId,
  onActivate,
}: NavItemRowProps) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('flex gap-3', isLast ? '' : 'min-h-[3rem]')}>
        <div className="flex flex-col items-center">
          {step.disabled ? (
            <DisabledIndicator
              step={step}
              variant={variant}
              orientation="vertical"
              panelId={panelId}
              indicatorId={indicatorId}
            />
          ) : (
            <EnabledIndicator
              step={step}
              index={index}
              variant={variant}
              orientation="vertical"
              currentIndex={currentIndex}
              panelId={panelId}
              indicatorId={indicatorId}
              onActivate={onActivate}
            />
          )}
          {!isLast ? (
            <VerticalConnector
              fill={connectorFill(step, currentIndex, index)}
            />
          ) : null}
        </div>
        <div className={cn('flex-1', isLast ? 'pb-1' : 'pb-6')}>
          <NavLabel
            step={step}
            indicatorId={indicatorId}
            compactLabels={compactLabels}
            orientation="vertical"
          />
        </div>
      </div>
    );
  }

  // horizontal
  return (
    <>
      <div className="flex min-w-0 flex-col items-center">
        {step.disabled ? (
          <DisabledIndicator
            step={step}
            variant={variant}
            orientation="horizontal"
            panelId={panelId}
            indicatorId={indicatorId}
          />
        ) : (
          <EnabledIndicator
            step={step}
            index={index}
            variant={variant}
            orientation="horizontal"
            currentIndex={currentIndex}
            panelId={panelId}
            indicatorId={indicatorId}
            onActivate={onActivate}
          />
        )}
        {compactLabels ? (
          <NavLabel
            step={step}
            indicatorId={indicatorId}
            compactLabels={true}
            orientation="horizontal"
          />
        ) : (
          <div className="mt-2 max-w-[10rem] text-center">
            <NavLabel
              step={step}
              indicatorId={indicatorId}
              compactLabels={false}
              orientation="horizontal"
            />
          </div>
        )}
      </div>
      {!isLast ? (
        <HorizontalConnector
          fill={connectorFill(step, currentIndex, index)}
          compactLabels={compactLabels}
        />
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Indicator                                                                  */
/* -------------------------------------------------------------------------- */

interface IndicatorPropsBase {
  step: NavStep;
  variant: StepIndicatorVariant;
  orientation: WizardOrientation;
  panelId: string;
  indicatorId: string;
}

interface EnabledIndicatorProps extends IndicatorPropsBase {
  index: number;
  currentIndex: number;
  onActivate: () => void;
}

function EnabledIndicator({
  step,
  index,
  variant,
  orientation,
  currentIndex,
  panelId,
  indicatorId,
  onActivate,
}: EnabledIndicatorProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { tabIndex, onKeyDown, onFocus } = useRovingFocusItem(index, ref);

  const isCurrent = index === currentIndex;
  const ariaSelected = isCurrent;

  const handleKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (step.clickable) onActivate();
      return;
    }
    onKeyDown(e);
  };

  const handleClick = () => {
    if (!step.clickable) return;
    onActivate();
  };

  const button = (
    <button
      ref={ref}
      id={indicatorId}
      type="button"
      role="tab"
      aria-selected={ariaSelected}
      aria-controls={panelId}
      aria-labelledby={`${indicatorId}-label`}
      tabIndex={tabIndex}
      onKeyDown={handleKey}
      onFocus={onFocus}
      onClick={handleClick}
      data-status={step.status}
      data-clickable={step.clickable ? 'true' : 'false'}
      className={cn(
        indicatorBase(variant),
        indicatorStateClasses(step.status, variant),
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        step.clickable ? 'cursor-pointer' : 'cursor-default',
        'motion-safe:transition-colors motion-safe:duration-200',
      )}
    >
      <IndicatorGlyph step={step} index={index} variant={variant} />
    </button>
  );

  if (orientation === 'horizontal' && step.description !== undefined) {
    return (
      <Tooltip>
        <TooltipTrigger>{button}</TooltipTrigger>
        <TooltipContent>{step.description}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

function DisabledIndicator({
  step,
  variant,
  orientation,
  panelId,
  indicatorId,
}: IndicatorPropsBase) {
  const span = (
    <span
      id={indicatorId}
      role="tab"
      aria-selected={false}
      aria-disabled={true}
      aria-controls={panelId}
      aria-labelledby={`${indicatorId}-label`}
      tabIndex={-1}
      data-status="idle"
      data-disabled="true"
      className={cn(
        indicatorBase(variant),
        'border-border bg-surface-muted text-foreground-subtle',
        'cursor-not-allowed opacity-60',
      )}
    >
      <IndicatorGlyph
        step={{ ...step, status: 'idle' }}
        index={0}
        variant={variant}
      />
    </span>
  );

  if (orientation === 'horizontal' && step.disabledReason !== undefined) {
    return (
      <Tooltip>
        <TooltipTrigger>{span}</TooltipTrigger>
        <TooltipContent>{step.disabledReason}</TooltipContent>
      </Tooltip>
    );
  }

  return span;
}

function IndicatorGlyph({
  step,
  index,
  variant,
}: {
  step: NavStep;
  index: number;
  variant: StepIndicatorVariant;
}) {
  if (variant === 'dots' || variant === 'progress') {
    return <span className="block h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />;
  }
  if (step.status === 'complete') {
    return <Check className="h-3.5 w-3.5" aria-hidden="true" />;
  }
  if (step.status === 'error') {
    return <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />;
  }
  if (variant === 'icons' && step.icon !== undefined) {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center" aria-hidden="true">
        {step.icon}
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold" aria-hidden="true">
      {index + 1}
    </span>
  );
}

function indicatorBase(variant: StepIndicatorVariant): string {
  if (variant === 'dots' || variant === 'progress') {
    return 'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2';
  }
  return 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2';
}

function indicatorStateClasses(status: NavStepStatus, variant: StepIndicatorVariant): string {
  // dots/progress use a smaller dot inside; same color rules
  if (status === 'active') {
    return 'border-primary bg-primary text-primary-foreground';
  }
  if (status === 'complete') {
    return 'border-primary bg-primary text-primary-foreground';
  }
  if (status === 'error') {
    return 'border-danger bg-surface text-danger';
  }
  // idle / future
  return cn(
    'border-border bg-surface text-foreground-muted',
    variant === 'dots' || variant === 'progress' ? '' : 'hover:border-foreground-muted',
  );
}

/* -------------------------------------------------------------------------- */
/* Label                                                                      */
/* -------------------------------------------------------------------------- */

interface NavLabelProps {
  step: NavStep;
  indicatorId: string;
  compactLabels: boolean;
  orientation: WizardOrientation;
}

function NavLabel({ step, indicatorId, compactLabels, orientation }: NavLabelProps) {
  if (compactLabels) {
    // labels hidden visually but kept accessible via aria-labelledby pattern
    return (
      <span id={`${indicatorId}-label`} className="sr-only">
        {step.title}
      </span>
    );
  }
  return (
    <div className="space-y-0.5">
      <div
        id={`${indicatorId}-label`}
        className={cn(
          'text-sm font-medium',
          step.status === 'active' || step.status === 'complete'
            ? 'text-foreground'
            : 'text-foreground-muted',
          step.status === 'error' && 'text-danger',
        )}
      >
        {step.title}
        {step.optional ? (
          <span className="ml-1 text-xs font-normal text-foreground-subtle">(optional)</span>
        ) : null}
      </div>
      {orientation === 'vertical' && step.description !== undefined ? (
        <div className="text-sm text-foreground-muted">{step.description}</div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Connectors                                                                 */
/* -------------------------------------------------------------------------- */

type ConnectorFill = 'empty' | 'half' | 'full';

function connectorFill(step: NavStep, currentIndex: number, index: number): ConnectorFill {
  if (step.status === 'complete') return 'full';
  if (index === currentIndex) return 'half';
  return 'empty';
}

function HorizontalConnector({
  fill,
  compactLabels,
}: {
  fill: ConnectorFill;
  compactLabels: boolean;
}) {
  const widthPct = fill === 'full' ? '100%' : fill === 'half' ? '50%' : '0%';
  // mt aligns with indicator's vertical center: indicator h-8 (32px) → mt-4 (16px),
  // smaller for dots/progress (h-4 → mt-2)
  const mt = compactLabels ? 'mt-2' : 'mt-4';
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn('h-0.5 flex-1 self-start rounded-full bg-border overflow-hidden mx-2', mt)}
      data-fill={fill}
      data-testid="wizard-connector"
    >
      <div
        className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-200"
        style={{ width: widthPct }}
      />
    </div>
  );
}

function VerticalConnector({ fill }: { fill: ConnectorFill }) {
  const heightPct = fill === 'full' ? '100%' : fill === 'half' ? '50%' : '0%';
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="my-1 w-0.5 flex-1 self-stretch rounded-full bg-border overflow-hidden"
      data-fill={fill}
      data-testid="wizard-connector"
      style={{ minHeight: '1rem' }}
    >
      <div
        className="w-full rounded-full bg-primary motion-safe:transition-[height] motion-safe:duration-200"
        style={{ height: heightPct }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ProgressBar (variant="progress")                                           */
/* -------------------------------------------------------------------------- */

function ProgressBar({
  currentIndex,
  totalSteps,
}: {
  currentIndex: number;
  totalSteps: number;
}) {
  const percent =
    totalSteps > 1
      ? Math.round((currentIndex / Math.max(totalSteps - 1, 1)) * 100)
      : 0;
  return (
    <div
      className="mt-3 space-y-1"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label="Wizard progress"
    >
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-right text-xs text-foreground-subtle">{percent}%</div>
    </div>
  );
}

