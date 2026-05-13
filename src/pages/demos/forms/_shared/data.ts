import type {
  Address,
  Employee,
  EmployeeDepartment,
  EmployeeRole,
  PaymentMethod,
  Product,
  ShippingMethod,
  TaxRate,
} from './model';

/*
 * Deterministic mock data for /forms/* demos. No randomness — every
 * reload yields the same dataset so screenshots and tests stay stable.
 */

/* ------------------------------- Employees ------------------------------- */

const FIRST = [
  'Amara',
  'Bao',
  'Carla',
  'Diego',
  'Emi',
  'Farah',
  'Gabe',
  'Hana',
  'Ines',
  'Jonas',
  'Kira',
  'Luca',
  'Mira',
  'Noor',
  'Omar',
  'Pia',
  'Quinn',
  'Rafa',
  'Suri',
  'Tomas',
  'Uma',
  'Vito',
  'Wren',
  'Xan',
  'Yara',
  'Zev',
  'Anita',
  'Bashar',
  'Cleo',
  'Dario',
];
const LAST = [
  'Aalto',
  'Borges',
  'Cruz',
  'Dao',
  'Eklund',
  'Fernandez',
  'Goncalves',
  'Haidari',
  'Iqbal',
  'Jovic',
  'Khan',
  'Lindgren',
  'Marchetti',
  'Nair',
  'Okafor',
  'Pisani',
  'Quiroga',
  'Romanov',
  'Saito',
  'Tanaka',
  'Uribe',
  'Vasquez',
  'Whittaker',
  'Xie',
  'Younes',
  'Zoric',
  'Adler',
  'Bauer',
  'Clausen',
  'Deniz',
];
const DEPTS: EmployeeDepartment[] = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Support',
  'Finance',
  'People',
];
const ROLES: EmployeeRole[] = ['admin', 'editor', 'viewer'];

export const EMPLOYEES: ReadonlyArray<Employee> = Array.from({ length: 30 }, (_, i) => {
  const first = FIRST[i % FIRST.length] ?? 'Unknown';
  const last = LAST[(i * 3) % LAST.length] ?? 'User';
  const dept = DEPTS[i % DEPTS.length] ?? 'Engineering';
  const role = ROLES[i % ROLES.length] ?? 'viewer';
  return {
    id: `emp-${i + 1}`,
    name: `${first} ${last}`,
    email: `${first}.${last}`.toLowerCase() + '@acme.test',
    role,
    department: dept,
    managerId: i < 6 ? null : `emp-${(i % 6) + 1}`,
  };
});

export function getEmployeeById(id: string): Employee | undefined {
  return EMPLOYEES.find((e) => e.id === id);
}

export const EMPLOYEE_DEPARTMENTS: ReadonlyArray<EmployeeDepartment> = DEPTS;
export const EMPLOYEE_ROLES: ReadonlyArray<EmployeeRole> = ROLES;

/* ------------------------------- Products -------------------------------- */

