// SIMS mock data + types. Ported from /SIMS/app.tsx. Plain in-memory data —
// pages use useState + these constants, no RTK Query / MSW.

export type UserStatus = 'Active' | 'Inactive';
export interface SimsUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  status: UserStatus;
  avatar: string;
}

export interface SimsRole {
  id: number;
  name: string;
  description: string;
  users: number;
}

export interface SimsHoliday {
  date: string;
  name: string;
}

export type LogLevel = 'Info' | 'Warning' | 'Error';
export interface SimsLogEntry {
  id: number;
  ts: string;
  level: LogLevel;
  user: string;
  action: string;
  message: string;
}

export interface SimsNotification {
  id: number;
  iconKey: string;
  title: string;
  body: string;
  ts: string;
  unread: boolean;
}

export type DriftState = 'match' | 'mismatch' | 'missing' | 'extra';
export interface SimsDriftRow {
  table: string;
  column: string;
  expected: string;
  actual: string;
  state: DriftState;
}

export interface SimsOperation {
  id: number;
  key: string;
  label: string;
}

export interface SimsModule {
  id: number;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  operations: SimsOperation[];
}

export interface SimsMenuNode {
  id: number;
  label: string;
  path: string;
  iconKey: string;
  visible: boolean;
  children?: SimsMenuNode[];
}

export type EmailSecurity = 'none' | 'ssl' | 'tls';
export interface SimsEmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromName: string;
  fromAddress: string;
  security: EmailSecurity;
  auth: boolean;
}

export type NotifChannel = 'email' | 'sms' | 'inApp';
export interface SimsNotificationTemplate {
  id: number;
  key: string;
  name: string;
  trigger: string;
  channels: Record<NotifChannel, boolean>;
  lastSent: string;
}

export type ReportCategory = 'Academic' | 'Financial' | 'Operations';
export type ReportFormat = 'PDF' | 'XLSX' | 'CSV';
export interface SimsReport {
  id: number;
  name: string;
  description: string;
  category: ReportCategory;
  lastGenerated: string;
  rows: number;
  format: ReportFormat;
}

export interface SimsLookupRow {
  code: string;
  label: string;
  sort: number;
  enabled: boolean;
}
export interface SimsLookupTable {
  id: number;
  name: string;
  description: string;
  rows: SimsLookupRow[];
}

export interface SimsThemeConfig {
  primary: string;
  secondary: string;
  fontHead: string;
  fontBody: string;
  radius: number;
  dense: boolean;
}

export interface SimsStats {
  enrolled: number;
  teachers: number;
  classes: number;
  avgAttendance: number;
  enrollmentTrend: { label: string; value: number }[];
  roleSplit: { label: string; value: number; color: string }[];
  attendanceByGrade: { label: string; value: number }[];
}

export interface SimsDashboardStats {
  totalUsers: number;
  activeRoles: number;
  pendingNotifs: number;
  holidayDaysRemaining: number;
}

