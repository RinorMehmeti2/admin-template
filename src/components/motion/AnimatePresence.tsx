import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { MotionPreset } from './Motion.types';

export interface AnimatePresenceProps {
  /** Single child or null. Toggle visibility by changing children. */
  children: ReactNode;
  /** Enter animation preset. Default 'fade-in'. */
  enter?: MotionPreset;
  /** Exit animation preset. Default 'fade-out'. */
  exit?: MotionPreset;
  /** Duration shared by enter + exit, ms. Default 180. */
  duration?: number;
  /** Easing override. Default depends on preset. */
  easing?: string;
  /** Force animation regardless of `prefers-reduced-motion`. */
  force?: boolean;
}

const KF: Record<MotionPreset, string> = {
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

/*
 * AnimatePresence — runs an exit animation before unmount and an enter on
 * mount. Single child only. Replaces (key change) animate as exit→enter.
 *
 *   <AnimatePresence enter="slide-in-up" exit="fade-out">
 *     {isOpen ? <Panel key="panel" /> : null}
 *   </AnimatePresence>
 */
export function AnimatePresence({
  children,
  enter = 'fade-in',
  exit = 'fade-out',
  duration = 180,
  easing,
  force = false,
}: AnimatePresenceProps) {
  const reducedRaw = useReducedMotion();
  const reduced = reducedRaw && !force;
  const incoming = isValidElement(children) ? (children as ReactElement) : null;
  const [rendered, setRendered] = useState<ReactElement | null>(incoming);
  const [phase, setPhase] = useState<'enter' | 'exit' | 'idle'>(
    incoming === null ? 'idle' : 'enter',
  );
  const timerRef = useRef<number | null>(null);

  /*
   * Phase orchestration drives entrance + exit by toggling state. The
   * "synchronous setState in effect" pattern lint flags here is intentional —
   * phase changes between renders are how a CSS-driven mount/unmount
   * transition works. Deferring inside rAF would delay the enter animation
   * by one frame and produce a visible flash.
   */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (reduced) {
      setRendered(incoming);
      setPhase('idle');
      return;
    }

    const sameKey = rendered !== null && incoming !== null && rendered.key === incoming.key;

    if (incoming === null && rendered !== null) {
      // Exit current.
      setPhase('exit');
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setRendered(null);
        setPhase('idle');
      }, duration);
      return;
    }

    if (incoming !== null && rendered === null) {
      setRendered(incoming);
      setPhase('enter');
      return;
    }

    if (incoming !== null && rendered !== null && !sameKey) {
      // Swap: exit out then mount new one.
      setPhase('exit');
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setRendered(incoming);
        setPhase('enter');
      }, duration);
      return;
    }

    if (sameKey) {
      // Same element, no transition.
      setRendered(incoming);
      setPhase('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming?.key, incoming === null]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (rendered === null) return null;
  if (reduced) return rendered;

  const animation = phase === 'exit' ? exit : phase === 'enter' ? enter : null;
  const childStyle = (rendered.props as { style?: CSSProperties }).style ?? {};
  const animStyle: CSSProperties =
    animation !== null && !force
      ? {
          animationName: KF[animation],
          animationDuration: `${duration}ms`,
          animationTimingFunction: easing ?? 'ease-out',
          animationFillMode: 'both',
        }
      : {};

  const props: Record<string, unknown> = {
    style: { ...animStyle, ...childStyle },
  };

  if (force && animation !== null) {
    const childRef = (rendered as ReactElement & { ref?: Ref<HTMLElement> }).ref;
    props.ref = (node: HTMLElement | null) => {
      if (typeof childRef === 'function') childRef(node);
      else if (childRef !== undefined && childRef !== null) {
        // RefObject.current is readonly at the type level but mutable at
        // runtime — same pattern as useMergedRefs.ts.
        // eslint-disable-next-line react-hooks/immutability
        (childRef as { current: HTMLElement | null }).current = node;
      }
      if (node === null) return;
      node.style.setProperty('animation-name', KF[animation], 'important');
      node.style.setProperty('animation-duration', `${duration}ms`, 'important');
      node.style.setProperty('animation-timing-function', easing ?? 'ease-out', 'important');
      node.style.setProperty('animation-fill-mode', 'both', 'important');
    };
  }

  return cloneElement(rendered, props as Partial<typeof rendered.props>);
}
