import { Button } from '@/components/primitives/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/data-display';
import { useToast } from '@/context/ToastProvider';

function ToastDemo() {
  const { toast } = useToast();
  return (
    <div className="flex gap-2">
      <Button onClick={() => toast.info('Swipe me right →', { duration: 0 })}>Show toast</Button>
      <Button variant="outline" onClick={() => toast.success('Saved')}>
        Quick toast
      </Button>
    </div>
  );
}

export function ToastSection() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Toast swipe-to-dismiss</CardTitle>
        <CardDescription>
          On touch devices, swipe a toast to the right past the threshold to dismiss it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ToastDemo />
      </CardContent>
    </Card>
  );
}