const PRODUCT_BASE: ReadonlyArray<Omit<Product, 'sku'>> = [
  // Electronics
  {
    name: 'Mechanical keyboard',
    category: 'Electronics',
    unitPrice: 129,
    currency: 'USD',
    taxRatePct: 7,
    stock: 42,
    accessories: ['ACC-WRIST', 'ACC-CABLE'],
  },
  {
    name: 'USB-C dock',
    category: 'Electronics',
    unitPrice: 95,
    currency: 'USD',
    taxRatePct: 7,
    stock: 28,
  },
  {
    name: 'Wireless mouse',
    category: 'Electronics',
    unitPrice: 49,
    currency: 'USD',
    taxRatePct: 7,
    stock: 110,
  },
  {
    name: '4K monitor',
    category: 'Electronics',
    unitPrice: 399,
    currency: 'USD',
    taxRatePct: 7,
    stock: 12,
    accessories: ['ACC-HDMI'],
  },
  {
    name: 'Webcam',
    category: 'Electronics',
    unitPrice: 79,
    currency: 'USD',
    taxRatePct: 7,
    stock: 64,
  },
  {
    name: 'Noise-cancel headphones',
    category: 'Electronics',
    unitPrice: 249,
    currency: 'USD',
    taxRatePct: 7,
    stock: 22,
  },
  // Office
  {
    name: 'Standing desk',
    category: 'Office',
    unitPrice: 549,
    currency: 'USD',
    taxRatePct: 7,
    stock: 8,
  },
  {
    name: 'Ergonomic chair',
    category: 'Office',
    unitPrice: 429,
    currency: 'USD',
    taxRatePct: 7,
    stock: 14,
  },
  {
    name: 'Desk lamp',
    category: 'Office',
    unitPrice: 59,
    currency: 'USD',
    taxRatePct: 7,
    stock: 88,
  },
  {
    name: 'Filing cabinet',
    category: 'Office',
    unitPrice: 189,
    currency: 'USD',
    taxRatePct: 7,
    stock: 6,
  },
  // Stationery
  {
    name: 'Notebook set',
    category: 'Stationery',
    unitPrice: 24,
    currency: 'USD',
    taxRatePct: 0,
    stock: 320,
  },
  {
    name: 'Gel pen pack',
    category: 'Stationery',
    unitPrice: 12,
    currency: 'USD',
    taxRatePct: 0,
    stock: 540,
  },
  {
    name: 'Sticky notes',
    category: 'Stationery',
    unitPrice: 9,
    currency: 'USD',
    taxRatePct: 0,
    stock: 800,
  },
  // Software
  {
    name: 'Design tool · annual',
    category: 'Software',
    unitPrice: 144,
    currency: 'EUR',
    taxRatePct: 20,
    stock: 999,
  },
  {
    name: 'CI minutes · 10k',
    category: 'Software',
    unitPrice: 89,
    currency: 'EUR',
    taxRatePct: 20,
    stock: 999,
  },
  {
    name: 'Cloud storage · 1TB',
    category: 'Software',
    unitPrice: 72,
    currency: 'EUR',
    taxRatePct: 20,
    stock: 999,
  },
  // Accessories (referenced by dependents)
  {
    name: 'Wrist rest',
    category: 'Accessories',
    unitPrice: 19,
    currency: 'USD',
    taxRatePct: 7,
    stock: 200,
  },
  {
    name: 'Braided USB-C cable',
    category: 'Accessories',
    unitPrice: 14,
    currency: 'USD',
    taxRatePct: 7,
    stock: 350,
  },
  {
    name: 'HDMI 2.1 cable',
    category: 'Accessories',
    unitPrice: 22,
    currency: 'USD',
    taxRatePct: 7,
    stock: 180,
  },
  {
    name: 'Laptop stand',
    category: 'Accessories',
    unitPrice: 39,
    currency: 'USD',
    taxRatePct: 7,
    stock: 95,
  },
  // Misc
  {
    name: 'Coffee subscription',
    category: 'Pantry',
    unitPrice: 35,
    currency: 'USD',
    taxRatePct: 0,
    stock: 999,
  },
  {
    name: 'Tea variety pack',
    category: 'Pantry',
    unitPrice: 28,
    currency: 'USD',
    taxRatePct: 0,
    stock: 999,
  },
  {
    name: 'Snack box · monthly',
    category: 'Pantry',
    unitPrice: 45,
    currency: 'USD',
    taxRatePct: 0,
    stock: 999,
  },
  {
    name: 'First-aid kit',
    category: 'Safety',
    unitPrice: 38,
    currency: 'USD',
    taxRatePct: 0,
    stock: 65,
  },
  {
    name: 'Whiteboard',
    category: 'Office',
    unitPrice: 119,
    currency: 'USD',
    taxRatePct: 7,
    stock: 18,
  },
  {
    name: 'Projector',
    category: 'Electronics',
    unitPrice: 599,
    currency: 'USD',
    taxRatePct: 7,
    stock: 5,
  },
  {
    name: 'Conference speaker',
    category: 'Electronics',
    unitPrice: 199,
    currency: 'USD',
    taxRatePct: 7,
    stock: 17,
  },
  {
    name: 'External SSD 2TB',
    category: 'Electronics',
    unitPrice: 169,
    currency: 'USD',
    taxRatePct: 7,
    stock: 40,
  },
  {
    name: 'Privacy screen',
    category: 'Accessories',
    unitPrice: 34,
    currency: 'USD',
    taxRatePct: 7,
    stock: 130,
  },
  {
    name: 'Wireless charger',
    category: 'Electronics',
    unitPrice: 29,
    currency: 'USD',
    taxRatePct: 7,
    stock: 220,
  },
  {
    name: 'Backup battery 20k',
    category: 'Electronics',
    unitPrice: 59,
    currency: 'USD',
    taxRatePct: 7,
    stock: 88,
  },
  {
    name: 'Office plant',
    category: 'Decor',
    unitPrice: 22,
    currency: 'USD',
    taxRatePct: 0,
    stock: 75,
  },
  {
    name: 'Picture frame',
    category: 'Decor',
    unitPrice: 15,
    currency: 'USD',
    taxRatePct: 0,
    stock: 120,
  },
  {
    name: 'Acoustic panel',
    category: 'Decor',
    unitPrice: 49,
    currency: 'USD',
    taxRatePct: 7,
    stock: 38,
  },
  {
    name: 'Surge protector',
    category: 'Electronics',
    unitPrice: 32,
    currency: 'USD',
    taxRatePct: 7,
    stock: 90,
  },
  {
    name: 'KVM switch',
    category: 'Electronics',
    unitPrice: 89,
    currency: 'USD',
    taxRatePct: 7,
    stock: 30,
  },
  {
    name: 'Document scanner',
    category: 'Electronics',
    unitPrice: 219,
    currency: 'USD',
    taxRatePct: 7,
    stock: 12,
  },
  {
    name: 'Time tracker · annual',
    category: 'Software',
    unitPrice: 96,
    currency: 'GBP',
    taxRatePct: 20,
    stock: 999,
  },
  {
    name: 'PM tool · annual',
    category: 'Software',
    unitPrice: 264,
    currency: 'GBP',
    taxRatePct: 20,
    stock: 999,
  },
  {
    name: 'Linter · annual',
    category: 'Software',
    unitPrice: 48,
    currency: 'GBP',
    taxRatePct: 20,
    stock: 999,
  },
];

