import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Code, Copy } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import { IconButton } from '@/components/primitives/IconButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/feedback/Dialog';
import { cn } from '@/lib/cn';

export interface SectionProps {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  /** Source snippet shown in Show-code dialog and copied to clipboard. Omit to hide toolbar. */
  code?: string;
  /** Label appended to dialog title. Default `tsx`. */
  codeLanguage?: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/** SIMS-style outlined card section with Copy/Show-code toolbar — used across /forms/* demos. */
export function Section({
  id,
  title,
  description,
  eyebrow,
  actions,
  code,
  codeLanguage = 'tsx',
  className,
  contentClassName,
  children,
}: SectionProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const showToolbar = code !== undefined;

  const handleCopy = (): void => {
    if (code === undefined) return;
    navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopied(true);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id={id} className={cn('scroll-mt-24', className)}>
      <Card variant="outlined">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {eyebrow !== undefined ? (
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                {eyebrow}
              </p>
            ) : null}
            <CardTitle className="text-lg">{title}</CardTitle>
            {description !== undefined ? (
              <CardDescription className="max-w-3xl">{description}</CardDescription>
            ) : null}
          </div>
          {actions !== undefined || showToolbar ? (
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              {showToolbar ? (
                <div className="flex items-center gap-1" data-print="hide">
                  <Tooltip>
                    <TooltipTrigger>
                      <IconButton
                        aria-label={copied ? 'Copied' : 'Copy code'}
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </IconButton>
                    </TooltipTrigger>
                    <TooltipContent>{copied ? 'Copied' : 'Copy code'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <IconButton
                        aria-label="Show code"
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(true)}
                      >
                        <Code className="h-4 w-4" />
                      </IconButton>
                    </TooltipTrigger>
                    <TooltipContent>Show code</TooltipContent>
                  </Tooltip>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardHeader>
        <CardContent className={cn('pt-2', contentClassName)}>{children}</CardContent>
      </Card>
      {showToolbar ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent size="xl">
            <DialogHeader>
              <DialogTitle>
                {typeof title === 'string' ? `${title} — ${codeLanguage}` : codeLanguage}
              </DialogTitle>
            </DialogHeader>
            <DialogBody className="p-0">
              <pre className="m-0 max-h-[60vh] overflow-auto bg-surface-muted px-6 py-4 font-mono text-xs leading-relaxed text-foreground">
                <code>{code}</code>
              </pre>
            </DialogBody>
          </DialogContent>
        </Dialog>
      ) : null}
    </section>
  );
}
