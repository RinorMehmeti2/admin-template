import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CloudDrizzle,
  Heart,
  MessageSquare,
  RefreshCcw,
  Sparkles,
  Star,
  Sun,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  AnimatePresence,
  BlurIn,
  BounceIn,
  FadeIn,
  FlipIn,
  Float,
  Marquee,
  Motion,
  Pop,
  PulseRing,
  RotateIn,
  ScaleIn,
  Shimmer,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
  Stagger,
  TypingDots,
  Wiggle,
} from '@/components/motion';
import type { MotionPreset } from '@/components/motion';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Badge } from '@/components/primitives/Badge';
import { Separator } from '@/components/primitives/Separator';
import { Switch } from '@/components/forms/Switch';
import { Select } from '@/components/forms/Select';
import { Card, CardContent, CardTitle } from '@/components/data-display/Card';

/* --------------- Context: force-motion toggle propagates to demos --------------- */

const ForceMotionContext = createContext<boolean>(false);
const useForceMotion = (): boolean => useContext(ForceMotionContext);

/* --------------- Helpers --------------- */

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </header>
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">{children}</div>
    </section>
  );
}

function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">{label}</p>
      {children}
    </div>
  );
}

function PresetTile({
  label,
  hue = 'bg-primary/10',
  icon,
}: {
  label: string;
  hue?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className={`flex h-28 flex-col items-center justify-center gap-1.5 rounded-md ${hue} text-foreground sm:h-32`}
    >
      {icon !== undefined ? <span className="text-foreground-muted">{icon}</span> : null}
      <span className="text-base font-semibold sm:text-lg">{label}</span>
    </div>
  );
}

function ReducedMotionBanner() {
  const reduced = useReducedMotion();
  const force = useForceMotion();
  if (!reduced || force) return null;
  return (
    <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
      <div>
        <p className="font-medium">Reduced motion detected</p>
        <p className="mt-0.5 text-xs text-foreground-muted">
          Your OS / browser reports{' '}
          <code className="rounded bg-surface-muted px-1">prefers-reduced-motion: reduce</code>. The
          global stylesheet clamps animation-duration to 0.01ms by default (intentional
          accessibility behavior). Flip <strong>Force animations</strong> in the header to preview
          motion regardless. Windows: Settings → Accessibility → Visual effects → Animation effects.
        </p>
      </div>
    </div>
  );
}

/* --------------- Demos --------------- */

const PRESETS: Array<{ key: MotionPreset; label: string; tile: ReactNode }> = [
  { key: 'fade-in', label: 'fade-in', tile: <PresetTile label="Fade" /> },
  {
    key: 'slide-in-up',
    label: 'slide-in-up',
    tile: <PresetTile label="Slide ↑" hue="bg-info/10" />,
  },
  {
    key: 'slide-in-down',
    label: 'slide-in-down',
    tile: <PresetTile label="Slide ↓" hue="bg-info/10" />,
  },
  {
    key: 'slide-in-left',
    label: 'slide-in-left',
    tile: <PresetTile label="Slide ←" hue="bg-info/10" />,
  },
  {
    key: 'slide-in-right',
    label: 'slide-in-right',
    tile: <PresetTile label="Slide →" hue="bg-info/10" />,
  },
  {
    key: 'scale-in',
    label: 'scale-in',
    tile: <PresetTile label="Scale" hue="bg-success/10" />,
  },
  {
    key: 'bounce-in',
    label: 'bounce-in',
    tile: <PresetTile label="Bounce" hue="bg-warning/10" />,
  },
  { key: 'pop', label: 'pop', tile: <PresetTile label="Pop" hue="bg-warning/10" /> },
  {
    key: 'rotate-in',
    label: 'rotate-in',
    tile: <PresetTile label="Rotate" hue="bg-danger/10" />,
  },
  {
    key: 'flip-in',
    label: 'flip-in',
    tile: <PresetTile label="Flip" hue="bg-danger/10" />,
  },
  {
    key: 'blur-in',
    label: 'blur-in',
    tile: <PresetTile label="Blur" hue="bg-surface-muted" />,
  },
];

