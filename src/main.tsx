import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/i18n';
import '@/styles/globals.css';
import { App } from '@/App';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

async function enableMocks(): Promise<void> {
  // Opt-in MSW worker. Set VITE_USE_MSW=true (commonly via .env.e2e + the
  // playwright webServer command, or `VITE_USE_MSW=true pnpm dev` for local
  // demos against fully mocked endpoints).
  if (import.meta.env.VITE_USE_MSW !== 'true') return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

void enableMocks().then(() => {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary source="app-root">
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
});
