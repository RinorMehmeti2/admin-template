import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Toaster, type ToastPosition } from '@/components/feedback/Toast/Toaster';

/*
 * In-app toast system. ToastProvider sits at the app root, owns the queue,
 * and renders the Toaster (a Portal). useToast() exposes imperative APIs.
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'neutral';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: ReactNode;
  description?: ReactNode;
  /** ms; 0 or non-finite = sticky (no auto-dismiss). */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

export interface ToastItem {
  id: string;
  type: ToastType;
  duration: number;
  title?: ReactNode;
  description?: ReactNode;
  action?: { label: string; onClick: () => void };
}

type ToastInput = string | ToastOptions;

export interface ToastFn {
  (message: ToastInput, opts?: ToastOptions): string;
  success: (message: string, opts?: ToastOptions) => string;
  error: (message: string, opts?: ToastOptions) => string;
  warning: (message: string, opts?: ToastOptions) => string;
  info: (message: string, opts?: ToastOptions) => string;
  neutral: (message: string, opts?: ToastOptions) => string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: ToastFn;
  dismiss: (id: string) => void;
  update: (id: string, opts: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxVisible?: number;
  defaultDuration?: number;
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxVisible = 5,
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const update = useCallback((id: string, opts: ToastOptions) => {
    setToasts((list) =>
      list.map((t) =>
        t.id === id
          ? {
              ...t,
              ...(opts.type !== undefined ? { type: opts.type } : {}),
              ...(opts.duration !== undefined ? { duration: opts.duration } : {}),
              ...(opts.title !== undefined ? { title: opts.title } : {}),
              ...(opts.description !== undefined ? { description: opts.description } : {}),
              ...(opts.action !== undefined ? { action: opts.action } : {}),
            }
          : t,
      ),
    );
  }, []);

  const create = useCallback(
    (input: ToastInput, opts?: ToastOptions): string => {
      const resolved: ToastOptions =
        typeof input === 'string' ? { title: input, ...opts } : { ...input, ...opts };
      idCounter.current += 1;
      const id = resolved.id ?? `toast-${idCounter.current}`;
      const item: ToastItem = {
        id,
        type: resolved.type ?? 'neutral',
        duration: resolved.duration ?? defaultDuration,
        ...(resolved.title !== undefined ? { title: resolved.title } : {}),
        ...(resolved.description !== undefined ? { description: resolved.description } : {}),
        ...(resolved.action !== undefined ? { action: resolved.action } : {}),
      };
      // newest on top
      setToasts((list) => [item, ...list]);
      return id;
    },
    [defaultDuration],
  );

  // Toast API is a callable with attached helpers. The lint plugin can't model
  // this idiomatic shape — disabling refs/immutability checks at this site.
  /* eslint-disable react-hooks/immutability */
  const toast = useMemo<ToastFn>(() => {
    const fn = ((input: ToastInput, opts?: ToastOptions) => create(input, opts)) as ToastFn;
    fn.success = (msg, opts) => create(msg, { ...opts, type: 'success' });
    fn.error = (msg, opts) => create(msg, { ...opts, type: 'error' });
    fn.warning = (msg, opts) => create(msg, { ...opts, type: 'warning' });
    fn.info = (msg, opts) => create(msg, { ...opts, type: 'info' });
    fn.neutral = (msg, opts) => create(msg, { ...opts, type: 'neutral' });
    return fn;
  }, [create]);
  /* eslint-enable react-hooks/immutability */

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, toast, dismiss, update }),
    [toasts, toast, dismiss, update],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster position={position} maxVisible={maxVisible} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx === null) throw new Error('useToast must be used inside <ToastProvider>');
  return { toast: ctx.toast, dismiss: ctx.dismiss, update: ctx.update };
}

/** Internal — used by Toaster to render the queue. */
export function useToastList() {
  const ctx = useContext(ToastContext);
  if (ctx === null) throw new Error('Internal: ToastList missing context');
  return { toasts: ctx.toasts, dismiss: ctx.dismiss };
}
