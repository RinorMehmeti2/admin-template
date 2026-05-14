import { useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  Bell,
  DollarSign,
  Heart,
  Package,
  ShoppingCart,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Carousel } from '@/components/data-display/Carousel';
import { StatCard } from '@/components/data-display/StatCard';
import { Card, CardContent, CardTitle } from '@/components/data-display/Card';
import { ExampleBlock } from '@/components/data-display/ExampleBlock';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/navigation/Accordion';
import { StickyCard, StickyStack } from '@/components/layout/StickyCard';
import { Button } from '@/components/primitives/Button';
import { Separator } from '@/components/primitives/Separator';

/* --------------- Helpers --------------- */

function Section({
  id,
  title,
  description,
  code,
  children,
}: {
  id: string;
  title: string;
  description: string;
  code?: string;
  children: ReactNode;
}) {
  return (
    <ExampleBlock
      id={id}
      title={title}
      description={description}
      code={code}
      className="scroll-mt-20"
    >
      {children}
    </ExampleBlock>
  );
}

const CAROUSEL_CODE = `<Carousel
  aria-label="Numbered slides"
  slides={[1, 2, 3, 4].map((i) => ({ id: \`s\${i}\`, content: tile(String(i)) }))}
/>

<Carousel
  aria-label="Feature tiles"
  slidesPerView={{ base: 1, sm: 2, lg: 3 }}
  slides={features.map((f, i) => ({
    id: \`f\${i}\`,
    content: (
      <Card variant="outlined" className="flex h-32 flex-col justify-between p-4">
        {f.icon}
        <p className="text-sm font-medium">{f.label}</p>
      </Card>
    ),
  }))}
/>

<Carousel aria-label="Autoplaying slides" autoplayMs={2500} slides={...} />
<Carousel aria-label="Outside arrows" arrowPosition="outside" loop={false} slides={...} />`;

const ACCORDION_CODE = `<Accordion defaultValue="q-0">
  {faq.map((f, i) => (
    <AccordionItem key={f.q} value={\`q-\${i}\`}>
      <AccordionTrigger>{f.q}</AccordionTrigger>
      <AccordionContent>{f.a}</AccordionContent>
    </AccordionItem>
  ))}
</Accordion>

<Accordion type="multiple" variant="separated" defaultValue={['q-0', 'q-2']}>...</Accordion>

<Accordion variant="bordered">
  <AccordionItem value="a">
    <AccordionTrigger>Open me</AccordionTrigger>
    <AccordionContent>Use ArrowUp / ArrowDown / Home / End.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="b" disabled>
    <AccordionTrigger>Locked (disabled)</AccordionTrigger>
    <AccordionContent>Not reachable.</AccordionContent>
  </AccordionItem>
</Accordion>`;

const STAT_CARD_CODE = `<StatCard
  label="Total revenue"
  value={48210 + pulse * 137}
  unit="USD"
  delta={12.4}
  deltaLabel="vs previous 30 days"
  icon={<DollarSign className="h-4 w-4" />}
  sparklineData={spark}
/>
<StatCard variant="default" label="Default" value={1234} delta={2.1} />
<StatCard variant="outlined" label="Outlined" value={1234} delta={2.1} />
<StatCard variant="elevated" label="Elevated" value={1234} delta={2.1} />
<StatCard variant="accent" label="Accent" value={1234} delta={2.1} icon={<Sparkles />} />
<StatCard label="Revenue" value={0} loading icon={<DollarSign />} />`;

const STICKY_CODE = `// Sticky against the page scroll - no inner scrollbar.
<StickyCard offset={56} compactWhenStuck>
  <h3 className="text-base font-semibold">Sticky header</h3>
  <p className="text-xs text-foreground-muted">Pins below the topbar + compacts padding when stuck.</p>
</StickyCard>

<StickyCard side="bottom" offset={0} variant="elevated">
  <div className="flex items-center justify-between gap-3">
    <p className="text-sm font-medium">3 selected</p>
    <Button size="sm">Apply</Button>
  </div>
</StickyCard>

<StickyStack offset={56} gap={14} flowGap={28}>
  <Card variant="outlined" className="p-4">Card 1</Card>
  <Card variant="outlined" className="p-4">Card 2 (slides over card 1)</Card>
  <Card variant="outlined" className="p-4">Card 3 (tops the stack)</Card>
</StickyStack>`;

function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">{label}</p>
      {children}
    </div>
  );
}

const tile = (label: string, hue = 'bg-primary/10') => (
  <div
    className={`flex h-32 items-center justify-center rounded-md ${hue} text-foreground sm:h-40`}
  >
    <span className="text-2xl font-semibold sm:text-3xl">{label}</span>
  </div>
);

const spark = [12, 18, 14, 22, 19, 28, 24, 32, 30, 38];
const sparkDown = [40, 36, 38, 30, 28, 22, 24, 18, 16, 12];

/* --------------- Sub-sections --------------- */

