export interface InvoiceRow {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issued: string;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  expenses: number;
}

export interface SignupPoint {
  day: string;
  signups: number;
}

export interface PlanBreakdownPoint {
  name: string;
  value: number;
  color: 'info' | 'primary' | 'success' | 'warning';
}
