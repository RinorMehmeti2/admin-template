import { useEffect, useRef, type Ref, type TextareaHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';

const textareaStyles = cva(
  'block w-full rounded-md border bg-surface text-foreground placeholder:text-foreground-subtle px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-surface-muted resize-y',
  {
    variants: {
      variant: {
        default: 'border-border focus-visible:ring-ring',
        error: 'border-danger focus-visible:ring-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaStyles> {
  ref?: Ref<HTMLTextAreaElement>;
  /** Auto-grow height to fit content (clamped between minRows and maxRows). */
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

export function Textarea({
  ref,
  className,
  variant,
  autoResize,
  minRows = 2,
  maxRows = 10,
  value,
  id,
  ...rest
}: TextareaProps) {
  const internal = useRef<HTMLTextAreaElement>(null);
  const merged = useMergedRefs<HTMLTextAreaElement>(internal, ref);

  const aria = useFieldAriaProps(
    { id, 'aria-describedby': rest['aria-describedby'], 'aria-invalid': rest['aria-invalid'] },
    variant === 'error',
  );
  const effectiveVariant = variant ?? (aria.hasError ? 'error' : 'default');

  useEffect(() => {
    if (autoResize !== true) return;
    const el = internal.current;
    if (el === null) return;

    let raf = 0;
    const resize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.height = 'auto';
        const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight);
        const safeLine = Number.isFinite(lineHeight) && lineHeight > 0 ? lineHeight : 20;
        const min = safeLine * minRows;
        const max = safeLine * maxRows;
        const next = Math.max(min, Math.min(max, el.scrollHeight));
        el.style.height = `${next}px`;
        el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
      });
    };
    resize();
    el.addEventListener('input', resize);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('input', resize);
    };
  }, [autoResize, minRows, maxRows, value]);

  return (
    <textarea
      ref={merged}
      value={value}
      className={cn(
        textareaStyles({ variant: effectiveVariant }),
        autoResize === true && 'resize-none',
        className,
      )}
      {...rest}
      id={aria.id}
      aria-describedby={aria['aria-describedby']}
      aria-invalid={aria['aria-invalid']}
    />
  );
}
