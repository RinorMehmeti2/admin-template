import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { z } from 'zod';
import {
  ChevronDown,
  CircleUserRound,
  CreditCard,
  FileText,
  Folder,
  Inbox,
  Link as LinkIcon,
  Settings,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/primitives/Button';
import { AvatarGroup } from '@/components/primitives/AvatarGroup';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import {
  Dialog,
  DialogBody,
  DialogClose,
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
import { NotificationsBell } from '@/components/feedback/NotificationsCenter';

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionType,
  type AccordionVariant,
} from '@/components/navigation/Accordion';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/navigation/ContextMenu';
import { Menu, MenuGroup, MenuItem } from '@/components/navigation/Menu';

import { Combobox, ComboboxContent, ComboboxTrigger } from '@/components/forms/Combobox';
import { Select } from '@/components/forms/Select';
import { Calendar } from '@/components/forms/Calendar';
import { Radio } from '@/components/forms/Radio';
import { RadioGroup } from '@/components/forms/RadioGroup';
import { FormWizard, FormWizardStep } from '@/components/forms/FormWizard';
import { Input } from '@/components/forms/Input';
import { FormField } from '@/components/forms/FormField';
import { Repeater } from '@/components/forms/Repeater';
import { LazyRichTextEditor } from '@/components/forms/RichTextEditor/lazy';
import type { RichTextToolbarOption } from '@/components/forms/RichTextEditor';

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
import { DataTable, type ColumnDef as DataColumnDef } from '@/components/data-display/DataTable';
import { FileExplorer } from '@/components/data-display/FileExplorer';
import type { FileNode } from '@/components/data-display/FileExplorer';
import { FilterableSearch } from '@/components/data-display/FilterableSearch';
import type { FilterDef } from '@/components/data-display/FilterableSearch';
import { ImageGallery } from '@/components/data-display/ImageGallery';
import type { GalleryAspect, GalleryImage } from '@/components/data-display/ImageGallery';
import { KanbanBoard } from '@/components/data-display/Kanban';
import { TreeView } from '@/components/data-display/TreeView';
import type { TreeNode } from '@/components/data-display/TreeView';
import { Carousel } from '@/components/data-display/Carousel';

import { AreaChart } from '@/components/data-display/charts/AreaChart';
import { BarChart } from '@/components/data-display/charts/BarChart';
import { LineChart } from '@/components/data-display/charts/LineChart';
import { PieChart } from '@/components/data-display/charts/PieChart';
import { DonutChart } from '@/components/data-display/charts/DonutChart';
import { RadialChart } from '@/components/data-display/charts/RadialChart';
import { StackedBarChart } from '@/components/data-display/charts/StackedBarChart';
import { ComposedChart } from '@/components/data-display/charts/ComposedChart';

import { PageHeader } from '@/components/layout/PageHeader';
import { SplitLayout } from '@/components/layout/SplitLayout';
import { StickyCard } from '@/components/layout/StickyCard';

import {
  CommandPalette,
  CommandRegistryProvider,
  useCommandRegistry,
  useRegisterCommands,
} from '@/components/overlays/CommandPalette';

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
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  title?: string;
  description?: string;
}

