import type { Order } from './model';

function makeOrders(n: number): Order[] {
  const customers = [
    'Acme Inc.',
    'Globex',
    'Initech',
    'Umbrella',
    'Soylent',
    'Hooli',
    'Pied Piper',
  ];
  return Array.from({ length: n }).map((_, i) => {
    const days = i * 2;
    const d = new Date();
    d.setDate(d.getDate() - days);
    return {
      id: `INV-${String(2000 + i).padStart(5, '0')}`,
      customer: customers[i % customers.length]!,
      amount: Math.round((50 + ((i * 137) % 950)) * 100) / 100,
      currency: i % 4 === 0 ? 'EUR' : 'USD',
      status: (['Pending', 'Paid', 'Refunded', 'Failed'] as const)[i % 4]!,
      placedAt: d,
    };
  });
}

export const ORDERS: Order[] = makeOrders(40);
