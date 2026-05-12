import type { Layer } from './model';

export const INITIAL_LAYERS: ReadonlyArray<Layer> = [
  { id: 'bg', name: 'Background', visible: true, locked: true },
  { id: 'hero-text', name: 'Hero text', visible: true, locked: false },
  { id: 'cta', name: 'CTA button', visible: true, locked: false },
  { id: 'product-shot', name: 'Product shot', visible: false, locked: false },
];
