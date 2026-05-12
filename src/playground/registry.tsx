import { Plus, Settings, Trash2, Inbox, ArrowRight } from 'lucide-react';
import type { PlaygroundRegistry } from './types';

import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { Avatar } from '@/components/primitives/Avatar';
import { IconButton } from '@/components/primitives/IconButton';
import { Spinner } from '@/components/primitives/Spinner';
import { Skeleton } from '@/components/primitives/Skeleton';
import { Kbd } from '@/components/primitives/Kbd';
import { Separator } from '@/components/primitives/Separator';

import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { NumberInput } from '@/components/forms/NumberInput';
import { Switch } from '@/components/forms/Switch';
import { Checkbox } from '@/components/forms/Checkbox';
import { Slider } from '@/components/forms/Slider';
import { ColorPicker } from '@/components/forms/ColorPicker';
import { Rating } from '@/components/forms/Rating';
import { OtpInput } from '@/components/forms/OtpInput';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { TagInput } from '@/components/forms/TagInput';
import { RangeSlider } from '@/components/forms/RangeSlider';
import { DatePicker } from '@/components/forms/DatePicker';
import { TimePicker } from '@/components/forms/TimePicker';
import { DateRangePicker } from '@/components/forms/DateRangePicker';
import { DateTimePicker } from '@/components/forms/DateTimePicker';

import { Alert } from '@/components/feedback/Alert';
import { Progress } from '@/components/feedback/Progress';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import { Stat } from '@/components/data-display/Stat';
import { EmptyState } from '@/components/data-display/EmptyState';

import {
  AvatarGroupShim,
  BottomSheetShim,
  BreadcrumbsShim,
  CalendarShim,
  ComboboxShim,
  ConfirmDialogShim,
  DialogShim,
  DrawerShim,
  DropdownMenuShim,
  FormFieldShim,
  FormWizardShim,
  ListShim,
  PaginationShim,
  RadioGroupShim,
  SelectShim,
  StepperShim,
  TableShim,
  TabsShim,
  TimelineShim,
  TooltipShim,
} from './shims';

/*
 * PLAYGROUND REGISTRY
 *
 * One-file change to add a component — see src/playground/README.md.
 *
 * Naming: entry.name is the JSX tag emitted by codegen. For composition
 * components (Dialog, Tabs, …) entry.component points at a *Shim wrapper
 * that supplies a canonical composition + trigger so the live preview is
 * meaningful, while entry.name keeps the canonical export name for
 * "Copy code".
 *
 * advancedStyle: defaults true. Set false for Rating-style components
 * that don't accept className/style at all.
 */

