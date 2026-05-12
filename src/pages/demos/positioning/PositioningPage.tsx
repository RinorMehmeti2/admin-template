import { useTranslation } from 'react-i18next';
import {
  ContextMenuArea,
  CustomBoundaryDemo,
  DraggableTooltip,
  EdgeDropdownGrid,
} from './components';

export function PositioningPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('demos.positioning.title')}</h1>
        <p className="mt-1 text-sm text-foreground-subtle">{t('demos.positioning.subtitle')}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Tooltip flip</h2>
        <DraggableTooltip initial={{ x: 50, y: 50 }} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">DropdownMenu near edges</h2>
        <p className="text-sm text-foreground-subtle">
          Open each menu and try scrolling the viewport — placements adapt automatically.
        </p>
        <EdgeDropdownGrid />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">ContextMenu at cursor</h2>
        <ContextMenuArea />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Custom boundary</h2>
        <CustomBoundaryDemo />
      </section>
    </div>
  );
}
