import { Button } from '@/components/primitives/Button';
import { useToast } from '@/context/ToastProvider';
import { Section } from './Section';

export function ToastSection() {
  const { toast } = useToast();

  return (
    <Section title="Toast">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast.success('Saved successfully')}>Success</Button>
        <Button variant="danger" onClick={() => toast.error('Network error', { description: 'Check your connection.' })}>
          Error
        </Button>
        <Button variant="outline" onClick={() => toast.warning('Storage almost full')}>
          Warning
        </Button>
        <Button variant="ghost" onClick={() => toast.info('New version available')}>
          Info
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.neutral('Heads up', {
              duration: 0,
              action: { label: 'Undo', onClick: () => toast.success('Undone') },
            })
          }
        >
          Sticky w/ action
        </Button>
      </div>
    </Section>
  );
}
