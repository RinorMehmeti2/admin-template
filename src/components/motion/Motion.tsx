import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { cn } from '@/lib/cn';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { MotionPreset, MotionProps } from './Motion.types';

const PRESET_KEYFRAME: Record<MotionPreset, string> = {
  'fade-in': 'fade-in',
  'fade-out': 'fade-out',
  'slide-in-up': 'slide-in-up',
  'slide-in-down': 'slide-in-down',
  'slide-in-left': 'slide-in-left',
  'slide-in-right': 'slide-in-right',
  'scale-in': 'scale-in',
  'scale-out': 'scale-out',
  'bounce-in': 'bounce-in',
  pop: 'pop',
  'rotate-in': 'rotate-in',
  'flip-in': 'flip-in',
  'blur-in': 'blur-in',
};

const DEFAULT_EASING: Record<MotionPreset, string> = {
  'fade-in': 'ease-out',
  'fade-out': 'ease-in',
  'slide-in-up': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'slide-in-down': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'slide-in-left': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'slide-in-right': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'scale-in': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'scale-out': 'ease-in',
  'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'rotate-in': 'ease-out',
  'flip-in': 'ease-out',
  'blur-in': 'ease-out',
};

/*
 * Motion — declarative entrance/exit animation wrapper.
 *
 *   <Motion animation="slide-in-up">…</Motion>
 *   <Motion animation="fade-in" whenInView once>…</Motion>
 *
 * Composes CSS keyframes declared in `globals.css`. No JS animation loop —
 * the browser owns the timeline, prefers-reduced-motion is honored globally.
 *
 * For mount/unmount transitions wrap children in <AnimatePresence>.
 */
export function Motion({
  animation = 'fade-in',
  duration,
  delay = 0,
  easing,
  whenInView = false,
  rootMargin = '0px',
  once = true,
  disabled = false,
  force = false,
  as = 'div',
  className,
  style,
  children,
  ref,
  ...rest
}: MotionProps) {
  const innerRef = useRef<HTMLElement | null>(null);
  const setRef = useMergedRefs<HTMLElement>(innerRef, ref);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(!whenInView);

  useEffect(() => {
    if (!whenInView) return;
    const node = innerRef.current;
    if (node === null) return;
    if (typeof IntersectionObserver === 'undefined') {
      // Defer to avoid synchronous setState in effect; runs once on environments
      // without IntersectionObserver (older browsers, SSR shim) so the element
      // animates immediately on mount.
      const id = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(id);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry === undefined) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [whenInView, rootMargin, once]);

  const shouldAnimate = !disabled && (force || !reduced) && inView;
  const keyframe = PRESET_KEYFRAME[animation];
  const ease = easing ?? DEFAULT_EASING[animation];
  const dur = duration ?? 180;

  // `force` mode: project-level reduced-motion CSS clamps animation-duration
  // to 0.01ms with !important. Inline `style` cannot override !important — we
  // must call setProperty(name, value, 'important') via ref.
  useLayoutEffect(() => {
    if (!force) return;
    const node = innerRef.current;
    if (node === null) return;
    if (!shouldAnimate) {
      node.style.removeProperty('animation-name');
      node.style.removeProperty('animation-duration');
      node.style.removeProperty('animation-delay');
      node.style.removeProperty('animation-timing-function');
      node.style.removeProperty('animation-fill-mode');
      return;
    }
    // Reset first to restart the animation on re-render.
    node.style.setProperty('animation-name', 'none', 'important');
    // Force browser to apply the reset before re-setting.
    void node.offsetWidth;
    node.style.setProperty('animation-name', keyframe, 'important');
    node.style.setProperty('animation-duration', `${dur}ms`, 'important');
    node.style.setProperty('animation-delay', `${delay}ms`, 'important');
    node.style.setProperty('animation-timing-function', ease, 'important');
    node.style.setProperty('animation-fill-mode', 'both', 'important');
  }, [force, shouldAnimate, keyframe, dur, delay, ease]);

  const animStyle: CSSProperties =
    shouldAnimate && !force
      ? {
          animationName: keyframe,
          animationDuration: `${dur}ms`,
          animationDelay: `${delay}ms`,
          animationTimingFunction: ease,
          animationFillMode: 'both',
        }
      : {};

  return createElement(
    as,
    {
      ref: setRef,
      className: cn(className),
      style: { ...animStyle, ...style },
      'data-motion-animation': animation,
      ...rest,
    },
    children,
  );
}