export const MOCK_USERS: SimsUser[] = [
  {
    id: 1,
    name: 'Arta',
    surname: 'Krasniqi',
    email: 'arta.krasniqi@sims.edu',
    role: 'Admin',
    status: 'Active',
    avatar: 'AK',
  },
  {
    id: 2,
    name: 'Bledar',
    surname: 'Hoxha',
    email: 'bledar.hoxha@sims.edu',
    role: 'Teacher',
    status: 'Active',
    avatar: 'BH',
  },
  {
    id: 3,
    name: 'Driton',
    surname: 'Berisha',
    email: 'driton.berisha@sims.edu',
    role: 'Registrar',
    status: 'Active',
    avatar: 'DB',
  },
  {
    id: 4,
    name: 'Elira',
    surname: 'Shala',
    email: 'elira.shala@sims.edu',
    role: 'Teacher',
    status: 'Inactive',
    avatar: 'ES',
  },
  {
    id: 5,
    name: 'Festim',
    surname: 'Gashi',
    email: 'festim.gashi@sims.edu',
    role: 'Student',
    status: 'Active',
    avatar: 'FG',
  },
  {
    id: 6,
    name: 'Genta',
    surname: 'Selmani',
    email: 'genta.selmani@sims.edu',
    role: 'Auditor',
    status: 'Active',
    avatar: 'GS',
  },
  {
    id: 7,
    name: 'Hekuran',
    surname: 'Maloku',
    email: 'hekuran.maloku@sims.edu',
    role: 'Admin',
    status: 'Active',
    avatar: 'HM',
  },
  {
    id: 8,
    name: 'Ilirjana',
    surname: 'Mehmeti',
    email: 'ilirjana.mehmeti@sims.edu',
    role: 'Teacher',
    status: 'Active',
    avatar: 'IM',
  },
  {
    id: 9,
    name: 'Jeton',
    surname: 'Rexhepi',
    email: 'jeton.rexhepi@sims.edu',
    role: 'Parent',
    status: 'Inactive',
    avatar: 'JR',
  },
  {
    id: 10,
    name: 'Kujtim',
    surname: 'Bajrami',
    email: 'kujtim.bajrami@sims.edu',
    role: 'Student',
    status: 'Active',
    avatar: 'KB',
  },
  {
    id: 11,
    name: 'Liridona',
    surname: 'Pllana',
    email: 'liridona.pllana@sims.edu',
    role: 'Teacher',
    status: 'Active',
    avatar: 'LP',
  },
  {
    id: 12,
    name: 'Mirjeta',
    surname: 'Dervishi',
    email: 'mirjeta.dervishi@sims.edu',
    role: 'Registrar',
    status: 'Active',
    avatar: 'MD',
  },
];

export const MOCK_ROLES: SimsRole[] = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access; manages users, roles, settings.',
    users: 4,
  },
  {
    id: 2,
    name: 'Teacher',
    description: 'Manages classes, grades, attendance for assigned subjects.',
    users: 87,
  },
  {
    id: 3,
    name: 'Registrar',
    description: 'Enrolls students, manages records and transcripts.',
    users: 6,
  },
  { id: 4, name: 'Student', description: 'Views schedule, grades, assignments.', users: 1240 },
  { id: 5, name: 'Parent', description: 'Views child progress, attendance, fees.', users: 932 },
  { id: 6, name: 'Auditor', description: 'Read-only access to logs and reports.', users: 3 },
];

export const MOCK_HOLIDAYS_2026: SimsHoliday[] = [
  { date: '2026-01-01', name: 'New Year' },
  { date: '2026-02-17', name: 'Independence Day' },
  { date: '2026-04-05', name: 'Easter Monday' },
  { date: '2026-05-01', name: 'Labour Day' },
  { date: '2026-05-09', name: 'Europe Day' },
  { date: '2026-11-28', name: 'Flag Day' },
  { date: '2026-12-25', name: 'Christmas' },
];

export const MOCK_LOGS: SimsLogEntry[] = (() => {
  const levels: LogLevel[] = ['Info', 'Info', 'Info', 'Warning', 'Error', 'Info'];
  const users = [
    'arta.krasniqi',
    'bledar.hoxha',
    'system',
    'driton.berisha',
    'elira.shala',
    'hekuran.maloku',
  ];
  const actions: [string, string][] = [
    ['Login', 'User authenticated successfully'],
    ['User Updated', 'Updated profile for student #2204'],
    ['Permission Changed', 'Granted Reports.Export to role Auditor'],
    ['Failed Login', '3rd consecutive failed login from 10.4.12.88'],
    ['DB Error', 'Connection pool exhausted, retried in 1.2s'],
    ['Export', 'Exported logs.csv (4,328 rows)'],
    ['Holiday Added', 'Added "Independence Day" to year 2026'],
    ['Email Test', 'SMTP test connection succeeded'],
  ];
  const out: SimsLogEntry[] = [];
  for (let i = 0; i < 64; i++) {
    const a = actions[i % actions.length] ?? ['', ''];
    out.push({
      id: i + 1,
      ts: new Date(2026, 4, 4, 9 + (i % 9), (i * 7) % 60).toISOString(),
      level: levels[i % levels.length] ?? 'Info',
      user: users[i % users.length] ?? 'system',
      action: a[0],
      message: a[1],
    });
  }
  return out;
})();