const ACCESSORY_SKU_BY_NAME: Record<string, string> = {
  'Wrist rest': 'ACC-WRIST',
  'Braided USB-C cable': 'ACC-CABLE',
  'HDMI 2.1 cable': 'ACC-HDMI',
};

export const PRODUCTS: ReadonlyArray<Product> = PRODUCT_BASE.map((p, i) => {
  const accessoryOverride = ACCESSORY_SKU_BY_NAME[p.name];
  const sku = accessoryOverride ?? `SKU-${String(i + 1).padStart(4, '0')}`;
  return { ...p, sku };
});

export function getProductBySku(sku: string): Product | undefined {
  return PRODUCTS.find((p) => p.sku === sku);
}

export const PRODUCT_CATEGORIES: ReadonlyArray<string> = Array.from(
  new Set(PRODUCTS.map((p) => p.category)),
);

/* ------------------------------- Addresses ------------------------------- */

export const ADDRESS_BOOK: ReadonlyArray<Address> = [
  {
    id: 'addr-1',
    label: 'HQ',
    street: '1 Market St',
    city: 'San Francisco',
    zip: '94105',
    country: 'US',
  },
  {
    id: 'addr-2',
    label: 'Warehouse',
    street: '2200 Industrial Pkwy',
    city: 'Reno',
    zip: '89506',
    country: 'US',
  },
  {
    id: 'addr-3',
    label: 'Berlin office',
    street: 'Friedrichstraße 12',
    city: 'Berlin',
    zip: '10117',
    country: 'DE',
  },
  {
    id: 'addr-4',
    label: 'London office',
    street: '20 Old Bailey',
    city: 'London',
    zip: 'EC4M 7AN',
    country: 'GB',
  },
  {
    id: 'addr-5',
    label: 'Tokyo office',
    street: 'Marunouchi 1-6-1',
    city: 'Tokyo',
    zip: '100-0005',
    country: 'JP',
  },
  {
    id: 'addr-6',
    label: 'Madrid satellite',
    street: 'Gran Vía 41',
    city: 'Madrid',
    zip: '28013',
    country: 'ES',
  },
  {
    id: 'addr-7',
    label: 'Sydney office',
    street: '50 Pitt St',
    city: 'Sydney',
    zip: '2000',
    country: 'AU',
  },
  {
    id: 'addr-8',
    label: 'Home — Alex',
    street: '12 Oak Lane',
    city: 'Austin',
    zip: '78704',
    country: 'US',
  },
  {
    id: 'addr-9',
    label: 'Home — Sam',
    street: '88 Birch Ave',
    city: 'Seattle',
    zip: '98101',
    country: 'US',
  },
  {
    id: 'addr-10',
    label: 'Pickup locker',
    street: '500 Commerce Blvd',
    city: 'Chicago',
    zip: '60601',
    country: 'US',
  },
  {
    id: 'addr-11',
    label: 'Co-working space',
    street: '7 Rue La Fayette',
    city: 'Paris',
    zip: '75009',
    country: 'FR',
  },
  {
    id: 'addr-12',
    label: 'Field office',
    street: '15 Queen St',
    city: 'Toronto',
    zip: 'M5H 2N2',
    country: 'CA',
  },
];

