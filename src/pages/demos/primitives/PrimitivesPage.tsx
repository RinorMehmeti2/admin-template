import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
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
    <div className="mx-auto max-w-[1400px]">
      <SimsPageHeader
        title={t('demos.primitives.title')}
        description={t('demos.primitives.subtitle')}
      />
      <div className="space-y-6">
        <ButtonSection />
        <IconButtonSection />
        <BadgeSection />
        <AvatarSection />
        <SpinnerSkeletonSection />
        <KbdSeparatorSection />
      </div>
    </div>
  );
}