function PresetsGrid() {
  const force = useForceMotion();
  const [tick, setTick] = useState(0);
  const [duration, setDuration] = useState(400);

  function renderPreset(key: MotionPreset, tile: ReactNode): ReactNode {
    switch (key) {
      case 'slide-in-up':
        return (
          <SlideInUp force={force} duration={duration}>
            {tile}
          </SlideInUp>
        );
      case 'slide-in-down':
        return (
          <SlideInDown force={force} duration={duration}>
            {tile}
          </SlideInDown>
        );
      case 'slide-in-left':
        return (
          <SlideInLeft force={force} duration={duration}>
            {tile}
          </SlideInLeft>
        );
      case 'slide-in-right':
        return (
          <SlideInRight force={force} duration={duration}>
            {tile}
          </SlideInRight>
        );
      case 'scale-in':
        return (
          <ScaleIn force={force} duration={duration}>
            {tile}
          </ScaleIn>
        );
      case 'bounce-in':
        return (
          <BounceIn force={force} duration={duration}>
            {tile}
          </BounceIn>
        );
      case 'pop':
        return (
          <Pop force={force} duration={duration}>
            {tile}
          </Pop>
        );
      case 'rotate-in':
        return (
          <RotateIn force={force} duration={duration}>
            {tile}
          </RotateIn>
        );
      case 'flip-in':
        return (
          <FlipIn force={force} duration={duration}>
            {tile}
          </FlipIn>
        );
      case 'blur-in':
        return (
          <BlurIn force={force} duration={duration}>
            {tile}
          </BlurIn>
        );
      case 'fade-in':
      case 'fade-out':
      case 'scale-out':
      default:
        return (
          <FadeIn force={force} duration={duration}>
            {tile}
          </FadeIn>
        );
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-foreground-muted">11 entrance presets, one tile each.</p>
        <label className="ml-auto inline-flex items-center gap-2 text-xs">
          <span className="text-foreground-muted">Duration</span>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
          <span className="w-14 text-right tabular-nums">{duration}ms</span>
        </label>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCcw className="h-3.5 w-3.5" />}
          onClick={() => setTick((t) => t + 1)}
        >
          Replay
        </Button>
      </div>
      <div
        key={`${tick}-${duration}`}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {PRESETS.map((p) => (
          <div key={p.key} className="space-y-1">
            {renderPreset(p.key, p.tile)}
            <p className="text-center text-xs text-foreground-subtle">{p.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaggerDemo() {
  const force = useForceMotion();
  const [tick, setTick] = useState(0);
  const [preset, setPreset] = useState<MotionPreset>('slide-in-up');
  const [delay, setDelay] = useState(80);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-xs">
          <span className="text-foreground-muted">Preset</span>
          <Select
            selectSize="sm"
            value={preset}
            onChange={(e) => setPreset(e.target.value as MotionPreset)}
            className="w-40"
          >
            <option value="slide-in-up">slide-in-up</option>
            <option value="slide-in-down">slide-in-down</option>
            <option value="slide-in-left">slide-in-left</option>
            <option value="slide-in-right">slide-in-right</option>
            <option value="scale-in">scale-in</option>
            <option value="bounce-in">bounce-in</option>
            <option value="rotate-in">rotate-in</option>
            <option value="flip-in">flip-in</option>
            <option value="blur-in">blur-in</option>
          </Select>
        </label>
        <label className="inline-flex items-center gap-2 text-xs">
          <span className="text-foreground-muted">Stagger</span>
          <input
            type="range"
            min={20}
            max={250}
            step={10}
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
          />
          <span className="w-12 text-right tabular-nums">{delay}ms</span>
        </label>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCcw className="h-3.5 w-3.5" />}
          onClick={() => setTick((t) => t + 1)}
          className="ml-auto"
        >
          Replay
        </Button>
      </div>

      <Stagger
        key={`stagger-${tick}-${preset}-${delay}`}
        animation={preset}
        stagger={delay}
        duration={400}
        whenInView={false}
        force={force}
        className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-9"
      >
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className="flex h-16 items-center justify-center rounded-md border border-border bg-surface-muted text-sm font-medium"
          >
            {i + 1}
          </div>
        ))}
      </Stagger>
    </div>
  );
}

function AnimatePresenceDemo() {
  const force = useForceMotion();
  const [show, setShow] = useState(true);
  const [active, setActive] = useState<'A' | 'B' | 'C'>('A');

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Demo label="Toggle mount + unmount">
        <Button size="sm" onClick={() => setShow((v) => !v)} className="mb-3">
          {show ? 'Hide' : 'Show'} card
        </Button>
        <div className="min-h-[140px]">
          <AnimatePresence enter="scale-in" exit="fade-out" duration={250} force={force}>
            {show ? (
              <Card key="card" variant="outlined" className="max-w-sm p-4">
                <CardTitle>Animated card</CardTitle>
                <CardContent className="p-0 text-sm text-foreground-muted">
                  Mounts with scale-in, exits with fade-out.
                </CardContent>
              </Card>
            ) : null}
          </AnimatePresence>
        </div>
      </Demo>

      <Demo label="Swap by key">
        <div className="mb-3 flex gap-2">
          {(['A', 'B', 'C'] as const).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={active === k ? 'primary' : 'outline'}
              onClick={() => setActive(k)}
            >
              {k}
            </Button>
          ))}
        </div>
        <div className="min-h-[140px]">
          <AnimatePresence enter="slide-in-up" exit="slide-in-up" duration={280} force={force}>
            <Card key={active} variant="outlined" className="max-w-sm p-4">
              <CardTitle>Panel {active}</CardTitle>
              <CardContent className="p-0 text-sm text-foreground-muted">
                Changing the key swaps exit → enter.
              </CardContent>
            </Card>
          </AnimatePresence>
        </div>
      </Demo>
    </div>
  );
}

