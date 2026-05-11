import { useState } from 'react';
import { z } from 'zod';
import { User, Briefcase, Settings, Building2, ListChecks } from 'lucide-react';
import { FormWizard, FormWizardStep } from './FormWizard';
import type { StepIndicatorVariant, WizardOrientation } from './FormWizard.types';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Button } from '@/components/primitives/Button';

export default { title: 'Forms/FormWizard', component: FormWizard };

/* -------------------------------------------------------------------------- */

interface NewUserValues {
  email: string;
  fullName: string;
  role: string;
}

const newUserFull = z.object({
  email: z.string().min(1).email(),
  fullName: z.string().min(1),
  role: z.string().min(1),
});
const newUserStep1 = z.object({
  email: z.string().min(1, 'Email required').email('Invalid email'),
});
const newUserStep2 = z.object({ fullName: z.string().min(1, 'Name required') });
const newUserStep3 = z.object({ role: z.string().min(1, 'Role required') });

export const ThreeStepHorizontalNumbered = {
  render: () => (
    <FormWizard
      schema={newUserFull}
      defaultValues={{ email: '', fullName: '', role: '' }}
      onSubmit={(values) => {
        // eslint-disable-next-line no-alert
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <FormWizardStep<NewUserValues>
        id="account"
        title="Account"
        description="Where we'll reach you"
        schema={newUserStep1}
        render={({ form }) => (
          <FormField label="Email" error={form.formState.errors.email?.message}>
            <Input
              type="email"
              placeholder="you@example.com"
              {...form.register('email')}
            />
          </FormField>
        )}
      />
      <FormWizardStep<NewUserValues>
        id="profile"
        title="Profile"
        description="A bit about you"
        schema={newUserStep2}
        render={({ form }) => (
          <FormField label="Full name" error={form.formState.errors.fullName?.message}>
            <Input {...form.register('fullName')} />
          </FormField>
        )}
      />
      <FormWizardStep<NewUserValues>
        id="permissions"
        title="Permissions"
        description="Pick a role"
        schema={newUserStep3}
        render={({ form }) => (
          <FormField label="Role" error={form.formState.errors.role?.message}>
            <Input placeholder="admin / editor / viewer" {...form.register('role')} />
          </FormField>
        )}
      />
    </FormWizard>
  ),
};

/* -------------------------------------------------------------------------- */

interface FourStepValues {
  email: string;
  bio: string;
  workspace: string;
  agreed: boolean;
}

const fourFull = z.object({
  email: z.string().min(1).email(),
  bio: z.string().min(1),
  workspace: z.string().min(1),
  agreed: z.boolean(),
});
const fourStep1 = z.object({ email: z.string().min(1).email() });
const fourStep2 = z.object({ bio: z.string().min(1) });
const fourStep3 = z.object({ workspace: z.string().min(1) });

export const VerticalWithIconsAndDescriptions = {
  render: () => (
    <div className="max-w-3xl">
      <FormWizard
        schema={fourFull}
        defaultValues={{ email: '', bio: '', workspace: '', agreed: false }}
        orientation="vertical"
        stepIndicatorVariant="icons"
        showSummaryStep
        onSubmit={(v) => {
          // eslint-disable-next-line no-alert
          alert(JSON.stringify(v, null, 2));
        }}
      >
        <FormWizardStep<FourStepValues>
          id="account"
          title="Account"
          description="Email and identity"
          icon={<User className="h-4 w-4" />}
          schema={fourStep1}
          render={({ form }) => (
            <FormField label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register('email')} />
            </FormField>
          )}
        />
        <FormWizardStep<FourStepValues>
          id="profile"
          title="Profile"
          description="What people see"
          icon={<Briefcase className="h-4 w-4" />}
          schema={fourStep2}
          render={({ form }) => (
            <FormField label="Bio" error={form.formState.errors.bio?.message}>
              <Textarea rows={3} {...form.register('bio')} />
            </FormField>
          )}
        />
        <FormWizardStep<FourStepValues>
          id="workspace"
          title="Workspace"
          description="Where you'll work"
          icon={<Building2 className="h-4 w-4" />}
          schema={fourStep3}
          render={({ form }) => (
            <FormField
              label="Workspace name"
              error={form.formState.errors.workspace?.message}
            >
              <Input {...form.register('workspace')} />
            </FormField>
          )}
        />
      </FormWizard>
    </div>
  ),
};

/* -------------------------------------------------------------------------- */

export const MixedStatesHiddenDisabled = {
  render: () => (
    <FormWizard
      schema={newUserFull}
      defaultValues={{ email: '', fullName: '', role: '' }}
      onSubmit={() => undefined}
    >
      <FormWizardStep<NewUserValues>
        id="account"
        title="Account"
        schema={newUserStep1}
        render={({ form }) => (
          <FormField label="Email" error={form.formState.errors.email?.message}>
            <Input {...form.register('email')} />
          </FormField>
        )}
      />
      <FormWizardStep<NewUserValues>
        id="profile"
        title="Profile"
        schema={newUserStep2}
        disabled
        disabledReason="Locked until billing on file"
        render={() => null}
      />
      <FormWizardStep<NewUserValues>
        id="locked"
        title="Hidden step"
        hidden
        render={() => null}
      />
      <FormWizardStep<NewUserValues>
        id="permissions"
        title="Permissions"
        schema={newUserStep3}
        clickable={false}
        render={({ form }) => (
          <FormField label="Role" error={form.formState.errors.role?.message}>
            <Input {...form.register('role')} />
          </FormField>
        )}
      />
    </FormWizard>
  ),
};

/* -------------------------------------------------------------------------- */

export const ResponsiveOrientation = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <FormWizard
      schema={newUserFull}
      defaultValues={{ email: '', fullName: '', role: '' }}
      responsiveOrientation
      onSubmit={() => undefined}
    >
      <FormWizardStep<NewUserValues>
        id="account"
        title="Account"
        description="Email"
        schema={newUserStep1}
        render={({ form }) => (
          <FormField label="Email" error={form.formState.errors.email?.message}>
            <Input {...form.register('email')} />
          </FormField>
        )}
      />
      <FormWizardStep<NewUserValues>
        id="profile"
        title="Profile"
        description="Name"
        schema={newUserStep2}
        render={({ form }) => (
          <FormField label="Full name" error={form.formState.errors.fullName?.message}>
            <Input {...form.register('fullName')} />
          </FormField>
        )}
      />
      <FormWizardStep<NewUserValues>
        id="permissions"
        title="Permissions"
        description="Role"
        schema={newUserStep3}
        render={({ form }) => (
          <FormField label="Role" error={form.formState.errors.role?.message}>
            <Input {...form.register('role')} />
          </FormField>
        )}
      />
    </FormWizard>
  ),
};

