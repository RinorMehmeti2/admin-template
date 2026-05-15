import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
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
    <div className="mx-auto max-w-[1400px]">
      <SimsPageHeader
        title={t('demos.feedback.title')}
        description={t('demos.feedback.subtitle')}
      />
      <div className="space-y-6">
        <AlertSection />
        <ToastSection />
        <DialogSection />
        <DrawerSection />
        <ConfirmDialogSection />
        <TooltipSection />
        <ProgressSection />
        <ScrollLockSection />
      </div>
    </div>
  );
}