function AmbientDemo() {
  const force = useForceMotion();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card variant="outlined" className="flex items-center gap-3 p-4">
        <PulseRing color="success" force={force} />
        <div>
          <p className="text-sm font-medium">Live</p>
          <p className="text-xs text-foreground-muted">PulseRing · success</p>
        </div>
      </Card>
      <Card variant="outlined" className="flex items-center gap-3 p-4">
        <PulseRing color="danger" force={force} />
        <div>
          <p className="text-sm font-medium">Recording</p>
          <p className="text-xs text-foreground-muted">PulseRing · danger</p>
        </div>
      </Card>
      <Card variant="outlined" className="flex items-center gap-3 p-4">
        <MessageSquare className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
        <TypingDots force={force} />
        <p className="text-sm text-foreground-muted">User is typing…</p>
      </Card>
      <Card variant="outlined" className="flex items-center justify-center p-4">
        <Float force={force}>
          <Badge variant="info" className="px-3 py-1 text-sm">
            <CloudDrizzle className="mr-1 h-3.5 w-3.5" /> Float
          </Badge>
        </Float>
      </Card>
      <Card variant="outlined" className="flex items-center justify-center p-4">
        <Wiggle force={force}>
          <Badge variant="warning" className="px-3 py-1 text-sm">
            <Bell className="mr-1 h-3.5 w-3.5" /> Wiggle
          </Badge>
        </Wiggle>
      </Card>
      <Card variant="outlined" className="flex items-center gap-3 p-4">
        <IconButton aria-label="Like" variant="ghost" size="sm">
          <Heart className="h-4 w-4" />
        </IconButton>
        <Pop force={force}>
          <Star className="h-5 w-5 text-warning" />
        </Pop>
        <p className="text-sm text-foreground-muted">Pop pulse on mount</p>
      </Card>
      <Card variant="outlined" className="space-y-2 p-4 sm:col-span-2">
        <p className="text-xs uppercase tracking-wide text-foreground-subtle">
          Shimmer placeholder
        </p>
        <Shimmer className="h-4 w-3/4" force={force} />
        <Shimmer className="h-4 w-1/2" force={force} />
        <Shimmer className="h-4 w-2/3" force={force} />
      </Card>
      <Card variant="outlined" className="p-4">
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-warning" aria-hidden="true" />
          <Float force={force}>
            <span className="text-sm font-medium">Floating icon</span>
          </Float>
        </div>
      </Card>
      <Card variant="outlined" className="p-2 sm:col-span-3">
        <Marquee force={force}>
          {['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'].map((w) => (
            <Badge key={w} variant="info" className="px-3 py-1 text-sm">
              {w}
            </Badge>
          ))}
        </Marquee>
      </Card>
    </div>
  );
}

