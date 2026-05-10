/*
 * Single source of truth for turning an ApiError into a user-facing action.
 *
 * mapApiError() classifies the error; dispatchError() runs the global side
 * effects (toast / redirect) via handlers registered by <ErrorBridge>.
 *
 * Why a side-channel: QueryCache + MutationCache callbacks are module-level
 * and cannot call useToast() / useNavigate(). A component inside the router
 * + toast providers registers handlers at mount; the data layer reads them
 * through dispatchError() without taking a context dependency.
 *
 * Components opt out of global dispatch by setting
 *   meta: { handlesErrors: true }
 * on the relevant useQuery / useMutation. useApiFormSubmit relies on this
 * because it owns inline error handling itself.
 */

import { isApiError, type ApiError } from './api';

export type ToastSeverity = 'error' | 'warning' | 'info';

export interface ToastAction {
  kind: 'toast';
  severity: ToastSeverity;
  message: string;
}

export interface RedirectAction {
  kind: 'redirect';
  to: string;
}

export interface InlineAction {
  kind: 'inline';
  /** Optional API-supplied error code, e.g. "validation". */
  code?: string;
  /** Form-level message; pair with `fields` for field-level details. */
  message: string;
  /** RHF field-name → message. Empty/absent ⇒ form-level only. */
  fields?: Record<string, string>;
}

export interface FatalAction {
  kind: 'fatal';
  error: ApiError;
}

export type ErrorAction = ToastAction | RedirectAction | InlineAction | FatalAction;

interface ApiPayload {
  message?: unknown;
  code?: unknown;
  fields?: unknown;
  errors?: unknown;
  [key: string]: unknown;
}

function readObject(value: unknown): ApiPayload | null {
  if (value === null || typeof value !== 'object') return null;
  return value as ApiPayload;
}

/**
 * Normalize a payload's field-error map. Accepts either:
 *   { fields: { email: 'msg' | ['msg', ...] } }   // zod-style
 *   { errors: { email: ['msg', ...] } }           // common Rails / DRF shape
 * Returns undefined when nothing field-shaped is present.
 */
function readFields(payload: ApiPayload | null): Record<string, string> | undefined {
  if (payload === null) return undefined;
  const raw = readObject(payload.fields) ?? readObject(payload.errors);
  if (raw === null) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string' && value.length > 0) {
      out[key] = value;
    } else if (Array.isArray(value)) {
      const first = value.find((v): v is string => typeof v === 'string' && v.length > 0);
      if (first !== undefined) out[key] = first;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Pure classifier — no side effects, easy to unit-test. */
export function mapApiError(error: ApiError): ErrorAction {
  const payload = readObject(error.payload);
  const status = error.status;

  // Auth — api.ts already retries 401 once with refresh. Reaching here means
  // both attempts failed: send the user back to login.
  if (status === 401) {
    return { kind: 'redirect', to: '/login' };
  }

  // Forbidden — keep the user where they are but warn. Some apps prefer a
  // dedicated /403 page; switch to 'redirect' if that's added.
  if (status === 403) {
    return { kind: 'toast', severity: 'warning', message: error.message };
  }

  // Validation — 422 and any 4xx that ships a fields/errors map go inline.
  const fields = readFields(payload);
  if (status === 422 || (status >= 400 && status < 500 && fields !== undefined)) {
    const action: InlineAction = { kind: 'inline', message: error.message };
    if (error.code !== undefined) action.code = error.code;
    if (fields !== undefined) action.fields = fields;
    return action;
  }

  // Other client errors — surface the server message as a toast.
  if (status >= 400 && status < 500) {
    return { kind: 'toast', severity: 'error', message: error.message };
  }

  // Server / network — transient toast.
  if (status === 0 || (status >= 500 && status < 600)) {
    const message =
      status === 0 ? 'Network error. Check your connection and try again.' : error.message;
    return { kind: 'toast', severity: 'error', message };
  }

  // Anything else (e.g. 3xx slipping through) — let a boundary deal with it.
  return { kind: 'fatal', error };
}

// ---- Dispatcher side-channel ---------------------------------------------

export interface ErrorDispatcher {
  toast: (severity: ToastSeverity, message: string) => void;
  navigate: (to: string) => void;
}

let registered: ErrorDispatcher | null = null;

/**
 * Register / unregister the active dispatcher. <ErrorBridge> calls this in a
 * useEffect so handlers are torn down with the providers.
 */
export function registerErrorDispatcher(dispatcher: ErrorDispatcher | null): void {
  registered = dispatcher;
}

export function getErrorDispatcher(): ErrorDispatcher | null {
  return registered;
}

/**
 * Run the side effect for the given action. Used by the QueryCache /
 * MutationCache global handlers and by useApiFormSubmit for non-inline cases.
 *
 * Inline actions never dispatch here — they require a form to call setError
 * and are owned by the consumer.
 */
export function runErrorAction(action: ErrorAction): void {
  switch (action.kind) {
    case 'toast':
      registered?.toast(action.severity, action.message);
      return;
    case 'redirect':
      registered?.navigate(action.to);
      return;
    case 'inline':
      // Inline errors must be handled by the calling form. If we reach here it
      // means the caller forgot to opt out of global dispatch — fall back to a
      // toast so the user at least sees the failure.
      registered?.toast('error', action.message);
      return;
    case 'fatal':
      throw action.error;
  }
}

/** Convenience: classify + dispatch in one call. Non-ApiErrors are ignored. */
export function dispatchError(error: unknown): void {
  if (!isApiError(error)) return;
  runErrorAction(mapApiError(error));
}
