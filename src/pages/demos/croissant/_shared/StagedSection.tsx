import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Stagger } from '@/components/motion';
import type { MotionPreset } from '@/components/motion';
import { SectionHeader, type SectionTone } from './SectionHeader';

export interface StagedSectionProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  tone?: SectionTone;
  /** Animation delay between children. Default 40ms. */
  staggerDelay?: number;
  /** Preset used by Stagger. Default 'slide-in-up'. */
  preset?: MotionPreset;
  /** Wait for the section to scroll into view before staggering. Default true. */
  whenInView?: boolean;
  /** `<section>` aria-labelledby — pass a stable id; rendered as title's id. */
  headingId?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function StagedSection({
  eyebrow,
  title,
  description,
  tone = 'primary',
  staggerDelay = 40,
  preset = 'slide-in-up',
  whenInView = true,
  headingId,
  className,
  bodyClassName,
  children,
}: StagedSectionProps) {
  const heading =
    headingId !== undefined ? <span id={headingId}>{title}</span> : <span>{title}</span>;
  return (
    <section aria-labelledby={headingId} className={cn('space-y-6', className)}>
      <SectionHeader tone={tone} eyebrow={eyebrow} title={heading} description={description} />
      <Stagger
        animation={preset}
        stagger={staggerDelay}
        whenInView={whenInView}
        className={cn('space-y-4', bodyClassName)}
      >
        {children}
      </Stagger>
    </section>
  );
}
