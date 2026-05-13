import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/primitives/Button';
import { Spinner } from '@/components/primitives/Spinner';
import { Skeleton } from '@/components/primitives/Skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import { Alert } from '@/components/feedback/Alert';
import { Progress } from '@/components/feedback/Progress';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/feedback/Dialog';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/feedback/Drawer';
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/components/feedback/BottomSheet';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useToast } from '@/context/ToastProvider';
import { ComponentsUsedFooter, SectionHeader } from '../_shared';

const COMPONENTS = [
  'Dialog',
  'Drawer',
  'BottomSheet',
  'ConfirmDialog',
  'Toast',
  'Alert',
  'Tooltip',
  'Progress',
  'Spinner',
  'Skeleton',
  'Button',
  'Card',
];

export function FeedbackTheaterPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerLeftOpen, setDrawerLeftOpen] = useState(false);
  const [drawerRightOpen, setDrawerRightOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progress, setProgress] = useState(35);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title={t('croissant.feedback.title')}
        description={t('croissant.feedback.subtitle')}
      />

      <section className="space-y-4" aria-labelledby="modals-heading">
        <SectionHeader
          tone="primary"
          eyebrow={t('croissant.feedback.section.modalsEyebrow')}
          title={<span id="modals-heading">{t('croissant.feedback.section.modals')}</span>}
        />
        <Card variant="outlined">
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setDialogOpen(true)}>
                {t('croissant.feedback.btn.openDialog')}
              </Button>
              <Button variant="outline" onClick={() => setDrawerLeftOpen(true)}>
                {t('croissant.feedback.btn.openDrawerLeft')}
              </Button>
              <Button variant="outline" onClick={() => setDrawerRightOpen(true)}>
                {t('croissant.feedback.btn.openDrawerRight')}
              </Button>
              <Button variant="outline" onClick={() => setSheetOpen(true)}>
                {t('croissant.feedback.btn.openSheet')}
              </Button>
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                {t('croissant.feedback.btn.openConfirm')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="inline-heading">
        <SectionHeader
          tone="info"
          eyebrow={t('croissant.feedback.section.inlineEyebrow')}
          title={<span id="inline-heading">{t('croissant.feedback.section.inline')}</span>}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Toasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => toast.info(t('croissant.feedback.toast.info'))}
                >
                  {t('croissant.feedback.btn.toastInfo')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.success(t('croissant.feedback.toast.success'))}
                >
                  {t('croissant.feedback.btn.toastSuccess')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.warning(t('croissant.feedback.toast.warning'))}
                >
                  {t('croissant.feedback.btn.toastWarning')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.error(t('croissant.feedback.toast.danger'))}
                >
                  {t('croissant.feedback.btn.toastDanger')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Tooltip</CardTitle>
            </CardHeader>
            <CardContent>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="outline">{t('croissant.feedback.btn.hoverMe')}</Button>
                </TooltipTrigger>
                <TooltipContent>{t('croissant.feedback.tooltip.body')}</TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>

          <div className="space-y-3 lg:col-span-2">
            <Alert variant="info" title="Info" description={t('croissant.feedback.alert.info')} />
            <Alert
              variant="success"
              title="Success"
              description={t('croissant.feedback.alert.success')}
            />
            <Alert
              variant="warning"
              title="Warning"
              description={t('croissant.feedback.alert.warning')}
            />
            <Alert
              variant="danger"
              title="Danger"
              description={t('croissant.feedback.alert.danger')}
            />
            <Alert
              variant="neutral"
              icon={<Bell className="h-5 w-5" />}
              title={t('croissant.feedback.bell.title')}
              description={t('croissant.feedback.bell.body')}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="loading-heading">
        <SectionHeader
          tone="warning"
          eyebrow={t('croissant.feedback.section.loadingEyebrow')}
          title={<span id="loading-heading">{t('croissant.feedback.section.loading')}</span>}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>{t('croissant.feedback.progress.label')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={progress} label={t('croissant.feedback.progress.label')} />
              <Progress indeterminate variant="success" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setProgress((p) => Math.min(100, p + 10))}>
                  {t('croissant.feedback.btn.tickProgress')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setProgress(0)}>
                  {t('croissant.feedback.btn.resetProgress')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>{t('croissant.feedback.spinner.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-primary">
                <Spinner size="xs" />
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>{t('croissant.feedback.skeleton.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('croissant.feedback.dialog.title')}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-foreground-muted">{t('croissant.feedback.dialog.body')}</p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              {t('croissant.forms.confirm.cancel')}
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false);
                toast.success(t('croissant.feedback.toast.success'));
              }}
            >
              {t('croissant.feedback.dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={drawerLeftOpen} onOpenChange={setDrawerLeftOpen} side="left" responsive={false}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('croissant.feedback.drawer.title')}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <p className="text-sm text-foreground-muted">{t('croissant.feedback.drawer.body')}</p>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={drawerRightOpen}
        onOpenChange={setDrawerRightOpen}
        side="right"
        responsive={false}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('croissant.feedback.drawer.title')}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <p className="text-sm text-foreground-muted">{t('croissant.feedback.drawer.body')}</p>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <BottomSheetContent>
          <BottomSheetHeader>
            <BottomSheetTitle>{t('croissant.feedback.sheet.title')}</BottomSheetTitle>
          </BottomSheetHeader>
          <BottomSheetBody>
            <p className="text-sm text-foreground-muted">{t('croissant.feedback.sheet.body')}</p>
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="danger"
        title={t('croissant.feedback.confirm.title')}
        description={t('croissant.feedback.confirm.body')}
        confirmLabel={t('croissant.feedback.confirm.ok')}
        cancelLabel={t('croissant.feedback.confirm.cancel')}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.error(t('croissant.feedback.toast.danger'));
        }}
      />

      <ComponentsUsedFooter components={COMPONENTS} />
    </div>
  );
}
