import { useState } from 'react';
import { Bell, History, Mail, MessageSquare, MoreHorizontal, Plus, Megaphone } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { Switch } from '@/components/forms/Switch';
import { useToast } from '@/context/ToastProvider';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { SimsStatCard } from '../components/SimsStatCard';
import { MOCK_NOTIF_TEMPLATES, type NotifChannel, type SimsNotificationTemplate } from '../data';

const CHANNELS: NotifChannel[] = ['email', 'sms', 'inApp'];

export function NotificationsPage() {
  const { toast } = useToast();
  const [list, setList] = useState<SimsNotificationTemplate[]>(MOCK_NOTIF_TEMPLATES);

  const toggle = (id: number, ch: NotifChannel) => {
    setList((l) =>
      l.map((t) =>
        t.id === id ? { ...t, channels: { ...t.channels, [ch]: !t.channels[ch] } } : t,
      ),
    );
    const tpl = list.find((t) => t.id === id);
    if (tpl !== undefined)
      toast.info(`${tpl.name}: ${ch} ${tpl.channels[ch] ? 'disabled' : 'enabled'}`);
  };

  const counts = {
    total: list.length,
    email: list.filter((t) => t.channels.email).length,
    sms: list.filter((t) => t.channels.sms).length,
    inApp: list.filter((t) => t.channels.inApp).length,
  };

  return (
    <>
      <SimsPageHeader
        title="Notifications"
        description="Templates and delivery channels for system notifications."
        actions={
          <>
            <Button variant="outline" leftIcon={<History className="h-4 w-4" />}>
              Delivery history
            </Button>
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              New template
            </Button>
          </>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SimsStatCard Icon={Megaphone} label="Templates" value={counts.total} />
        <SimsStatCard Icon={Mail} label="Email enabled" value={counts.email} />
        <SimsStatCard Icon={MessageSquare} label="SMS enabled" value={counts.sms} />
        <SimsStatCard Icon={Bell} label="In-app enabled" value={counts.inApp} />
      </div>
      <div className="rounded-md border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead className="text-center" style={{ width: 90 }}>
                Email
              </TableHead>
              <TableHead className="text-center" style={{ width: 80 }}>
                SMS
              </TableHead>
              <TableHead className="text-center" style={{ width: 80 }}>
                In-app
              </TableHead>
              <TableHead style={{ width: 140 }}>Last sent</TableHead>
              <TableHead className="text-right" style={{ width: 60 }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <p className="font-semibold">{t.name}</p>
                  <p className="font-mono text-xs text-foreground-muted">{t.key}</p>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-foreground-muted">{t.trigger}</span>
                </TableCell>
                {CHANNELS.map((ch) => (
                  <TableCell key={ch} className="text-center">
                    <Switch
                      checked={t.channels[ch]}
                      onChange={() => toggle(t.id, ch)}
                      aria-label={`Toggle ${ch} for ${t.name}`}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <span className="text-xs text-foreground-muted">{t.lastSent}</span>
                </TableCell>
                <TableCell className="text-right">
                  <IconButton aria-label="More" variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
