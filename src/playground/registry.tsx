import { ArrowRight, Inbox, Plus, Settings, Trash2, Users } from 'lucide-react';
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
import { Label } from '@/components/forms/Label';

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
import { StatCard } from '@/components/data-display/StatCard';
import { EmptyState } from '@/components/data-display/EmptyState';

import { Container } from '@/components/layout/Container';

import {
  AccordionShim,
  AreaChartShim,
  AvatarGroupShim,
  BarChartShim,
  BottomSheetShim,
  BreadcrumbsShim,
  CalendarShim,
  CarouselShim,
  ComboboxShim,
  CommandPaletteShim,
  ComposedChartShim,
  ConfirmDialogShim,
  ContextMenuShim,
  DataTableShim,
  DialogShim,
  DonutChartShim,
  DrawerShim,
  DropdownMenuShim,
  FileExplorerShim,
  FilterableSearchShim,
  FormFieldShim,
  FormWizardShim,
  ImageGalleryShim,
  KanbanShim,
  LineChartShim,
  ListShim,
  MenuShim,
  NotificationsBellShim,
  PaginationShim,
  PageHeaderShim,
  PieChartShim,
  RadialChartShim,
  RadioGroupShim,
  RadioShim,
  RepeaterShim,
  RichTextEditorShim,
  SelectShim,
  SplitLayoutShim,
  StackedBarChartShim,
  StepperShim,
  StickyCardShim,
  TableShim,
  TabsShim,
  TimelineShim,
  TooltipShim,
  TreeViewShim,
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
 * styleProfile: defaults to { kind: 'all' } when omitted. Tune per-family
 * so the overlay panel only shows sections that apply (a Spinner has no
 * useful "Typography" panel; a Card sized by its contents has no useful
 * "Width" panel inside a Size group, etc.). See StyleOverlayProfile in
 * types.ts.
 *
 * Components NOT in the registry are catalogued in SKIPPED_BY_DESIGN below
 * with a one-line reason — grep that map before adding a new entry.
 */

export const PLAYGROUND_REGISTRY: PlaygroundRegistry = [
  /* ------------------------------------ Primitives ------------------------------------ */
  {
    name: 'Button',
    category: 'primitives',
    component: Button,
    keywords: ['action', 'cta'],
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'colors', 'size', 'typography', 'effects', 'className'],
    },
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
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'colors', 'typography', 'className'],
    },
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
    styleProfile: { kind: 'pick', sections: ['border', 'size', 'effects', 'className'] },
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
    styleProfile: { kind: 'pick', sections: ['border', 'size', 'effects', 'className'] },
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
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'colors', 'size', 'typography', 'effects', 'className'],
    },
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
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'colors', 'size', 'className'],
    },
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
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'colors', 'size', 'className'],
    },
    propSchemas: {
      className: { kind: 'string', default: 'h-4 w-40' },
    },
  },
  {
    name: 'Kbd',
    category: 'primitives',
    component: Kbd,
    keywords: ['keyboard', 'shortcut', 'key'],
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'colors', 'size', 'className'],
    },
    propSchemas: {
      children: { kind: 'string', default: '⌘K' },
    },
  },
  {
    name: 'Separator',
    category: 'primitives',
    component: Separator,
    keywords: ['divider', 'rule', 'hr'],
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'colors', 'size', 'className'],
    },
    propSchemas: {
      orientation: { kind: 'enum', options: ['horizontal', 'vertical'], default: 'horizontal' },
      decorative: { kind: 'boolean', default: true },
    },
  },

  /* --------------------------------------- Forms -------------------------------------- */
  {
    name: 'Label',
    category: 'forms',
    component: Label,
    keywords: ['label', 'field'],
    propSchemas: {
      children: { kind: 'string', default: 'Email address' },
      required: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Input',
    category: 'forms',
    component: Input,
    keywords: ['text', 'field'],
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'pick', sections: ['colors', 'size', 'className'] },
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
    styleProfile: { kind: 'pick', sections: ['colors', 'size', 'className'] },
    propSchemas: {
      defaultChecked: { kind: 'boolean', default: false },
      indeterminate: { kind: 'boolean', default: false },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Radio',
    category: 'forms',
    component: RadioShim,
    keywords: ['radio', 'option', 'choice'],
    styleProfile: { kind: 'pick', sections: ['colors', 'size', 'className'] },
    propSchemas: {
      value: { kind: 'string', default: 'standard' },
      children: { kind: 'string', default: 'Standard' },
      disabled: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'Slider',
    category: 'forms',
    component: Slider,
    keywords: ['range', 'value'],
    styleProfile: { kind: 'none' },
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
    styleProfile: { kind: 'none' },
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
    styleProfile: { kind: 'none' },
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
    styleProfile: { kind: 'none' },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'effects', 'size', 'className'],
    },
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
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'effects', 'size', 'className'],
    },
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
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'effects', 'size', 'className'],
    },
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
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'effects', 'size', 'className'],
    },
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
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'effects', 'size', 'className'],
    },
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
    styleProfile: { kind: 'pick', sections: ['spacing', 'size', 'className'] },
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
    styleProfile: { kind: 'pick', sections: ['spacing', 'size', 'className'] },
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
  {
    name: 'Repeater',
    category: 'forms',
    component: RepeaterShim,
    keywords: ['repeater', 'list', 'rows', 'add', 'remove'],
    styleProfile: { kind: 'pick', sections: ['spacing', 'size', 'className'] },
    propSchemas: {
      min: { kind: 'number', default: 1, min: 0, max: 5, step: 1 },
      max: { kind: 'number', default: 5, min: 1, max: 20, step: 1 },
      addLabel: { kind: 'string', default: 'Add row' },
      variant: { kind: 'enum', options: ['separated', 'stacked'], default: 'separated' },
    },
  },
  {
    name: 'RichTextEditor',
    category: 'forms',
    component: RichTextEditorShim,
    keywords: ['wysiwyg', 'tiptap', 'prosemirror', 'editor'],
    styleProfile: { kind: 'pick', sections: ['border', 'size', 'className'] },
    propSchemas: {
      placeholder: { kind: 'string', default: 'Write something…' },
      readOnly: { kind: 'boolean', default: false },
      minHeight: { kind: 'number', default: 160, min: 80, max: 480, step: 8 },
      toolbar: { kind: 'enum', options: ['full', 'minimal', 'hidden'], default: 'full' },
      bubbleMenu: { kind: 'boolean', default: true },
      error: { kind: 'boolean', default: false },
    },
  },

  /* ------------------------------------- Feedback ------------------------------------- */
  {
    name: 'Alert',
    category: 'feedback',
    component: Alert,
    keywords: ['banner', 'message', 'notice'],
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'pick', sections: ['size', 'colors', 'className'] },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
    styleProfile: { kind: 'omit', sections: ['typography'] },
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
  {
    name: 'NotificationsBell',
    category: 'feedback',
    component: NotificationsBellShim,
    keywords: ['notifications', 'bell', 'inbox', 'unread'],
    styleProfile: { kind: 'pick', sections: ['size', 'className'] },
    propSchemas: {
      size: { kind: 'enum', options: ['sm', 'md'], default: 'md' },
      persistOpen: { kind: 'boolean', default: false },
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
    name: 'Accordion',
    category: 'navigation',
    component: AccordionShim,
    keywords: ['accordion', 'collapse', 'disclosure'],
    propSchemas: {
      type: { kind: 'enum', options: ['single', 'multiple'], default: 'single' },
      variant: {
        kind: 'enum',
        options: ['default', 'bordered', 'separated'],
        default: 'default',
      },
      collapsible: { kind: 'boolean', default: true },
      defaultValue: {
        kind: 'enum',
        options: ['item-1', 'item-2', 'item-3'],
        default: 'item-1',
      },
    },
  },
  {
    name: 'Menu',
    category: 'navigation',
    component: MenuShim,
    keywords: ['sidebar', 'nav', 'menu'],
    propSchemas: {
      iconOnly: { kind: 'boolean', default: false },
      ariaLabel: { kind: 'string', default: 'Sidebar' },
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
  {
    name: 'ContextMenu',
    category: 'navigation',
    component: ContextMenuShim,
    keywords: ['menu', 'context', 'right-click'],
    propSchemas: {},
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
    name: 'StatCard',
    category: 'data-display',
    component: StatCard,
    keywords: ['metric', 'kpi', 'card'],
    propSchemas: {
      label: { kind: 'string', default: 'Active users' },
      value: { kind: 'number', default: 12481, step: 1 },
      delta: { kind: 'number', default: 8.2, step: 0.1 },
      deltaLabel: { kind: 'string', default: 'vs last week' },
      unit: { kind: 'string', default: '' },
      variant: {
        kind: 'enum',
        options: ['default', 'outlined', 'elevated', 'accent'],
        default: 'outlined',
      },
      size: { kind: 'enum', options: ['sm', 'md', 'lg'], default: 'md' },
      loading: { kind: 'boolean', default: false },
      animate: { kind: 'boolean', default: true },
      icon: {
        kind: 'jsx',
        default: '<Users className="h-4 w-4" />',
        presets: [
          {
            label: 'Users',
            value: '<Users className="h-4 w-4" />',
            node: <Users className="h-4 w-4" />,
          },
          {
            label: 'Inbox',
            value: '<Inbox className="h-4 w-4" />',
            node: <Inbox className="h-4 w-4" />,
          },
        ],
      },
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
  {
    name: 'DataTable',
    category: 'data-display',
    component: DataTableShim,
    keywords: ['datatable', 'tanstack', 'sort', 'filter'],
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'size', 'effects', 'className'],
    },
    propSchemas: {
      pageSize: { kind: 'number', default: 4, min: 1, max: 50, step: 1 },
      enableSorting: { kind: 'boolean', default: true },
      enableGlobalFilter: { kind: 'boolean', default: false },
      enableRowSelection: { kind: 'boolean', default: false },
      size: { kind: 'enum', options: ['dense', 'default', 'comfortable'], default: 'default' },
      variant: {
        kind: 'enum',
        options: ['default', 'striped', 'bordered'],
        default: 'default',
      },
    },
  },
  {
    name: 'FileExplorer',
    category: 'data-display',
    component: FileExplorerShim,
    keywords: ['files', 'folder', 'finder', 'explorer'],
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'size', 'effects', 'className'],
    },
    propSchemas: {
      viewMode: { kind: 'enum', options: ['list', 'grid'], default: 'list' },
      multiSelect: { kind: 'boolean', default: true },
    },
  },
  {
    name: 'FilterableSearch',
    category: 'data-display',
    component: FilterableSearchShim,
    keywords: ['filter', 'search', 'chips', 'facets'],
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'size', 'effects', 'className'],
    },
    propSchemas: {
      placeholder: { kind: 'string', default: 'Search users…' },
      hideAddFilter: { kind: 'boolean', default: false },
      debounceMs: { kind: 'number', default: 250, min: 0, max: 1000, step: 50 },
    },
  },
  {
    name: 'ImageGallery',
    category: 'data-display',
    component: ImageGalleryShim,
    keywords: ['gallery', 'images', 'lightbox'],
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'size', 'effects', 'className'],
    },
    propSchemas: {
      columns: { kind: 'number', default: 3, min: 1, max: 6, step: 1 },
      gap: { kind: 'number', default: 8, min: 0, max: 32, step: 2 },
      aspectRatio: { kind: 'enum', options: ['square', 'video', 'natural'], default: 'video' },
      disableLightbox: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'KanbanBoard',
    category: 'data-display',
    component: KanbanShim,
    keywords: ['kanban', 'board', 'drag', 'drop'],
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'size', 'effects', 'className'],
    },
    propSchemas: {
      allowReorderWithinColumn: { kind: 'boolean', default: true },
    },
  },
  {
    name: 'TreeView',
    category: 'data-display',
    component: TreeViewShim,
    keywords: ['tree', 'hierarchy', 'nodes'],
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'size', 'effects', 'className'],
    },
    propSchemas: {
      selectionMode: { kind: 'enum', options: ['none', 'single', 'multiple'], default: 'single' },
    },
  },
  {
    name: 'Carousel',
    category: 'data-display',
    component: CarouselShim,
    keywords: ['carousel', 'slider', 'slides'],
    styleProfile: {
      kind: 'pick',
      sections: ['spacing', 'border', 'size', 'effects', 'className'],
    },
    propSchemas: {
      loop: { kind: 'boolean', default: true },
      autoplayMs: { kind: 'number', default: 0, min: 0, max: 10_000, step: 500 },
      showArrows: { kind: 'boolean', default: true },
      showDots: { kind: 'boolean', default: true },
      arrowPosition: { kind: 'enum', options: ['overlay', 'outside'], default: 'overlay' },
    },
  },

  /* ---------------------------- Data display — charts -------------------------------- */
  {
    name: 'AreaChart',
    category: 'data-display',
    component: AreaChartShim,
    keywords: ['chart', 'area', 'recharts'],
    styleProfile: { kind: 'pick', sections: ['size', 'effects', 'className'] },
    propSchemas: {
      height: { kind: 'number', default: 220, min: 120, max: 600, step: 20 },
      showGrid: { kind: 'boolean', default: true },
      showLegend: { kind: 'boolean', default: true },
      showTooltip: { kind: 'boolean', default: true },
    },
  },
  {
    name: 'BarChart',
    category: 'data-display',
    component: BarChartShim,
    keywords: ['chart', 'bar', 'recharts'],
    styleProfile: { kind: 'pick', sections: ['size', 'effects', 'className'] },
    propSchemas: {
      height: { kind: 'number', default: 220, min: 120, max: 600, step: 20 },
      showGrid: { kind: 'boolean', default: true },
      showLegend: { kind: 'boolean', default: true },
      showTooltip: { kind: 'boolean', default: true },
    },
  },
  {
    name: 'LineChart',
    category: 'data-display',
    component: LineChartShim,
    keywords: ['chart', 'line', 'recharts'],
    styleProfile: { kind: 'pick', sections: ['size', 'effects', 'className'] },
    propSchemas: {
      height: { kind: 'number', default: 220, min: 120, max: 600, step: 20 },
      showGrid: { kind: 'boolean', default: true },
      showLegend: { kind: 'boolean', default: true },
      showTooltip: { kind: 'boolean', default: true },
    },
  },
  {
    name: 'StackedBarChart',
    category: 'data-display',
    component: StackedBarChartShim,
    keywords: ['chart', 'bar', 'stacked'],
    styleProfile: { kind: 'pick', sections: ['size', 'effects', 'className'] },
    propSchemas: {
      height: { kind: 'number', default: 220, min: 120, max: 600, step: 20 },
      showGrid: { kind: 'boolean', default: true },
      showLegend: { kind: 'boolean', default: true },
      showTooltip: { kind: 'boolean', default: true },
    },
  },
  {
    name: 'ComposedChart',
    category: 'data-display',
    component: ComposedChartShim,
    keywords: ['chart', 'composed', 'mixed'],
    styleProfile: { kind: 'pick', sections: ['size', 'effects', 'className'] },
    propSchemas: {
      height: { kind: 'number', default: 220, min: 120, max: 600, step: 20 },
      showGrid: { kind: 'boolean', default: true },
      showLegend: { kind: 'boolean', default: true },
      showTooltip: { kind: 'boolean', default: true },
    },
  },
  {
    name: 'PieChart',
    category: 'data-display',
    component: PieChartShim,
    keywords: ['chart', 'pie', 'slice'],
    styleProfile: { kind: 'pick', sections: ['size', 'effects', 'className'] },
    propSchemas: {
      height: { kind: 'number', default: 240, min: 160, max: 600, step: 20 },
      showLegend: { kind: 'boolean', default: true },
      showTooltip: { kind: 'boolean', default: true },
    },
  },
  {
    name: 'DonutChart',
    category: 'data-display',
    component: DonutChartShim,
    keywords: ['chart', 'donut', 'ring'],
    styleProfile: { kind: 'pick', sections: ['size', 'effects', 'className'] },
    propSchemas: {
      height: { kind: 'number', default: 240, min: 160, max: 600, step: 20 },
      innerRadius: { kind: 'number', default: 60, min: 20, max: 120, step: 5 },
      outerRadius: { kind: 'number', default: 100, min: 60, max: 200, step: 5 },
      showLegend: { kind: 'boolean', default: true },
      showTooltip: { kind: 'boolean', default: true },
    },
  },
  {
    name: 'RadialChart',
    category: 'data-display',
    component: RadialChartShim,
    keywords: ['chart', 'radial', 'gauge'],
    styleProfile: { kind: 'pick', sections: ['size', 'effects', 'className'] },
    propSchemas: {
      height: { kind: 'number', default: 260, min: 160, max: 600, step: 20 },
      innerRadius: { kind: 'number', default: 30, min: 0, max: 100, step: 5 },
      outerRadius: { kind: 'number', default: 110, min: 60, max: 200, step: 5 },
      showLegend: { kind: 'boolean', default: true },
      showTooltip: { kind: 'boolean', default: true },
    },
  },

  /* --------------------------------------- Layout ------------------------------------- */
  {
    name: 'Container',
    category: 'layout',
    component: Container,
    keywords: ['container', 'wrapper', 'page-width'],
    propSchemas: {
      size: { kind: 'enum', options: ['sm', 'md', 'lg', 'xl', 'full'], default: 'lg' },
    },
    childrenCode: '\n  <p className="text-sm text-foreground-muted">Page content.</p>\n',
    children: <p className="text-sm text-foreground-muted">Page content.</p>,
  },
  {
    name: 'PageHeader',
    category: 'layout',
    component: PageHeaderShim,
    keywords: ['header', 'title', 'page'],
    propSchemas: {
      title: { kind: 'string', default: 'Settings' },
      description: {
        kind: 'string',
        default: 'Manage your account and workspace preferences.',
        multiline: true,
      },
      showActions: { kind: 'boolean', default: true },
      showBreadcrumbs: { kind: 'boolean', default: false },
    },
  },
  {
    name: 'SplitLayout',
    category: 'layout',
    component: SplitLayoutShim,
    keywords: ['split', 'pane', 'resizable', 'master-detail'],
    propSchemas: {
      defaultLeftWidth: { kind: 'number', default: 200, min: 100, max: 480, step: 10 },
      minLeftWidth: { kind: 'number', default: 140, min: 80, max: 320, step: 10 },
      maxLeftWidth: { kind: 'number', default: 320, min: 160, max: 800, step: 10 },
      resizable: { kind: 'boolean', default: true },
      collapsible: { kind: 'boolean', default: true },
    },
  },
  {
    name: 'StickyCard',
    category: 'layout',
    component: StickyCardShim,
    keywords: ['sticky', 'scroll', 'pinned'],
    propSchemas: {
      offset: { kind: 'number', default: 0, min: 0, max: 200, step: 4 },
      variant: {
        kind: 'enum',
        options: ['default', 'outlined', 'elevated'],
        default: 'outlined',
      },
      shadowWhenStuck: { kind: 'boolean', default: true },
      compactWhenStuck: { kind: 'boolean', default: false },
    },
  },

  /* -------------------------------------- Overlays ------------------------------------ */
  {
    name: 'CommandPalette',
    category: 'overlays',
    component: CommandPaletteShim,
    keywords: ['palette', 'command', 'cmdk', 'spotlight'],
    styleProfile: {
      kind: 'pick',
      sections: ['border', 'size', 'effects', 'className'],
    },
    propSchemas: {
      placeholder: { kind: 'string', default: 'Type a command or search…' },
    },
  },
];

