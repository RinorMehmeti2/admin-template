import { useState } from 'react';
import {
  Step,
  StepDescription,
  StepIndicator,
  StepLabel,
  Stepper,
} from '@/components/navigation/Stepper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/navigation/Tabs';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/primitives/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { FormField, Input } from '@/components/forms';
import { useToast } from '@/context/ToastProvider';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { DemoBreadcrumbs } from './LayoutDemo';

export function SettingsPage() {
  const { toast } = useToast();
  const [workspaceName, setWorkspaceName] = useState('Acme Inc.');
  const [savedName, setSavedName] = useState(workspaceName);
  const isDirty = workspaceName !== savedName;

  return (
    <div>
      <div className="mb-3">
        <DemoBreadcrumbs items={[{ label: 'Dashboard', to: '/layout' }, { label: 'Settings' }]} />
      </div>
      <SimsPageHeader title="Settings" description="Workspace preferences and integrations." />

      <Tabs defaultValue="general" orientation="vertical" variant="underline">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Alert
            variant="info"
            title="Heads up"
            description="Changes apply across all workspaces."
          />
          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="text-base">Workspace</CardTitle>
              <p className="mt-1 text-sm text-foreground-muted">
                Update your workspace display name.
              </p>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm">
                <FormField label="Workspace name">
                  <Input
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.currentTarget.value)}
                  />
                </FormField>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setWorkspaceName(savedName)}
                  disabled={!isDirty}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSavedName(workspaceName);
                    toast.success('Settings saved');
                  }}
                  disabled={!isDirty}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <p className="text-sm text-foreground-muted">No integrations connected yet.</p>
        </TabsContent>

        <TabsContent value="billing">
          <p className="text-sm text-foreground-muted">Pro plan, $49 / month.</p>
        </TabsContent>

        <TabsContent value="onboarding">
          <Stepper className="max-w-2xl">
            <Step status="complete" index={0}>
              <StepIndicator />
              <div>
                <StepLabel>Account</StepLabel>
                <StepDescription>Created</StepDescription>
              </div>
            </Step>
            <Step status="active" index={1}>
              <StepIndicator />
              <div>
                <StepLabel>Profile</StepLabel>
                <StepDescription>In progress</StepDescription>
              </div>
            </Step>
            <Step status="idle" index={2}>
              <StepIndicator />
              <div>
                <StepLabel>Invite team</StepLabel>
                <StepDescription>Optional</StepDescription>
              </div>
            </Step>
          </Stepper>
        </TabsContent>
      </Tabs>
    </div>
  );
}
