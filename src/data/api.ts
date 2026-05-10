/*
 * Typed fetch wrapper. Three concerns:
 *
 *   1. Read base URL from import.meta.env.VITE_API_URL (empty by default —
 *      same-origin requests work out of the box).
 *   2. Attach Authorization: Bearer <token> when a `getToken` is configured
 *      (returning null skips the header).
 *   3. Auth refresh dance: on a 401 we call `refresh()` once, retry the
 *      original request, and on a second 401 invoke `onAuthFailure` (typically
 *      AuthClient.logout). Subsequent retries are NOT attempted — the loop is
 *      strictly one round.
 *
 * Non-2xx responses throw `ApiError` with `status`, `code`, `message`, and
 * `payload`. Network failures throw `ApiError` with status `0`.
 *
 * The default `api()` helper uses a module-level singleton client that
 * `configureApi()` mutates at app init. Tests should call `createApiClient()`
 * directly so each test has an isolated client.
 */

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export interface ApiRequestInit extends Omit<RequestInit, 'body'> {
  /** JSON-serialized into the body. Sets `content-type: application/json`. */
  json?: unknown;
  /** Raw body — passed through to fetch(). Use `json` for the common case. */
  body?: BodyInit | null;
  /** Query params merged onto the URL. Values are coerced via String(). */
  query?: Record<string, string | number | boolean | undefined | null>;
}

export interface ApiClientConfig {
  /** Defaults to `import.meta.env.VITE_API_URL ?? ''`. */
  baseUrl?: string;
  /** Returns the current bearer token, or null when unauthenticated. */
  getToken?: () => string | null;
  /** Called once after a 401 to attempt a session refresh. */
  refresh?: () => Promise<unknown>;
  /** Called when a request still 401s after refresh — wire to logout. */
  onAuthFailure?: () => void;
  /** Override for tests. Defaults to globalThis.fetch. */
  fetchImpl?: typeof fetch;
}

export interface ApiClient {
  fetch: <T = unknown>(path: string, init?: ApiRequestInit) => Promise<T>;
}

interface ApiErrorPayload {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

/** Thrown for any non-2xx response or network failure. */
export class ApiError extends Error {
  status: number;
  code: string | undefined;
  payload: unknown;

  constructor(opts: { status: number; message: string; code?: string; payload?: unknown }) {
    super(opts.message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.code = opts.code;
    this.payload = opts.payload;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

function buildUrl(baseUrl: string, path: string, query: ApiRequestInit['query']): string {
  let url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  if (query !== undefined) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      sp.append(k, String(v));
    }
    const qs = sp.toString();
    if (qs.length > 0) url += `${url.includes('?') ? '&' : '?'}${qs}`;
  }
  return url;
}

async function parseError(res: Response): Promise<ApiError> {
  let payload: unknown = undefined;
  let code: string | undefined;
  let message = `Request failed with ${res.status}`;
  const contentType = res.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      payload = (await res.json()) as unknown;
      const p = payload as ApiErrorPayload | null;
      if (p !== null && typeof p === 'object') {
        if (typeof p.message === 'string' && p.message.length > 0) message = p.message;
        if (typeof p.code === 'string') code = p.code;
      }
    } else {
      const text = await res.text();
      if (text.length > 0) message = text;
      payload = text;
    }
  } catch {
    // Body parsing failed — keep the default message.
  }
  return new ApiError({ status: res.status, message, ...(code !== undefined ? { code } : {}), payload });
}

async function parseSuccess<T>(res: Response): Promise<T> {
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export function createApiClient(config: ApiClientConfig = {}): ApiClient {
  const baseUrl = config.baseUrl ?? '';
  const fetchImpl = config.fetchImpl ?? globalThis.fetch.bind(globalThis);

  async function execute(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetchImpl(url, init);
    } catch (err) {
      throw new ApiError({
        status: 0,
        message: err instanceof Error ? err.message : 'Network request failed',
        code: 'network',
      });
    }
  }

  function buildInit(init: ApiRequestInit | undefined): RequestInit {
    const headers = new Headers(init?.headers);
    let body: BodyInit | null | undefined = init?.body;
    if (init?.json !== undefined) {
      if (!headers.has('content-type')) headers.set('content-type', 'application/json');
      body = JSON.stringify(init.json);
    }
    const token = config.getToken?.() ?? null;
    if (token !== null && !headers.has('authorization')) {
      headers.set('authorization', `Bearer ${token}`);
    }
    if (!headers.has('accept')) headers.set('accept', 'application/json');
    const out: RequestInit = { ...init, headers };
    if (body !== undefined) out.body = body;
    return out;
  }

  async function call<T>(path: string, init?: ApiRequestInit): Promise<T> {
    const url = buildUrl(baseUrl, path, init?.query);
    let res = await execute(url, buildInit(init));

    if (res.status === 401 && config.refresh !== undefined) {
      try {
        await config.refresh();
      } catch {
        // refresh failure ⇒ treat like a hard 401 below
      }
      res = await execute(url, buildInit(init));
      if (res.status === 401) {
        config.onAuthFailure?.();
        throw await parseError(res);
      }
    }

    if (!res.ok) throw await parseError(res);
    return parseSuccess<T>(res);
  }

  return { fetch: call };
}

let defaultClient: ApiClient = createApiClient({
  baseUrl: typeof import.meta.env.VITE_API_URL === 'string' ? import.meta.env.VITE_API_URL : '',
});

/**
 * Reconfigure the default singleton client. Call once during app bootstrap
 * (after AuthProvider has the necessary callbacks).
 */
export function configureApi(config: ApiClientConfig): void {
  defaultClient = createApiClient(config);
}

/** Default-client convenience wrapper — used by useApiQuery / useApiMutation. */
export function api<T = unknown>(path: string, init?: ApiRequestInit): Promise<T> {
  return defaultClient.fetch<T>(path, init);
}
