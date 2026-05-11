import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { User, Briefcase, Settings } from 'lucide-react';
import { FormWizard, FormWizardStep, type FormWizardHandle } from './FormWizard';
import { Input, FormField } from '@/components/forms';
import { TooltipProvider } from '@/components/feedback/Tooltip';
import { ToastProvider } from '@/context/ToastProvider';
import { runAxe } from '@/test-utils/a11y';

/* -------------------------------------------------------------------------- */
/* Test helpers                                                               */
/* -------------------------------------------------------------------------- */

function mockMatchMedia(matchMobile: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      // Match mobile-ish (max-width) queries when matchMobile=true.
      matches: matchMobile && /max-width/.test(query),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
      onchange: null,
    })),
  });
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider position="top-right">
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </ToastProvider>
  );
}

interface BasicValues {
  name: string;
  bio: string;
  acceptTos: string;
}

const fullSchema = z.object({
  name: z.string().min(1, 'Name required'),
  bio: z.string().min(1, 'Bio required'),
  acceptTos: z.string().min(1, 'Acceptance required'),
});

const step1Schema = z.object({
  name: z.string().min(1, 'Name required'),
});
const step2Schema = z.object({
  bio: z.string().min(1, 'Bio required'),
});
const step3Schema = z.object({
  acceptTos: z.string().min(1, 'Acceptance required'),
});

interface BasicHarnessProps {
  onSubmit?: (values: BasicValues) => void;
  orientation?: 'horizontal' | 'vertical';
  allowSkip?: boolean;
  showSummaryStep?: boolean;
  variant?: 'numbered' | 'icons' | 'dots' | 'progress';
  persistKey?: string;
  autoRestore?: boolean;
  step2Disabled?: boolean;
  step2DisabledReason?: string;
  step2Hidden?: boolean;
  step3Clickable?: boolean;
  responsiveOrientation?: boolean;
  handleRef?: React.Ref<FormWizardHandle<BasicValues>>;
  defaults?: Partial<BasicValues>;
  iconsVariant?: boolean;
  compactBelow?: 'sm' | 'md' | 'lg' | 'xl';
}

function BasicHarness({
  onSubmit = () => undefined,
  orientation = 'horizontal',
  allowSkip,
  showSummaryStep,
  variant = 'numbered',
  persistKey,
  autoRestore,
  step2Disabled,
  step2DisabledReason,
  step2Hidden,
  step3Clickable,
  responsiveOrientation,
  handleRef,
  defaults,
  iconsVariant,
  compactBelow,
}: BasicHarnessProps) {
  return (
    <FormWizard<typeof fullSchema>
      schema={fullSchema}
      defaultValues={{
        name: defaults?.name ?? '',
        bio: defaults?.bio ?? '',
        acceptTos: defaults?.acceptTos ?? '',
      }}
      onSubmit={onSubmit}
      orientation={orientation}
      stepIndicatorVariant={variant}
      {...(allowSkip === true ? { allowSkip: true } : {})}
      {...(showSummaryStep === true ? { showSummaryStep: true } : {})}
      {...(persistKey !== undefined ? { persistKey } : {})}
      {...(autoRestore === true ? { autoRestore: true } : {})}
      {...(responsiveOrientation === true ? { responsiveOrientation: true } : {})}
      {...(handleRef !== undefined ? { ref: handleRef } : {})}
      {...(compactBelow !== undefined ? { compactBelow } : {})}
    >
      <FormWizardStep<BasicValues>
        id="account"
        title="Account"
        description="Your basic info"
        schema={step1Schema}
        {...(iconsVariant === true ? { icon: <User data-testid="step-icon-account" /> } : {})}
        render={({ form }) => (
          <FormField label="Name" error={form.formState.errors.name?.message}>
            <Input aria-label="Name" {...form.register('name')} />
          </FormField>
        )}
      />
      <FormWizardStep<BasicValues>
        id="profile"
        title="Profile"
        description="Tell us about yourself"
        schema={step2Schema}
        {...(step2Disabled === true ? { disabled: true } : {})}
        {...(step2DisabledReason !== undefined
          ? { disabledReason: step2DisabledReason }
          : {})}
        {...(step2Hidden === true ? { hidden: true } : {})}
        {...(iconsVariant === true
          ? { icon: <Briefcase data-testid="step-icon-profile" /> }
          : {})}
        render={({ form }) => (
          <FormField label="Bio" error={form.formState.errors.bio?.message}>
            <Input aria-label="Bio" {...form.register('bio')} />
          </FormField>
        )}
      />
      <FormWizardStep<BasicValues>
        id="settings"
        title="Settings"
        description="Final acceptance"
        schema={step3Schema}
        {...(step3Clickable !== undefined ? { clickable: step3Clickable } : {})}
        {...(iconsVariant === true ? { icon: <Settings data-testid="step-icon-settings" /> } : {})}
        render={({ form }) => (
          <FormField label="Accept ToS" error={form.formState.errors.acceptTos?.message}>
            <Input aria-label="Accept ToS" {...form.register('acceptTos')} />
          </FormField>
        )}
      />
    </FormWizard>
  );
}

