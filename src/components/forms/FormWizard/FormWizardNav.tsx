import { useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { RovingFocusGroup, useRovingFocusItem } from '@/hooks/useRovingFocus';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import type {
  StepIndicatorShape,
  StepIndicatorSize,
  StepIndicatorStyle,
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
  shape: StepIndicatorShape;
  styleVariant: StepIndicatorStyle;
  size: StepIndicatorSize;
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
    shape,
    styleVariant,
    size,
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
      steps.length > 1 ? Math.round((currentIndex / Math.max(steps.length - 1, 1)) * 100) : 0;
    return (
      <div
        className="space-y-2"
        role="status"
        aria-label={ariaLabel ?? 'Wizard progress'}
        data-testid="wizard-nav-compact"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{compactSummary}</span>
          {current !== undefined ? (
            <span className="truncate text-sm text-foreground-muted">{current.title}</span>
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

  const isProgressVariant = variant === 'progress';

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
          orientation === 'horizontal' ? 'w-full items-start' : 'flex-col items-stretch',
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
            shape={shape}
            styleVariant={styleVariant}
            size={size}
            compactLabels={variant === 'dots' || variant === 'progress'}
            panelId={panelIdFor(step.id)}
            indicatorId={indicatorIdFor(step.id)}
            onActivate={() => onStepClick(step.id)}
          />
        ))}
      </div>
      {isProgressVariant && orientation === 'horizontal' ? (
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
  shape: StepIndicatorShape;
  styleVariant: StepIndicatorStyle;
  size: StepIndicatorSize;
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
  shape,
  styleVariant,
  size,
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
              shape={shape}
              styleVariant={styleVariant}
              size={size}
              orientation="vertical"
              panelId={panelId}
              indicatorId={indicatorId}
            />
          ) : (
            <EnabledIndicator
              step={step}
              index={index}
              variant={variant}
              shape={shape}
              styleVariant={styleVariant}
              size={size}
              orientation="vertical"
              currentIndex={currentIndex}
              panelId={panelId}
              indicatorId={indicatorId}
              onActivate={onActivate}
            />
          )}
          {!isLast ? (
            <VerticalConnector fill={connectorFill(step, currentIndex, index)} variant={variant} />
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
            shape={shape}
            styleVariant={styleVariant}
            size={size}
            orientation="horizontal"
            panelId={panelId}
            indicatorId={indicatorId}
          />
        ) : (
          <EnabledIndicator
            step={step}
            index={index}
            variant={variant}
            shape={shape}
            styleVariant={styleVariant}
            size={size}
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
          variant={variant}
          size={size}
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
  shape: StepIndicatorShape;
  styleVariant: StepIndicatorStyle;
  size: StepIndicatorSize;
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
  shape,
  styleVariant,
  size,
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
      data-shape={shape}
      data-style={styleVariant}
      data-size={size}
      className={cn(
        indicatorBase(variant, shape, size),
        indicatorStateClasses(step.status, styleVariant, variant),
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        step.clickable ? 'cursor-pointer' : 'cursor-default',
        'motion-safe:transition-colors motion-safe:duration-200',
      )}
    >
      <IndicatorGlyph step={step} index={index} variant={variant} size={size} />
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
  shape,
  styleVariant,
  size,
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
      data-shape={shape}
      data-style={styleVariant}
      data-size={size}
      className={cn(
        indicatorBase(variant, shape, size),
        'border-border bg-surface-muted text-foreground-subtle',
        'cursor-not-allowed opacity-60',
      )}
    >
      <IndicatorGlyph step={{ ...step, status: 'idle' }} index={0} variant={variant} size={size} />
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
  size,
}: {
  step: NavStep;
  index: number;
  variant: StepIndicatorVariant;
  size: StepIndicatorSize;
}) {
  if (variant === 'dots' || variant === 'progress') {
    return <span className="block h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />;
  }
  const glyphCls = glyphSizeClass(size);
  if (step.status === 'complete') {
    return <Check className={glyphCls} aria-hidden="true" />;
  }
  if (step.status === 'error') {
    return <AlertCircle className={glyphCls} aria-hidden="true" />;
  }
  if (variant === 'icons' && step.icon !== undefined) {
    return (
      <span className={cn('inline-flex items-center justify-center', glyphCls)} aria-hidden="true">
        {step.icon}
      </span>
    );
  }
  return (
    <span className={cn('font-semibold', numberSizeClass(size))} aria-hidden="true">
      {index + 1}
    </span>
  );
}

function glyphSizeClass(size: StepIndicatorSize): string {
  if (size === 'sm') return 'h-3 w-3';
  if (size === 'lg') return 'h-4 w-4';
  return 'h-3.5 w-3.5';
}

function numberSizeClass(size: StepIndicatorSize): string {
  if (size === 'sm') return 'text-[10px]';
  if (size === 'lg') return 'text-sm';
  return 'text-xs';
}

function shapeRadius(shape: StepIndicatorShape): string {
  if (shape === 'square') return 'rounded-none';
  if (shape === 'rounded') return 'rounded-md';
  return 'rounded-full';
}

function indicatorBase(
  variant: StepIndicatorVariant,
  shape: StepIndicatorShape,
  size: StepIndicatorSize,
): string {
  if (variant === 'dots' || variant === 'progress') {
    return cn(
      'inline-flex h-4 w-4 shrink-0 items-center justify-center border-2',
      shapeRadius(shape),
    );
  }
  const sizeCls =
    shape === 'pill'
      ? size === 'sm'
        ? 'h-6 w-9 px-1'
        : size === 'lg'
          ? 'h-10 w-14 px-2'
          : 'h-8 w-12 px-1.5'
      : size === 'sm'
        ? 'h-6 w-6'
        : size === 'lg'
          ? 'h-10 w-10'
          : 'h-8 w-8';
  return cn(
    'inline-flex shrink-0 items-center justify-center border-2',
    shapeRadius(shape),
    sizeCls,
  );
}

function indicatorStateClasses(
  status: NavStepStatus,
  styleVariant: StepIndicatorStyle,
  variant: StepIndicatorVariant,
): string {
  if (styleVariant === 'outline') {
    if (status === 'active') {
      return 'border-primary bg-surface text-primary ring-2 ring-primary/25';
    }
    if (status === 'complete') return 'border-primary bg-surface text-primary';
    if (status === 'error') return 'border-danger bg-surface text-danger';
    return cn(
      'border-border bg-surface text-foreground-muted',
      variant === 'dots' || variant === 'progress' ? '' : 'hover:border-foreground-muted',
    );
  }

  if (styleVariant === 'soft') {
    if (status === 'active') {
      return 'border-primary/40 bg-primary/15 text-primary';
    }
    if (status === 'complete') return 'border-primary/30 bg-primary/10 text-primary';
    if (status === 'error') return 'border-danger/40 bg-danger/10 text-danger';
    return cn(
      'border-border bg-surface-muted text-foreground-muted',
      variant === 'dots' || variant === 'progress' ? '' : 'hover:border-foreground-muted',
    );
  }

  if (styleVariant === 'ghost') {
    if (status === 'active') return 'border-transparent bg-transparent text-primary';
    if (status === 'complete') return 'border-transparent bg-transparent text-primary';
    if (status === 'error') return 'border-transparent bg-transparent text-danger';
    return 'border-transparent bg-transparent text-foreground-muted';
  }

  // solid (default)
  if (status === 'active') return 'border-primary bg-primary text-primary-foreground';
  if (status === 'complete') return 'border-primary bg-primary text-primary-foreground';
  if (status === 'error') return 'border-danger bg-surface text-danger';
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

type ConnectorFill = 'empty' | 'full';

/*
 * Progress lands AT the circle, not between two. So a step is either:
 *  - complete → connector AFTER it is fully filled (we've passed it)
 *  - otherwise → empty
 * No half-fill for the active step.
 */
function connectorFill(step: NavStep, _currentIndex: number, _index: number): ConnectorFill {
  if (step.status === 'complete') return 'full';
  return 'empty';
}

function horizontalConnectorOffset(size: StepIndicatorSize, compactLabels: boolean): string {
  if (compactLabels) return 'mt-2'; // dots/progress h-4 → center 8px
  if (size === 'sm') return 'mt-3'; // h-6 → 12px
  if (size === 'lg') return 'mt-5'; // h-10 → 20px
  return 'mt-4'; // h-8 → 16px
}

function HorizontalConnector({
  fill,
  variant,
  size,
}: {
  fill: ConnectorFill;
  variant: StepIndicatorVariant;
  size: StepIndicatorSize;
}) {
  const widthPct = fill === 'full' ? '100%' : '0%';
  const compactLabels = variant === 'dots' || variant === 'progress';
  const offset = horizontalConnectorOffset(size, compactLabels);
  const thickness = variant === 'progress' ? 'h-1' : 'h-0.5';
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn(
        thickness,
        'flex-1 self-start rounded-full bg-border overflow-hidden mx-2',
        offset,
      )}
      data-fill={fill}
      data-testid="wizard-connector"
    >
      <div
        className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-300"
        style={{ width: widthPct }}
      />
    </div>
  );
}

function VerticalConnector({
  fill,
  variant,
}: {
  fill: ConnectorFill;
  variant: StepIndicatorVariant;
}) {
  const heightPct = fill === 'full' ? '100%' : '0%';
  const thickness = variant === 'progress' ? 'w-1' : 'w-0.5';
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn(thickness, 'my-1 flex-1 self-stretch rounded-full bg-border overflow-hidden')}
      data-fill={fill}
      data-testid="wizard-connector"
      style={{ minHeight: '1rem' }}
    >
      <div
        className="w-full rounded-full bg-primary motion-safe:transition-[height] motion-safe:duration-300"
        style={{ height: heightPct }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ProgressBar (variant="progress")                                           */
/* -------------------------------------------------------------------------- */

function ProgressBar({ currentIndex, totalSteps }: { currentIndex: number; totalSteps: number }) {
  const percent =
    totalSteps > 1 ? Math.round((currentIndex / Math.max(totalSteps - 1, 1)) * 100) : 0;
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
          className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-right text-xs text-foreground-subtle">{percent}%</div>
    </div>
  );
}
