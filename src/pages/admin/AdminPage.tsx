import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/auth';

export function AdminPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-lg font-semibold">Admin area</h1>
          <p className="text-sm text-foreground-muted">
            Restricted to users with the <code>admin</code> role.
          </p>
        </div>
      </div>

      {user !== null ? (
        <div className="rounded-md border border-border bg-surface p-4 text-sm text-foreground-muted">
          Signed in as <strong className="text-foreground">{user.name}</strong> ({user.email}) with
          roles <code className="font-mono">{user.roles.join(', ')}</code>.
        </div>
      ) : null}
    </div>
  );
}
