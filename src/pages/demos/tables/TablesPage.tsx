import { useTranslation } from 'react-i18next';
import { OrdersTableSection, SimpleTableSection, UsersTableSection } from './components';

export function TablesPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('demos.tables.title')}</h1>
        <p className="mt-1 text-foreground-muted">{t('demos.tables.subtitle')}</p>
      </header>

      <SimpleTableSection />
      <UsersTableSection />
      <OrdersTableSection />
    </div>
  );
}
