import { Alert } from './Alert';
import { Button } from '@/components/primitives/Button';

export default { title: 'Feedback/Alert', component: Alert };

export const Variants = {
  render: () => (
    <div className="max-w-xl space-y-3">
      <Alert variant="info" title="Heads up" description="A friendly note." />
      <Alert variant="success" title="Saved" description="Your changes were saved." />
      <Alert variant="warning" title="Storage low" description="Less than 10% remaining." />
      <Alert variant="danger" title="Deletion failed" description="The server returned 500." />
      <Alert variant="neutral" title="Note" description="Plain neutral alert." />
    </div>
  ),
};

export const Dismissable = {
  render: () => (
    <div className="max-w-xl">
      <Alert
        variant="warning"
        title="Backup overdue"
        description="Last backup was 7 days ago."
        // eslint-disable-next-line no-alert
        onClose={() => alert('dismissed')}
      />
    </div>
  ),
};

export const WithActions = {
  render: () => (
    <div className="max-w-xl">
      <Alert
        variant="danger"
        title="Could not save"
        description="Network error occurred."
        actions={
          <>
            <Button size="sm" variant="danger">Retry</Button>
            <Button size="sm" variant="ghost">Discard</Button>
          </>
        }
      />
    </div>
  ),
};
