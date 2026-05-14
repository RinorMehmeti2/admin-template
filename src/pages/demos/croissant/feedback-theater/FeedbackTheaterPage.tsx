import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Image as ImageIcon,
  Info,
  MessageSquare,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { Alert } from '@/components/feedback/Alert';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Card, CardContent } from '@/components/data-display/Card';
import { Progress } from '@/components/feedback/Progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/feedback/Dialog';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/feedback/Drawer';
import { EmptyState } from '@/components/data-display/EmptyState';
import { FormField, Input } from '@/components/forms';
import { useToast } from '@/context/ToastProvider';
import type { Placement } from '@/hooks/usePosition';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';

type DialogKind = 'confirm' | 'danger' | 'form' | 'image';
type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

interface AlertEntry {
  id: string;
  variant: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  title: string;
  body: string;
}

const TOAST_BUTTONS: Array<{
  kind: 'success' | 'error' | 'warning' | 'info';
  position: 'top-right' | 'bottom-right';
  textKey: string;
}> = [
  { kind: 'success', position: 'top-right', textKey: 'croissant.feedback.toasts.success' },
  { kind: 'error', position: 'top-right', textKey: 'croissant.feedback.toasts.error' },
  { kind: 'warning', position: 'top-right', textKey: 'croissant.feedback.toasts.warning' },
  { kind: 'info', position: 'top-right', textKey: 'croissant.feedback.toasts.info' },
  { kind: 'success', position: 'bottom-right', textKey: 'croissant.feedback.toasts.successBottom' },
  { kind: 'error', position: 'bottom-right', textKey: 'croissant.feedback.toasts.errorBottom' },
  { kind: 'warning', position: 'bottom-right', textKey: 'croissant.feedback.toasts.warningBottom' },
  { kind: 'info', position: 'bottom-right', textKey: 'croissant.feedback.toasts.infoBottom' },
];

const TOOLTIP_GRID: Placement[] = [
  'top',
  'top-start',
  'top-end',
  'right',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'top',
  'right',
  'bottom',
  'left',
];

const DIALOG_CARDS: Array<{
  kind: DialogKind;
  titleKey: string;
  bodyKey: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    kind: 'confirm',
    titleKey: 'croissant.feedback.dialogs.confirmTitle',
    bodyKey: 'croissant.feedback.dialogs.confirmBody',
    icon: CheckCircle,
  },
  {
    kind: 'danger',
    titleKey: 'croissant.feedback.dialogs.dangerTitle',
    bodyKey: 'croissant.feedback.dialogs.dangerBody',
    icon: ShieldAlert,
  },
  {
    kind: 'form',
    titleKey: 'croissant.feedback.dialogs.formTitle',
    bodyKey: 'croissant.feedback.dialogs.formBody',
    icon: MessageSquare,
  },
  {
    kind: 'image',
    titleKey: 'croissant.feedback.dialogs.imageTitle',
    bodyKey: 'croissant.feedback.dialogs.imageBody',
    icon: ImageIcon,
  },
];

const DRAWER_SIDES: Array<{
  side: DrawerSide;
  icon: ComponentType<{ className?: string }>;
  labelKey: string;
}> = [
  { side: 'left', icon: ChevronLeft, labelKey: 'croissant.feedback.drawer.left' },
  { side: 'right', icon: ChevronRight, labelKey: 'croissant.feedback.drawer.right' },
  { side: 'top', icon: ChevronUp, labelKey: 'croissant.feedback.drawer.top' },
  { side: 'bottom', icon: ChevronDown, labelKey: 'croissant.feedback.drawer.bottom' },
];

const INITIAL_ALERTS: ReadonlyArray<AlertEntry> = [
  {
    id: 'a1',
    variant: 'info',
    title: 'Heads up',
    body: 'Weather looks great for fresh sourdough today.',
  },
  { id: 'a2', variant: 'success', title: 'Saved', body: 'Order #1042 paid in full.' },
  { id: 'a3', variant: 'warning', title: 'Low stock', body: 'Only 2 croissants left in the case.' },
  {
    id: 'a4',
    variant: 'danger',
    title: 'Card declined',
    body: 'Customer Ada — please retry checkout.',
  },
  { id: 'a5', variant: 'neutral', title: 'New tip', body: 'Press Cmd+K to jump to any page.' },
];