/*
 * SKIPPED_BY_DESIGN
 *
 * Components in `src/components/` that the playground intentionally does NOT
 * register, along with a one-line reason. Grep this map before adding a new
 * entry — the previous decision may still hold.
 *
 * If a skip reason is wrong (the component grew props since this map was
 * written) feel free to migrate the entry into PLAYGROUND_REGISTRY above
 * with an appropriate styleProfile.
 */

export const SKIPPED_BY_DESIGN: Record<string, string> = {
  // Forms ----------------------------------------------------------------
  Form: 'Composition primitive around react-hook-form. Canonical preview is the FormField/Input combo already covered by FormField and FormWizard.',

  // Feedback -------------------------------------------------------------
  Toast:
    'Transient — surfaced via useToast() context. Preview is the trigger that calls toast.success(...), not a component-in-isolation.',
  Toaster: 'Singleton portal mount for toasts. Always-on at the app root; no useful prop matrix.',
  ErrorBoundary:
    'Renders children when no error and a fallback otherwise. Useful preview requires a thrown error inside an inner subtree.',
  LoadingBoundary:
    'Wraps Suspense with a fallback. Useful preview requires a real pending promise.',

  // Layout / app shell ---------------------------------------------------
  AppLayout: 'App-shell wrapper. Preview by visiting any product page.',
  PageShell: 'Variant of AppLayout used by the /layout demo. Preview by visiting /layout.',
  Sidebar: 'Mounted by AppLayout/PageShell. Preview as part of a layout, not in isolation.',
  Topbar: 'Mounted by AppLayout. Preview as part of a layout.',
  FocusMode: 'Takes over the viewport. Preview at /focus.',
  FullscreenWorkspace: 'Takes over the viewport. Preview at /workspace.',
  ThemePicker: 'Already mounted in the playground header. A second instance would duplicate it.',
  TypographyPicker:
    'Already mounted in the playground header. A second instance would duplicate it.',
  ThemeToggle: 'Already mounted in the playground header.',
  LocaleSwitcher: 'Already mounted in the playground header.',

  // Data display --------------------------------------------------------
  ChartContainer:
    'Slot wrapper consumed by every chart component. Charts themselves are in the registry; the wrapper has no user-facing surface.',

  // Overlays ------------------------------------------------------------
  Portal: 'Implementation detail — wraps createPortal. No visual surface of its own.',
};
