import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote } from 'lucide-react';
import { Avatar } from '@/components/primitives/Avatar';
import { Card, CardContent } from '@/components/data-display/Card';
import { Carousel, type CarouselSlide } from '@/components/data-display/Carousel';
import { Rating } from '@/components/forms/Rating';
import { Marquee } from '@/components/motion';

interface Testimonial {
  id: string;
  text: string;
  name: string;
  role: string;
  rating: number;
}

const TESTIMONIALS: ReadonlyArray<Testimonial> = [
  {
    id: 't1',
    text: 'The almond croissants are unreasonably good. I bring some home every weekend.',
    name: 'Hedy Lamarr',
    role: 'Regular',
    rating: 5,
  },
  {
    id: 't2',
    text: 'The crew always remembers my order. Feels like the bakery next door, but better.',
    name: 'Linus Torvalds',
    role: 'Local',
    rating: 5,
  },
  {
    id: 't3',
    text: 'I ordered a custom cake at 9 PM and they pulled it off the next morning.',
    name: 'Grace Hopper',
    role: 'Customer',
    rating: 4,
  },
];

const LOGOS = ['Sourdough Co.', 'Croissant Daily', 'Flour & Time', 'Le Bistro', 'The Bake Press', 'Knead Magazine'];

export function TestimonialCarousel() {
  const { t } = useTranslation();

  const slides: CarouselSlide[] = useMemo(
    () =>
      TESTIMONIALS.map((tt) => ({
        id: tt.id,
        label: `${tt.name} — ${tt.role}`,
        content: (
          <Card variant="outlined" className="h-full">
            <CardContent className="flex h-full flex-col gap-4">
              <Quote aria-hidden="true" className="h-6 w-6 text-primary/60" />
              <p className="text-base leading-relaxed text-foreground">“{tt.text}”</p>
              <div className="mt-auto flex items-center gap-3">
                <Avatar size="sm" name={tt.name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{tt.name}</p>
                  <p className="truncate text-xs text-foreground-muted">{tt.role}</p>
                </div>
                <div className="ml-auto">
                  <Rating value={tt.rating} readOnly max={5} aria-label={`${tt.rating} out of 5`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ),
      })),
    [],
  );

  return (
    <div className="space-y-4">
      <Carousel slides={slides} autoplayMs={6000} aria-label={t('croissant.cards.testimonials.carouselLabel')} />
      <div data-print="hide">
        <Marquee speed={0.6} pauseOnHover className="rounded-md border border-border bg-surface-muted/30 py-3">
          {LOGOS.map((l) => (
            <span key={l} className="font-serif text-sm tracking-wide text-foreground-subtle">
              {l}
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
