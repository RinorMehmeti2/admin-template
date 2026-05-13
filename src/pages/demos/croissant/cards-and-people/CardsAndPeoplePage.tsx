import { useTranslation } from 'react-i18next';
import { CheckCircle2, Heart, MoreVertical, Pencil, Star, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/primitives/Badge';
import { Avatar } from '@/components/primitives/Avatar';
import { AvatarGroup } from '@/components/primitives/AvatarGroup';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { ComponentsUsedFooter, SectionHeader } from '../_shared';

type Role = 'head' | 'pastry' | 'front' | 'delivery' | 'intern' | 'manager';

interface Member {
  name: string;
  roleKey: Role;
  status: 'online' | 'away' | 'offline';
  badgeTone: 'primary' | 'success' | 'warning' | 'info' | 'neutral';
}

const TEAM: ReadonlyArray<Member> = [
  { name: 'Ada Lovelace', roleKey: 'head', status: 'online', badgeTone: 'primary' },
  { name: 'Grace Hopper', roleKey: 'pastry', status: 'online', badgeTone: 'success' },
  { name: 'Linus Torvalds', roleKey: 'manager', status: 'away', badgeTone: 'info' },
  { name: 'Margaret Hamilton', roleKey: 'front', status: 'online', badgeTone: 'warning' },
  { name: 'Alan Turing', roleKey: 'delivery', status: 'offline', badgeTone: 'neutral' },
  { name: 'Edsger Dijkstra', roleKey: 'intern', status: 'online', badgeTone: 'neutral' },
];

const COMPONENTS = [
  'Card',
  'CardHeader',
  'CardContent',
  'CardFooter',
  'Badge',
  'Avatar',
  'AvatarGroup',
  'IconButton',
  'DropdownMenu',
  'Button',
];

export function CardsAndPeoplePage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader title={t('croissant.cards.title')} description={t('croissant.cards.subtitle')} />

      <section className="space-y-4" aria-labelledby="cards-heading">
        <SectionHeader
          tone="primary"
          eyebrow={t('croissant.cards.section.cardVariantsEyebrow')}
          title={<span id="cards-heading">{t('croissant.cards.section.cardVariants')}</span>}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent>
              <p className="font-medium text-foreground">{t('croissant.cards.card.default')}</p>
              <p className="mt-2 text-sm text-foreground-muted">{t('croissant.cards.card.body')}</p>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <p className="font-medium text-foreground">{t('croissant.cards.card.outlined')}</p>
              <p className="mt-2 text-sm text-foreground-muted">{t('croissant.cards.card.body')}</p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent>
              <p className="font-medium text-foreground">{t('croissant.cards.card.elevated')}</p>
              <p className="mt-2 text-sm text-foreground-muted">{t('croissant.cards.card.body')}</p>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>{t('croissant.cards.card.withHeader')}</CardTitle>
              <CardDescription>{t('croissant.cards.card.body')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground-muted">{t('croissant.cards.card.body')}</p>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <p className="font-medium text-foreground">{t('croissant.cards.card.withFooter')}</p>
              <p className="mt-2 text-sm text-foreground-muted">{t('croissant.cards.card.body')}</p>
            </CardContent>
            <CardFooter>
              <span className="flex-1 text-xs text-foreground-subtle">
                {t('croissant.cards.card.footerNote')}
              </span>
              <Button size="sm" variant="outline">
                {t('croissant.cards.card.cta')}
              </Button>
            </CardFooter>
          </Card>

          <Card variant="outlined" className="border-danger/30 bg-danger/5">
            <CardHeader>
              <CardTitle className="text-danger">{t('croissant.cards.card.dangerTint')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-danger/80">{t('croissant.cards.card.body')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="badges-heading">
        <SectionHeader
          tone="success"
          eyebrow={t('croissant.cards.section.badgesEyebrow')}
          title={<span id="badges-heading">{t('croissant.cards.section.badges')}</span>}
        />
        <Card variant="outlined">
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success" dot>
                Online
              </Badge>
              <Badge variant="warning" dot>
                Pending
              </Badge>
              <Badge variant="danger" dot>
                Failed
              </Badge>
              <Badge variant="info" dot>
                Beta
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="md">
                <Star className="h-3 w-3" /> Top
              </Badge>
              <Badge variant="success" size="md">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </Badge>
              <Badge variant="danger" size="md">
                <Heart className="h-3 w-3" /> Loved
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="sm">
                Small
              </Badge>
              <Badge variant="primary" size="md">
                Medium
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="avatars-heading">
        <SectionHeader
          tone="info"
          eyebrow={t('croissant.cards.section.avatarsEyebrow')}
          title={<span id="avatars-heading">{t('croissant.cards.section.avatars')}</span>}
        />
        <Card variant="outlined">
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar size="xs" name="Ada Lovelace" />
              <Avatar size="sm" name="Grace Hopper" />
              <Avatar size="md" name="Linus Torvalds" />
              <Avatar size="lg" name="Margaret Hamilton" />
              <Avatar size="xl" name="Alan Turing" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar size="md" name="Ada Lovelace" status="online" className="overflow-visible" />
              <Avatar size="md" name="Grace Hopper" status="away" className="overflow-visible" />
              <Avatar size="md" name="Linus Torvalds" status="busy" className="overflow-visible" />
              <Avatar
                size="md"
                name="Margaret Hamilton"
                status="offline"
                className="overflow-visible"
              />
            </div>
            <AvatarGroup
              size="md"
              spacing="normal"
              max={4}
              aria-label="Team"
              items={TEAM.map((m) => ({ name: m.name }))}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="roster-heading">
        <SectionHeader
          tone="warning"
          eyebrow={t('croissant.cards.section.rosterEyebrow')}
          title={<span id="roster-heading">{t('croissant.cards.section.roster')}</span>}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m) => (
            <Card key={m.name} variant="outlined">
              <CardContent className="flex items-start gap-3">
                <Avatar size="lg" name={m.name} status={m.status} className="overflow-visible" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{m.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge variant={m.badgeTone} size="sm">
                      {t(`croissant.cards.roles.${m.roleKey}`)}
                    </Badge>
                    <Badge variant="neutral" size="sm" dot>
                      {m.status}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <IconButton
                      aria-label={t('croissant.cards.roster.menuLabel')}
                      variant="ghost"
                      size="sm"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </IconButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom-end">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t('croissant.cards.roster.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('croissant.cards.roster.remove')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <ComponentsUsedFooter components={COMPONENTS} />
    </div>
  );
}
