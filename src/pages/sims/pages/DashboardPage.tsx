import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Calendar, Plus, ShieldCheck, UsersRound } from 'lucide-react';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/data-display/Card';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { SimsStatCard } from '../components/SimsStatCard';
import { MOCK_DASHBOARD, MOCK_HOLIDAYS_2026, MOCK_LOGS } from '../data';

export function DashboardPage() {
  const navigate = useNavigate();
  const stats = MOCK_DASHBOARD;
  const logs = MOCK_LOGS;
  const holidays = MOCK_HOLIDAYS_2026;

  return (
    <>
      <SimsPageHeader
        title="Dashboard"
        description="Welcome back, Arta. Here's what's happening today."
        actions={
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            New Action
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SimsStatCard
          Icon={UsersRound}
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend="up"
          trendValue="+4.2%"
        />
        <SimsStatCard
          Icon={ShieldCheck}
          label="Active Roles"
          value={stats.activeRoles}
          trend="flat"
          trendValue="0"
        />
        <SimsStatCard
          Icon={Bell}
          label="Pending Notifications"
          value={stats.pendingNotifs}
          trend="down"
          trendValue="-12%"
        />
        <SimsStatCard
          Icon={Calendar}
          label="Holiday Days Remaining"
          value={stats.holidayDaysRemaining}
          trend="flat"
          trendValue="this year"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card variant="outlined">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </div>
            <Button
              variant="link"
              size="sm"
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              onClick={() => navigate('/sims/administration/logs')}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {logs.slice(0, 6).map((log) => {
                const tone =
                  log.level === 'Error' ? 'danger' : log.level === 'Warning' ? 'warning' : 'info';
                return (
                  <li key={log.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="w-14 shrink-0 font-mono text-xs text-foreground-muted">
                      {new Date(log.ts).toTimeString().slice(0, 5)}
                    </span>
                    <Badge variant={tone} size="sm" className="w-20 justify-center">
                      {log.level}
                    </Badge>
                    <span className="truncate text-foreground">{log.message}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Upcoming Holidays</CardTitle>
              <CardDescription>Year 2026</CardDescription>
            </div>
            <Button
              variant="link"
              size="sm"
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              onClick={() => navigate('/sims/administration/holidays')}
            >
              Manage
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {holidays.slice(0, 6).map((h) => {
                const d = new Date(h.date);
                return (
                  <li key={h.date} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                      <span className="text-[9px] font-bold uppercase tracking-wide">
                        {d.toLocaleString('en', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{h.name}</p>
                      <p className="text-xs text-foreground-muted">
                        {d.toLocaleDateString('en', { weekday: 'long' })}
                      </p>
                    </div>
                    <Badge variant="primary" size="sm">
                      Public
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
