import { useTranslation } from 'react-i18next';
import { BottomSheetSection, DrawerSection, TapTargetsSection, ToastSection } from './components';

/*
 * /mobile-preview — showcase mobile-native behaviors. Resize the viewport to
 * &lt;768px (or open DevTools device emulation) for the full effect.
 */

export function MobilePreviewPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('demos.mobile.title')}</h1>
        <p className="mt-1 text-foreground-muted">{t('demos.mobile.subtitle')}</p>
      </header>

      <BottomSheetSection />
      <DrawerSection />
      <ToastSection />
      <TapTargetsSection />
    </div>
  );
}
