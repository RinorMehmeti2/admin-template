import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api';
import {
  dispatchError,
  mapApiError,
  registerErrorDispatcher,
  runErrorAction,
  type ErrorDispatcher,
} from '../errorHandler';

describe('mapApiError', () => {
  it('classifies 401 as a redirect to /login', () => {
    const action = mapApiError(new ApiError({ status: 401, message: 'auth' }));
    expect(action).toEqual({ kind: 'redirect', to: '/login' });
  });

  it('classifies 403 as a warning toast with the server message', () => {
    const action = mapApiError(new ApiError({ status: 403, message: 'forbidden' }));
    expect(action).toEqual({ kind: 'toast', severity: 'warning', message: 'forbidden' });
  });

  it('classifies 422 with a zod-style fields map as inline with per-field messages', () => {
    const action = mapApiError(
      new ApiError({
        status: 422,
        message: 'Validation failed',
        code: 'validation',
        payload: { fields: { email: 'Invalid email', password: 'Too short' } },
      }),
    );
    expect(action).toEqual({
      kind: 'inline',
      code: 'validation',
      message: 'Validation failed',
      fields: { email: 'Invalid email', password: 'Too short' },
    });
  });

  it('flattens errors[]: takes the first non-empty string per field', () => {
    const action = mapApiError(
      new ApiError({
        status: 400,
        message: 'Bad request',
        payload: { errors: { name: ['Required', 'Too long'], age: [] } },
      }),
    );
    expect(action.kind).toBe('inline');
    if (action.kind !== 'inline') return;
    expect(action.fields).toEqual({ name: 'Required' });
  });

  it('classifies 422 with no fields as inline form-level only', () => {
    const action = mapApiError(new ApiError({ status: 422, message: 'Bad data' }));
    expect(action).toEqual({ kind: 'inline', message: 'Bad data' });
  });

  it('classifies a generic 4xx without a fields map as a toast', () => {
    const action = mapApiError(new ApiError({ status: 404, message: 'Not found' }));
    expect(action).toEqual({ kind: 'toast', severity: 'error', message: 'Not found' });
  });

  it('classifies 500 as an error toast', () => {
    const action = mapApiError(new ApiError({ status: 500, message: 'boom' }));
    expect(action).toEqual({ kind: 'toast', severity: 'error', message: 'boom' });
  });

  it('classifies network failures (status 0) with a friendly fallback message', () => {
    const action = mapApiError(new ApiError({ status: 0, message: 'fetch failed', code: 'network' }));
    expect(action).toEqual({
      kind: 'toast',
      severity: 'error',
      message: 'Network error. Check your connection and try again.',
    });
  });

  it('treats unexpected statuses as fatal so a boundary handles them', () => {
    const err = new ApiError({ status: 301, message: 'redirect' });
    expect(mapApiError(err)).toEqual({ kind: 'fatal', error: err });
  });
});

describe('runErrorAction / dispatchError', () => {
  function withDispatcher(): ErrorDispatcher & { _spy: { toast: ReturnType<typeof vi.fn>; navigate: ReturnType<typeof vi.fn> } } {
    const toast = vi.fn();
    const navigate = vi.fn();
    const dispatcher: ErrorDispatcher = { toast, navigate };
    registerErrorDispatcher(dispatcher);
    return Object.assign(dispatcher, { _spy: { toast, navigate } });
  }

  it('toast actions invoke the registered toast handler', () => {
    const d = withDispatcher();
    runErrorAction({ kind: 'toast', severity: 'error', message: 'boom' });
    expect(d._spy.toast).toHaveBeenCalledWith('error', 'boom');
    expect(d._spy.navigate).not.toHaveBeenCalled();
    registerErrorDispatcher(null);
  });

  it('redirect actions invoke navigate', () => {
    const d = withDispatcher();
    runErrorAction({ kind: 'redirect', to: '/login' });
    expect(d._spy.navigate).toHaveBeenCalledWith('/login');
    registerErrorDispatcher(null);
  });

  it('fatal actions throw the underlying ApiError', () => {
    withDispatcher();
    const err = new ApiError({ status: 301, message: 'weird' });
    expect(() => runErrorAction({ kind: 'fatal', error: err })).toThrow(err);
    registerErrorDispatcher(null);
  });

  it('dispatchError ignores non-ApiError values', () => {
    const d = withDispatcher();
    dispatchError(new Error('plain'));
    dispatchError(null);
    dispatchError('string');
    expect(d._spy.toast).not.toHaveBeenCalled();
    expect(d._spy.navigate).not.toHaveBeenCalled();
    registerErrorDispatcher(null);
  });

  it('dispatchError on an inline action falls back to a toast (caller forgot to opt out)', () => {
    const d = withDispatcher();
    dispatchError(
      new ApiError({
        status: 422,
        message: 'invalid',
        payload: { fields: { name: 'required' } },
      }),
    );
    expect(d._spy.toast).toHaveBeenCalledWith('error', 'invalid');
    registerErrorDispatcher(null);
  });
});