function CarouselDemos() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Demo label="Single slide · loop · dots + arrows">
        <Carousel
          aria-label="Numbered slides"
          slides={[1, 2, 3, 4].map((i) => ({
            id: `s${i}`,
            content: tile(String(i)),
          }))}
        />
      </Demo>

      <Demo label="Responsive multi-per-view (1 / 2 / 3)">
        <Carousel
          aria-label="Feature tiles"
          slidesPerView={{ base: 1, sm: 2, lg: 3 }}
          slides={[
            { icon: <Sparkles className="h-5 w-5 text-primary" />, label: 'Polish' },
            { icon: <Zap className="h-5 w-5 text-warning" />, label: 'Speed' },
            { icon: <Heart className="h-5 w-5 text-danger" />, label: 'Care' },
            { icon: <Star className="h-5 w-5 text-success" />, label: 'Quality' },
            { icon: <Bell className="h-5 w-5 text-info" />, label: 'Live' },
            { icon: <Package className="h-5 w-5 text-foreground" />, label: 'Bundled' },
          ].map((f, i) => ({
            id: `f${i}`,
            content: (
              <Card variant="outlined" className="flex h-32 flex-col justify-between p-4">
                {f.icon}
                <p className="text-sm font-medium">{f.label}</p>
              </Card>
            ),
          }))}
        />
      </Demo>

      <Demo label="Autoplay (2.5s) · pauses on hover/focus">
        <Carousel
          aria-label="Autoplaying slides"
          autoplayMs={2500}
          slides={['Aurora', 'Borealis', 'Crepuscule', 'Dusk'].map((w, i) => ({
            id: w,
            content: tile(w, ['bg-info/10', 'bg-warning/10', 'bg-success/10', 'bg-danger/10'][i]),
          }))}
        />
      </Demo>

      <Demo label="Arrows outside · no loop">
        <Carousel
          aria-label="Outside arrows"
          arrowPosition="outside"
          loop={false}
          slides={['One', 'Two', 'Three'].map((w) => ({
            id: w,
            content: tile(w, 'bg-surface-muted'),
          }))}
        />
      </Demo>
    </div>
  );
}

