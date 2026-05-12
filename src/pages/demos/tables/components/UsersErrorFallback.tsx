import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/primitives/Button';

export function UsersErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Alert
      variant="danger"
      title="Couldn't load users"
      description={error.message}
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Retry
        </Button>
      }
    />
  );
}
