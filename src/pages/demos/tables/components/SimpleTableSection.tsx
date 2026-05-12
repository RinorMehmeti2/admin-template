import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display';

const STATIC_PLANS = [
  { plan: 'Starter', seats: 1, price: '$0/mo', features: '1 project' },
  { plan: 'Team', seats: 10, price: '$49/mo', features: 'Unlimited projects, audit log' },
  { plan: 'Business', seats: 50, price: '$149/mo', features: 'SSO, RBAC, priority support' },
  { plan: 'Enterprise', seats: 0, price: 'Contact us', features: 'SLA, dedicated infra' },
];

export function SimpleTableSection() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Simple Table</CardTitle>
        <CardDescription>Static rows. Striped variant, default size.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table variant="striped">
          <TableCaption>Pricing plans</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Features</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {STATIC_PLANS.map((p) => (
              <TableRow key={p.plan}>
                <TableCell className="font-medium">{p.plan}</TableCell>
                <TableCell>{p.seats === 0 ? 'Custom' : p.seats}</TableCell>
                <TableCell>{p.price}</TableCell>
                <TableCell className="text-foreground-muted">{p.features}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
