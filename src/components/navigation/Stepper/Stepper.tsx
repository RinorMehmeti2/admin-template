import {
  Children,
  createContext,
  Fragment,
  isValidElement,
  useContext,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type StepStatus = 'idle' | 'active' | 'complete' | 'error';
export type StepperOrientation = 'horizontal' | 'vertical';

interface StepperContextValue {
  orientation: StepperOrientation;
}

const StepperContext = createContext<StepperContextValue>({ orientation: 'horizontal' });

interface StepContextValue {
  status: StepStatus;
  index: number;
}

const StepContext = createContext<StepContextValue | null>(null);

function useStep(part: string): StepContextValue {
  const ctx = useContext(StepContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside <Step>`);
  return ctx;
}

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {
  ref?: Ref<HTMLOListElement>;
  orientation?: StepperOrientation;
}

export function Stepper({
  ref,
  orientation = 'horizontal',
  className,
  children,
  ...rest
}: StepperProps) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <StepperContext.Provider value={{ orientation }}>
      <ol
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'items-center gap-3' : 'flex-col gap-2',
          className,
        )}
        {...rest}
      >
        {items.map((item, i) => (
          <Fragment key={i}>
            {item}
            {i < items.length - 1 ? <StepConnector /> : null}
          </Fragment>
        ))}
      </ol>
    </StepperContext.Provider>
  );
}

export interface StepProps extends HTMLAttributes<HTMLLIElement> {
  ref?: Ref<HTMLLIElement>;
  status?: StepStatus;
  index?: number;
}

export function Step({
  ref,
  status = 'idle',
  index = 0,
  className,
  children,
  ...rest
}: StepProps) {
  return (
    <StepContext.Provider value={{ status, index }}>
      <li
        ref={ref}
        aria-current={status === 'active' ? 'step' : undefined}
        className={cn('flex items-center gap-3', className)}
        {...rest}
      >
        {children}
      </li>
    </StepContext.Provider>
  );
}

export interface StepIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  ref?: Ref<HTMLSpanElement>;
  /** Custom indicator content (overrides number/icon). */
  children?: ReactNode;
}

export function StepIndicator({ ref, className, children, ...rest }: StepIndicatorProps) {
  const { status, index } = useStep('StepIndicator');
  const icon: ReactNode = (() => {
    if (children !== undefined) return children;
    if (status === 'complete') return <Check className="h-3.5 w-3.5" aria-hidden="true" />;
    if (status === 'error') return <X className="h-3.5 w-3.5" aria-hidden="true" />;
    return index + 1;
  })();
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
        status === 'idle' && 'border-border bg-surface text-foreground-muted',
        status === 'active' && 'border-primary bg-primary text-primary-foreground',
        status === 'complete' && 'border-success bg-success text-success-foreground',
        status === 'error' && 'border-danger bg-danger text-danger-foreground',
        className,
      )}
      {...rest}
    >
      {icon}
    </span>
  );
}

export function StepLabel({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { ref?: Ref<HTMLSpanElement> }) {
  const { status } = useStep('StepLabel');
  return (
    <span
      ref={ref}
      className={cn(
        'text-sm font-medium',
        status === 'idle' && 'text-foreground-muted',
        status === 'active' && 'text-foreground',
        status === 'complete' && 'text-foreground',
        status === 'error' && 'text-danger',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export function StepDescription({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { ref?: Ref<HTMLSpanElement> }) {
  return (
    <span ref={ref} className={cn('text-xs text-foreground-muted', className)} {...rest}>
      {children}
    </span>
  );
}

export function StepConnector({
  ref,
  className,
  ...rest
}: HTMLAttributes<HTMLLIElement> & { ref?: Ref<HTMLLIElement> }) {
  const { orientation } = useContext(StepperContext);
  return (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'h-px flex-1' : 'ml-3.5 h-4 w-px',
        className,
      )}
      {...rest}
    />
  );
}