export const PLAYGROUND_REGISTRY: PlaygroundRegistry = [
  /* ------------------------------------ Primitives ------------------------------------ */
  {
    name: 'Button',
    category: 'primitives',
    component: Button,
    keywords: ['action', 'cta'],
    propSchemas: {
      children: { kind: 'string', default: 'Click me' },
      variant: {
        kind: 'enum',
        options: ['primary', 'secondary', 'ghost', 'outline', 'danger', 'link'],
        default: 'primary',
      },
      size: { kind: 'enum', options: ['sm', 'md', 'lg', 'icon'], default: 'md' },
      isLoading: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Badge',
    category: 'primitives',
    component: Badge,
    keywords: ['pill', 'tag', 'chip'],
    propSchemas: {
      children: { kind: 'string', default: 'Active' },
      variant: {
        kind: 'enum',
        options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
        default: 'neutral',
      },
      size: { kind: 'enum', options: ['sm', 'md'], default: 'sm' },
      dot: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Avatar',
    category: 'primitives',
    component: Avatar,
    keywords: ['user', 'profile', 'image'],
    propSchemas: {
      name: { kind: 'string', default: 'Ada Lovelace' },
      src: { kind: 'string', default: '', placeholder: 'https://… (optional)' },
      size: { kind: 'enum', options: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'md' },
      status: { kind: 'enum', options: ['online', 'offline', 'busy', 'away'] },
    },
  },
  {
    name: 'AvatarGroup',
    category: 'primitives',
    component: AvatarGroupShim,
    keywords: ['stack', 'overlap', 'team'],
    propSchemas: {
      size: { kind: 'enum', options: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'md' },
      spacing: { kind: 'enum', options: ['tight', 'normal', 'loose'], default: 'normal' },
      max: { kind: 'number', default: 5, min: 1, max: 10, step: 1 },
      reverseOrder: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'IconButton',
    category: 'primitives',
    component: IconButton,
    keywords: ['button', 'icon', 'action'],
    propSchemas: {
      'aria-label': { kind: 'string', default: 'Settings' },
      children: {
        kind: 'jsx',
        default: '<Settings className="h-4 w-4" />',
        presets: [
          {
            label: 'Settings',
            value: '<Settings className="h-4 w-4" />',
            node: <Settings className="h-4 w-4" />,
          },
          {
            label: 'Trash',
            value: '<Trash2 className="h-4 w-4" />',
            node: <Trash2 className="h-4 w-4" />,
          },
          {
            label: 'Plus',
            value: '<Plus className="h-4 w-4" />',
            node: <Plus className="h-4 w-4" />,
          },
        ],
      },
      variant: {
        kind: 'enum',
        options: ['primary', 'secondary', 'ghost', 'outline', 'danger', 'link'],
        default: 'ghost',
      },
      size: { kind: 'enum', options: ['sm', 'md', 'lg', 'icon'], default: 'md' },
      isLoading: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Spinner',
    category: 'primitives',
    component: Spinner,
    keywords: ['loading', 'busy'],
    propSchemas: {
      size: { kind: 'enum', options: ['xs', 'sm', 'md', 'lg'], default: 'md' },
      label: { kind: 'string', default: 'Loading' },
    },
  },
  {
    name: 'Skeleton',
    category: 'primitives',
    component: Skeleton,
    keywords: ['placeholder', 'loading'],
    propSchemas: {
      className: { kind: 'string', default: 'h-4 w-40' },
    },
  },
  {
    name: 'Kbd',
    category: 'primitives',
    component: Kbd,
    keywords: ['keyboard', 'shortcut', 'key'],
    propSchemas: {
      children: { kind: 'string', default: '⌘K' },
    },
  },
  {
    name: 'Separator',
    category: 'primitives',
    component: Separator,
    keywords: ['divider', 'rule', 'hr'],
    propSchemas: {
      orientation: { kind: 'enum', options: ['horizontal', 'vertical'], default: 'horizontal' },
      decorative: { kind: 'boolean', default: true },
    },
  },

  /* --------------------------------------- Forms -------------------------------------- */
  {
    name: 'Input',
    category: 'forms',
    component: Input,
    keywords: ['text', 'field'],
    propSchemas: {
      placeholder: { kind: 'string', default: 'Search…' },
      defaultValue: { kind: 'string', default: '' },
      variant: { kind: 'enum', options: ['default', 'error'], default: 'default' },
      inputSize: { kind: 'enum', options: ['sm', 'md', 'lg'], default: 'md' },
      disabled: { kind: 'boolean', default: false },
      readOnly: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Textarea',
    category: 'forms',
    component: Textarea,
    keywords: ['text', 'multiline', 'field'],
    propSchemas: {
      placeholder: { kind: 'string', default: 'Tell us more…' },
      defaultValue: { kind: 'string', default: '', multiline: true },
      variant: { kind: 'enum', options: ['default', 'error'], default: 'default' },
      autoResize: { kind: 'boolean', default: false },
      minRows: { kind: 'number', default: 2, min: 1, max: 10, step: 1 },
      maxRows: { kind: 'number', default: 10, min: 2, max: 30, step: 1 },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'NumberInput',
    category: 'forms',
    component: NumberInput,
    keywords: ['number', 'numeric', 'stepper'],
    propSchemas: {
      defaultValue: { kind: 'number', default: 0, step: 1 },
      min: { kind: 'number', default: 0, step: 1 },
      max: { kind: 'number', default: 100, step: 1 },
      step: { kind: 'number', default: 1, step: 1 },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Switch',
    category: 'forms',
    component: Switch,
    keywords: ['toggle', 'boolean'],
    propSchemas: {
      defaultChecked: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Checkbox',
    category: 'forms',
    component: Checkbox,
    keywords: ['toggle', 'tick'],
    propSchemas: {
      defaultChecked: { kind: 'boolean', default: false },
      indeterminate: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Slider',
    category: 'forms',
    component: Slider,
    keywords: ['range', 'value'],
    propSchemas: {
      defaultValue: { kind: 'number', default: 30, min: 0, max: 100, step: 1 },
      min: { kind: 'number', default: 0 },
      max: { kind: 'number', default: 100 },
      step: { kind: 'number', default: 1 },
      orientation: { kind: 'enum', options: ['horizontal', 'vertical'], default: 'horizontal' },
      disabled: { kind: 'boolean', default: false },
      'aria-label': { kind: 'string', default: 'Volume' },
    },
  },
  {
    name: 'RangeSlider',
    category: 'forms',
    component: RangeSlider,
    keywords: ['range', 'min', 'max', 'dual'],
    propSchemas: {
      min: { kind: 'number', default: 0 },
      max: { kind: 'number', default: 100 },
      step: { kind: 'number', default: 1 },
      orientation: { kind: 'enum', options: ['horizontal', 'vertical'], default: 'horizontal' },
      invert: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'ColorPicker',
    category: 'forms',
    component: ColorPicker,
    keywords: ['color', 'hex', 'rgb'],
    propSchemas: {
      defaultValue: { kind: 'color', default: '#6366f1' },
      format: { kind: 'enum', options: ['hex', 'rgb', 'hsl'], default: 'hex' },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Rating',
    category: 'forms',
    component: Rating,
    keywords: ['star', 'review', 'score'],
    advancedStyle: false,
    propSchemas: {
      defaultValue: { kind: 'number', default: 3, min: 0, max: 5, step: 0.5 },
      max: { kind: 'number', default: 5, min: 1, max: 10, step: 1 },
      size: { kind: 'enum', options: ['sm', 'md', 'lg'], default: 'md' },
      allowHalf: { kind: 'boolean', default: false },
      allowClear: { kind: 'boolean', default: true },
      readOnly: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'OtpInput',
    category: 'forms',
    component: OtpInput,
    keywords: ['otp', 'pin', 'code', 'verification'],
    propSchemas: {
      length: { kind: 'number', default: 6, min: 2, max: 12, step: 1 },
      size: { kind: 'enum', options: ['sm', 'md', 'lg'], default: 'md' },
      masked: { kind: 'boolean', default: false },
      error: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
      autoFocusOnMount: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'PhoneInput',
    category: 'forms',
    component: PhoneInput,
    keywords: ['phone', 'tel', 'country'],
    propSchemas: {
      defaultValue: { kind: 'string', default: '' },
      placeholder: { kind: 'string', default: '' },
      variant: { kind: 'enum', options: ['default', 'error'], default: 'default' },
      inputSize: { kind: 'enum', options: ['sm', 'md', 'lg'], default: 'md' },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'TagInput',
    category: 'forms',
    component: TagInput,
    keywords: ['tags', 'chips', 'multi'],
    propSchemas: {
      placeholder: { kind: 'string', default: 'Add tag and press Enter…' },
      variant: { kind: 'enum', options: ['default', 'error'], default: 'default' },
      inputSize: { kind: 'enum', options: ['sm', 'md', 'lg'], default: 'md' },
      maxTags: { kind: 'number', default: 8, min: 1, max: 20, step: 1 },
      allowDuplicates: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
      readOnly: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Combobox',
    category: 'forms',
    component: ComboboxShim,
    keywords: ['select', 'autocomplete', 'search', 'multi'],
    propSchemas: {
      placeholder: { kind: 'string', default: 'Select fruit…' },
      multiple: { kind: 'boolean', default: false },
      loading: { kind: 'boolean', default: false },
      creatable: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Select',
    category: 'forms',
    component: SelectShim,
    keywords: ['native', 'dropdown'],
    propSchemas: {
      defaultValue: { kind: 'enum', options: ['apple', 'banana', 'cherry'], default: 'apple' },
      variant: { kind: 'enum', options: ['default', 'error'], default: 'default' },
      selectSize: { kind: 'enum', options: ['sm', 'md', 'lg'], default: 'md' },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'RadioGroup',
    category: 'forms',
    component: RadioGroupShim,
    keywords: ['radio', 'group', 'choice'],
    propSchemas: {
      defaultValue: {
        kind: 'enum',
        options: ['basic', 'standard', 'premium'],
        default: 'standard',
      },
      orientation: { kind: 'enum', options: ['horizontal', 'vertical'], default: 'vertical' },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Calendar',
    category: 'forms',
    component: CalendarShim,
    keywords: ['date', 'month', 'days'],
    propSchemas: {
      weekStartsOn: { kind: 'number', default: 1, min: 0, max: 6, step: 1 },
      showOutsideDays: { kind: 'boolean', default: true },
    },
  },
  {
    name: 'DatePicker',
    category: 'forms',
    component: DatePicker,
    keywords: ['date', 'picker'],
    propSchemas: {
      placeholder: { kind: 'string', default: 'Pick a date' },
      format: { kind: 'string', default: 'PP' },
      allowTextInput: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
      error: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'TimePicker',
    category: 'forms',
    component: TimePicker,
    keywords: ['time', 'hours', 'minutes'],
    propSchemas: {
      format: { kind: 'enum', options: ['12h', '24h'], default: '24h' },
      step: { kind: 'number', default: 1, min: 1, max: 60, step: 1 },
      withSeconds: { kind: 'boolean', default: false },
      placeholder: { kind: 'string', default: 'HH:MM' },
      disabled: { kind: 'boolean', default: false },
      error: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'DateRangePicker',
    category: 'forms',
    component: DateRangePicker,
    keywords: ['range', 'date', 'from', 'to'],
    propSchemas: {
      format: { kind: 'string', default: 'PP' },
      placeholderFrom: { kind: 'string', default: 'Start date' },
      placeholderTo: { kind: 'string', default: 'End date' },
      hidePresets: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
      error: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'DateTimePicker',
    category: 'forms',
    component: DateTimePicker,
    keywords: ['date', 'time', 'datetime'],
    propSchemas: {
      timeFormat: { kind: 'enum', options: ['12h', '24h'], default: '24h' },
      withSeconds: { kind: 'boolean', default: false },
      datePlaceholder: { kind: 'string', default: 'Pick a date' },
      timePlaceholder: { kind: 'string', default: 'HH:MM' },
      disabled: { kind: 'boolean', default: false },
      error: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'FormField',
    category: 'forms',
    component: FormFieldShim,
    keywords: ['field', 'label', 'error'],
    propSchemas: {
      label: { kind: 'string', default: 'Email' },
      description: { kind: 'string', default: '' },
      error: { kind: 'string', default: '' },
      required: { kind: 'boolean', default: false },
      hideLabel: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'FormWizard',
    category: 'forms',
    component: FormWizardShim,
    keywords: ['wizard', 'steps', 'multi-step'],
    propSchemas: {
      orientation: { kind: 'enum', options: ['horizontal', 'vertical'], default: 'horizontal' },
      stepIndicatorVariant: {
        kind: 'enum',
        options: ['numbered', 'icons', 'dots', 'progress'],
        default: 'numbered',
      },
      responsiveOrientation: { kind: 'boolean', default: true },
      showSummaryStep: { kind: 'boolean', default: true },
      allowSkip: { kind: 'boolean', default: false },
    },
  },

  /* ------------------------------------- Feedback ------------------------------------- */
  {
    name: 'Alert',
    category: 'feedback',
    component: Alert,
    keywords: ['banner', 'message', 'notice'],
    propSchemas: {
      variant: {
        kind: 'enum',
        options: ['info', 'success', 'warning', 'danger', 'neutral'],
        default: 'info',
      },
      title: { kind: 'string', default: 'Heads up!' },
      description: {
        kind: 'string',
        default: 'You can pass any ReactNode into description.',
        multiline: true,
      },
    },
  },
  {
    name: 'Progress',
    category: 'feedback',
    component: Progress,
    keywords: ['bar', 'percent', 'loading'],
    propSchemas: {
      value: { kind: 'number', default: 65, min: 0, max: 100, step: 1 },
      max: { kind: 'number', default: 100 },
      variant: {
        kind: 'enum',
        options: ['default', 'success', 'warning', 'danger'],
        default: 'default',
      },
      size: { kind: 'enum', options: ['sm', 'md', 'lg'], default: 'md' },
      indeterminate: { kind: 'boolean', default: false },
      label: { kind: 'string', default: 'Upload progress' },
    },
  },
  {
    name: 'Tooltip',
    category: 'feedback',
    component: TooltipShim,
    keywords: ['hover', 'hint', 'overlay'],
    propSchemas: {
      label: { kind: 'string', default: 'Tooltip body text' },
      side: { kind: 'enum', options: ['top', 'right', 'bottom', 'left'], default: 'top' },
      defaultOpen: { kind: 'boolean', default: true },
      delayDuration: { kind: 'number', default: 300, min: 0, max: 2000, step: 50 },
    },
  },
  {
    name: 'Dialog',
    category: 'feedback',
    component: DialogShim,
    keywords: ['modal', 'overlay', 'locked'],
    propSchemas: {
      title: { kind: 'string', default: 'Dialog title' },
      description: {
        kind: 'string',
        default: 'Optional supporting copy beneath the title.',
        multiline: true,
      },
      size: { kind: 'enum', options: ['sm', 'md', 'lg', 'xl', 'full'], default: 'md' },
      variant: {
        kind: 'enum',
        options: ['default', 'info', 'success', 'warning', 'danger'],
        default: 'default',
      },
      closeOnOverlayClick: { kind: 'boolean', default: true },
      closeOnEscape: { kind: 'boolean', default: true },
      defaultOpen: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Drawer',
    category: 'feedback',
    component: DrawerShim,
    keywords: ['sidebar', 'panel', 'slide'],
    propSchemas: {
      title: { kind: 'string', default: 'Drawer title' },
      description: { kind: 'string', default: 'Slide-in panel for secondary content.' },
      side: { kind: 'enum', options: ['left', 'right', 'top', 'bottom'], default: 'right' },
      responsive: { kind: 'boolean', default: true },
      defaultOpen: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'BottomSheet',
    category: 'feedback',
    component: BottomSheetShim,
    keywords: ['mobile', 'sheet', 'snap'],
    propSchemas: {
      title: { kind: 'string', default: 'Bottom sheet' },
      defaultSnap: { kind: 'number', default: 50, min: 10, max: 95, step: 5 },
      defaultOpen: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'ConfirmDialog',
    category: 'feedback',
    component: ConfirmDialogShim,
    keywords: ['confirm', 'destructive', 'modal'],
    propSchemas: {
      title: { kind: 'string', default: 'Are you sure?' },
      description: { kind: 'string', default: 'This action cannot be undone.', multiline: true },
      confirmLabel: { kind: 'string', default: 'Confirm' },
      cancelLabel: { kind: 'string', default: 'Cancel' },
      variant: { kind: 'enum', options: ['default', 'danger'], default: 'default' },
      isLoading: { kind: 'boolean', default: false },
      open: { kind: 'boolean', default: true },
    },
  },

  /* ------------------------------------ Navigation ------------------------------------ */
  {
    name: 'Tabs',
    category: 'navigation',
    component: TabsShim,
    keywords: ['tabs', 'panels'],
    propSchemas: {
      variant: { kind: 'enum', options: ['underline', 'pills', 'segmented'], default: 'underline' },
      orientation: { kind: 'enum', options: ['horizontal', 'vertical'], default: 'horizontal' },
      defaultValue: {
        kind: 'enum',
        options: ['overview', 'activity', 'settings'],
        default: 'overview',
      },
    },
  },
  {
    name: 'Breadcrumbs',
    category: 'navigation',
    component: BreadcrumbsShim,
    keywords: ['nav', 'path', 'crumbs'],
    propSchemas: {
      separator: { kind: 'enum', options: ['chevron', 'slash', 'dot'], default: 'chevron' },
    },
  },
  {
    name: 'Pagination',
    category: 'navigation',
    component: PaginationShim,
    keywords: ['paging', 'page'],
    propSchemas: {
      page: { kind: 'number', default: 5, min: 1, max: 50, step: 1 },
      totalPages: { kind: 'number', default: 12, min: 1, max: 200, step: 1 },
      siblingCount: { kind: 'number', default: 1, min: 0, max: 5, step: 1 },
      boundaryCount: { kind: 'number', default: 1, min: 0, max: 5, step: 1 },
    },
  },
  {
    name: 'Stepper',
    category: 'navigation',
    component: StepperShim,
    keywords: ['steps', 'wizard', 'progress'],
    propSchemas: {
      orientation: { kind: 'enum', options: ['horizontal', 'vertical'], default: 'horizontal' },
    },
  },
  {
    name: 'DropdownMenu',
    category: 'navigation',
    component: DropdownMenuShim,
    keywords: ['menu', 'dropdown', 'actions'],
    propSchemas: {
      defaultOpen: { kind: 'boolean', default: true },
    },
  },

  /* ----------------------------------- Data display ----------------------------------- */
  {
    name: 'Card',
    category: 'data-display',
    component: Card,
    keywords: ['container', 'surface'],
    propSchemas: {
      variant: { kind: 'enum', options: ['default', 'outlined', 'elevated'], default: 'outlined' },
    },
    children: (
      <>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>A short supporting line of text.</CardDescription>
        </CardHeader>
        <CardContent>Body content goes here.</CardContent>
      </>
    ),
    childrenCode:
      '\n  <CardHeader>\n    <CardTitle>Card title</CardTitle>\n    <CardDescription>A short supporting line of text.</CardDescription>\n  </CardHeader>\n  <CardContent>Body content goes here.</CardContent>\n',
  },
  {
    name: 'Stat',
    category: 'data-display',
    component: Stat,
    keywords: ['metric', 'kpi', 'number'],
    propSchemas: {
      label: { kind: 'string', default: 'Active users' },
      value: { kind: 'string', default: '12,481' },
      delta: { kind: 'string', default: '+8.2%' },
      deltaLabel: { kind: 'string', default: 'vs last week' },
      variant: { kind: 'enum', options: ['default', 'compact'], default: 'default' },
    },
  },
  {
    name: 'EmptyState',
    category: 'data-display',
    component: EmptyState,
    keywords: ['empty', 'no-results', 'zero'],
    propSchemas: {
      icon: {
        kind: 'jsx',
        default: '<Inbox className="h-10 w-10" />',
        presets: [
          {
            label: 'Inbox',
            value: '<Inbox className="h-10 w-10" />',
            node: <Inbox className="h-10 w-10" />,
          },
          {
            label: 'Plus',
            value: '<Plus className="h-10 w-10" />',
            node: <Plus className="h-10 w-10" />,
          },
        ],
      },
      title: { kind: 'string', default: 'No results' },
      description: {
        kind: 'string',
        default: 'Try clearing your filters or widening the date range.',
        multiline: true,
      },
      action: {
        kind: 'jsx',
        default: '<Button leftIcon={<Plus className="h-4 w-4"/>}>Create</Button>',
        presets: [
          {
            label: 'Create',
            value: '<Button leftIcon={<Plus className="h-4 w-4"/>}>Create</Button>',
            node: <Button leftIcon={<Plus className="h-4 w-4" />}>Create</Button>,
          },
          {
            label: 'Get started',
            value: '<Button rightIcon={<ArrowRight className="h-4 w-4"/>}>Get started</Button>',
            node: <Button rightIcon={<ArrowRight className="h-4 w-4" />}>Get started</Button>,
          },
        ],
      },
    },
  },
  {
    name: 'List',
    category: 'data-display',
    component: ListShim,
    keywords: ['list', 'items'],
    propSchemas: {
      variant: { kind: 'enum', options: ['default', 'divided'], default: 'default' },
    },
  },
  {
    name: 'Timeline',
    category: 'data-display',
    component: TimelineShim,
    keywords: ['timeline', 'history', 'activity'],
    propSchemas: {
      orientation: { kind: 'enum', options: ['vertical', 'horizontal'], default: 'vertical' },
    },
  },
  {
    name: 'Table',
    category: 'data-display',
    component: TableShim,
    keywords: ['table', 'rows', 'data'],
    propSchemas: {
      variant: {
        kind: 'enum',
        options: ['default', 'striped', 'bordered'],
        default: 'default',
      },
      size: { kind: 'enum', options: ['dense', 'default', 'comfortable'], default: 'default' },
      hover: { kind: 'boolean', default: true },
    },
  },
];
