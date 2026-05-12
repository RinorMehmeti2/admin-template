import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { z } from 'zod';
import {
  ChevronDown,
  FileText,
  Folder,
  Inbox,
  Link as LinkIcon,
  Settings,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/primitives/Button';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/feedback/Dialog';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/feedback/Drawer';
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from '@/components/feedback/BottomSheet';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/navigation/Tabs';
import {
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  Breadcrumbs,
} from '@/components/navigation/Breadcrumbs';
import { Pagination } from '@/components/navigation/Pagination';
import {
  Step,
  StepDescription,
  StepIndicator,
  StepLabel,
  Stepper,
} from '@/components/navigation/Stepper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';

import { Combobox, ComboboxContent, ComboboxTrigger } from '@/components/forms/Combobox';
import { Select } from '@/components/forms/Select';
import { Calendar } from '@/components/forms/Calendar';
import { Radio } from '@/components/forms/Radio';
import { RadioGroup } from '@/components/forms/RadioGroup';
import { FormWizard, FormWizardStep } from '@/components/forms/FormWizard';
import { Input } from '@/components/forms/Input';
import { FormField } from '@/components/forms/FormField';

import { List, ListItem } from '@/components/data-display/List';
import { Timeline, TimelineContent, TimelineItem } from '@/components/data-display/Timeline';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { AvatarGroup } from '@/components/primitives/AvatarGroup';

/*
 * Shim wrappers for components whose useful preview is a composition (not a
 * single element) or that need always-on context (Dialog open state, etc.).
 *
 * Each shim accepts a small subset of the real component's props plus
 * `style` + `className` so the playground style overlay still flows through
 * to the visible part (DialogContent, DrawerContent, BottomSheetContent).
 *
 * Codegen uses entry.name to emit the JSX tag — so registry entries use the
 * real component's name (e.g. "Dialog") even though entry.component points
 * at the shim. Users copy-pasting code get the canonical composition.
 */

type Forwarded = { className?: string; style?: CSSProperties };

/* -------------------------------- Tooltip -------------------------------- */

interface TooltipShimProps extends Forwarded {
  defaultOpen?: boolean;
  delayDuration?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  label?: string;
}

export function TooltipShim({
  defaultOpen = true,
  delayDuration,
  side = 'top',
  label = 'Tooltip body text',
  className,
  style,
}: TooltipShimProps) {
  const props: { defaultOpen: boolean; delayDuration?: number } = { defaultOpen };
  if (delayDuration !== undefined) props.delayDuration = delayDuration;
  return (
    <Tooltip {...props}>
      <TooltipTrigger>
        <Button variant="outline">Hover or focus</Button>
      </TooltipTrigger>
      <TooltipContent side={side} className={className} style={style}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/* --------------------------------- Dialog -------------------------------- */

interface DialogShimProps extends Forwarded {
  defaultOpen?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
  description?: string;
}

export function DialogShim({
  defaultOpen = false,
  size = 'md',
  title = 'Dialog title',
  description = 'Optional supporting copy beneath the title.',
  className,
  style,
}: DialogShimProps) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent size={size} className={className} style={style}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-foreground-muted">
            Body content goes here. Replace with form, list, or any ReactNode.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- Drawer -------------------------------- */

interface DrawerShimProps extends Forwarded {
  defaultOpen?: boolean;
  side?: 'left' | 'right' | 'top' | 'bottom';
  responsive?: boolean;
  title?: string;
  description?: string;
}

export function DrawerShim({
  defaultOpen = false,
  side = 'right',
  responsive = true,
  title = 'Drawer title',
  description = 'Slide-in panel for secondary content.',
  className,
  style,
}: DrawerShimProps) {
  return (
    <Drawer defaultOpen={defaultOpen} side={side} responsive={responsive}>
      <DrawerTrigger>
        <Button>Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent className={className} style={style}>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-sm text-foreground-muted">Drawer body.</p>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/* ------------------------------ BottomSheet ------------------------------ */

interface BottomSheetShimProps extends Forwarded {
  defaultOpen?: boolean;
  defaultSnap?: number;
  title?: string;
}

export function BottomSheetShim({
  defaultOpen = false,
  defaultSnap = 50,
  title = 'Bottom sheet',
  className,
  style,
}: BottomSheetShimProps) {
  return (
    <BottomSheet defaultOpen={defaultOpen} defaultSnap={defaultSnap}>
      <BottomSheetTrigger>
        <Button>Open sheet</Button>
      </BottomSheetTrigger>
      <BottomSheetContent className={className} style={style}>
        <BottomSheetHeader>
          <BottomSheetTitle>{title}</BottomSheetTitle>
        </BottomSheetHeader>
        <BottomSheetBody>
          <p className="text-sm text-foreground-muted">Drag the handle to snap.</p>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
}

/* ----------------------------- ConfirmDialog ----------------------------- */

interface ConfirmDialogShimProps extends Forwarded {
  open?: boolean;
  variant?: 'default' | 'danger';
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialogShim({
  open = true,
  variant = 'default',
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
}: ConfirmDialogShimProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={() => undefined}
      variant={variant}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      isLoading={isLoading}
      onConfirm={() => undefined}
    />
  );
}

/* ---------------------------------- Tabs --------------------------------- */

interface TabsShimProps extends Forwarded {
  variant?: 'underline' | 'pills' | 'segmented';
  orientation?: 'horizontal' | 'vertical';
  defaultValue?: string;
}

export function TabsShim({
  variant = 'underline',
  orientation = 'horizontal',
  defaultValue = 'overview',
  className,
  style,
}: TabsShimProps) {
  return (
    <div style={style}>
      <Tabs
        variant={variant}
        orientation={orientation}
        defaultValue={defaultValue}
        {...(className !== undefined ? { className } : {})}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview tab content.</TabsContent>
        <TabsContent value="activity">Activity tab content.</TabsContent>
        <TabsContent value="settings">Settings tab content.</TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------ Breadcrumbs ------------------------------ */

interface BreadcrumbsShimProps extends Forwarded {
  separator?: 'chevron' | 'slash' | 'dot';
}

const SEP_NODE: Record<NonNullable<BreadcrumbsShimProps['separator']>, ReactNode> = {
  chevron: undefined,
  slash: <span>/</span>,
  dot: <span>·</span>,
};

export function BreadcrumbsShim({ separator = 'chevron', className, style }: BreadcrumbsShimProps) {
  const props: { separator?: ReactNode; className?: string; style?: CSSProperties } = {};
  const node = SEP_NODE[separator];
  if (node !== undefined) props.separator = node;
  if (className !== undefined) props.className = className;
  if (style !== undefined) props.style = style;
  return (
    <Breadcrumbs {...props}>
      <BreadcrumbItem>
        <BreadcrumbLink to="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink to="/admin">Admin</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbCurrent>Users</BreadcrumbCurrent>
      </BreadcrumbItem>
    </Breadcrumbs>
  );
}

/* ------------------------------- Pagination ------------------------------ */

interface PaginationShimProps extends Forwarded {
  page?: number;
  totalPages?: number;
  siblingCount?: number;
  boundaryCount?: number;
}

export function PaginationShim({
  page = 5,
  totalPages = 12,
  siblingCount = 1,
  boundaryCount = 1,
  className,
  style,
}: PaginationShimProps) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      siblingCount={siblingCount}
      boundaryCount={boundaryCount}
      onPageChange={() => undefined}
      className={className}
      style={style}
    />
  );
}

/* -------------------------------- Stepper -------------------------------- */

interface StepperShimProps extends Forwarded {
  orientation?: 'horizontal' | 'vertical';
}

export function StepperShim({ orientation = 'horizontal', className, style }: StepperShimProps) {
  return (
    <Stepper orientation={orientation} className={className} style={style}>
      <Step status="complete">
        <StepIndicator>1</StepIndicator>
        <StepLabel>Account</StepLabel>
        <StepDescription>Done</StepDescription>
      </Step>
      <Step status="active">
        <StepIndicator>2</StepIndicator>
        <StepLabel>Profile</StepLabel>
        <StepDescription>In progress</StepDescription>
      </Step>
      <Step status="idle">
        <StepIndicator>3</StepIndicator>
        <StepLabel>Review</StepLabel>
        <StepDescription>Pending</StepDescription>
      </Step>
    </Stepper>
  );
}

/* ----------------------------- DropdownMenu ----------------------------- */

interface DropdownMenuShimProps extends Forwarded {
  defaultOpen?: boolean;
}

export function DropdownMenuShim({ defaultOpen = true, className, style }: DropdownMenuShimProps) {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger>
        <Button variant="outline" rightIcon={<ChevronDown className="h-4 w-4" />}>
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={className} style={style}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Settings className="h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LinkIcon className="h-4 w-4" /> Copy link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-danger">
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------- Combobox ------------------------------- */

interface ComboboxShimProps extends Forwarded {
  multiple?: boolean;
  loading?: boolean;
  disabled?: boolean;
  creatable?: boolean;
  placeholder?: string;
}

const FRUITS = [
  'Apple',
  'Apricot',
  'Banana',
  'Blueberry',
  'Cherry',
  'Mango',
  'Orange',
  'Peach',
  'Pear',
  'Plum',
];

export function ComboboxShim({
  multiple = false,
  loading = false,
  disabled = false,
  creatable = false,
  placeholder = 'Select fruit…',
  className,
  style,
}: ComboboxShimProps) {
  return (
    <Combobox<string>
      items={FRUITS}
      getItemLabel={(s) => s}
      getItemValue={(s) => s}
      multiple={multiple}
      loading={loading}
      disabled={disabled}
      creatable={creatable}
    >
      <ComboboxTrigger placeholder={placeholder} className={className} style={style} />
      <ComboboxContent />
    </Combobox>
  );
}

/* --------------------------------- Select -------------------------------- */

interface SelectShimProps extends Forwarded {
  variant?: 'default' | 'error';
  selectSize?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  defaultValue?: string;
}

export function SelectShim({
  variant = 'default',
  selectSize = 'md',
  disabled = false,
  defaultValue = 'apple',
  className,
  style,
}: SelectShimProps) {
  return (
    <Select
      variant={variant}
      selectSize={selectSize}
      disabled={disabled}
      defaultValue={defaultValue}
      className={className}
      style={style}
    >
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
    </Select>
  );
}

/* ------------------------------- RadioGroup ------------------------------ */

interface RadioGroupShimProps extends Forwarded {
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  defaultValue?: string;
  name?: string;
}

export function RadioGroupShim({
  orientation = 'vertical',
  disabled = false,
  defaultValue = 'standard',
  name = 'plan',
  className,
  style,
}: RadioGroupShimProps) {
  return (
    <div style={style}>
      <RadioGroup
        name={name}
        defaultValue={defaultValue}
        orientation={orientation}
        disabled={disabled}
        {...(className !== undefined ? { className } : {})}
      >
        <Radio value="basic">Basic</Radio>
        <Radio value="standard">Standard</Radio>
        <Radio value="premium">Premium</Radio>
      </RadioGroup>
    </div>
  );
}

/* --------------------------------- Calendar ------------------------------ */

interface CalendarShimProps extends Forwarded {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showOutsideDays?: boolean;
}

export function CalendarShim({
  weekStartsOn = 1,
  showOutsideDays = true,
  className,
  style,
}: CalendarShimProps) {
  const month = useMemo(() => new Date(), []);
  return (
    <Calendar
      month={month}
      weekStartsOn={weekStartsOn}
      showOutsideDays={showOutsideDays}
      className={className}
      style={style}
    />
  );
}

/* ----------------------------------- List -------------------------------- */

interface ListShimProps extends Forwarded {
  variant?: 'default' | 'divided';
}

export function ListShim({ variant = 'default', className, style }: ListShimProps) {
  return (
    <List variant={variant} className={className} style={style}>
      <ListItem
        leading={<Inbox className="h-4 w-4" />}
        primary="Inbox"
        secondary="12 unread messages"
      />
      <ListItem leading={<Folder className="h-4 w-4" />} primary="Projects" secondary="4 active" />
      <ListItem leading={<FileText className="h-4 w-4" />} primary="Drafts" secondary="None" />
    </List>
  );
}

/* -------------------------------- Timeline ------------------------------- */

interface TimelineShimProps extends Forwarded {
  orientation?: 'vertical' | 'horizontal';
}

const TIMELINE_FIXTURES = [
  new Date('2026-05-10T09:00:00'),
  new Date('2026-05-11T14:30:00'),
  new Date('2026-05-12T08:15:00'),
] as const;

export function TimelineShim({ orientation = 'vertical', className, style }: TimelineShimProps) {
  return (
    <Timeline orientation={orientation} className={className} style={style}>
      <TimelineItem timestamp={TIMELINE_FIXTURES[0]}>
        <TimelineContent>Created new project</TimelineContent>
      </TimelineItem>
      <TimelineItem timestamp={TIMELINE_FIXTURES[1]}>
        <TimelineContent>Added 3 collaborators</TimelineContent>
      </TimelineItem>
      <TimelineItem timestamp={TIMELINE_FIXTURES[2]}>
        <TimelineContent>Published v1.0</TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}

/* ---------------------------------- Table -------------------------------- */

interface TableShimProps extends Forwarded {
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'dense' | 'default' | 'comfortable';
  hover?: boolean;
}

export function TableShim({
  variant = 'default',
  size = 'default',
  hover = true,
  className,
  style,
}: TableShimProps) {
  return (
    <Table variant={variant} size={size} hover={hover} className={className} style={style}>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ada Lovelace</TableCell>
          <TableCell>Admin</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Grace Hopper</TableCell>
          <TableCell>Editor</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Linus Torvalds</TableCell>
          <TableCell>Viewer</TableCell>
          <TableCell>Invited</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

/* ------------------------------- AvatarGroup ----------------------------- */

interface AvatarGroupShimProps extends Forwarded {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'tight' | 'normal' | 'loose';
  max?: number;
  reverseOrder?: boolean;
}

const AVATAR_PEOPLE = [
  { name: 'Ada Lovelace' },
  { name: 'Grace Hopper' },
  { name: 'Alan Turing' },
  { name: 'Linus Torvalds' },
  { name: 'Margaret Hamilton' },
  { name: 'Donald Knuth' },
  { name: 'Hedy Lamarr' },
];

export function AvatarGroupShim({
  size = 'md',
  spacing = 'normal',
  max = 5,
  reverseOrder = false,
  className,
  style,
}: AvatarGroupShimProps) {
  return (
    <AvatarGroup
      items={AVATAR_PEOPLE}
      size={size}
      spacing={spacing}
      max={max}
      reverseOrder={reverseOrder}
      className={className}
      style={style}
    />
  );
}

/* ------------------------------- FormField ------------------------------- */

interface FormFieldShimProps extends Forwarded {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  hideLabel?: boolean;
}

export function FormFieldShim({
  label = 'Email',
  description,
  error,
  required = false,
  hideLabel = false,
  className,
  style,
}: FormFieldShimProps) {
  const fieldProps: {
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    hideLabel?: boolean;
    className?: string;
  } = { required, hideLabel };
  if (label !== '') fieldProps.label = label;
  if (description !== undefined && description !== '') fieldProps.description = description;
  if (error !== undefined && error !== '') fieldProps.error = error;
  if (className !== undefined) fieldProps.className = className;
  return (
    <div style={style}>
      <FormField {...fieldProps}>
        <Input placeholder="you@example.com" />
      </FormField>
    </div>
  );
}

/* ------------------------------ FormWizard ------------------------------ */

interface FormWizardShimProps extends Forwarded {
  orientation?: 'horizontal' | 'vertical';
  stepIndicatorVariant?: 'numbered' | 'icons' | 'dots' | 'progress';
  responsiveOrientation?: boolean;
  showSummaryStep?: boolean;
  allowSkip?: boolean;
}

const wizardStep1Schema = z.object({
  email: z.string().email('Enter a valid email'),
});
const wizardStep2Schema = z.object({
  company: z.string().min(2, 'Company name required'),
});
const wizardStep3Schema = z.object({
  plan: z.enum(['basic', 'standard', 'premium']),
});
const wizardSchema = wizardStep1Schema
  .extend(wizardStep2Schema.shape)
  .extend(wizardStep3Schema.shape);

type WizardValues = z.infer<typeof wizardSchema>;

export function FormWizardShim({
  orientation = 'horizontal',
  stepIndicatorVariant = 'numbered',
  responsiveOrientation = true,
  showSummaryStep = true,
  allowSkip = false,
  className,
  style,
}: FormWizardShimProps) {
  const defaultValues: WizardValues = useMemo(
    () => ({ email: '', company: '', plan: 'standard' }),
    [],
  );
  const wrapperStyle: CSSProperties | undefined = style;

  return (
    <div className="w-full" style={wrapperStyle}>
      <FormWizard<typeof wizardSchema>
        schema={wizardSchema}
        defaultValues={defaultValues}
        onSubmit={() => undefined}
        orientation={orientation}
        stepIndicatorVariant={stepIndicatorVariant}
        responsiveOrientation={responsiveOrientation}
        showSummaryStep={showSummaryStep}
        allowSkip={allowSkip}
        {...(className !== undefined ? { className } : {})}
      >
        <FormWizardStep
          id="account"
          title="Account"
          description="Your sign-in"
          schema={wizardStep1Schema}
          render={({ form }) => {
            const msg = form.formState.errors.email?.message;
            return (
              <FormField label="Email" required error={typeof msg === 'string' ? msg : undefined}>
                <Input placeholder="you@example.com" {...form.register('email')} />
              </FormField>
            );
          }}
        />
        <FormWizardStep
          id="company"
          title="Company"
          description="Your organisation"
          schema={wizardStep2Schema}
          render={({ form }) => {
            const msg = form.formState.errors.company?.message;
            return (
              <FormField label="Company" required error={typeof msg === 'string' ? msg : undefined}>
                <Input placeholder="Acme Inc." {...form.register('company')} />
              </FormField>
            );
          }}
        />
        <FormWizardStep
          id="plan"
          title="Plan"
          description="Choose a tier"
          schema={wizardStep3Schema}
          render={({ form }) => (
            <FormField label="Plan" required>
              <RadioGroup
                name="plan"
                value={form.watch('plan')}
                onValueChange={(v) => form.setValue('plan', v as 'basic' | 'standard' | 'premium')}
                orientation="horizontal"
              >
                <Radio value="basic">Basic</Radio>
                <Radio value="standard">Standard</Radio>
                <Radio value="premium">Premium</Radio>
              </RadioGroup>
            </FormField>
          )}
        />
      </FormWizard>
    </div>
  );
}
