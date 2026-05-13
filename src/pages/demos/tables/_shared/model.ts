/* Shared types for the /tables/* demo pages. */

export type EmployeeStatus = 'active' | 'on-leave' | 'terminated';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  startDate: Date;
  salary: number;
  managerId: string | null;
  /** Resolved subordinates — built lazily by helpers below. */
  reports?: Employee[];
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded';

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  currency: 'USD' | 'EUR';
  status: OrderStatus;
  placedAt: Date;
  shippedAt: Date | null;
}

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'shipped';

export interface Project {
  id: string;
  name: string;
  owner: string;
  status: ProjectStatus;
  budget: number;
  progress: number;
  startDate: Date;
  dueDate: Date;
  tags: string[];
  subProjects?: Project[];
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

export interface InvoiceLine {
  description: string;
  qty: number;
  unit: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  vendor: string;
  issuedAt: Date;
  dueAt: Date;
  amount: number;
  currency: 'USD' | 'EUR';
  status: InvoiceStatus;
  lineItems: InvoiceLine[];
}

export type DeploymentEnv = 'dev' | 'staging' | 'prod';
export type DeploymentStatus = 'queued' | 'running' | 'success' | 'failed' | 'rolled-back';

export interface Deployment {
  id: string;
  commit: string;
  branch: string;
  environment: DeploymentEnv;
  deployer: string;
  status: DeploymentStatus;
  durationMs: number;
  deployedAt: Date;
}
