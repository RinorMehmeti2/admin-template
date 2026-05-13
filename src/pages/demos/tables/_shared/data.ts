import type {
  Deployment,
  DeploymentEnv,
  DeploymentStatus,
  Employee,
  EmployeeStatus,
  Invoice,
  InvoiceStatus,
  Order,
  OrderItem,
  OrderStatus,
  Project,
  ProjectStatus,
} from './model';

/*
 * Realistic, deterministic mock data for the /tables/* demos. All dates
 * are anchored relative to BASE_DATE (currentDate at write time) so the
 * pages stay reproducible across reloads. Every dataset is plausible —
 * names, currency mix, durations — but no specific persons or vendors.
 */

const BASE = new Date('2026-05-13T12:00:00Z');

function daysFromBase(days: number): Date {
  return new Date(BASE.getTime() + days * 24 * 60 * 60 * 1000);
}

/* ------------------------------- Employees ------------------------------- */

const FIRST_NAMES = [
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
];
const LAST_NAMES = [
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
];
const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Support',
  'Finance',
  'People',
];
const ROLE_BY_DEPT: Record<string, string[]> = {
  Engineering: ['Engineer', 'Senior Engineer', 'Staff Engineer', 'Engineering Manager'],
  Design: ['Designer', 'Senior Designer', 'Design Lead'],
  Product: ['Product Manager', 'Senior PM', 'Product Lead'],
  Marketing: ['Marketing Specialist', 'Content Lead', 'Marketing Manager'],
  Sales: ['Account Executive', 'Sales Manager', 'Solutions Engineer'],
  Support: ['Support Engineer', 'Support Lead'],
  Finance: ['Analyst', 'Controller', 'Finance Manager'],
  People: ['Recruiter', 'People Partner', 'People Lead'],
};

function det(seed: number, max: number): number {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % max | 0;
}

function buildEmployees(): Employee[] {
  const total = 120;
  const employees: Employee[] = [];
  for (let i = 0; i < total; i += 1) {
    const first = FIRST_NAMES[det(i + 1, FIRST_NAMES.length)] ?? 'Alex';
    const last = LAST_NAMES[det(i * 31 + 7, LAST_NAMES.length)] ?? 'Doe';
    const dept = DEPARTMENTS[det(i * 17 + 3, DEPARTMENTS.length)] ?? 'Engineering';
    const roleOptions = ROLE_BY_DEPT[dept] ?? ['Specialist'];
    const role = roleOptions[det(i * 11 + 5, roleOptions.length)] ?? 'Specialist';
    const status: EmployeeStatus =
      i % 23 === 0 ? 'terminated' : i % 19 === 0 ? 'on-leave' : 'active';
    const startOffset = -((i * 37) % 1100) - 14;
    const salary = 55000 + (i * 911) % 145000;
    const id = `emp-${String(i + 1).padStart(3, '0')}`;
    // First 8 are managers; rest report to one of them by department alignment.
    const managerId =
      i < 8 ? null : `emp-${String(((i * 13) % 8) + 1).padStart(3, '0')}`;
    employees.push({
      id,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      department: dept,
      role,
      status,
      startDate: daysFromBase(startOffset),
      salary,
      managerId,
    });
  }
  return employees;
}

export const EMPLOYEES: Array<Employee> = buildEmployees();

export const EMPLOYEE_DEPARTMENTS = DEPARTMENTS;

/** Returns employees with `reports` populated (one level only). */
export function getEmployeesWithReports(): Employee[] {
  const byMgr = new Map<string, Employee[]>();
  for (const e of EMPLOYEES) {
    if (e.managerId === null) continue;
    const list = byMgr.get(e.managerId);
    if (list === undefined) byMgr.set(e.managerId, [e]);
    else list.push(e);
  }
  return EMPLOYEES.map((e) => ({ ...e, reports: byMgr.get(e.id) ?? [] }));
}

/* --------------------------------- Orders -------------------------------- */

