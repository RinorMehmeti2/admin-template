import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type AccordionType = 'single' | 'multiple';
export type AccordionVariant = 'default' | 'bordered' | 'separated';

export interface AccordionBaseProps {
  type?: AccordionType;
  variant?: AccordionVariant;
  /** Single mode: allow collapsing the open item. Default true. */
  collapsible?: boolean;
  className?: string;
  children: ReactNode;
}

export interface AccordionSingleProps extends AccordionBaseProps {
  type?: 'single';
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

export interface AccordionMultipleProps extends AccordionBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

export interface AccordionTriggerProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
  /** Keep mounted when collapsed (for forms/state preservation). Default false. */
  forceMount?: boolean;
}
