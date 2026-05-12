import { useTranslation } from 'react-i18next';
import {
  AvatarSection,
  BadgeSection,
  ButtonSection,
  IconButtonSection,
  KbdSeparatorSection,
  SpinnerSkeletonSection,
} from './components';

export function PrimitivesPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('demos.primitives.title')}</h1>
        <p className="mt-1 text-foreground-muted">{t('demos.primitives.subtitle')}</p>
      </header>

      <ButtonSection />
      <IconButtonSection />
      <BadgeSection />
      <AvatarSection />
      <SpinnerSkeletonSection />
      <KbdSeparatorSection />
    </div>
  );
}