function InViewDemo() {
  const force = useForceMotion();
  return (
    <Demo label="Scroll the box — animation fires when element enters viewport">
      <div
        className="h-72 space-y-3 overflow-y-auto rounded-md border border-border p-4 [scrollbar-gutter:stable] [scrollbar-width:thin]"
        style={{ scrollbarColor: 'var(--color-border-strong) transparent' }}
      >
        <p className="text-sm text-foreground-muted">Scroll down ↓</p>
        <div className="h-40 rounded-md border border-dashed border-border" />
        <SlideInUp whenInView duration={500} force={force}>
          <Card variant="outlined" className="p-4">
            <CardTitle>Triggered on entry</CardTitle>
            <CardContent className="p-0 text-sm text-foreground-muted">
              Only animates once when the element enters the viewport.
            </CardContent>
          </Card>
        </SlideInUp>
        <div className="h-32" />
        <Motion animation="bounce-in" whenInView duration={500} force={force}>
          <Card variant="outlined" className="p-4">
            <CardTitle>Second trigger</CardTitle>
            <CardContent className="p-0 text-sm text-foreground-muted">
              Bounce-in via the generic Motion wrapper.
            </CardContent>
          </Card>
        </Motion>
        <div className="h-32" />
        <Motion animation="blur-in" whenInView duration={800} force={force}>
          <Card variant="outlined" className="p-4">
            <CardTitle>Third trigger</CardTitle>
            <CardContent className="p-0 text-sm text-foreground-muted">
              Blur-in with longer duration (800ms).
            </CardContent>
          </Card>
        </Motion>
        <div className="h-24" />
      </div>
    </Demo>
  );
}

function CustomTimingDemo() {
  const force = useForceMotion();
  const [duration, setDuration] = useState(400);
  const [delay, setDelay] = useState(0);
  const [easing, setEasing] = useState<string>('cubic-bezier(0.34, 1.56, 0.64, 1)');
  const [preset, setPreset] = useState<MotionPreset>('slide-in-up');
  const [tick, setTick] = useState(0);

  return (
    <Demo label="Tweak duration / delay / easing — click Play">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1.5 text-xs">
          <span className="block text-foreground-muted">Preset</span>
          <Select
            selectSize="sm"
            value={preset}
            onChange={(e) => setPreset(e.target.value as MotionPreset)}
          >
            <option value="fade-in">fade-in</option>
            <option value="slide-in-up">slide-in-up</option>
            <option value="slide-in-down">slide-in-down</option>
            <option value="slide-in-left">slide-in-left</option>
            <option value="slide-in-right">slide-in-right</option>
            <option value="scale-in">scale-in</option>
            <option value="bounce-in">bounce-in</option>
            <option value="rotate-in">rotate-in</option>
            <option value="flip-in">flip-in</option>
            <option value="blur-in">blur-in</option>
          </Select>
        </label>
        <label className="space-y-1.5 text-xs">
          <span className="block text-foreground-muted">Duration ({duration}ms)</span>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="space-y-1.5 text-xs">
          <span className="block text-foreground-muted">Delay ({delay}ms)</span>
          <input
            type="range"
            min={0}
            max={1000}
            step={50}
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="space-y-1.5 text-xs">
          <span className="block text-foreground-muted">Easing</span>
          <Select
            selectSize="sm"
            value={easing}
            onChange={(e) => setEasing(e.target.value)}
          >
            <option value="ease-out">ease-out</option>
            <option value="ease-in">ease-in</option>
            <option value="ease-in-out">ease-in-out</option>
            <option value="cubic-bezier(0.22, 1, 0.36, 1)">smooth (out-quint)</option>
            <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">spring</option>
            <option value="linear">linear</option>
          </Select>
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          size="sm"
          variant="primary"
          leftIcon={<RefreshCcw className="h-3.5 w-3.5" />}
          onClick={() => setTick((t) => t + 1)}
        >
          Play
        </Button>
        <code className="text-xs text-foreground-muted">
          {`<Motion animation="${preset}" duration={${duration}} delay={${delay}} easing="${easing}" />`}
        </code>
      </div>

      <div key={tick} className="mt-3">
        <Motion animation={preset} duration={duration} delay={delay} easing={easing} force={force}>
          <div className="flex h-32 items-center justify-center rounded-md bg-primary/10 text-2xl font-semibold">
            ✨ Preview
          </div>
        </Motion>
      </div>
    </Demo>
  );
}

