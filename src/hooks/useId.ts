import { useId as reactUseId } from 'react';

export function useId(prefix?: string): string {
  const id = reactUseId();
  return prefix !== undefined && prefix !== '' ? `${prefix}-${id}` : id;
}