export const MOCK_NOTIFS: SimsNotification[] = [
  {
    id: 1,
    iconKey: 'user-plus',
    title: 'New user registered',
    body: 'Festim Gashi (Student) created an account.',
    ts: '2 min ago',
    unread: true,
  },
  {
    id: 2,
    iconKey: 'alert-triangle',
    title: 'Failed login attempts',
    body: '3 failed attempts on bledar.hoxha@sims.edu',
    ts: '14 min ago',
    unread: true,
  },
  {
    id: 3,
    iconKey: 'calendar',
    title: 'Upcoming holiday',
    body: 'Independence Day is in 13 days.',
    ts: '1 hr ago',
    unread: true,
  },
  {
    id: 4,
    iconKey: 'mail',
    title: 'SMTP test failed',
    body: 'Connection refused on smtp.school.local:587',
    ts: '3 hr ago',
    unread: false,
  },
  {
    id: 5,
    iconKey: 'file-text',
    title: 'Report ready',
    body: 'Monthly attendance report is ready to download.',
    ts: 'Yesterday',
    unread: false,
  },
];

export const MOCK_DRIFT: SimsDriftRow[] = [
  { table: 'users', column: 'id', expected: 'uuid PK', actual: 'uuid PK', state: 'match' },
  {
    table: 'users',
    column: 'email',
    expected: 'varchar(255) UNIQUE',
    actual: 'varchar(255) UNIQUE',
    state: 'match',
  },
  {
    table: 'users',
    column: 'created_at',
    expected: 'timestamptz NOT NULL',
    actual: 'timestamp NOT NULL',
    state: 'mismatch',
  },
  {
    table: 'users',
    column: 'last_login_at',
    expected: 'timestamptz NULL',
    actual: '— missing —',
    state: 'missing',
  },
  {
    table: 'users',
    column: 'legacy_id',
    expected: '— not defined —',
    actual: 'integer',
    state: 'extra',
  },
  { table: 'roles', column: 'id', expected: 'uuid PK', actual: 'uuid PK', state: 'match' },
  {
    table: 'roles',
    column: 'name',
    expected: 'varchar(64) UNIQUE',
    actual: 'varchar(64)',
    state: 'mismatch',
  },
  {
    table: 'roles',
    column: 'description',
    expected: 'text NULL',
    actual: 'text NULL',
    state: 'match',
  },
  {
    table: 'permissions',
    column: 'role_id',
    expected: 'uuid FK',
    actual: 'uuid FK',
    state: 'match',
  },
  {
    table: 'permissions',
    column: 'op_key',
    expected: 'varchar(64) NOT NULL',
    actual: 'varchar(64) NOT NULL',
    state: 'match',
  },
  {
    table: 'enrollments',
    column: 'gpa',
    expected: '— not defined —',
    actual: 'numeric(3,2)',
    state: 'extra',
  },
  {
    table: 'enrollments',
    column: 'term_id',
    expected: 'uuid FK',
    actual: '— missing —',
    state: 'missing',
  },
];