function ChainedDemo() {
  const force = useForceMotion();
  const [tick, setTick] = useState(0);

  return (
    <Demo label="Chained — staged delays compose into a sequence">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-foreground-muted">
          Title fades in → subtitle slides up → CTA scales in → details fade in.
        </p>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCcw className="h-3.5 w-3.5" />}
          onClick={() => setTick((t) => t + 1)}
        >
          Replay
        </Button>
      </div>
      <div key={tick} className="space-y-3 rounded-lg border border-border bg-surface-muted/40 p-6">
        <Motion animation="fade-in" duration={400} delay={0} force={force}>
          <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
        </Motion>
        <Motion animation="slide-in-up" duration={500} delay={150} force={force}>
          <h3 className="text-xl font-semibold">Welcome to your workspace</h3>
        </Motion>
        <Motion animation="slide-in-up" duration={500} delay={350} force={force}>
          <p className="text-sm text-foreground-muted">Everything you need, sequenced in motion.</p>
        </Motion>
        <Motion animation="scale-in" duration={400} delay={650} force={force}>
          <Button>Get started</Button>
        </Motion>
        <Motion animation="fade-in" duration={500} delay={900} force={force}>
          <p className="text-xs text-foreground-subtle">No card required. Cancel anytime.</p>
        </Motion>
      </div>
    </Demo>
  );
}

/* --------------- Page --------------- */

const TOC = [
  { id: 'presets', label: 'Entrance presets' },
  { id: 'stagger', label: 'Stagger' },
  { id: 'animate-presence', label: 'AnimatePresence' },
  { id: 'in-view', label: 'In-view scroll' },
  { id: 'ambient', label: 'Ambient loops' },
  { id: 'custom', label: 'Custom timing' },
  { id: 'chained', label: 'Chained sequence' },
] as const;

export function MotionPage() {
  const { t } = useTranslation();
  const [force, setForce] = useState(false);

  return (
    <ForceMotionContext.Provider value={force}>
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{t('demos.motion.title')}</h1>
              <p className="mt-1 text-foreground-muted">{t('demos.motion.subtitle')}</p>
            </div>
            <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm">
              <Switch
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                aria-label="Force animations"
              />
              <span className="font-medium">Force animations</span>
              <span className="text-xs text-foreground-muted">
                bypass <code className="rounded bg-surface-muted px-1">prefers-reduced-motion</code>
              </span>
            </label>
          </div>
          <ReducedMotionBanner />
        </header>

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
          id="presets"
          title="Entrance presets"
          description="11 named animations covering fade, slide (4 directions), scale, bounce, pop, rotate, flip, and blur."
        >
          <PresetsGrid />
        </Section>

        <Section
          id="stagger"
          title="Stagger"
          description="Apply an incremental delay across children. Drives the timing while each child runs its own preset."
        >
          <StaggerDemo />
        </Section>

        <Section
          id="animate-presence"
          title="AnimatePresence"
          description="Runs an exit animation before unmount and an enter animation on mount. Swapping by key sequences exit → enter."
        >
          <AnimatePresenceDemo />
        </Section>

        <Section
          id="in-view"
          title="In-view scroll trigger"
          description="Defer animation until the element enters the viewport. Uses IntersectionObserver — animates once by default."
        >
          <InViewDemo />
        </Section>

        <Section
          id="ambient"
          title="Ambient loops"
          description="Continuous decorative effects — PulseRing (live status), TypingDots, Float, Wiggle, Shimmer (richer skeleton), Marquee, Pop."
        >
          <AmbientDemo />
        </Section>

        <Section
          id="custom"
          title="Custom timing"
          description="Generic Motion wrapper accepts any preset, duration, delay, and easing. Use this when a named wrapper doesn't fit."
        >
          <CustomTimingDemo />
        </Section>

        <Section
          id="chained"
          title="Chained sequence"
          description="Compose individual Motion elements with staggered delays to build a choreographed reveal."
        >
          <ChainedDemo />
        </Section>

        <Separator />

        <footer className="rounded-lg border border-border bg-surface p-4 text-sm text-foreground-muted">
          <p>
            All motion respects{' '}
            <code className="rounded bg-surface-muted px-1">prefers-reduced-motion</code> by
            default. Use <code className="rounded bg-surface-muted px-1">force</code> only for
            showcase / demo surfaces where the animation is the content.
          </p>
        </footer>
      </div>
    </ForceMotionContext.Provider>
  );
}
