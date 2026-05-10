import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import { queryClient as defaultClient } from './queryClient';

/*
 * QueryProvider mounts the QueryClientProvider plus the dev-only devtools
 * panel. Devtools are tree-shaken out of production builds via the
 * import.meta.env.DEV guard — react-query-devtools is the only place we
 * import that package.
 */

export interface QueryProviderProps {
  children: ReactNode;
  /** Override for tests / Storybook. Defaults to the shared singleton. */
  client?: QueryClient;
}

export function QueryProvider({ children, client = defaultClient }: QueryProviderProps) {
  return (
    <QueryClientProvider client={client}>
      {children}
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" /> : null}
    </QueryClientProvider>
  );
}
