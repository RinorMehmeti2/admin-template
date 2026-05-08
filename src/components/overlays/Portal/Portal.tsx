import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type PortalContainer = Element | (() => Element);

export interface PortalProps {
  children: ReactNode;
  container?: PortalContainer;
}

export function Portal({ children, container }: PortalProps) {
  // SSR-safe: bail when there's no document. On the client we render
  // synchronously so refs inside the portal are set in the FIRST commit
  // (useFocusTrap, usePosition, etc. depend on this).
  if (typeof document === 'undefined') return null;
  const target =
    typeof container === 'function' ? container() : (container ?? document.body);
  return createPortal(children, target);
}
