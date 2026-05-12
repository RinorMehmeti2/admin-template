import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display';
import { ENTRIES } from '../data';

export function ShowcaseGrid() {
  const { t } = useTranslation();
  return (
    <section
      aria-label={t('showcase.categoriesAria')}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {ENTRIES.map((entry) => (
        <Link
          key={entry.to}
          to={entry.to}
          className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Card
            variant="outlined"
            className="h-full transition-colors group-hover:border-border-strong group-hover:bg-surface-muted/40"
          >
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-foreground">
                  {entry.icon}
                </span>
                <div>
                  <CardTitle className="text-base">{t(entry.labelKey)}</CardTitle>
                  <span className="text-xs text-foreground-subtle">{t(entry.countKey)}</span>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-foreground-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>{t(entry.descriptionKey)}</CardDescription>
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>
  );
}