/* -------------------------------------------------------------------------- */

export const WithPersistKey = {
  render: () => (
    <FormWizard
      schema={newUserFull}
      defaultValues={{ email: '', fullName: '', role: '' }}
      persistKey="story-wizard-persist"
      onSubmit={() => undefined}
    >
      <FormWizardStep<NewUserValues>
        id="account"
        title="Account"
        schema={newUserStep1}
        render={({ form }) => (
          <FormField label="Email" error={form.formState.errors.email?.message}>
            <Input {...form.register('email')} />
          </FormField>
        )}
      />
      <FormWizardStep<NewUserValues>
        id="profile"
        title="Profile"
        schema={newUserStep2}
        render={({ form }) => (
          <FormField label="Full name" error={form.formState.errors.fullName?.message}>
            <Input {...form.register('fullName')} />
          </FormField>
        )}
      />
      <FormWizardStep<NewUserValues>
        id="permissions"
        title="Permissions"
        schema={newUserStep3}
        render={({ form }) => (
          <FormField label="Role" error={form.formState.errors.role?.message}>
            <Input {...form.register('role')} />
          </FormField>
        )}
      />
    </FormWizard>
  ),
};

/* -------------------------------------------------------------------------- */

export const SwitchableOrientation = {
  render: () => {
    function Demo() {
      const [orientation, setOrientation] = useState<WizardOrientation>('horizontal');
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Orientation:</span>
            <Button
              size="sm"
              variant={orientation === 'horizontal' ? 'primary' : 'outline'}
              onClick={() => setOrientation('horizontal')}
            >
              Horizontal
            </Button>
            <Button
              size="sm"
              variant={orientation === 'vertical' ? 'primary' : 'outline'}
              onClick={() => setOrientation('vertical')}
            >
              Vertical
            </Button>
          </div>
          <FormWizard
            schema={newUserFull}
            defaultValues={{ email: '', fullName: '', role: '' }}
            orientation={orientation}
            onSubmit={() => undefined}
          >
            <FormWizardStep<NewUserValues>
              id="account"
              title="Account"
              description="Email"
              icon={<User className="h-4 w-4" />}
              schema={newUserStep1}
              render={({ form }) => (
                <FormField label="Email" error={form.formState.errors.email?.message}>
                  <Input {...form.register('email')} />
                </FormField>
              )}
            />
            <FormWizardStep<NewUserValues>
              id="profile"
              title="Profile"
              description="Name"
              icon={<Briefcase className="h-4 w-4" />}
              schema={newUserStep2}
              render={({ form }) => (
                <FormField
                  label="Full name"
                  error={form.formState.errors.fullName?.message}
                >
                  <Input {...form.register('fullName')} />
                </FormField>
              )}
            />
            <FormWizardStep<NewUserValues>
              id="permissions"
              title="Permissions"
              description="Role"
              icon={<Settings className="h-4 w-4" />}
              schema={newUserStep3}
              render={({ form }) => (
                <FormField label="Role" error={form.formState.errors.role?.message}>
                  <Input {...form.register('role')} />
                </FormField>
              )}
            />
          </FormWizard>
        </div>
      );
    }
    return <Demo />;
  },
};

