import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';

export interface ComponentsUsedFooterProps {
  components: ReadonlyArray<string>;
}

export function ComponentsUsedFooter({ components }: ComponentsUsedFooterProps) {
  const { t } = useTranslation();
  return (
    <Card variant="outlined" data-testid="components-used-footer">
      <CardHeader>
        <CardTitle>{t('croissant.common.componentsUsed')}</CardTitle>
        <p className="text-xs text-foreground-subtle">{t('croissant.common.componentsUsedHint')}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="flex flex-wrap gap-2">
          {components.map((c) => (
            <li key={c}>
              <Badge variant="neutral" size="sm" className="font-mono">
                {c}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
