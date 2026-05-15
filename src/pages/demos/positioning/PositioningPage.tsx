import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  ContextMenuArea,
  CustomBoundaryDemo,
  DraggableTooltip,
  EdgeDropdownGrid,
} from './components';

export function PositioningPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-[1400px]">
      <SimsPageHeader
        title={t('demos.positioning.title')}
        description={t('demos.positioning.subtitle')}
      />
      <div className="space-y-6">
        <Card variant="outlined" className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Tooltip flip</CardTitle>
          </CardHeader>
          <CardContent>
            <DraggableTooltip initial={{ x: 50, y: 50 }} />
          </CardContent>
        </Card>

        <Card variant="outlined" className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">DropdownMenu near edges</CardTitle>
            <p className="mt-1 text-sm text-foreground-muted">
              Open each menu and try scrolling the viewport — placements adapt automatically.
            </p>
          </CardHeader>
          <CardContent>
            <EdgeDropdownGrid />
          </CardContent>
        </Card>

        <Card variant="outlined" className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">ContextMenu at cursor</CardTitle>
          </CardHeader>
          <CardContent>
            <ContextMenuArea />
          </CardContent>
        </Card>

        <Card variant="outlined" className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Custom boundary</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomBoundaryDemo />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
