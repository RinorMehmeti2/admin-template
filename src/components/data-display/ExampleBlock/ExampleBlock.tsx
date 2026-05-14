import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { Check, Code, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { IconButton } from '@/components/primitives/IconButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/feedback/Dialog';

export interface ExampleBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  ref?: Ref<HTMLDivElement> | undefined;
  title: ReactNode;
  description?: ReactNode | undefined;
  /** Source snippet shown in the Show-code dialog and copied to clipboard. Omit to hide toolbar. */
  code?: string | undefined;
  /** Label appended to the dialog title. Default `tsx`. */
  codeLanguage?: string | undefined;
  /** Force-hide the Copy/Show toolbar even when `code` is set. */
  hideToolbar?: boolean | undefined;
  children: ReactNode;
}

export function ExampleBlock({
  ref,
  className,
  title,
  description,
  code,
  codeLanguage = 'tsx',
  hideToolbar,
  children,
  ...rest
}: ExampleBlockProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const showToolbar = !hideToolbar && code !== undefined;

  const handleCopy = (): void => {
    if (code === undefined) return;
    navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopied(true);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const cardRef = ref;
  return (
    <Card
      {...(cardRef !== undefined ? { ref: cardRef } : {})}
      variant="outlined"
      className={cn('overflow-hidden', className)}
      {...rest}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description !== undefined ? (
            <p className="mt-1 text-sm text-foreground-muted">{description}</p>
          ) : null}
        </div>
        {showToolbar ? (
          <div className="flex shrink-0 items-center gap-1" data-print="hide">
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
      </CardHeader>
      <CardContent>{children}</CardContent>
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
    </Card>
  );
}
