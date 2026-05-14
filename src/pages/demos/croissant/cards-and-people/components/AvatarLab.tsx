import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/primitives/Avatar';
import { AvatarGroup } from '@/components/primitives/AvatarGroup';
import { Button } from '@/components/primitives/Button';
import { Card, CardContent } from '@/components/data-display/Card';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
type Size = (typeof SIZES)[number];

const NAMES = [
  'Ada Lovelace',
  'Grace Hopper',
  'Linus Torvalds',
  'Margaret Hamilton',
  'Alan Turing',
  'Edsger Dijkstra',
  'Hedy Lamarr',
  'Donald Knuth',
];

export function AvatarLab() {
  const { t } = useTranslation();
  const [size, setSize] = useState<Size>('md');

  const cycle = () => {
    const idx = (SIZES.indexOf(size) + 1) % SIZES.length;
    setSize(SIZES[idx] as Size);
  };

  return (
    <Card variant="outlined">
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            {t('croissant.cards.avatarLab.groupLabel')}
          </p>
          <div className="mt-2">
            <AvatarGroup
              size="md"
              max={5}
              aria-label={t('croissant.cards.avatarLab.groupLabel')}
              items={NAMES.map((n) => ({ name: n }))}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              {t('croissant.cards.avatarLab.swap')}
            </p>
            <Button size="sm" variant="outline" onClick={cycle}>
              {t('croissant.cards.avatarLab.next', { size })}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            {NAMES.slice(0, 4).map((n) => (
              <Avatar key={n} size={size} name={n} />
            ))}
          </div>
          <p className="mt-2 text-xs text-foreground-subtle">
            {t('croissant.cards.avatarLab.hint')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
