/*
 * Single seam for error reporting. Replace the body of `reportError` with a
 * Sentry / Bugsnag / Datadog call in production — every boundary, async
 * handler, and `useErrorHandler` invocation goes through here, so swapping
 * the implementation is a one-file change.
 *
 * The default implementation logs to the console with a structured shape
 * (`{ name, message, stack, componentStack, ...context }`) so the same
 * payload that ships to a real reporter is also visible in dev DevTools.
 */

export interface ErrorContext {
  /** React's componentStack — only present for boundary-caught errors. */
  componentStack?: string;
  /** Source location, e.g. 'route:/tables', 'app-root', 'event:invite-user'. */
  source?: string;
  /** Arbitrary structured extras. Keep it serializable. */
  extra?: Record<string, unknown>;
}

interface SerializedError {
  name: string;
  message: string;
  stack: string | undefined;
  componentStack: string | undefined;
  source: string | undefined;
  extra: Record<string, unknown> | undefined;
  timestamp: string;
}

function serialize(error: unknown, context: ErrorContext): SerializedError {
  const e = error instanceof Error ? error : new Error(String(error));
  return {
    name: e.name,
    message: e.message,
    stack: e.stack,
    componentStack: context.componentStack,
    source: context.source,
    extra: context.extra,
    timestamp: new Date().toISOString(),
  };
}

export function reportError(error: unknown, context: ErrorContext = {}): void {
  const payload = serialize(error, context);
  // Production swap: replace this block with `Sentry.captureException(error, { contexts: { … } })`
  // (or equivalent). Keep the structured `payload` shape so log search stays consistent.
  // eslint-disable-next-line no-console
  console.error('[error]', payload);
}