function AccordionDemos() {
  const faq = [
    {
      q: 'How do I reset my password?',
      a: 'Open settings → security → reset. You will receive an email link valid for 24 hours.',
    },
    {
      q: 'Where are billing receipts?',
      a: 'Billing → invoices. Each row has a download PDF action.',
    },
    {
      q: 'How do I invite teammates?',
      a: 'Admin → members → invite. Paste up to 50 emails at once.',
    },
    {
      q: 'Is data encrypted at rest?',
      a: 'Yes. AES-256 with envelope-encrypted KMS keys rotated quarterly.',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Demo label="Single · default variant">
        <Accordion defaultValue="q-0">
          {faq.map((f, i) => (
            <AccordionItem key={f.q} value={`q-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Demo>

      <Demo label="Multiple · separated variant">
        <Accordion type="multiple" variant="separated" defaultValue={['q-0', 'q-2']}>
          {faq.map((f, i) => (
            <AccordionItem key={f.q} value={`q-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Demo>

      <Demo label="Bordered · with disabled item">
        <Accordion variant="bordered">
          <AccordionItem value="a">
            <AccordionTrigger>Open me</AccordionTrigger>
            <AccordionContent>
              Use ArrowUp / ArrowDown / Home / End to navigate between triggers.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b" disabled>
            <AccordionTrigger>Locked (disabled)</AccordionTrigger>
            <AccordionContent>Not reachable.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="c">
            <AccordionTrigger>Open me too</AccordionTrigger>
            <AccordionContent>Single mode collapses the other when one opens.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Demo>
    </div>
  );
}

function StatCardDemos() {
  const [pulse, setPulse] = useState(0);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={48210 + pulse * 137}
          unit="USD"
          delta={12.4}
          deltaLabel="vs previous 30 days"
          icon={<DollarSign className="h-4 w-4" />}
          sparklineData={spark}
        />
        <StatCard
          label="Active users"
          value={2140 - pulse * 11}
          delta={-3.1}
          deltaLabel="last 7 days"
          icon={<Users className="h-4 w-4" />}
          sparklineData={sparkDown}
        />
        <StatCard
          label="Orders today"
          value={148 + pulse * 3}
          delta={5.2}
          deltaLabel="vs yesterday"
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          label="Throughput"
          value={9420 + pulse * 41}
          unit="rps"
          delta={1.8}
          icon={<Activity className="h-4 w-4" />}
          sparklineData={spark}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground-muted">
          Click "Refresh" — values tween via requestAnimationFrame.
        </p>
        <Button size="sm" variant="outline" onClick={() => setPulse((p) => p + 1)}>
          Refresh
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard variant="default" label="Default" value={1234} delta={2.1} />
        <StatCard variant="outlined" label="Outlined" value={1234} delta={2.1} />
        <StatCard variant="elevated" label="Elevated" value={1234} delta={2.1} />
        <StatCard
          variant="accent"
          label="Accent"
          value={1234}
          delta={2.1}
          icon={<Sparkles className="h-4 w-4" />}
        />
      </div>

      <Separator />

      <Demo label="Loading skeletons">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Revenue" value={0} loading icon={<DollarSign className="h-4 w-4" />} />
          <StatCard label="Users" value={0} loading icon={<Users className="h-4 w-4" />} />
          <StatCard label="Orders" value={0} loading />
        </div>
      </Demo>
    </div>
  );
}

function StickyCardDemos() {
  const [mode, setMode] = useState<'header' | 'footer' | 'stack'>('header');
  const filler = (n: number, prefix: string) =>
    Array.from({ length: n }, (_, i) => (
      <p key={i} className="text-sm text-foreground-muted">
        {prefix} {i + 1}. Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
    ));

  // Header offset clears the AppLayout topbar (h-14 = 56px). Sticky pins
  // against the route's <main> scroll — no inner scroll container needed,
  // so no second scrollbar.
  const TOPBAR_OFFSET = 56;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={mode === 'header' ? 'primary' : 'outline'}
          onClick={() => setMode('header')}
        >
          Sticky header
        </Button>
        <Button
          size="sm"
          variant={mode === 'footer' ? 'primary' : 'outline'}
          onClick={() => setMode('footer')}
        >
          Sticky footer
        </Button>
        <Button
          size="sm"
          variant={mode === 'stack' ? 'primary' : 'outline'}
          onClick={() => setMode('stack')}
        >
          Stack pile
        </Button>
        <p className="ml-auto text-xs text-foreground-subtle">
          Sticky against the page scroll — no inner scrollbar.
        </p>
      </div>

      <div className="space-y-3">
        {mode === 'header' ? (
          <>
            <StickyCard offset={TOPBAR_OFFSET} compactWhenStuck>
              <h3 className="text-base font-semibold">Sticky header</h3>
              <p className="text-xs text-foreground-muted">
                Pins below the topbar + compacts padding when stuck.
              </p>
            </StickyCard>
            <div className="space-y-3">{filler(14, 'Paragraph')}</div>
          </>
        ) : null}

        {mode === 'footer' ? (
          <div className="space-y-3">
            <div className="space-y-3">{filler(14, 'Item')}</div>
            <StickyCard side="bottom" offset={0} variant="elevated">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">3 selected</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button size="sm">Apply</Button>
                </div>
              </div>
            </StickyCard>
          </div>
        ) : null}

        {mode === 'stack' ? (
          <>
            <StickyStack offset={TOPBAR_OFFSET} gap={14} flowGap={28}>
              <Card variant="outlined" className="p-4">
                <CardTitle>Card 1 · First</CardTitle>
                <CardContent className="p-0 text-sm text-foreground-muted">
                  The first card in the stack pins as you scroll.
                </CardContent>
              </Card>
              <Card variant="outlined" className="p-4">
                <CardTitle>Card 2 · Overlaps card 1</CardTitle>
                <CardContent className="p-0 text-sm text-foreground-muted">
                  When this hits the top, it slides over the previous one.
                </CardContent>
              </Card>
              <Card variant="outlined" className="p-4">
                <CardTitle>Card 3 · Tops the stack</CardTitle>
                <CardContent className="p-0 text-sm text-foreground-muted">
                  Final card sits above both prior layers.
                </CardContent>
              </Card>
            </StickyStack>
            <div className="space-y-3 pt-8">{filler(10, 'Filler')}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* --------------- Page --------------- */

const TOC = [
  { id: 'carousel', label: 'Carousel' },
  { id: 'accordion', label: 'Accordion' },
  { id: 'stat-card', label: 'StatCard' },
  { id: 'sticky-card', label: 'StickyCard' },
] as const;

export function NewComponentsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-[1400px]">
      <SimsPageHeader
        title={t('demos.newComponents.title')}
        description={t('demos.newComponents.subtitle')}
      />
      <div className="space-y-6">
        <nav
          aria-label="On-page table of contents"
          className="rounded-lg border border-border bg-surface p-3"
        >
          <ul className="flex flex-wrap gap-2">
            {TOC.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-muted/40 px-3 py-1 text-sm text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.label}
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Section
          id="carousel"
          title="Carousel"
          description="Slides with keyboard / swipe / autoplay, responsive slidesPerView, dots + arrows, ARIA carousel pattern."
          code={CAROUSEL_CODE}
        >
          <CarouselDemos />
        </Section>

        <Section
          id="accordion"
          title="Accordion"
          description="Single or multiple expand, three variants (default / bordered / separated), full keyboard nav, disabled items skipped on arrow."
          code={ACCORDION_CODE}
        >
          <AccordionDemos />
        </Section>

        <Section
          id="stat-card"
          title="StatCard"
          description="Dynamic statistic card — rAF counter, trend pill, optional sparkline (built-in or custom), 4 variants, loading skeleton, optional click action."
          code={STAT_CARD_CODE}
        >
          <StatCardDemos />
        </Section>

        <Section
          id="sticky-card"
          title="StickyCard / StickyStack"
          description="position: sticky with offset + side, IntersectionObserver detects stuck state, compact + shadow when pinned. Stack mode for chained pinning."
          code={STICKY_CODE}
        >
          <StickyCardDemos />
        </Section>
      </div>
    </div>
  );
}