export const MOCK_MODULES: SimsModule[] = [
  {
    id: 1,
    key: 'users',
    name: 'Users',
    enabled: true,
    description: 'User accounts, profiles, sessions, password policy.',
    operations: [
      { id: 1, key: 'view', label: 'View' },
      { id: 2, key: 'create', label: 'Create' },
      { id: 3, key: 'update', label: 'Update' },
      { id: 4, key: 'delete', label: 'Delete' },
      { id: 5, key: 'impersonate', label: 'Impersonate' },
    ],
  },
  {
    id: 2,
    key: 'enrollments',
    name: 'Enrollments',
    enabled: true,
    description: 'Student enrollment lifecycle, transfers, withdrawals.',
    operations: [
      { id: 1, key: 'view', label: 'View' },
      { id: 2, key: 'enroll', label: 'Enroll' },
      { id: 3, key: 'transfer', label: 'Transfer' },
      { id: 4, key: 'withdraw', label: 'Withdraw' },
    ],
  },
  {
    id: 3,
    key: 'grades',
    name: 'Grades',
    enabled: true,
    description: 'Grade books, term grades, final grades, transcripts.',
    operations: [
      { id: 1, key: 'view', label: 'View' },
      { id: 2, key: 'enter', label: 'Enter' },
      { id: 3, key: 'override', label: 'Override' },
      { id: 4, key: 'publish', label: 'Publish' },
    ],
  },
  {
    id: 4,
    key: 'attendance',
    name: 'Attendance',
    enabled: true,
    description: 'Daily attendance, tardiness, excuses, reports.',
    operations: [
      { id: 1, key: 'view', label: 'View' },
      { id: 2, key: 'mark', label: 'Mark' },
      { id: 3, key: 'excuse', label: 'Excuse' },
    ],
  },
  {
    id: 5,
    key: 'finance',
    name: 'Finance',
    enabled: true,
    description: 'Tuition, fees, invoices, scholarships, refunds.',
    operations: [
      { id: 1, key: 'view', label: 'View' },
      { id: 2, key: 'invoice', label: 'Invoice' },
      { id: 3, key: 'refund', label: 'Refund' },
      { id: 4, key: 'waive', label: 'Waive' },
    ],
  },
  {
    id: 6,
    key: 'reports',
    name: 'Reports',
    enabled: true,
    description: 'Pre-built and custom reports across all modules.',
    operations: [
      { id: 1, key: 'view', label: 'View' },
      { id: 2, key: 'generate', label: 'Generate' },
      { id: 3, key: 'export', label: 'Export' },
      { id: 4, key: 'schedule', label: 'Schedule' },
    ],
  },
  {
    id: 7,
    key: 'library',
    name: 'Library',
    enabled: false,
    description: 'Book catalog, loans, returns, late fees.',
    operations: [
      { id: 1, key: 'view', label: 'View' },
      { id: 2, key: 'loan', label: 'Loan' },
      { id: 3, key: 'return', label: 'Return' },
    ],
  },
];

export const MOCK_MENU: SimsMenuNode[] = [
  { id: 1, label: 'Dashboard', path: '/dashboard', iconKey: 'layout-dashboard', visible: true },
  {
    id: 2,
    label: 'Academic',
    path: '/academic',
    iconKey: 'graduation-cap',
    visible: true,
    children: [
      { id: 21, label: 'Classes', path: '/academic/classes', iconKey: 'school', visible: true },
      {
        id: 22,
        label: 'Subjects',
        path: '/academic/subjects',
        iconKey: 'book-open',
        visible: true,
      },
      {
        id: 23,
        label: 'Grading',
        path: '/academic/grading',
        iconKey: 'check-square',
        visible: false,
      },
    ],
  },
  {
    id: 3,
    label: 'People',
    path: '/people',
    iconKey: 'users-round',
    visible: true,
    children: [
      { id: 31, label: 'Students', path: '/people/students', iconKey: 'user', visible: true },
      { id: 32, label: 'Teachers', path: '/people/teachers', iconKey: 'badge', visible: true },
      { id: 33, label: 'Parents', path: '/people/parents', iconKey: 'heart', visible: true },
    ],
  },
  { id: 4, label: 'Finance', path: '/finance', iconKey: 'wallet', visible: true },
  { id: 5, label: 'Reports', path: '/reports', iconKey: 'file-text', visible: true },
];

export const MOCK_EMAIL: SimsEmailConfig = {
  host: 'smtp.school.local',
  port: 587,
  username: 'noreply@sims.edu',
  password: '••••••••••',
  fromName: 'SIMS Notifications',
  fromAddress: 'noreply@sims.edu',
  security: 'tls',
  auth: true,
};

