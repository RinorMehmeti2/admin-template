export type EmployeeRole = 'admin' | 'editor' | 'viewer';
export type EmployeeDepartment =
  | 'Engineering'
  | 'Design'
  | 'Product'
  | 'Marketing'
  | 'Sales'
  | 'Support'
  | 'Finance'
  | 'People';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  department: EmployeeDepartment;
  managerId: string | null;
}

export type Currency = 'USD' | 'EUR' | 'GBP';

export interface Product {
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  currency: Currency;
  taxRatePct: number;
  stock: number;
  /** Optional companion SKUs auto-appended in dependent-rows demo. */
  accessories?: string[];
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface ShippingMethod {
  id: string;
  label: string;
  description: string;
  flatRate: number;
}

export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
}

export interface TaxRate {
  rate: number;
  label: string;
}
