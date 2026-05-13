import { useState } from 'react';
import { Motion } from './Motion';
import { Stagger } from './Stagger';
import { AnimatePresence } from './AnimatePresence';
import {
  FadeIn,
  SlideInUp,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  ScaleIn,
  BounceIn,
  Pop,
  RotateIn,
  FlipIn,
  BlurIn,
} from './presets';
import { Float, Wiggle, PulseRing, Shimmer, TypingDots, Marquee } from './ambient';
import { Card, CardContent, CardTitle } from '@/components/data-display/Card';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';

export default { title: 'Motion/Motion', component: Motion };

const Tile = ({ label }: { label: string }) => (
  <div className="flex h-24 items-center justify-center rounded-md border border-border bg-surface-muted text-sm font-medium">
    {label}
  </div>
);

export const Presets = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <FadeIn>
        <Tile label="fade-in" />
      </FadeIn>
      <SlideInUp>
        <Tile label="slide-in-up" />
      </SlideInUp>
      <SlideInDown>
        <Tile label="slide-in-down" />
      </SlideInDown>
      <SlideInLeft>
        <Tile label="slide-in-left" />
      </SlideInLeft>
      <SlideInRight>
        <Tile label="slide-in-right" />
      </SlideInRight>
      <ScaleIn>
        <Tile label="scale-in" />
      </ScaleIn>
      <BounceIn>
        <Tile label="bounce-in" />
      </BounceIn>
      <Pop>
        <Tile label="pop" />
      </Pop>
      <RotateIn>
        <Tile label="rotate-in" />
      </RotateIn>
      <FlipIn>
        <Tile label="flip-in" />
      </FlipIn>
      <BlurIn>
        <Tile label="blur-in" />
      </BlurIn>
    </div>
  ),
};

export const StaggerGrid = {
  render: () => (
    <Stagger
      animation="slide-in-up"
      stagger={80}
      duration={350}
      whenInView={false}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <Tile key={i} label={`Item ${i + 1}`} />
      ))}
    </Stagger>
  ),
};

function AnimatePresenceToggleStory() {
  const [open, setOpen] = useState(true);
  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen((v) => !v)}>Toggle</Button>
      <AnimatePresence enter="scale-in" exit="fade-out" duration={220}>
        {open ? (
          <Card key="card" variant="outlined" className="max-w-sm p-4">
            <CardTitle>Hello</CardTitle>
            <CardContent className="p-0 text-sm text-foreground-muted">
              Animated mount + unmount via AnimatePresence.
            </CardContent>
          </Card>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export const AnimatePresenceToggle = { render: () => <AnimatePresenceToggleStory /> };

export const InViewScroll = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-foreground-muted">Scroll down to trigger.</p>
      <div className="h-[60vh] rounded-md border border-border" />
      <SlideInUp whenInView duration={500}>
        <Card variant="outlined" className="p-6">
          <CardTitle>In-view animation</CardTitle>
          <CardContent className="p-0 text-sm text-foreground-muted">
            Only animates once, when scrolled into viewport.
          </CardContent>
        </Card>
      </SlideInUp>
    </div>
  ),
};

export const Ambient = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card variant="outlined" className="flex items-center gap-3 p-4">
        <PulseRing color="success" />
        <div>
          <p className="text-sm font-medium">Live</p>
          <p className="text-xs text-foreground-muted">Pulse ring indicator</p>
        </div>
      </Card>
      <Card variant="outlined" className="flex items-center gap-3 p-4">
        <TypingDots />
        <p className="text-sm text-foreground-muted">User is typing…</p>
      </Card>
      <Card variant="outlined" className="p-4">
        <Float>
          <Badge variant="info">Float</Badge>
        </Float>
      </Card>
      <Card variant="outlined" className="p-4">
        <Wiggle>
          <Badge variant="warning">Wiggle</Badge>
        </Wiggle>
      </Card>
      <div className="sm:col-span-2 space-y-2">
        <p className="text-sm text-foreground-muted">Shimmer placeholder</p>
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-4 w-1/2" />
      </div>
      <Card variant="outlined" className="sm:col-span-2 p-2">
        <Marquee>
          {['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'].map((w) => (
            <Badge key={w} variant="info">
              {w}
            </Badge>
          ))}
        </Marquee>
      </Card>
    </div>
  ),
};

export const CustomTiming = {
  render: () => (
    <div className="space-y-3">
      <Motion animation="slide-in-up" duration={1000} easing="cubic-bezier(0.34, 1.56, 0.64, 1)">
        <Tile label="1s spring" />
      </Motion>
      <Motion animation="rotate-in" duration={600} delay={200}>
        <Tile label="200ms delay" />
      </Motion>
    </div>
  ),
};
