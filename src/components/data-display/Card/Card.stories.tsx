import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from '@/components/primitives/Button';

export default { title: 'Data Display/Card', component: Card };

export const Variants = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {(['default', 'outlined', 'elevated'] as const).map((v) => (
        <Card key={v} variant={v}>
          <CardHeader>
            <CardTitle>{v}</CardTitle>
            <CardDescription>Variant {v}</CardDescription>
          </CardHeader>
          <CardContent>Content body</CardContent>
        </Card>
      ))}
    </div>
  ),
};

export const Composition = {
  render: () => (
    <Card variant="outlined" className="max-w-md">
      <CardHeader>
        <CardTitle>Project: Apollo</CardTitle>
        <CardDescription>Last updated 2h ago</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground-muted">
          Internal admin tool for ops team. Onboarding flow + RBAC under review.
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="ghost">Archive</Button>
        <Button>Open</Button>
      </CardFooter>
    </Card>
  ),
};
