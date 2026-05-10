import { useMemo, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '@/lib/cn';
import { ChartContext, type ChartContextValue } from '../shared/ChartContext';
import { useTokenColors } from '../shared/useTokenColors';

export interface ChartContainerProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * Provides the resolved token-colour palette to descendant chart components.
 *
 * Charts can render standalone — they self-resolve via `useTokenColors` when
 * no `<ChartContainer>` is found in the tree. Wrapping multiple charts in a
 * single container avoids duplicate sentinel elements + observers.
 */
export function ChartContainer({ ref, className, children, ...rest }: ChartContainerProps) {
  const colors = useTokenColors();
  const value = useMemo<ChartContextValue>(() => ({ colors }), [colors]);

  return (
    <ChartContext.Provider value={value}>
      <div ref={ref} className={cn('w-full', className)} {...rest}>
        {children}
      </div>
    </ChartContext.Provider>
  );
}