export const MOCK_NOTIF_TEMPLATES: SimsNotificationTemplate[] = [
  {
    id: 1,
    key: 'user.created',
    name: 'User created',
    trigger: 'When a new account is provisioned',
    channels: { email: true, sms: false, inApp: true },
    lastSent: '2 min ago',
  },
  {
    id: 2,
    key: 'auth.failed',
    name: 'Failed login',
    trigger: 'After 3 failed attempts',
    channels: { email: true, sms: true, inApp: true },
    lastSent: '14 min ago',
  },
  {
    id: 3,
    key: 'grade.published',
    name: 'Grade published',
    trigger: 'Teacher publishes term grades',
    channels: { email: true, sms: false, inApp: true },
    lastSent: 'Yesterday',
  },
  {
    id: 4,
    key: 'attendance.absent',
    name: 'Daily absence',
    trigger: 'Student marked absent',
    channels: { email: true, sms: true, inApp: false },
    lastSent: '1 hr ago',
  },
  {
    id: 5,
    key: 'invoice.due',
    name: 'Invoice due soon',
    trigger: '7 days before due date',
    channels: { email: true, sms: false, inApp: true },
    lastSent: '3 days ago',
  },
  {
    id: 6,
    key: 'holiday.reminder',
    name: 'Holiday reminder',
    trigger: '1 day before holiday',
    channels: { email: false, sms: false, inApp: true },
    lastSent: '5 days ago',
  },
  {
    id: 7,
    key: 'password.reset',
    name: 'Password reset',
    trigger: 'User initiates password reset',
    channels: { email: true, sms: false, inApp: false },
    lastSent: '8 hr ago',
  },
  {
    id: 8,
    key: 'report.ready',
    name: 'Report ready',
    trigger: 'Async report generation done',
    channels: { email: true, sms: false, inApp: true },
    lastSent: 'Yesterday',
  },
];

export const MOCK_REPORTS: SimsReport[] = [
  {
    id: 1,
    name: 'Monthly Attendance Summary',
    description: 'Attendance percentages broken down by class and grade.',
    category: 'Academic',
    lastGenerated: 'May 1, 2026',
    rows: 4328,
    format: 'PDF',
  },
  {
    id: 2,
    name: 'Year-end Grade Report',
    description: 'Per-student grade summary across all subjects.',
    category: 'Academic',
    lastGenerated: 'Apr 28, 2026',
    rows: 1240,
    format: 'XLSX',
  },
  {
    id: 3,
    name: 'Outstanding Invoices',
    description: 'Open invoices grouped by family with aging buckets.',
    category: 'Financial',
    lastGenerated: 'May 4, 2026',
    rows: 184,
    format: 'PDF',
  },
  {
    id: 4,
    name: 'Scholarship Awards',
    description: 'Active scholarships and disbursement schedule.',
    category: 'Financial',
    lastGenerated: 'Mar 15, 2026',
    rows: 67,
    format: 'XLSX',
  },
  {
    id: 5,
    name: 'Audit Log Export',
    description: 'Full audit trail for the selected period.',
    category: 'Operations',
    lastGenerated: 'May 5, 2026',
    rows: 12480,
    format: 'CSV',
  },
  {
    id: 6,
    name: 'Active Users by Role',
    description: 'Headcount per role with last-login date.',
    category: 'Operations',
    lastGenerated: 'May 5, 2026',
    rows: 2287,
    format: 'CSV',
  },
];

