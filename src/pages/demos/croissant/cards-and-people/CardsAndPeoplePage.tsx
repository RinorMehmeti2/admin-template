import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  Heart,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import type { Sparkles } from 'lucide-react';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Card, CardContent } from '@/components/data-display/Card';
import { Stagger } from '@/components/motion';
import {
  Chip,
  ComponentsUsedFooter,
  HeroCard,
  SceneHeader,
  StagedSection,
} from '../_shared';
import { CrewCard, type CrewMember } from './components/CrewCard';
import { AvatarLab } from './components/AvatarLab';
import { TestimonialCarousel } from './components/TestimonialCarousel';

const CREW: ReadonlyArray<CrewMember> = [
  { name: 'Ada Lovelace', role: 'Head baker', status: 'on-shift', specialties: ['Croissants', 'Brioche'] },
  { name: 'Grace Hopper', role: 'Pastry chef', status: 'on-shift', specialties: ['Tarts', 'Cakes', 'Custards'] },
  { name: 'Margaret Hamilton', role: 'Front of house', status: 'on-break', specialties: ['Coffee', 'Service'] },
  { name: 'Linus Torvalds', role: 'Bread lead', status: 'off', specialties: ['Sourdough', 'Baguette'] },
  { name: 'Alan Turing', role: 'Delivery', status: 'on-shift', specialties: ['Routes', 'Cargo bike'] },
  { name: 'Edsger Dijkstra', role: 'Intern', status: 'on-break', specialties: ['Doughs', 'Cleaning'] },
];

const BADGE_TONES = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const;

const COMPONENTS = [
  'SceneHeader',
  'HeroCard',
  'StagedSection',
  'Chip',
  'Card',
  'CardContent',
  'Avatar',
  'AvatarGroup',
  'Badge',
  'Button',
  'IconButton',
  'Carousel',
  'Rating',
  'Marquee',
  'Pop',
  'Stagger',
];

type ActionTone = 'primary' | 'success' | 'warning' | 'info';

const ACTION_TINT: Record<ActionTone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

interface Action {
  icon: typeof Sparkles;
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

  const meta = (
    <>
      <Chip tone="primary" dot>
        {t('croissant.cards.meta.bakers', { n: 7 })}
      </Chip>
      <Chip tone="success">{t('croissant.cards.meta.onShift', { n: 2 })}</Chip>
    </>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      <SceneHeader
        tone="primary"
        pattern="grid"
        eyebrow={t('croissant.cards.scene.eyebrow')}
        title={t('croissant.cards.scene.title')}
        description={t('croissant.cards.scene.description')}
        meta={meta}
      />

      <section aria-labelledby="featured-baker" className="space-y-6">
        <HeroCard
          tone="primary"
          eyebrow={t('croissant.cards.featured.eyebrow')}
          title={
            <span id="featured-baker" className="inline-flex items-center gap-2">
              {t('croissant.cards.featured.title', { name: 'Ada Lovelace' })}
            </span>
          }
          description={t('croissant.cards.featured.description')}
          action={
            <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
              {t('croissant.cards.featured.viewProfile')}
            </Button>
          }
          illustration={
            <div className="flex items-center gap-5">
              <Avatar size="xl" name="Ada Lovelace" status="online" className="overflow-visible" />
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                {[
                  { label: t('croissant.cards.featured.stat.shifts'), value: '124' },
                  { label: t('croissant.cards.featured.stat.signature'), value: 'Almond' },
                  { label: t('croissant.cards.featured.stat.years'), value: '6' },
                ].map((s) => (
                  <div key={s.label} className="space-y-0.5">
                    <p className="text-base font-semibold text-foreground tabular-nums">{s.value}</p>
                    <p className="text-foreground-subtle">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </section>

      <StagedSection
        tone="primary"
        eyebrow={t('croissant.cards.section.crewEyebrow')}
        title={t('croissant.cards.section.crew')}
        description={t('croissant.cards.section.crewDesc')}
        headingId="crew-roster"
        staggerDelay={60}
        bodyClassName="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {CREW.map((m) => (
          <CrewCard key={m.name} member={m} />
        ))}
      </StagedSection>

      <StagedSection
        tone="primary"
        eyebrow={t('croissant.cards.section.avatarsEyebrow')}
        title={t('croissant.cards.section.avatars')}
        description={t('croissant.cards.section.avatarsDesc')}
        headingId="avatars-lab"
      >
        <AvatarLab />
      </StagedSection>

      <StagedSection
        tone="primary"
        eyebrow={t('croissant.cards.section.testimonialsEyebrow')}
        title={t('croissant.cards.section.testimonials')}
        description={t('croissant.cards.section.testimonialsDesc')}
        headingId="testimonials"
      >
        <TestimonialCarousel />
      </StagedSection>

      <StagedSection
        tone="primary"
        eyebrow={t('croissant.cards.section.badgesEyebrow')}
        title={t('croissant.cards.section.badges')}
        description={t('croissant.cards.section.badgesDesc')}
        headingId="badge-spectrum"
      >
        <Card variant="outlined">
          <CardContent>
            <Stagger animation="fade-in" stagger={40} className="space-y-3">
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
            </Stagger>
          </CardContent>
        </Card>
      </StagedSection>

      <StagedSection
        tone="primary"
        eyebrow={t('croissant.cards.section.actionsEyebrow')}
        title={t('croissant.cards.section.actions')}
        description={t('croissant.cards.section.actionsDesc')}
        headingId="action-stack"
        bodyClassName="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Card key={a.title} variant="outlined" className="group transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-4">
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${ACTION_TINT[a.tone]}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{t(a.title)}</p>
                  <p className="mt-1 text-xs text-foreground-muted">{t(a.description)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  }
                >
                  {t('croissant.cards.actions.go')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </StagedSection>

      <Card variant="outlined" className="hidden" aria-hidden="true">
        <Users className="h-0 w-0" />
      </Card>

      <ComponentsUsedFooter components={COMPONENTS} />
    </div>
  );
}
