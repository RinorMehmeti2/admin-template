import { useTranslation } from 'react-i18next';
import {
  AlertSection,
  ConfirmDialogSection,
  DialogSection,
  DrawerSection,
  ProgressSection,
  ScrollLockSection,
  ToastSection,
  TooltipSection,
} from './components';

export function FeedbackPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('demos.feedback.title')}</h1>
        <p className="mt-1 text-foreground-muted">{t('demos.feedback.subtitle')}</p>
      </header>

      <AlertSection />

      <ToastSection />

      <DialogSection />

      <DrawerSection />

      <ConfirmDialogSection />

      <TooltipSection />

      <ProgressSection />

      <ScrollLockSection />
    </div>
  );
}
