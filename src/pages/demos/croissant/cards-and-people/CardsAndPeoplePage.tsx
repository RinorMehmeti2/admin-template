import { useTranslation } from 'react-i18next';
import { ArrowRight, Calendar, ClipboardList, Heart, Star, UserPlus, Users } from 'lucide-react';
import type { ComponentType } from 'react';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { CrewCard, type CrewMember } from './components/CrewCard';
import { AvatarLab } from './components/AvatarLab';
import { TestimonialCarousel } from './components/TestimonialCarousel';

const CREW: ReadonlyArray<CrewMember> = [
  {
    name: 'Ada Lovelace',
    role: 'Head baker',
    status: 'on-shift',
    specialties: ['Croissants', 'Brioche'],
  },
  {
    name: 'Grace Hopper',
    role: 'Pastry chef',
    status: 'on-shift',
    specialties: ['Tarts', 'Cakes', 'Custards'],
  },
  {
    name: 'Margaret Hamilton',
    role: 'Front of house',
    status: 'on-break',
    specialties: ['Coffee', 'Service'],
  },
  {
    name: 'Linus Torvalds',
    role: 'Bread lead',
    status: 'off',
    specialties: ['Sourdough', 'Baguette'],
  },
  {
    name: 'Alan Turing',
    role: 'Delivery',
    status: 'on-shift',
    specialties: ['Routes', 'Cargo bike'],
  },
  {
    name: 'Edsger Dijkstra',
    role: 'Intern',
    status: 'on-break',
    specialties: ['Doughs', 'Cleaning'],
  },
];

const BADGE_TONES = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const;

type ActionTone = 'primary' | 'success' | 'warning' | 'info';

const ACTION_TINT: Record<ActionTone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

interface Action {
  icon: ComponentType<{ className?: string }>;
  tone: ActionTone;
  title: string;
  description: string;
}

const ACTIONS: ReadonlyArray<Action> = [
  {
    icon: UserPlus,
    tone: 'primary',
    title: 'croissant.cards.actions.onboardTitle',
    description: 'croissant.cards.actions.onboardDesc',
  },
  {
    icon: ClipboardList,
    tone: 'info',
    title: 'croissant.cards.actions.reviewTitle',
    description: 'croissant.cards.actions.reviewDesc',
  },
  {
    icon: Calendar,
    tone: 'success',
    title: 'croissant.cards.actions.scheduleTitle',
    description: 'croissant.cards.actions.scheduleDesc',
  },
];

export function CardsAndPeoplePage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <SimsPageHeader
        title={t('croissant.cards.scene.title')}
        description={t('croissant.cards.scene.description')}
        actions={
          <>
            <Badge variant="primary" size="sm" dot>
              {t('croissant.cards.meta.bakers', { n: 7 })}
            </Badge>
            <Badge variant="success" size="sm">
              {t('croissant.cards.meta.onShift', { n: 2 })}
            </Badge>
          </>
        }
      />

      <section aria-labelledby="featured-baker" className="space-y-4">
        <Card variant="outlined">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle id="featured-baker">
                {t('croissant.cards.featured.title', { name: 'Ada Lovelace' })}
              </CardTitle>
              <CardDescription>{t('croissant.cards.featured.description')}</CardDescription>
            </div>
            <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
              {t('croissant.cards.featured.viewProfile')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-5">
              <Avatar size="xl" name="Ada Lovelace" status="online" className="overflow-visible" />
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                {[
                  { label: t('croissant.cards.featured.stat.shifts'), value: '124' },
                  { label: t('croissant.cards.featured.stat.signature'), value: 'Almond' },
                  { label: t('croissant.cards.featured.stat.years'), value: '6' },
                ].map((s) => (
                  <div key={s.label} className="space-y-0.5">
                    <p className="text-base font-semibold text-foreground tabular-nums">
                      {s.value}
                    </p>
                    <p className="text-foreground-subtle">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="crew-roster" className="space-y-4">
        <div>
          <h2 id="crew-roster" className="text-lg font-semibold text-foreground">
            {t('croissant.cards.section.crew')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.cards.section.crewDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CREW.map((m) => (
            <CrewCard key={m.name} member={m} />
          ))}
        </div>
      </section>

      <section aria-labelledby="avatars-lab" className="space-y-4">
        <div>
          <h2 id="avatars-lab" className="text-lg font-semibold text-foreground">
            {t('croissant.cards.section.avatars')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.cards.section.avatarsDesc')}
          </p>
        </div>
        <AvatarLab />
      </section>

      <section aria-labelledby="testimonials" className="space-y-4">
        <div>
          <h2 id="testimonials" className="text-lg font-semibold text-foreground">
            {t('croissant.cards.section.testimonials')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.cards.section.testimonialsDesc')}
          </p>
        </div>
        <TestimonialCarousel />
      </section>

      <section aria-labelledby="badge-spectrum" className="space-y-4">
        <div>
          <h2 id="badge-spectrum" className="text-lg font-semibold text-foreground">
            {t('croissant.cards.section.badges')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.cards.section.badgesDesc')}
          </p>
        </div>
        <Card variant="outlined">
          <CardContent>
            <div className="space-y-3">
              {BADGE_TONES.map((tone) => (
                <div key={tone} className="flex flex-wrap items-center gap-3">
                  <span className="w-20 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                    {tone}
                  </span>
                  <Badge variant={tone} size="sm">
                    sm
                  </Badge>
                  <Badge variant={tone} size="md">
                    md
                  </Badge>
                  <Badge variant={tone} size="sm" dot>
                    dot
                  </Badge>
                  <Badge variant={tone} size="md">
                    <Star className="h-3 w-3" /> icon
                  </Badge>
                  <Badge variant={tone} size="md">
                    <Heart className="h-3 w-3" /> {t('croissant.cards.badges.loved')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="action-stack" className="space-y-4">
        <div>
          <h2 id="action-stack" className="text-lg font-semibold text-foreground">
            {t('croissant.cards.section.actions')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.cards.section.actionsDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Card key={a.title} variant="outlined" className="group">
                <CardContent className="flex items-start gap-4">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${ACTION_TINT[a.tone]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{t(a.title)}</p>
                    <p className="mt-1 text-xs text-foreground-muted">{t(a.description)}</p>
                  </div>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    {t('croissant.cards.actions.go')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Card variant="outlined" className="hidden" aria-hidden="true">
        <Users className="h-0 w-0" />
      </Card>
    </div>
  );
}