function renderHarness(props: BasicHarnessProps = {}) {
  return render(
    <Wrap>
      <BasicHarness {...props} />
    </Wrap>,
  );
}

async function fillName(value = 'Ada Admin') {
  const input = screen.getByLabelText('Name');
  await userEvent.clear(input);
  await userEvent.type(input, value);
}
async function fillBio(value = 'Some bio') {
  const input = screen.getByLabelText('Bio');
  await userEvent.clear(input);
  await userEvent.type(input, value);
}
async function fillTos(value = 'yes') {
  const input = screen.getByLabelText('Accept ToS');
  await userEvent.clear(input);
  await userEvent.type(input, value);
}

function clickNext() {
  return userEvent.click(screen.getByTestId('wizard-next'));
}
function clickBack() {
  return userEvent.click(screen.getByTestId('wizard-back'));
}

/* -------------------------------------------------------------------------- */

describe('FormWizard — navigation', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    window.localStorage.clear();
  });

  it('renders the first step active', () => {
    renderHarness();
    expect(screen.getByRole('tab', { name: /Account/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('Next from a valid step advances to the next step', async () => {
    renderHarness();
    await fillName('Ada');
    await clickNext();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Profile/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('Next on an invalid step keeps current step and surfaces errors', async () => {
    renderHarness();
    await clickNext();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByText('Name required')).toBeInTheDocument();
  });

  it('Back returns to previous step preserving entered values', async () => {
    renderHarness();
    await fillName('Ada');
    await clickNext();
    await fillBio('Hello');
    await clickBack();
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Ada');
  });

  it('clicking a visited step indicator navigates to it', async () => {
    renderHarness();
    await fillName('Ada');
    await clickNext();
    await userEvent.click(screen.getByRole('tab', { name: /Account/ }));
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('clicking a disabled step does nothing', async () => {
    renderHarness({ step2Disabled: true, step2DisabledReason: 'Locked' });
    const tab = screen.getByRole('tab', { name: /Profile/ });
    expect(tab).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(tab);
    expect(screen.getByRole('tab', { name: /Account/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('clicking clickable=false step does nothing', async () => {
    renderHarness({ step3Clickable: false });
    await userEvent.click(screen.getByRole('tab', { name: /Settings/ }));
    expect(screen.getByRole('tab', { name: /Account/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('clicking a future step with invalid prior shows blocked toast and stays', async () => {
    renderHarness({ step3Clickable: true });
    await userEvent.click(screen.getByRole('tab', { name: /Settings/ }));
    // Toast appears.
    await waitFor(() =>
      expect(
        screen.getByText(/Complete step "Account" first/i),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole('tab', { name: /Account/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('allowSkip=true lets Next bypass validation', async () => {
    renderHarness({ allowSkip: true });
    await clickNext();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
  });

  it('hidden step is excluded from indicator and schema slice', async () => {
    renderHarness({ step2Hidden: true });
    expect(screen.queryByRole('tab', { name: /Profile/ })).toBeNull();
    await fillName('Ada');
    await clickNext();
    // skips Profile, lands on Settings
    expect(screen.getByLabelText('Accept ToS')).toBeInTheDocument();
  });

  it('arrow key navigation across indicators (horizontal)', async () => {
    renderHarness();
    const accountTab = screen.getByRole('tab', { name: /Account/ });
    accountTab.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(
      screen.getByRole('tab', { name: /Profile/ }),
    );
  });

  it('arrow key navigation in vertical orientation uses Up/Down', async () => {
    renderHarness({ orientation: 'vertical' });
    const accountTab = screen.getByRole('tab', { name: /Account/ });
    accountTab.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(
      screen.getByRole('tab', { name: /Profile/ }),
    );
  });

  it('Enter on a focused (visited) indicator activates it', async () => {
    renderHarness();
    await fillName('Ada');
    await clickNext();
    const accountTab = screen.getByRole('tab', { name: /Account/ });
    accountTab.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */

describe('FormWizard — persistence', () => {
  const KEY = 'wizard-test-key';

  beforeEach(() => {
    mockMatchMedia(false);
    window.localStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it('writes a draft to localStorage after debounce on field change', async () => {
    render(
      <Wrap>
        <BasicHarness persistKey={KEY} />
      </Wrap>,
    );
    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    // Real timer; 500ms debounce. Use waitFor with extended timeout.
    await waitFor(
      () => {
        const raw = window.localStorage.getItem(KEY);
        expect(raw).not.toBeNull();
        const parsed = JSON.parse(raw as string);
        expect(parsed.values.name).toBe('Ada');
        expect(parsed.currentStepId).toBe('account');
      },
      { timeout: 2000 },
    );
  });

  it('mounts with an existing draft shows the restore prompt', () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        values: { name: 'Ada', bio: '', acceptTos: '' },
        currentStepId: 'account',
        completedStepIds: [],
      }),
    );
    renderHarness({ persistKey: KEY });
    expect(screen.getByText('Restore draft?')).toBeInTheDocument();
  });

  it('Restore loads values, current step, and completed ids', async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        values: { name: 'Ada', bio: 'B', acceptTos: '' },
        currentStepId: 'settings',
        completedStepIds: ['account', 'profile'],
      }),
    );
    renderHarness({ persistKey: KEY });
    await userEvent.click(screen.getByRole('button', { name: 'Restore' }));
    expect(screen.getByLabelText('Accept ToS')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Settings/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('Discard removes the draft from storage', async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        values: { name: 'Ada', bio: '', acceptTos: '' },
        currentStepId: 'account',
        completedStepIds: [],
      }),
    );
    renderHarness({ persistKey: KEY });
    await userEvent.click(screen.getByRole('button', { name: 'Discard' }));
    await waitFor(() => {
      expect(window.localStorage.getItem(KEY)).toBeNull();
    });
  });

  it('autoRestore=true skips the prompt and applies the draft', () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        values: { name: 'Ada', bio: 'B', acceptTos: '' },
        currentStepId: 'profile',
        completedStepIds: ['account'],
      }),
    );
    renderHarness({ persistKey: KEY, autoRestore: true });
    expect(screen.queryByText('Restore draft?')).toBeNull();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
  });

  it('successful submit clears the draft from storage', async () => {
    const onSubmit = vi.fn();
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        values: {
          name: 'Ada',
          bio: 'B',
          acceptTos: 'ok',
        },
        currentStepId: 'settings',
        completedStepIds: ['account', 'profile'],
      }),
    );
    render(
      <Wrap>
        <BasicHarness
          persistKey={KEY}
          autoRestore
          onSubmit={onSubmit}
          defaults={{
            name: 'Ada',
            bio: 'B',
            acceptTos: 'ok',
          }}
        />
      </Wrap>,
    );
    await userEvent.click(screen.getByTestId('wizard-submit'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */

describe('FormWizard — orientation', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    window.localStorage.clear();
  });

  it('orientation="horizontal" exposes the orientation in data + tablist', () => {
    renderHarness({ orientation: 'horizontal' });
    expect(screen.getByTestId('form-wizard').getAttribute('data-orientation')).toBe(
      'horizontal',
    );
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('orientation="vertical" exposes the orientation in data + tablist', () => {
    renderHarness({ orientation: 'vertical' });
    expect(screen.getByTestId('form-wizard').getAttribute('data-orientation')).toBe(
      'vertical',
    );
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical');
  });

  it('responsiveOrientation=true switches to vertical below md', () => {
    mockMatchMedia(true); // narrow viewport
    renderHarness({ orientation: 'horizontal', responsiveOrientation: true });
    expect(screen.getByTestId('form-wizard').getAttribute('data-orientation')).toBe(
      'vertical',
    );
  });

  it('switching orientation mid-flow preserves entered values', async () => {
    function Toggleable() {
      const [o, setO] = useState<'horizontal' | 'vertical'>('horizontal');
      return (
        <>
          <button type="button" onClick={() => setO((v) => (v === 'horizontal' ? 'vertical' : 'horizontal'))}>
            toggle
          </button>
          <BasicHarness orientation={o} />
        </>
      );
    }
    render(
      <Wrap>
        <Toggleable />
      </Wrap>,
    );
    await fillName('Ada');
    await userEvent.click(screen.getByText('toggle'));
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Ada');
  });
});

/* -------------------------------------------------------------------------- */

describe('FormWizard — variants', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    window.localStorage.clear();
  });

  it('numbered renders step numbers as the indicator glyph', () => {
    renderHarness({ variant: 'numbered' });
    expect(screen.getByRole('tab', { name: /Account/ }).textContent).toContain('1');
  });

  it('icons variant renders the provided icon', () => {
    renderHarness({ variant: 'icons', iconsVariant: true });
    expect(screen.getByTestId('step-icon-account')).toBeInTheDocument();
  });

  it('icons variant without icon falls back to a number glyph', () => {
    renderHarness({ variant: 'icons' });
    // no icon provided ⇒ number text
    expect(screen.getByRole('tab', { name: /Account/ }).textContent).toContain('1');
  });

  it('dots variant renders compact indicators (no visible labels)', () => {
    renderHarness({ variant: 'dots' });
    // The label is sr-only, sibling of the tab. Reference it via aria-labelledby.
    const accountTab = screen.getByRole('tab', { name: /Account/ });
    const labelId = accountTab.getAttribute('aria-labelledby');
    expect(labelId).not.toBeNull();
    const labelEl = labelId !== null ? document.getElementById(labelId) : null;
    expect(labelEl?.classList.contains('sr-only')).toBe(true);
  });

  it('progress variant renders a progressbar', () => {
    renderHarness({ variant: 'progress' });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */

describe('FormWizard — validation + submit', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    window.localStorage.clear();
  });

  it('onSubmit fires only after the final Submit AND full schema passes', async () => {
    const onSubmit = vi.fn();
    renderHarness({ onSubmit });
    await fillName('Ada');
    await clickNext();
    await fillBio('Some bio');
    await clickNext();
    await fillTos('yes');
    await userEvent.click(screen.getByTestId('wizard-submit'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const firstCall = onSubmit.mock.calls[0];
    expect(firstCall?.[0]).toEqual({
      name: 'Ada',
      bio: 'Some bio',
      acceptTos: 'yes',
    });
  });

  it('cross-step refinement surfaces an error and routes to the owning step', async () => {
    // A separate harness with a refinement: password must equal confirmPassword.
    // Step 1: password (in a slice). Step 2: confirmPassword.
    interface XValues {
      password: string;
      confirmPassword: string;
    }
    const fullX = z
      .object({
        password: z.string().min(1, 'pw req'),
        confirmPassword: z.string().min(1, 'cpw req'),
      })
      .refine((v) => v.password === v.confirmPassword, {
        message: 'mismatch',
        path: ['password'],
      });
    const sliceA = z.object({ password: z.string().min(1, 'pw req') });
    const sliceB = z.object({ confirmPassword: z.string().min(1, 'cpw req') });

    const onSubmit = vi.fn();

    function XHarness() {
      return (
        // schema typed as ZodObject (cast off the refine wrapper for the prop)
        <FormWizard<typeof fullX & { shape: { password: z.ZodTypeAny } }>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          schema={fullX as any}
          defaultValues={{ password: '', confirmPassword: '' }}
          onSubmit={onSubmit}
        >
          <FormWizardStep<XValues>
            id="a"
            title="Password"
            schema={sliceA}
            render={({ form }) => (
              <FormField
                label="Password"
                error={form.formState.errors.password?.message}
              >
                <Input aria-label="Password" {...form.register('password')} />
              </FormField>
            )}
          />
          <FormWizardStep<XValues>
            id="b"
            title="Confirm"
            schema={sliceB}
            render={({ form }) => (
              <FormField
                label="Confirm"
                error={form.formState.errors.confirmPassword?.message}
              >
                <Input
                  aria-label="Confirm"
                  {...form.register('confirmPassword')}
                />
              </FormField>
            )}
          />
        </FormWizard>
      );
    }

    render(
      <Wrap>
        <XHarness />
      </Wrap>,
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Password' }),
      'abc',
    );
    await clickNext();
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Confirm' }),
      'zzz',
    );
    await userEvent.click(screen.getByTestId('wizard-submit'));
    await waitFor(() => {
      expect(screen.getByText('mismatch')).toBeInTheDocument();
    });
    // routed back to step 1 (where the refinement path points)
    expect(screen.getByRole('tab', { name: /Password/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('imperative handle exposes goNext / goBack / getCurrentStep', async () => {
    const ref: { current: FormWizardHandle<BasicValues> | null } = { current: null };
    render(
      <Wrap>
        <BasicHarness handleRef={ref} defaults={{ name: 'Ada' }} />
      </Wrap>,
    );
    expect(ref.current?.getCurrentStep()).toBe('account');
    await act(async () => {
      await ref.current?.goNext();
    });
    expect(ref.current?.getCurrentStep()).toBe('profile');
    act(() => {
      ref.current?.goBack();
    });
    expect(ref.current?.getCurrentStep()).toBe('account');
  });

  it('reset() clears values and returns to step 0', async () => {
    const ref: { current: FormWizardHandle<BasicValues> | null } = { current: null };
    render(
      <Wrap>
        <BasicHarness handleRef={ref} defaults={{ name: 'Ada' }} />
      </Wrap>,
    );
    await act(async () => {
      await ref.current?.goNext();
    });
    act(() => {
      ref.current?.reset();
    });
    expect(ref.current?.getCurrentStep()).toBe('account');
  });
});

/* -------------------------------------------------------------------------- */

describe('FormWizard — summary step', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    window.localStorage.clear();
  });

  it('appends a summary step when showSummaryStep is true', async () => {
    renderHarness({ showSummaryStep: true });
    // There are 4 tabs now (Account / Profile / Settings / Review).
    expect(screen.getAllByRole('tab')).toHaveLength(4);
  });

  it('summaryRender override displays a custom review surface', async () => {
    function CustomHarness() {
      return (
        <FormWizard
          schema={fullSchema}
          defaultValues={{
            name: 'Ada',
            bio: 'B',
            acceptTos: 'ok',
          }}
          onSubmit={() => undefined}
          showSummaryStep
          summaryRender={() => <div data-testid="custom-summary">CUSTOM</div>}
        >
          <FormWizardStep<BasicValues>
            id="account"
            title="Account"
            schema={step1Schema}
            render={() => <div>step</div>}
          />
        </FormWizard>
      );
    }
    render(
      <Wrap>
        <CustomHarness />
      </Wrap>,
    );
    // Advance from account to review (the summary step) via Next.
    await clickNext();
    expect(screen.getByTestId('custom-summary')).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */

describe('FormWizard — compact mode', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('collapses to "Step N of M" header below the breakpoint', () => {
    mockMatchMedia(true);
    renderHarness({ compactBelow: 'md' });
    expect(screen.getByTestId('wizard-nav-compact')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */

describe('FormWizard — a11y', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    window.localStorage.clear();
  });

  it('aria-disabled, aria-selected, role wired correctly', () => {
    renderHarness({ step2Disabled: true });
    const profileTab = screen.getByRole('tab', { name: /Profile/ });
    expect(profileTab).toHaveAttribute('aria-disabled', 'true');
    expect(profileTab.getAttribute('role')).toBe('tab');
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tabpanel').length).toBeGreaterThanOrEqual(1);
  });

  it('passes axe at idle state', async () => {
    const { container } = renderHarness();
    expect(await runAxe(container)).toHaveNoViolations();
  }, 20000);

  it('passes axe with a disabled step', async () => {
    const { container } = renderHarness({
      step2Disabled: true,
      step2DisabledReason: 'Locked until account complete',
    });
    expect(await runAxe(container)).toHaveNoViolations();
  }, 20000);

  it('passes axe when currentIndex points at step 3', async () => {
    renderHarness({ allowSkip: true });
    // jump forward by Next twice
    await clickNext();
    await clickNext();
    const root = screen.getByTestId('form-wizard');
    expect(await runAxe(root)).toHaveNoViolations();
  }, 20000);
});
