import { Motion } from './Motion';
import type { MotionProps } from './Motion.types';

/*
 * Single-preset wrappers. Sugar over <Motion animation="…">. Use when you want
 * the call site to read like the effect (`<FadeIn>...</FadeIn>`).
 */

type Preset = Omit<MotionProps, 'animation'>;

export function FadeIn(props: Preset) {
  return <Motion animation="fade-in" {...props} />;
}
export function SlideInUp(props: Preset) {
  return <Motion animation="slide-in-up" {...props} />;
}
export function SlideInDown(props: Preset) {
  return <Motion animation="slide-in-down" {...props} />;
}
export function SlideInLeft(props: Preset) {
  return <Motion animation="slide-in-left" {...props} />;
}
export function SlideInRight(props: Preset) {
  return <Motion animation="slide-in-right" {...props} />;
}
export function ScaleIn(props: Preset) {
  return <Motion animation="scale-in" {...props} />;
}
export function BounceIn(props: Preset) {
  return <Motion animation="bounce-in" duration={450} {...props} />;
}
export function Pop(props: Preset) {
  return <Motion animation="pop" duration={320} {...props} />;
}
export function RotateIn(props: Preset) {
  return <Motion animation="rotate-in" {...props} />;
}
export function FlipIn(props: Preset) {
  return <Motion animation="flip-in" duration={450} {...props} />;
}
export function BlurIn(props: Preset) {
  return <Motion animation="blur-in" duration={240} {...props} />;
}
