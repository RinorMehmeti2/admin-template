import { Alert } from '@/components/feedback';
import { Button } from '@/components/primitives/Button';
import { useToast } from '@/context/ToastProvider';
import { Section } from './Section';

const CODE = `<div className="space-y-3">
  <Alert variant="info" title="Heads up" description="A friendly note." />
  <Alert variant="success" title="Saved" description="Your changes were saved." />
  <Alert variant="warning" title="Storage low" description="Less than 10% remaining." />
  <Alert
    variant="danger"
    title="Deletion failed"
    description="The server returned 500."
    actions={
      <>
        <Button size="sm" variant="danger">Retry</Button>
        <Button size="sm" variant="ghost">Discard</Button>
      </>
    }
  />
  <Alert
    variant="neutral"
    title="Dismissable"
    description="Click the × to remove me."
    onClose={() => toast.info('Alert dismissed (demo only)')}
  />
</div>`;

export function AlertSection() {
  const { toast } = useToast();

  return (
    <Section title="Alert" code={CODE}>
      <div className="space-y-3">
        <Alert variant="info" title="Heads up" description="A friendly note." />
        <Alert variant="success" title="Saved" description="Your changes were saved." />
        <Alert variant="warning" title="Storage low" description="Less than 10% remaining." />
        <Alert
          variant="danger"
          title="Deletion failed"
          description="The server returned 500."
          actions={
            <>
              <Button size="sm" variant="danger">
                Retry
              </Button>
              <Button size="sm" variant="ghost">
                Discard
              </Button>
            </>
          }
        />
        <Alert
          variant="neutral"
          title="Dismissable"
          description="Click the × to remove me."
          onClose={() => toast.info('Alert dismissed (demo only)')}
        />
      </div>
    </Section>
  );
}
