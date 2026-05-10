import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastProvider';
import { registerErrorDispatcher, type ToastSeverity } from './errorHandler';

/*
 * Bridges router + toast into the data layer's error dispatcher.
 *
 * The QueryCache / MutationCache global handlers run at module level and
 * cannot call hooks. This component sits inside <ToastProvider> AND inside
 * <RouterProvider>'s tree, registers handlers on mount, and tears them down
 * on unmount. dispatchError() reads the registry without taking a context
 * dependency.
 *
 * Mount once near the router root (see RootShell in App.tsx).
 */

export function ErrorBridge() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    registerErrorDispatcher({
      navigate: (to) => {
        navigate(to);
      },
      toast: (severity: ToastSeverity, message: string) => {
        if (severity === 'error') toast.error(message);
        else if (severity === 'warning') toast.warning(message);
        else toast.info(message);
      },
    });
    return () => {
      registerErrorDispatcher(null);
    };
  }, [navigate, toast]);

  return null;
}