const CUSTOMERS = [
  'Acme Inc.',
  'Globex',
  'Initech',
  'Umbrella',
  'Soylent',
  'Hooli',
  'Pied Piper',
  'Wayne Industries',
  'Stark Industries',
  'Wonka',
  'Cyberdyne',
  'Tyrell',
  'Massive Dynamic',
];

const SKUS = [
  ['SKU-AX1', 'Premium membership'],
  ['SKU-BX2', 'Annual subscription'],
  ['SKU-CX3', 'Pro plan add-on'],
  ['SKU-DX4', 'Workshop ticket'],
  ['SKU-EX5', 'API call pack'],
  ['SKU-FX6', 'Storage upgrade'],
  ['SKU-GX7', 'Onboarding service'],
  ['SKU-HX8', 'Branded merch'],
] as const;

function buildOrderItems(seed: number): { items: OrderItem[]; total: number } {
  const count = 1 + (seed % 4);
  const items: OrderItem[] = [];
  for (let j = 0; j < count; j += 1) {
    const sku = SKUS[(seed + j * 3) % SKUS.length]!;
    const qty = 1 + ((seed + j * 7) % 5);
    const unitPrice = 25 + (((seed + j) * 113) % 480);
    items.push({ sku: sku[0], name: sku[1], qty, unitPrice });
  }
  const total = items.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);
  return { items, total };
}

function buildOrders(): Order[] {
  const total = 250;
  const orders: Order[] = [];
  for (let i = 0; i < total; i += 1) {
    const { items, total: amount } = buildOrderItems(i + 1);
    const status: OrderStatus = (
      ['pending', 'paid', 'shipped', 'delivered', 'refunded'] as OrderStatus[]
    )[i % 5]!;
    const placedOffset = -((i * 5) % 170);
    const shippedOffset = status === 'shipped' || status === 'delivered' ? placedOffset + 2 : null;
    orders.push({
      id: `ord-${String(i + 1).padStart(4, '0')}`,
      orderNumber: `#${String(7000 + i).padStart(5, '0')}`,
      customerName: CUSTOMERS[i % CUSTOMERS.length]!,
      items,
      total: amount,
      currency: i % 5 === 0 ? 'EUR' : 'USD',
      status,
      placedAt: daysFromBase(placedOffset),
      shippedAt: shippedOffset === null ? null : daysFromBase(shippedOffset),
    });
  }
  return orders;
}

export const ORDERS: Array<Order> = buildOrders();

/* ------------------------------- Projects -------------------------------- */

function buildProjects(): Project[] {
  const tags = [
    ['platform', 'core'],
    ['growth', 'experiment'],
    ['mobile', 'native'],
    ['analytics'],
    ['infra'],
    ['ai'],
    ['design-system'],
    ['compliance'],
  ];
  const names = [
    'Atlas',
    'Beacon',
    'Compass',
    'Drift',
    'Echo',
    'Forge',
    'Glow',
    'Halo',
    'Iris',
    'Jet',
    'Kite',
    'Lumen',
  ];
  const total = 40;
  const projects: Project[] = [];
  for (let i = 0; i < total; i += 1) {
    const name = `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`;
    const status: ProjectStatus = (
      ['planning', 'active', 'on-hold', 'shipped'] as ProjectStatus[]
    )[i % 4]!;
    const owner =
      `${FIRST_NAMES[(i * 7) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 5) % LAST_NAMES.length]}`;
    const budget = 25000 + (i * 6700) % 480000;
    const progress = (i * 13) % 100;
    const startOffset = -((i * 9) % 200) - 30;
    const dueOffset = startOffset + 60 + ((i * 17) % 180);
    projects.push({
      id: `proj-${String(i + 1).padStart(3, '0')}`,
      name,
      owner,
      status,
      budget,
      progress,
      startDate: daysFromBase(startOffset),
      dueDate: daysFromBase(dueOffset),
      tags: tags[i % tags.length] ?? [],
    });
  }
  // Group every 4 successive projects under the first as subProjects (depth 2),
  // and the first 3 top-level projects also gain one nested child each (depth 3).
  const tree: Project[] = [];
  for (let i = 0; i < projects.length; i += 4) {
    const head = projects[i]!;
    const children = projects.slice(i + 1, i + 4);
    if (i < 3 && children[0] !== undefined) {
      children[0] = {
        ...children[0],
        subProjects: projects.slice(i + 4, i + 6),
      };
    }
    tree.push({ ...head, subProjects: children });
  }
  return tree;
}

