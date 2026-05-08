import { Button } from '@/components/primitives/Button';
import { ToastProvider, useToast } from '@/context/ToastProvider';

export default { title: 'Feedback/Toast', component: ToastProvider };

function Triggers() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.success('Saved successfully')}>Success</Button>
      <Button variant="danger" onClick={() => toast.error('Network error', { description: 'Check your connection.' })}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning('Storage almost full')}>Warning</Button>
      <Button variant="ghost" onClick={() => toast.info('New version available')}>Info</Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.neutral('Heads up', {
            duration: 0,
            action: {
              label: 'Undo',
              // eslint-disable-next-line no-alert
              onClick: () => alert('undone'),
            },
          })
        }
      >
        Sticky w/ action
      </Button>
    </div>
  );
}

export const TopRight = {
  render: () => (
    <ToastProvider position="top-right">
      <Triggers />
    </ToastProvider>
  ),
};

export const BottomCenter = {
  render: () => (
    <ToastProvider position="bottom-center">
      <Triggers />
    </ToastProvider>
  ),
};
