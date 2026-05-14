import { useState } from 'react';
import { CheckCircle2, FlaskConical, Info, Save, Send, XCircle } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/data-display/Card';
import { Alert } from '@/components/feedback/Alert';
import { Progress } from '@/components/feedback/Progress';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Switch } from '@/components/forms/Switch';
import { Label } from '@/components/forms/Label';
import { useToast } from '@/context/ToastProvider';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { MOCK_EMAIL, type SimsEmailConfig, type EmailSecurity } from '../data';

export function EmailConfigPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<SimsEmailConfig>(MOCK_EMAIL);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);

  const update = <K extends keyof SimsEmailConfig>(k: K, v: SimsEmailConfig[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const test = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      const ok = form.host.includes('smtp') && form.port > 0;
      setTesting(false);
      setTestResult(ok ? 'ok' : 'fail');
      if (ok) toast.success('SMTP test connection succeeded');
      else toast.error('SMTP test failed — check host and port');
    }, 1200);
  };

  return (
    <>
      <SimsPageHeader
        title="Email Configuration"
        description="SMTP settings used for outgoing transactional email."
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<FlaskConical className="h-4 w-4" />}
              disabled={testing}
              onClick={test}
            >
              {testing ? 'Testing…' : 'Test connection'}
            </Button>
            <Button
              variant="primary"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={() => toast.success('Email configuration saved')}
            >
              Save
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_360px]">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>SMTP server</CardTitle>
            <CardDescription>Outgoing mail server credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_140px] gap-3">
              <div className="space-y-1">
                <Label htmlFor="sims-email-host">Host</Label>
                <Input
                  id="sims-email-host"
                  value={form.host}
                  onChange={(e) => update('host', e.target.value)}
                />
                <p className="text-xs text-foreground-subtle">e.g. smtp.school.local</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="sims-email-port">Port</Label>
                <Input
                  id="sims-email-port"
                  type="number"
                  value={form.port}
                  onChange={(e) => update('port', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="sims-email-sec">Security</Label>
              <Select
                id="sims-email-sec"
                value={form.security}
                onChange={(e) => update('security', e.target.value as EmailSecurity)}
              >
                <option value="none">None (insecure)</option>
                <option value="ssl">SSL</option>
                <option value="tls">STARTTLS</option>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-semibold">Require authentication</p>
                <p className="text-xs text-foreground-muted">
                  Server requires a username and password to relay mail.
                </p>
              </div>
              <Switch checked={form.auth} onChange={(e) => update('auth', e.target.checked)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sims-email-user">Username</Label>
                <Input
                  id="sims-email-user"
                  value={form.username}
                  disabled={!form.auth}
                  onChange={(e) => update('username', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sims-email-pw">Password</Label>
                <Input
                  id="sims-email-pw"
                  type="password"
                  value={form.password}
                  disabled={!form.auth}
                  onChange={(e) => update('password', e.target.value)}
                />
              </div>
            </div>
            <div className="border-t border-border" />
            <p className="text-sm font-semibold">Sender identity</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sims-email-fromname">From name</Label>
                <Input
                  id="sims-email-fromname"
                  value={form.fromName}
                  onChange={(e) => update('fromName', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sims-email-fromaddr">From address</Label>
                <Input
                  id="sims-email-fromaddr"
                  value={form.fromAddress}
                  onChange={(e) => update('fromAddress', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Connection status</CardTitle>
            </CardHeader>
            <CardContent>
              {testing ? (
                <>
                  <Progress indeterminate className="mb-2" size="sm" />
                  <p className="text-xs text-foreground-muted">
                    Connecting to {form.host}:{form.port}…
                  </p>
                </>
              ) : testResult === 'ok' ? (
                <Alert
                  variant="success"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  description="Connected and authenticated successfully."
                />
              ) : testResult === 'fail' ? (
                <Alert
                  variant="danger"
                  icon={<XCircle className="h-4 w-4" />}
                  description="Could not reach SMTP server."
                />
              ) : (
                <Alert
                  variant="info"
                  icon={<Info className="h-4 w-4" />}
                  description="Run a test to verify these settings."
                />
              )}
              <ul className="mt-3 space-y-1.5 text-sm">
                <Row label="Host" value={form.host} />
                <Row label="Port" value={String(form.port)} />
                <Row label="Security" value={form.security.toUpperCase()} />
                <Row label="From" value={`${form.fromName} <${form.fromAddress}>`} />
              </ul>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Send test email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input defaultValue="arta.krasniqi@sims.edu" />
              <Button
                variant="outline"
                leftIcon={<Send className="h-4 w-4" />}
                onClick={() => toast.success('Test email queued for delivery')}
                className="w-full"
              >
                Send test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-xs text-foreground-muted">{label}</span>
      <span className="max-w-56 truncate font-mono text-xs">{value}</span>
    </li>
  );
}