export const COUNTRY_OPTIONS: ReadonlyArray<{ code: string; label: string }> = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'ES', label: 'Spain' },
  { code: 'JP', label: 'Japan' },
  { code: 'AU', label: 'Australia' },
];

/* ----------------------- Shipping / payment / tax ------------------------ */

export const SHIPPING_METHODS: ReadonlyArray<ShippingMethod> = [
  { id: 'standard', label: 'Standard', description: '5–7 business days', flatRate: 0 },
  { id: 'priority', label: 'Priority', description: '2–3 business days', flatRate: 12 },
  { id: 'overnight', label: 'Overnight', description: 'Next business day', flatRate: 28 },
  { id: 'pickup', label: 'Pickup', description: 'Collect from any location', flatRate: 0 },
];

export const PAYMENT_METHODS: ReadonlyArray<PaymentMethod> = [
  { id: 'card', label: 'Credit card', description: 'Visa, Mastercard, Amex' },
  { id: 'ach', label: 'Bank transfer (ACH)', description: 'Free · 3 business days' },
  { id: 'wire', label: 'Wire transfer', description: 'International · $25 fee' },
  { id: 'invoice', label: 'Net-30 invoice', description: 'Approved accounts only' },
];

export const TAX_RATES: ReadonlyArray<TaxRate> = [
  { rate: 0, label: 'Exempt' },
  { rate: 5, label: 'Reduced 5%' },
  { rate: 7, label: 'Standard 7%' },
  { rate: 10, label: 'Standard 10%' },
  { rate: 20, label: 'EU 20%' },
];

export const PLANS = [
  {
    id: 'starter',
    label: 'Starter',
    price: 0,
    description: 'For solo builders and tiny teams.',
    features: ['Up to 3 users', '5 GB storage', 'Community support'],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: 29,
    description: 'For growing teams.',
    features: ['Up to 20 users', '100 GB storage', 'Email support', 'Audit log'],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: 99,
    description: 'For organizations with stricter needs.',
    features: ['Unlimited users', '1 TB storage', 'SSO + SCIM', '24/7 phone support'],
  },
] as const;

export const ADDONS = [
  {
    id: 'analytics',
    label: 'Advanced analytics',
    price: 19,
    description: 'Cohorts, funnels, retention.',
  },
  { id: 'sso', label: 'SSO + SCIM', price: 49, description: 'SAML 2.0, OIDC, SCIM provisioning.' },
  {
    id: 'audit',
    label: 'Audit logs · 365d',
    price: 29,
    description: 'Search and export retained logs.',
  },
  {
    id: 'priority-support',
    label: 'Priority support',
    price: 39,
    description: '4-hour SLA, dedicated channel.',
  },
];