/* -------------------------------------------------------------------------- */

export const CompactMode = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <FormWizard
      schema={newUserFull}
      defaultValues={{ email: '', fullName: '', role: '' }}
      compactBelow="md"
      onSubmit={() => undefined}
    >
      <FormWizardStep<NewUserValues>
        id="account"
        title="Account"
        schema={newUserStep1}
        render={({ form }) => (
          <FormField label="Email" error={form.formState.errors.email?.message}>
            <Input {...form.register('email')} />
          </FormField>
        )}
      />
      <FormWizardStep<NewUserValues>
        id="profile"
        title="Profile"
        schema={newUserStep2}
        render={({ form }) => (
          <FormField label="Full name" error={form.formState.errors.fullName?.message}>
            <Input {...form.register('fullName')} />
          </FormField>
        )}
      />
      <FormWizardStep<NewUserValues>
        id="permissions"
        title="Permissions"
        schema={newUserStep3}
        render={({ form }) => (
          <FormField label="Role" error={form.formState.errors.role?.message}>
            <Input {...form.register('role')} />
          </FormField>
        )}
      />
    </FormWizard>
  ),
};

/* -------------------------------------------------------------------------- */

export const VariantPicker = {
  render: () => {
    function Demo() {
      const variants: StepIndicatorVariant[] = ['numbered', 'icons', 'dots', 'progress'];
      const [variant, setVariant] = useState<StepIndicatorVariant>('numbered');
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Variant:</span>
            {variants.map((v) => (
              <Button
                key={v}
                size="sm"
                variant={variant === v ? 'primary' : 'outline'}
                onClick={() => setVariant(v)}
              >
                {v}
              </Button>
            ))}
          </div>
          <FormWizard
            schema={newUserFull}
            defaultValues={{ email: '', fullName: '', role: '' }}
            stepIndicatorVariant={variant}
            onSubmit={() => undefined}
          >
            <FormWizardStep<NewUserValues>
              id="a"
              title="Account"
              icon={<User className="h-4 w-4" />}
              schema={newUserStep1}
              render={({ form }) => (
                <FormField label="Email" error={form.formState.errors.email?.message}>
                  <Input {...form.register('email')} />
                </FormField>
              )}
            />
            <FormWizardStep<NewUserValues>
              id="b"
              title="Profile"
              icon={<Briefcase className="h-4 w-4" />}
              schema={newUserStep2}
              render={({ form }) => (
                <FormField
                  label="Full name"
                  error={form.formState.errors.fullName?.message}
                >
                  <Input {...form.register('fullName')} />
                </FormField>
              )}
            />
            <FormWizardStep<NewUserValues>
              id="c"
              title="Done"
              icon={<ListChecks className="h-4 w-4" />}
              schema={newUserStep3}
              render={({ form }) => (
                <FormField label="Role" error={form.formState.errors.role?.message}>
                  <Input {...form.register('role')} />
                </FormField>
              )}
            />
          </FormWizard>
        </div>
      );
    }
    return <Demo />;
  },
};
