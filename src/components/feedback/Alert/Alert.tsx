import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/primitives/IconButton';

const alertStyles = cva('relative flex gap-3 rounded-lg border p-4', {
  variants: {
    variant: {
      info: 'border-info/30 bg-info/10',
      success: 'border-success/30 bg-success/10',
      warning: 'border-warning/30 bg-warning/10',
      danger: 'border-danger/30 bg-danger/10',
      neutral: 'border-border bg-surface-muted',
    },
  },
  defaultVariants: { variant: 'info' },
});

const iconColor = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  neutral: 'text-foreground-muted',
} as const;

const variantIcon = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  neutral: Info,
} as const;

type AlertVariant = NonNullable<VariantProps<typeof alertStyles>['variant']>;

export interface AlertProps
  // `title` on HTMLAttributes is the global `title` string attribute (tooltip
  // text). We override it with a ReactNode prop, so omit the inherited one.
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof alertStyles> {
  ref?: Ref<HTMLDivElement>;
  title?: ReactNode;
  description?: ReactNode;
  /** Override icon. Pass `false` to hide entirely. */
  icon?: ReactNode | false;
  onClose?: () => void;
  /** Composition slot for action buttons rendered under the description. */
  actions?: ReactNode;
}

export function Alert({
  ref,
  className,
  variant,
  title,
  description,
  icon,
  onClose,
  actions,
  children,
  ...rest
}: AlertProps) {
  const v: AlertVariant = variant ?? 'info';
  const DefaultIcon = variantIcon[v];
  const showIcon = icon !== false;
  // warning + danger get role=alert (assertive); others get status (polite)
  const role = v === 'warning' || v === 'danger' ? 'alert' : 'status';

  return (
    <div ref={ref} role={role} className={cn(alertStyles({ variant: v }), className)} {...rest}>
      {showIcon ? (
        <span className={cn('mt-0.5 shrink-0', iconColor[v])} aria-hidden="true">
          {icon ?? <DefaultIcon className="h-5 w-5" />}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        {title !== undefined ? (
          <p className="font-medium leading-tight text-foreground">{title}</p>
        ) : null}
        {description !== undefined ? (
          <p
            className={cn(
              'text-sm text-foreground-muted',
              title !== undefined && 'mt-1',
            )}
          >
            {description}
          </p>
        ) : null}
        {children}
        {actions !== undefined ? (
          <div className="mt-3 flex flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
      {onClose !== undefined ? (
        <IconButton
          aria-label="Dismiss"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="-mr-1 -mt-1"
        >
          <X className="h-4 w-4" />
        </IconButton>
      ) : null}
    </div>
  );
}
