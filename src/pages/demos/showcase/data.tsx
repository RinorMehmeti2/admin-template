import {
  FormInput,
  LayoutDashboard,
  MessageSquareWarning,
  PanelsTopLeft,
  Sparkles,
  Table,
} from 'lucide-react';
import type { ShowcaseEntry } from './model';

export const ENTRIES: ReadonlyArray<ShowcaseEntry> = [
  {
    to: '/primitives',
    labelKey: 'showcase.entries.primitives.label',
    descriptionKey: 'showcase.entries.primitives.description',
    countKey: 'showcase.entries.primitives.count',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    to: '/forms',
    labelKey: 'showcase.entries.forms.label',
    descriptionKey: 'showcase.entries.forms.description',
    countKey: 'showcase.entries.forms.count',
    icon: <FormInput className="h-5 w-5" />,
  },
  {
    to: '/feedback',
    labelKey: 'showcase.entries.feedback.label',
    descriptionKey: 'showcase.entries.feedback.description',
    countKey: 'showcase.entries.feedback.count',
    icon: <MessageSquareWarning className="h-5 w-5" />,
  },
  {
    to: '/data',
    labelKey: 'showcase.entries.data.label',
    descriptionKey: 'showcase.entries.data.description',
    countKey: 'showcase.entries.data.count',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    to: '/tables',
    labelKey: 'showcase.entries.tables.label',
    descriptionKey: 'showcase.entries.tables.description',
    countKey: 'showcase.entries.tables.count',
    icon: <Table className="h-5 w-5" />,
  },
  {
    to: '/layout',
    labelKey: 'showcase.entries.layout.label',
    descriptionKey: 'showcase.entries.layout.description',
    countKey: 'showcase.entries.layout.count',
    icon: <PanelsTopLeft className="h-5 w-5" />,
  },
];