export function DialogShim({
  defaultOpen = false,
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
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
      <DialogContent
        size={size}
        variant={variant}
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEscape={closeOnEscape}
        className={className}
        style={style}
      >
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
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Confirm</Button>
          </DialogClose>
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

/* -------------------------------- Accordion ------------------------------ */

interface AccordionShimProps extends Forwarded {
  type?: AccordionType;
  variant?: AccordionVariant;
  collapsible?: boolean;
  defaultValue?: string;
}

export function AccordionShim({
  type = 'single',
  variant = 'default',
  collapsible = true,
  defaultValue = 'item-1',
  className,
}: AccordionShimProps) {
  const common = {
    variant,
    ...(className !== undefined ? { className } : {}),
  };
  if (type === 'multiple') {
    return (
      <Accordion type="multiple" defaultValue={[defaultValue]} {...common}>
        <AccordionItem value="item-1">
          <AccordionTrigger>What is this template?</AccordionTrigger>
          <AccordionContent>An in-house admin UI template.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Does it ship a UI kit?</AccordionTrigger>
          <AccordionContent>No — every component is owned in-repo.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>How do I theme it?</AccordionTrigger>
          <AccordionContent>Through tokens + the theme picker.</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
  return (
    <Accordion type="single" collapsible={collapsible} defaultValue={defaultValue} {...common}>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is this template?</AccordionTrigger>
        <AccordionContent>An in-house admin UI template.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Does it ship a UI kit?</AccordionTrigger>
        <AccordionContent>No — every component is owned in-repo.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>How do I theme it?</AccordionTrigger>
        <AccordionContent>Through tokens + the theme picker.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/* ---------------------------------- Menu --------------------------------- */

interface MenuShimProps extends Forwarded {
  iconOnly?: boolean;
  ariaLabel?: string;
}

export function MenuShim({
  iconOnly = false,
  ariaLabel = 'Sidebar',
  className,
  style,
}: MenuShimProps) {
  return (
    <div className="w-60" style={style}>
      <Menu
        iconOnly={iconOnly}
        ariaLabel={ariaLabel}
        {...(className !== undefined ? { className } : {})}
      >
        <MenuItem to="/showcase" icon={<Inbox />}>
          Overview
        </MenuItem>
        <MenuItem to="/primitives" icon={<CircleUserRound />}>
          People
        </MenuItem>
        <MenuGroup label="Billing" icon={<CreditCard />}>
          <MenuItem to="/billing/invoices">Invoices</MenuItem>
          <MenuItem to="/billing/plans">Plans</MenuItem>
        </MenuGroup>
        <MenuItem to="/settings" icon={<Settings />}>
          Settings
        </MenuItem>
      </Menu>
    </div>
  );
}

/* ----------------------------- ContextMenu ------------------------------- */

export function ContextMenuShim({ className, style }: Forwarded) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed border-border bg-surface-muted/40 text-sm text-foreground-muted">
          Right-click me
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className={className} style={style}>
        <ContextMenuItem>
          <Settings className="h-4 w-4" /> Open
        </ContextMenuItem>
        <ContextMenuItem>
          <LinkIcon className="h-4 w-4" /> Copy link
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-danger">
          <Trash2 className="h-4 w-4" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
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

/* ---------------------------------- Radio -------------------------------- */

interface RadioShimProps extends Forwarded {
  value?: string;
  disabled?: boolean;
  children?: string;
}

export function RadioShim({
  value = 'standard',
  disabled = false,
  children = 'Standard',
  className,
  style,
}: RadioShimProps) {
  return (
    <div style={style}>
      <RadioGroup name="radio-shim" defaultValue={value}>
        <Radio value={value} disabled={disabled} className={className}>
          {children}
        </Radio>
      </RadioGroup>
    </div>
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

/* -------------------------------- Repeater ------------------------------- */

interface RepeaterShimProps extends Forwarded {
  min?: number;
  max?: number;
  addLabel?: string;
  variant?: 'separated' | 'stacked';
}

interface RepeaterRow {
  text: string;
}

export function RepeaterShim({
  min = 1,
  max = 5,
  addLabel = 'Add row',
  variant = 'separated',
  className,
  style,
}: RepeaterShimProps) {
  return (
    <div className="w-full" style={style}>
      <Repeater<RepeaterRow>
        defaultItems={[{ text: 'First row' }, { text: 'Second row' }]}
        createItem={() => ({ text: '' })}
        min={min}
        max={max}
        addLabel={addLabel}
        variant={variant}
        label="Items"
        {...(className !== undefined ? { className } : {})}
        renderItem={({ item, update }) => (
          <Input
            value={item.text}
            placeholder="Enter text…"
            onChange={(e) => update({ text: e.target.value })}
          />
        )}
      />
    </div>
  );
}

/* ----------------------------- DataTable shim ---------------------------- */

interface DataTableShimProps extends Forwarded {
  pageSize?: number;
  enableSorting?: boolean;
  enableGlobalFilter?: boolean;
  enableRowSelection?: boolean;
  size?: 'dense' | 'default' | 'comfortable';
  variant?: 'default' | 'striped' | 'bordered';
}

interface DataRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const DATA_ROWS: DataRow[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@analytical.dev', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Grace Hopper', email: 'grace@cobol.org', role: 'Editor', status: 'Active' },
  { id: 3, name: 'Alan Turing', email: 'alan@bletchley.uk', role: 'Viewer', status: 'Invited' },
  { id: 4, name: 'Linus Torvalds', email: 'linus@kernel.org', role: 'Admin', status: 'Active' },
];

const DATA_COLUMNS: DataColumnDef<DataRow, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

export function DataTableShim({
  pageSize = 4,
  enableSorting = true,
  enableGlobalFilter = false,
  enableRowSelection = false,
  size = 'default',
  variant = 'default',
  className,
  style,
}: DataTableShimProps) {
  return (
    <div style={style}>
      <DataTable<DataRow>
        columns={DATA_COLUMNS}
        data={DATA_ROWS}
        pageSize={pageSize}
        enableSorting={enableSorting}
        enableGlobalFilter={enableGlobalFilter}
        enableRowSelection={enableRowSelection}
        size={size}
        variant={variant}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

/* ----------------------------- FileExplorer ------------------------------ */

interface FileExplorerShimProps extends Forwarded {
  viewMode?: 'list' | 'grid';
  multiSelect?: boolean;
}

const FILE_TREE: FileNode = {
  id: 'root',
  name: 'Home',
  kind: 'folder',
  children: [
    {
      id: 'docs',
      name: 'Documents',
      kind: 'folder',
      children: [
        {
          id: 'invoice.pdf',
          name: 'Invoice.pdf',
          kind: 'file',
          size: 24_500,
          modifiedAt: new Date('2026-04-12'),
        },
        {
          id: 'plan.md',
          name: 'plan.md',
          kind: 'file',
          size: 8_200,
          modifiedAt: new Date('2026-05-01'),
        },
      ],
    },
    {
      id: 'images',
      name: 'Images',
      kind: 'folder',
      children: [
        {
          id: 'logo.svg',
          name: 'logo.svg',
          kind: 'file',
          size: 4_100,
          modifiedAt: new Date('2026-03-22'),
        },
      ],
    },
  ],
};

export function FileExplorerShim({
  viewMode = 'list',
  multiSelect = true,
  className,
}: FileExplorerShimProps) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-md border border-border">
      <FileExplorer
        root={FILE_TREE}
        viewMode={viewMode}
        multiSelect={multiSelect}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

/* ---------------------------- FilterableSearch --------------------------- */

interface FilterableSearchShimProps extends Forwarded {
  placeholder?: string;
  hideAddFilter?: boolean;
  debounceMs?: number;
}

const SEARCH_FILTERS: ReadonlyArray<FilterDef> = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'invited', label: 'Invited' },
      { value: 'suspended', label: 'Suspended' },
    ],
  },
  {
    id: 'role',
    label: 'Role',
    type: 'multi-select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
  },
  { id: 'email', label: 'Email', type: 'text', placeholder: 'contains…' },
];

export function FilterableSearchShim({
  placeholder = 'Search users…',
  hideAddFilter = false,
  debounceMs = 250,
  className,
  style,
}: FilterableSearchShimProps) {
  return (
    <div style={style} className="w-full">
      <FilterableSearch
        filters={SEARCH_FILTERS}
        placeholder={placeholder}
        hideAddFilter={hideAddFilter}
        debounceMs={debounceMs}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

/* ------------------------------ ImageGallery ----------------------------- */

interface ImageGalleryShimProps extends Forwarded {
  columns?: number;
  gap?: number;
  aspectRatio?: GalleryAspect;
  disableLightbox?: boolean;
}

const GALLERY_IMAGES: ReadonlyArray<GalleryImage> = [
  { id: 'a', src: 'https://picsum.photos/seed/admin-1/400/300', alt: 'Mountain skyline' },
  { id: 'b', src: 'https://picsum.photos/seed/admin-2/400/300', alt: 'Coastline cliffs' },
  { id: 'c', src: 'https://picsum.photos/seed/admin-3/400/300', alt: 'Desert dunes' },
  { id: 'd', src: 'https://picsum.photos/seed/admin-4/400/300', alt: 'Pine forest' },
  { id: 'e', src: 'https://picsum.photos/seed/admin-5/400/300', alt: 'River bend' },
  { id: 'f', src: 'https://picsum.photos/seed/admin-6/400/300', alt: 'City night' },
];

export function ImageGalleryShim({
  columns,
  gap = 8,
  aspectRatio = 'video',
  disableLightbox = false,
  className,
  style,
}: ImageGalleryShimProps) {
  return (
    <div style={style} className="w-full">
      <ImageGallery
        images={GALLERY_IMAGES}
        {...(columns !== undefined ? { columns } : {})}
        gap={gap}
        aspectRatio={aspectRatio}
        disableLightbox={disableLightbox}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

/* --------------------------------- Kanban -------------------------------- */

interface KanbanShimProps extends Forwarded {
  allowReorderWithinColumn?: boolean;
}

interface KanbanCard {
  id: string;
  column: string;
  title: string;
}

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'done', title: 'Done' },
];

const KANBAN_CARDS_INITIAL: KanbanCard[] = [
  { id: 'k1', column: 'todo', title: 'Spec the design tokens' },
  { id: 'k2', column: 'todo', title: 'Pick the audit firm' },
  { id: 'k3', column: 'doing', title: 'Migrate auth middleware' },
  { id: 'k4', column: 'doing', title: 'Rewrite notifications panel' },
  { id: 'k5', column: 'done', title: 'Ship the showcase page' },
];

export function KanbanShim({ allowReorderWithinColumn = true, className, style }: KanbanShimProps) {
  const [items, setItems] = useState<KanbanCard[]>(KANBAN_CARDS_INITIAL);
  return (
    <div style={style} className="w-full">
      <KanbanBoard<KanbanCard>
        columns={KANBAN_COLUMNS}
        items={items}
        getItemId={(c: KanbanCard) => c.id}
        getItemColumn={(c: KanbanCard) => c.column}
        onItemMove={(itemId: string, _from: string, toColId: string, toIndex: number) => {
          setItems((prev) => {
            const card = prev.find((c) => c.id === itemId);
            if (card === undefined) return prev;
            const others = prev.filter((c) => c.id !== itemId);
            const moved: KanbanCard = { ...card, column: toColId };
            const inTarget = others.filter((c) => c.column === toColId);
            const inserted = [...inTarget.slice(0, toIndex), moved, ...inTarget.slice(toIndex)];
            const elsewhere = others.filter((c) => c.column !== toColId);
            return [...elsewhere, ...inserted];
          });
        }}
        renderCard={(card: KanbanCard) => (
          <div className="rounded-md border border-border bg-surface p-3 text-sm">{card.title}</div>
        )}
        allowReorderWithinColumn={allowReorderWithinColumn}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

/* -------------------------------- TreeView ------------------------------- */

interface TreeViewShimProps extends Forwarded {
  selectionMode?: 'none' | 'single' | 'multiple';
}

const TREE_NODES: TreeNode<unknown>[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'Button.tsx', label: 'Button.tsx', isLeaf: true },
          { id: 'Card.tsx', label: 'Card.tsx', isLeaf: true },
        ],
      },
      { id: 'App.tsx', label: 'App.tsx', isLeaf: true },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [{ id: 'favicon.svg', label: 'favicon.svg', isLeaf: true }],
  },
];

export function TreeViewShim({ selectionMode = 'single', className, style }: TreeViewShimProps) {
  return (
    <div style={style} className="w-full">
      <TreeView
        items={TREE_NODES}
        selectionMode={selectionMode}
        defaultExpandedIds={['src', 'components']}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

/* --------------------------------- Carousel ------------------------------ */

interface CarouselShimProps extends Forwarded {
  loop?: boolean;
  autoplayMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
  arrowPosition?: 'overlay' | 'outside';
}

const CAROUSEL_SLIDES = [
  { id: 's1', label: 'Slide 1', tone: 'primary' as const },
  { id: 's2', label: 'Slide 2', tone: 'success' as const },
  { id: 's3', label: 'Slide 3', tone: 'warning' as const },
];

const SLIDE_TONE_CLASS: Record<'primary' | 'success' | 'warning', string> = {
  primary: 'bg-primary/10 text-foreground',
  success: 'bg-success/10 text-foreground',
  warning: 'bg-warning/10 text-foreground',
};

export function CarouselShim({
  loop = true,
  autoplayMs = 0,
  showArrows = true,
  showDots = true,
  arrowPosition = 'overlay',
  className,
  style,
}: CarouselShimProps) {
  const slides = useMemo(
    () =>
      CAROUSEL_SLIDES.map((slide) => ({
        id: slide.id,
        content: (
          <div
            className={`flex h-40 items-center justify-center rounded-md text-sm font-medium ${SLIDE_TONE_CLASS[slide.tone]}`}
          >
            {slide.label}
          </div>
        ),
      })),
    [],
  );
  return (
    <div style={style} className="w-full max-w-md">
      <Carousel
        aria-label="Carousel preview"
        slides={slides}
        loop={loop}
        autoplayMs={autoplayMs}
        showArrows={showArrows}
        showDots={showDots}
        arrowPosition={arrowPosition}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

/* ---------------------------------- PageHeader --------------------------- */

interface PageHeaderShimProps extends Forwarded {
  title?: string;
  description?: string;
  showActions?: boolean;
  showBreadcrumbs?: boolean;
}

export function PageHeaderShim({
  title = 'Settings',
  description = 'Manage your account and workspace preferences.',
  showActions = true,
  showBreadcrumbs = false,
  className,
  style,
}: PageHeaderShimProps) {
  return (
    <PageHeader
      title={title}
      description={description}
      breadcrumbs={
        showBreadcrumbs ? (
          <Breadcrumbs>
            <BreadcrumbItem>
              <BreadcrumbLink to="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbCurrent>Settings</BreadcrumbCurrent>
            </BreadcrumbItem>
          </Breadcrumbs>
        ) : undefined
      }
      actions={
        showActions ? (
          <>
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </>
        ) : undefined
      }
      className={className}
      style={style}
    />
  );
}

/* ------------------------------ SplitLayout ------------------------------ */

interface SplitLayoutShimProps extends Forwarded {
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  resizable?: boolean;
  collapsible?: boolean;
}

export function SplitLayoutShim({
  defaultLeftWidth = 200,
  minLeftWidth = 140,
  maxLeftWidth = 320,
  resizable = true,
  collapsible = true,
  className,
  style,
}: SplitLayoutShimProps) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-md border border-border" style={style}>
      <SplitLayout
        defaultLeftWidth={defaultLeftWidth}
        minLeftWidth={minLeftWidth}
        maxLeftWidth={maxLeftWidth}
        resizable={resizable}
        collapsible={collapsible}
        {...(className !== undefined ? { className } : {})}
        left={
          <div className="p-3">
            <p className="text-xs font-semibold uppercase text-foreground-subtle">List</p>
            <ul className="mt-2 space-y-1 text-sm text-foreground-muted">
              <li>Item one</li>
              <li>Item two</li>
              <li>Item three</li>
            </ul>
          </div>
        }
        right={
          <div className="p-4 text-sm text-foreground-muted">
            <p className="font-medium text-foreground">Detail pane</p>
            <p>Resizable + collapsible split layout. Drag the divider.</p>
          </div>
        }
      />
    </div>
  );
}

/* ------------------------------- StickyCard ------------------------------ */

interface StickyCardShimProps extends Forwarded {
  offset?: number;
  variant?: 'default' | 'outlined' | 'elevated';
  shadowWhenStuck?: boolean;
  compactWhenStuck?: boolean;
}

export function StickyCardShim({
  offset = 0,
  variant = 'outlined',
  shadowWhenStuck = true,
  compactWhenStuck = false,
  className,
  style,
}: StickyCardShimProps) {
  return (
    <div className="h-64 w-full overflow-auto rounded-md border border-border">
      <div className="flex flex-col gap-3 p-3">
        <StickyCard
          offset={offset}
          variant={variant}
          shadowWhenStuck={shadowWhenStuck}
          compactWhenStuck={compactWhenStuck}
          className={className}
          style={style}
        >
          <p className="text-sm font-medium text-foreground">Sticky header</p>
          <p className="text-xs text-foreground-muted">Scroll the container to see me stick.</p>
        </StickyCard>
        <div className="h-24 rounded-md border border-dashed border-border bg-surface-muted/30 p-3 text-xs text-foreground-subtle">
          Filler block #1
        </div>
        <div className="h-24 rounded-md border border-dashed border-border bg-surface-muted/30 p-3 text-xs text-foreground-subtle">
          Filler block #2
        </div>
        <div className="h-24 rounded-md border border-dashed border-border bg-surface-muted/30 p-3 text-xs text-foreground-subtle">
          Filler block #3
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- NotificationsBell -------------------------- */

interface NotificationsBellShimProps extends Forwarded {
  size?: 'sm' | 'md';
  persistOpen?: boolean;
}

export function NotificationsBellShim({
  size = 'md',
  persistOpen = false,
  className,
}: NotificationsBellShimProps) {
  // Direct render — NotificationsProvider is mounted at the app root, so the
  // bell pulls from the real notification store. `persistOpen` defaults false
  // so toggling in the playground doesn't bleed across components.
  return (
    <NotificationsBell
      size={size}
      persistOpen={persistOpen}
      {...(className !== undefined ? { className } : {})}
    />
  );
}

/* ----------------------------- CommandPalette ---------------------------- */

interface CommandPaletteShimProps {
  placeholder?: string;
}

export function CommandPaletteShim({ placeholder }: CommandPaletteShimProps) {
  // Nest a private CommandRegistryProvider so the shim's palette + commands
  // are scoped to the playground preview rather than fighting the global
  // one that lives in RootShell.
  return (
    <CommandRegistryProvider>
      <CommandPaletteShimInner {...(placeholder !== undefined ? { placeholder } : {})} />
    </CommandRegistryProvider>
  );
}

function CommandPaletteShimInner({ placeholder }: CommandPaletteShimProps) {
  const { openPalette } = useCommandRegistry();
  useRegisterCommands(
    [
      {
        id: 'preview-nav',
        label: 'Go to dashboard',
        group: 'Navigation',
        keywords: ['home', 'overview'],
        perform: () => undefined,
      },
      {
        id: 'preview-new',
        label: 'Create document',
        group: 'Actions',
        keywords: ['new', 'add'],
        perform: () => undefined,
      },
      {
        id: 'preview-theme',
        label: 'Toggle theme',
        group: 'Settings',
        keywords: ['dark', 'light', 'theme'],
        perform: () => undefined,
      },
    ],
    [],
  );
  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={openPalette}>Open command palette</Button>
      <p className="text-xs text-foreground-subtle">
        Palette mounts inside its own provider — Esc closes.
      </p>
      <CommandPalette {...(placeholder !== undefined ? { placeholder } : {})} />
    </div>
  );
}

/* ----------------------------- RichTextEditor ---------------------------- */

interface RichTextEditorShimProps extends Forwarded {
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: number;
  toolbar?: 'full' | 'minimal' | 'hidden';
  bubbleMenu?: boolean;
  error?: boolean;
}

export function RichTextEditorShim({
  placeholder = 'Write something…',
  readOnly = false,
  minHeight = 160,
  toolbar = 'full',
  bubbleMenu = true,
  error = false,
  className,
  style,
}: RichTextEditorShimProps) {
  const resolvedToolbar: RichTextToolbarOption =
    toolbar === 'hidden' ? false : (toolbar as 'full' | 'minimal');
  return (
    <div className="w-full" style={style}>
      <LazyRichTextEditor
        placeholder={placeholder}
        readOnly={readOnly}
        minHeight={minHeight}
        toolbar={resolvedToolbar}
        bubbleMenu={bubbleMenu}
        error={error}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

/* ------------------------------- Chart fixtures -------------------------- */

const SERIES_DATA = [
  { day: 'Mon', signups: 240, churn: 80 },
  { day: 'Tue', signups: 300, churn: 90 },
  { day: 'Wed', signups: 520, churn: 110 },
  { day: 'Thu', signups: 480, churn: 120 },
  { day: 'Fri', signups: 610, churn: 140 },
  { day: 'Sat', signups: 380, churn: 70 },
];

const SLICE_DATA = [
  { region: 'NA', value: 480 },
  { region: 'EU', value: 320 },
  { region: 'APAC', value: 210 },
  { region: 'LATAM', value: 95 },
];

interface AxisChartShimProps extends Forwarded {
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export function AreaChartShim({
  height = 220,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  className,
}: AxisChartShimProps) {
  return (
    <div className="w-full max-w-xl">
      <AreaChart
        xKey="day"
        data={SERIES_DATA}
        height={height}
        showGrid={showGrid}
        showLegend={showLegend}
        showTooltip={showTooltip}
        series={[
          { key: 'signups', label: 'Sign-ups', color: 'primary' },
          { key: 'churn', label: 'Churn', color: 'danger' },
        ]}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

export function LineChartShim({
  height = 220,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  className,
}: AxisChartShimProps) {
  return (
    <div className="w-full max-w-xl">
      <LineChart
        xKey="day"
        data={SERIES_DATA}
        height={height}
        showGrid={showGrid}
        showLegend={showLegend}
        showTooltip={showTooltip}
        series={[
          { key: 'signups', label: 'Sign-ups', color: 'primary' },
          { key: 'churn', label: 'Churn', color: 'danger' },
        ]}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

export function BarChartShim({
  height = 220,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  className,
}: AxisChartShimProps) {
  return (
    <div className="w-full max-w-xl">
      <BarChart
        xKey="day"
        data={SERIES_DATA}
        height={height}
        showGrid={showGrid}
        showLegend={showLegend}
        showTooltip={showTooltip}
        series={[{ key: 'signups', label: 'Sign-ups', color: 'primary' }]}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

export function StackedBarChartShim({
  height = 220,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  className,
}: AxisChartShimProps) {
  return (
    <div className="w-full max-w-xl">
      <StackedBarChart
        xKey="day"
        data={SERIES_DATA}
        height={height}
        showGrid={showGrid}
        showLegend={showLegend}
        showTooltip={showTooltip}
        series={[
          { key: 'signups', label: 'Sign-ups', color: 'primary' },
          { key: 'churn', label: 'Churn', color: 'danger' },
        ]}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

export function ComposedChartShim({
  height = 220,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  className,
}: AxisChartShimProps) {
  return (
    <div className="w-full max-w-xl">
      <ComposedChart
        xKey="day"
        data={SERIES_DATA}
        height={height}
        showGrid={showGrid}
        showLegend={showLegend}
        showTooltip={showTooltip}
        series={[
          { key: 'signups', label: 'Sign-ups', color: 'primary', type: 'bar' },
          { key: 'churn', label: 'Churn', color: 'danger', type: 'line' },
        ]}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

interface SliceChartShimProps extends Forwarded {
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function PieChartShim({
  height = 240,
  showLegend = true,
  showTooltip = true,
  innerRadius,
  outerRadius,
  className,
}: SliceChartShimProps) {
  return (
    <div className="w-full max-w-md">
      <PieChart
        xKey="region"
        data={SLICE_DATA}
        height={height}
        showLegend={showLegend}
        showTooltip={showTooltip}
        {...(innerRadius !== undefined ? { innerRadius } : {})}
        {...(outerRadius !== undefined ? { outerRadius } : {})}
        series={[{ key: 'value', label: 'Users' }]}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

export function DonutChartShim({
  height = 240,
  showLegend = true,
  showTooltip = true,
  innerRadius = 60,
  outerRadius = 100,
  className,
}: SliceChartShimProps) {
  return (
    <div className="w-full max-w-md">
      <DonutChart
        xKey="region"
        data={SLICE_DATA}
        height={height}
        showLegend={showLegend}
        showTooltip={showTooltip}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        series={[{ key: 'value', label: 'Users' }]}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}

export function RadialChartShim({
  height = 260,
  showLegend = true,
  showTooltip = true,
  innerRadius = 30,
  outerRadius = 110,
  className,
}: SliceChartShimProps) {
  return (
    <div className="w-full max-w-md">
      <RadialChart
        xKey="region"
        data={SLICE_DATA}
        height={height}
        showLegend={showLegend}
        showTooltip={showTooltip}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        series={[{ key: 'value', label: 'Users' }]}
        {...(className !== undefined ? { className } : {})}
      />
    </div>
  );
}
