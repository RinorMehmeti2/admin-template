import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ShowcaseFooter() {
  const { t } = useTranslation();
  return (
    <footer className="flex items-center justify-between border-t border-border pt-6 text-sm text-foreground-muted">
      <span>{t('showcase.footer.hint')}</span>
      <Link
        to="/primitives"
        className="inline-flex items-center gap-1 text-primary hover:underline"
      >
        {t('showcase.footer.startExploring')}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </footer>
  );
}
