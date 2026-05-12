export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Viewer';
  status: 'Active' | 'Invited' | 'Suspended';
  lastSeenDays: number;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Order {
  id: string;
  customer: string;
  amount: number;
  currency: 'USD' | 'EUR';
  status: 'Pending' | 'Paid' | 'Refunded' | 'Failed';
  placedAt: Date;
}
