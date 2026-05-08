import { useEffect } from 'react';

// TODO: iOS rubber-band — revisit if mobile-first usage appears.
// Current `overflow: hidden` on body works on desktop + Android but iOS
// Safari can still rubber-band the scroll. Fix would be the position:fixed
// pattern (save scrollY, body { position: fixed; top: -scrollY }), restore
// on unlock. Deferred — admin template is desktop-primary.

interface SavedStyles {
  overflow: string;
  paddingRight: string;
}

let lockCount = 0;
let saved: SavedStyles | null = null;

function applyLock(): void {
  const scrollbarGutter = window.innerWidth - document.documentElement.clientWidth;
  saved = {
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
  };
  document.body.style.overflow = 'hidden';
  if (scrollbarGutter > 0) {
    document.body.style.paddingRight = `${scrollbarGutter}px`;
  }
}

function releaseLock(): void {
  if (saved === null) return;
  document.body.style.overflow = saved.overflow;
  document.body.style.paddingRight = saved.paddingRight;
  saved = null;
}

export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    if (lockCount === 0) applyLock();
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) releaseLock();
    };
  }, [active]);
}
