import { Plus, Settings, Trash2 } from 'lucide-react';
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

/*
 * PLAYGROUND REGISTRY
 *
 * Starter set covering every major category. Adding more is a one-file
 * change — see src/playground/README.md.
 *
 * Guidelines for entries:
 *   - Prefer `defaultValue` / `defaultChecked` over controlled `value` so
 *     the playground doesn't need to manage state for every entry.
 *   - Use `kind: 'enum'` for cva-style string unions ('primary' | 'ghost' …).
 *   - Use `kind: 'jsx'` with `presets` for slot-like ReactNode props the user
 *     should pick from rather than type freehand. The literal source string is
 *     copied verbatim into "Copy code"; the matching `preset.node` renders live.
 *   - Components with required children pass `children` + `childrenCode`
 *     OR add a `children` entry to propSchemas (string for text, jsx for JSX).
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
      title: { kind: 'string', default: 'No results' },
      description: {
        kind: 'string',
        default: 'Try clearing your filters or widening the date range.',
        multiline: true,
      },
    },
  },
];
