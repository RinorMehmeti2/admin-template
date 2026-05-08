import { cn } from '@/lib/cn';
import { Portal } from '@/components/overlays/Portal';
import { useToastList } from '@/context/ToastProvider';
import { Toast } from './Toast';

export type ToastPosition = 'top-right' | 'bottom-right' | 'top-center' | 'bottom-center';

const positionClasses: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4 items-end',
  'bottom-right': 'bottom-4 right-4 items-end flex-col-reverse',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center flex-col-reverse',
};

export interface ToasterProps {
  position?: ToastPosition;
  maxVisible?: number;
}

export function Toaster({ position = 'top-right', maxVisible = 5 }: ToasterProps) {
  const { toasts, dismiss } = useToastList();
  const visible = toasts.slice(0, maxVisible);

  return (
    <Portal>
      <div
        role="region"
        aria-label="Notifications"
        className={cn(
          'pointer-events-none fixed z-[60] flex flex-col gap-2',
          positionClasses[position],
        )}
      >
        {visible.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </Portal>
  );
}