export function FeedbackTheaterPage() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [dialogKind, setDialogKind] = useState<DialogKind | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerSide, setDrawerSide] = useState<DrawerSide | null>(null);
  const [alerts, setAlerts] = useState<ReadonlyArray<AlertEntry>>(INITIAL_ALERTS);
  const [progress, setProgress] = useState(28);
  const [timerProgress, setTimerProgress] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!timerActive) return;
    const startedAt = Date.now() - timerProgress * 300;
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 300);
      setTimerProgress(Math.min(100, elapsed));
      if (elapsed >= 100) {
        setTimerActive(false);
      }
    }, 200);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive]);

  const fireToast = (kind: 'success' | 'error' | 'warning' | 'info', textKey: string) => {
    toast[kind](t(textKey));
  };

  const stormToasts = () => {
    const order: Array<'success' | 'error' | 'warning' | 'info'> = [
      'success',
      'info',
      'warning',
      'error',
      'success',
      'info',
    ];
    order.forEach((k, i) =>
      setTimeout(() => toast[k](t('croissant.feedback.toasts.storm', { n: i + 1 })), i * 220),
    );
  };

  const dismissAlert = (id: string) => setAlerts((list) => list.filter((a) => a.id !== id));
  const resetAlerts = () => setAlerts(INITIAL_ALERTS);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <SimsPageHeader
        title={t('croissant.feedback.scene.title')}
        description={t('croissant.feedback.scene.description')}
        actions={
          <>
            <Badge variant="danger" size="sm" dot>
              {t('croissant.feedback.meta.overlays', { n: 7 })}
            </Badge>
            <Badge variant="warning" size="sm">
              {t('croissant.feedback.meta.collisions', { n: 0 })}
            </Badge>
          </>
        }
      />

      <section aria-labelledby="toast-theater" className="space-y-4">
        <div>
          <h2 id="toast-theater" className="text-lg font-semibold text-foreground">
            {t('croissant.feedback.section.toasts')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.feedback.section.toastsDesc')}
          </p>
        </div>
        <Card variant="outlined">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TOAST_BUTTONS.map((b) => (
                <Button
                  key={`${b.kind}-${b.position}`}
                  variant={
                    b.kind === 'error' ? 'danger' : b.kind === 'success' ? 'primary' : 'outline'
                  }
                  onClick={() => fireToast(b.kind, b.textKey)}
                >
                  {t(b.textKey)}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-xs text-foreground-muted">
                {t('croissant.feedback.toasts.stormHint')}
              </p>
              <Button leftIcon={<Zap className="h-4 w-4" />} onClick={stormToasts}>
                {t('croissant.feedback.toasts.stormBtn')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="dialog-gallery" className="space-y-4">
        <div>
          <h2 id="dialog-gallery" className="text-lg font-semibold text-foreground">
            {t('croissant.feedback.section.dialogs')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.feedback.section.dialogsDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DIALOG_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.kind} variant="outlined">
                <CardContent className="space-y-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-danger/10 text-danger">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold text-foreground">{t(card.titleKey)}</p>
                  <p className="text-xs text-foreground-muted">{t(card.bodyKey)}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      card.kind === 'danger' ? setConfirmOpen(true) : setDialogKind(card.kind)
                    }
                  >
                    {t('croissant.feedback.dialogs.open')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="drawer-sides" className="space-y-4">
        <div>
          <h2 id="drawer-sides" className="text-lg font-semibold text-foreground">
            {t('croissant.feedback.section.drawer')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.feedback.section.drawerDesc')}
          </p>
        </div>
        <Card variant="outlined">
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              {DRAWER_SIDES.map((d) => {
                const Icon = d.icon;
                return (
                  <Button
                    key={d.side}
                    variant="outline"
                    leftIcon={<Icon className="h-4 w-4" />}
                    onClick={() => setDrawerSide(d.side)}
                  >
                    {t(d.labelKey)}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="alert-weather" className="space-y-4">
        <div>
          <h2 id="alert-weather" className="text-lg font-semibold text-foreground">
            {t('croissant.feedback.section.alerts')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.feedback.section.alertsDesc')}
          </p>
        </div>
        <Card variant="outlined">
          <CardContent>
            {alerts.length > 0 ? (
              <ul className="space-y-3">
                {alerts.map((a) => (
                  <li key={a.id}>
                    <Alert
                      variant={a.variant}
                      title={a.title}
                      description={a.body}
                      onClose={() => dismissAlert(a.id)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<CheckCircle className="h-7 w-7" />}
                title={t('croissant.feedback.alerts.allClear')}
                description={t('croissant.feedback.alerts.allClearDesc')}
                action={
                  <Button onClick={resetAlerts}>{t('croissant.feedback.alerts.reset')}</Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="progress-lab" className="space-y-4">
        <div>
          <h2 id="progress-lab" className="text-lg font-semibold text-foreground">
            {t('croissant.feedback.section.progress')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.feedback.section.progressDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card variant="outlined">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  {t('croissant.feedback.progress.basic')}
                </p>
                <Progress value={progress} label={t('croissant.feedback.progress.basic')} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  {t('croissant.feedback.progress.indeterminate')}
                </p>
                <Progress
                  indeterminate
                  variant="success"
                  label={t('croissant.feedback.progress.indeterminate')}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  {t('croissant.feedback.progress.tone')}
                </p>
                <div className="space-y-1.5">
                  <Progress
                    value={20}
                    variant="default"
                    label={t('croissant.feedback.progress.tone')}
                  />
                  <Progress
                    value={50}
                    variant="success"
                    label={t('croissant.feedback.progress.tone')}
                  />
                  <Progress
                    value={75}
                    variant="warning"
                    label={t('croissant.feedback.progress.tone')}
                  />
                  <Progress
                    value={95}
                    variant="danger"
                    label={t('croissant.feedback.progress.tone')}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setProgress((p) => Math.min(100, p + 10))}>
                  {t('croissant.feedback.progress.tick')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setProgress(0)}>
                  {t('croissant.feedback.progress.reset')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                {t('croissant.feedback.progress.timer')}
              </p>
              <CircularProgress value={timerProgress} />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (timerProgress >= 100) setTimerProgress(0);
                    setTimerActive(true);
                  }}
                  disabled={timerActive}
                  leftIcon={<Clock className="h-4 w-4" />}
                >
                  {t('croissant.feedback.progress.start')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTimerActive(false);
                    setTimerProgress(0);
                  }}
                >
                  {t('croissant.feedback.progress.reset')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="tooltip-orchard" className="space-y-4">
        <div>
          <h2 id="tooltip-orchard" className="text-lg font-semibold text-foreground">
            {t('croissant.feedback.section.tooltips')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.feedback.section.tooltipsDesc')}
          </p>
        </div>
        <Card variant="outlined">
          <CardContent>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {TOOLTIP_GRID.map((side, i) => (
                <Tooltip key={`${side}-${i}`} delayDuration={Math.max(100, i * 60)}>
                  <TooltipTrigger>
                    <Button variant="outline" size="sm">
                      {side}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={side} sideOffset={6 + (i % 3) * 2}>
                    {t('croissant.feedback.tooltips.body', { side })}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="danger"
        title={t('croissant.feedback.dialogs.dangerTitle')}
        description={t('croissant.feedback.dialogs.dangerBody')}
        confirmLabel={t('croissant.feedback.dialogs.dangerOk')}
        cancelLabel={t('croissant.feedback.dialogs.cancel')}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.error(t('croissant.feedback.toasts.deleted'));
        }}
      />

      <Dialog
        open={dialogKind !== null && dialogKind !== 'danger'}
        onOpenChange={(open) => !open && setDialogKind(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogKind === 'confirm'
                ? t('croissant.feedback.dialogs.confirmTitle')
                : dialogKind === 'form'
                  ? t('croissant.feedback.dialogs.formTitle')
                  : dialogKind === 'image'
                    ? t('croissant.feedback.dialogs.imageTitle')
                    : ''}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {dialogKind === 'confirm' ? (
              <p className="flex items-start gap-2 text-sm text-foreground-muted">
                <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                {t('croissant.feedback.dialogs.confirmBody')}
              </p>
            ) : null}
            {dialogKind === 'form' ? (
              <div className="space-y-3">
                <FormField label={t('croissant.feedback.dialogs.formNameLabel')}>
                  <Input placeholder="Ada" />
                </FormField>
                <FormField label={t('croissant.feedback.dialogs.formNoteLabel')}>
                  <Input placeholder={t('croissant.feedback.dialogs.formNotePh')} />
                </FormField>
              </div>
            ) : null}
            {dialogKind === 'image' ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  'bg-warning/10 text-warning',
                  'bg-info/10 text-info',
                  'bg-success/10 text-success',
                  'bg-danger/10 text-danger',
                  'bg-info/10 text-info',
                  'bg-warning/10 text-warning',
                ].map((cls, idx) => (
                  <div
                    key={idx}
                    className={`flex h-24 items-center justify-center rounded-md ${cls}`}
                  >
                    <ImageIcon className="h-6 w-6" />
                  </div>
                ))}
              </div>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogKind(null)}>
              {t('croissant.feedback.dialogs.cancel')}
            </Button>
            <Button onClick={() => setDialogKind(null)}>
              {t('croissant.feedback.dialogs.ok')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {DRAWER_SIDES.map((d) => (
        <Drawer
          key={d.side}
          open={drawerSide === d.side}
          onOpenChange={(open) => !open && setDrawerSide(null)}
          side={d.side}
          responsive={false}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t('croissant.feedback.drawer.title', { side: d.side })}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="space-y-3">
              <FormField label={t('croissant.feedback.drawer.field')}>
                <Input placeholder={t('croissant.feedback.drawer.fieldPh')} />
              </FormField>
              <p className="text-xs text-foreground-muted">{t('croissant.feedback.drawer.hint')}</p>
              <Button
                onClick={() => setDrawerSide(null)}
                variant="outline"
                size="sm"
                leftIcon={<AlertCircle className="h-4 w-4" />}
              >
                {t('croissant.feedback.drawer.close')}
              </Button>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={96} height={96} viewBox="0 0 96 96" aria-hidden="true">
      <circle
        cx={48}
        cy={48}
        r={r}
        stroke="currentColor"
        strokeWidth={6}
        fill="none"
        className="text-surface-muted"
      />
      <circle
        cx={48}
        cy={48}
        r={r}
        stroke="currentColor"
        strokeWidth={6}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        className="text-primary transition-[stroke-dashoffset] duration-200"
      />
      <text
        x="48"
        y="52"
        textAnchor="middle"
        className="fill-foreground text-sm font-semibold tabular-nums"
      >
        {Math.round(value)}%
      </text>
    </svg>
  );
}