export const PROJECTS: Array<Project> = buildProjects();

/* ------------------------------- Invoices -------------------------------- */

const VENDORS = [
  'NorthBeam Cloud',
  'PixelForge Studio',
  'Hexa Hosting',
  'Lumiere Marketing',
  'Crisp Analytics',
  'OctoLogix Freight',
  'PaperTrail Legal',
  'Verdant Office',
  'Forge & Co Hardware',
  'Quartz Print Shop',
];

function buildInvoiceLines(seed: number): { lines: { description: string; qty: number; unit: number; amount: number }[]; total: number } {
  const titles = [
    'Hosting (month)',
    'Design retainer',
    'Consulting hours',
    'Annual license',
    'Hardware purchase',
    'Marketing services',
    'Travel reimbursement',
  ];
  const count = 2 + (seed % 3);
  const lines: { description: string; qty: number; unit: number; amount: number }[] = [];
  for (let j = 0; j < count; j += 1) {
    const description = titles[(seed + j * 5) % titles.length]!;
    const qty = 1 + ((seed + j * 3) % 6);
    const unit = 80 + ((seed * 7 + j * 23) % 1100);
    lines.push({ description, qty, unit, amount: qty * unit });
  }
  const total = lines.reduce((acc, l) => acc + l.amount, 0);
  return { lines, total };
}

function buildInvoices(): Invoice[] {
  const total = 80;
  const invoices: Invoice[] = [];
  for (let i = 0; i < total; i += 1) {
    const { lines, total: amount } = buildInvoiceLines(i + 1);
    const status: InvoiceStatus = (
      ['draft', 'sent', 'paid', 'overdue', 'void'] as InvoiceStatus[]
    )[i % 5]!;
    const issuedOffset = -((i * 4) % 180) - 5;
    const dueOffset = issuedOffset + 30;
    invoices.push({
      id: `inv-${String(i + 1).padStart(4, '0')}`,
      number: `INV-${String(2000 + i).padStart(5, '0')}`,
      vendor: VENDORS[i % VENDORS.length]!,
      issuedAt: daysFromBase(issuedOffset),
      dueAt: daysFromBase(dueOffset),
      amount,
      currency: i % 6 === 0 ? 'EUR' : 'USD',
      status,
      lineItems: lines,
    });
  }
  return invoices;
}

export const INVOICES: Array<Invoice> = buildInvoices();

/* ----------------------------- Deployments ------------------------------- */

const BRANCHES = [
  'main',
  'release/2026.05',
  'feature/checkout-v2',
  'hotfix/auth-loop',
  'feature/dashboard-refresh',
  'feature/i18n-arabic',
];

function buildDeployments(): Deployment[] {
  const total = 30;
  const out: Deployment[] = [];
  for (let i = 0; i < total; i += 1) {
    const env: DeploymentEnv = (['dev', 'staging', 'prod'] as DeploymentEnv[])[i % 3]!;
    const status: DeploymentStatus = (
      ['queued', 'running', 'success', 'success', 'success', 'failed', 'rolled-back'] as DeploymentStatus[]
    )[i % 7]!;
    out.push({
      id: `dep-${String(i + 1).padStart(3, '0')}`,
      commit: hex8(i + 1),
      branch: BRANCHES[i % BRANCHES.length]!,
      environment: env,
      deployer: `${FIRST_NAMES[(i * 3) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 11) % LAST_NAMES.length]}`,
      status,
      durationMs: 30_000 + ((i * 1373) % 480_000),
      deployedAt: daysFromBase(-(i * 1.3)),
    });
  }
  return out;
}

function hex8(n: number): string {
  const r = (n * 2654435761) >>> 0;
  return r.toString(16).padStart(8, '0').slice(0, 8);
}

export const DEPLOYMENTS: Array<Deployment> = buildDeployments();