export const MOCK_STATS: SimsStats = {
  enrolled: 1240,
  teachers: 87,
  classes: 54,
  avgAttendance: 93.4,
  enrollmentTrend: [
    { label: 'Sep', value: 1180 },
    { label: 'Oct', value: 1198 },
    { label: 'Nov', value: 1205 },
    { label: 'Dec', value: 1212 },
    { label: 'Jan', value: 1219 },
    { label: 'Feb', value: 1224 },
    { label: 'Mar', value: 1230 },
    { label: 'Apr', value: 1236 },
    { label: 'May', value: 1240 },
  ],
  roleSplit: [
    { label: 'Students', value: 1240, color: 'var(--color-primary)' },
    { label: 'Parents', value: 932, color: 'var(--color-info)' },
    { label: 'Teachers', value: 87, color: 'var(--color-success)' },
    { label: 'Registrars', value: 6, color: 'var(--color-warning)' },
    { label: 'Admins', value: 4, color: 'var(--color-danger)' },
    { label: 'Auditors', value: 3, color: 'var(--color-secondary)' },
  ],
  attendanceByGrade: [
    { label: '1', value: 96 },
    { label: '2', value: 95 },
    { label: '3', value: 94 },
    { label: '4', value: 93 },
    { label: '5', value: 94 },
    { label: '6', value: 92 },
    { label: '7', value: 91 },
    { label: '8', value: 90 },
    { label: '9', value: 89 },
  ],
};

export const MOCK_DASHBOARD: SimsDashboardStats = {
  totalUsers: 2287,
  activeRoles: 6,
  pendingNotifs: 18,
  holidayDaysRemaining: 24,
};

export const MOCK_LOOKUPS: SimsLookupTable[] = [
  {
    id: 1,
    name: 'Grade levels',
    description: 'Standard grade levels recognised by the system.',
    rows: [
      { code: 'G1', label: 'Grade 1', sort: 1, enabled: true },
      { code: 'G2', label: 'Grade 2', sort: 2, enabled: true },
      { code: 'G3', label: 'Grade 3', sort: 3, enabled: true },
      { code: 'G4', label: 'Grade 4', sort: 4, enabled: true },
      { code: 'G5', label: 'Grade 5', sort: 5, enabled: true },
      { code: 'G6', label: 'Grade 6', sort: 6, enabled: true },
      { code: 'G7', label: 'Grade 7', sort: 7, enabled: true },
      { code: 'G8', label: 'Grade 8', sort: 8, enabled: true },
      { code: 'G9', label: 'Grade 9', sort: 9, enabled: true },
    ],
  },
  {
    id: 2,
    name: 'Attendance codes',
    description: 'Codes used when marking attendance.',
    rows: [
      { code: 'P', label: 'Present', sort: 1, enabled: true },
      { code: 'A', label: 'Absent', sort: 2, enabled: true },
      { code: 'T', label: 'Tardy', sort: 3, enabled: true },
      { code: 'E', label: 'Excused', sort: 4, enabled: true },
      { code: 'S', label: 'Suspended', sort: 5, enabled: false },
    ],
  },
  {
    id: 3,
    name: 'Document types',
    description: 'Document types accepted on the student profile.',
    rows: [
      { code: 'BC', label: 'Birth Certificate', sort: 1, enabled: true },
      { code: 'ID', label: 'National ID', sort: 2, enabled: true },
      { code: 'IMM', label: 'Immunisation Record', sort: 3, enabled: true },
      { code: 'TR', label: 'Prior Transcript', sort: 4, enabled: true },
      { code: 'GUARD', label: 'Guardianship Order', sort: 5, enabled: false },
    ],
  },
  {
    id: 4,
    name: 'Currencies',
    description: 'Currencies supported by Finance module.',
    rows: [
      { code: 'EUR', label: 'Euro', sort: 1, enabled: true },
      { code: 'USD', label: 'US Dollar', sort: 2, enabled: true },
      { code: 'GBP', label: 'British Pound', sort: 3, enabled: false },
      { code: 'CHF', label: 'Swiss Franc', sort: 4, enabled: false },
    ],
  },
];

export const MOCK_THEME: SimsThemeConfig = {
  primary: '#2D6A4F',
  secondary: '#74C69D',
  fontHead: 'Inter',
  fontBody: 'Inter',
  radius: 8,
  dense: false,
};
