import type { Editor } from '@tiptap/react';
import type { Ref } from 'react';

/**
 * Commands the toolbar / bubble menu can invoke. Stable string ids so
 * consumers can pass a custom subset for the `toolbar="custom"` variant.
 */
export type RichTextCommandId =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'paragraph'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'codeBlock'
  | 'horizontalRule'
  | 'link'
  | 'unlink'
  | 'undo'
  | 'redo';

export type RichTextToolbarPreset = 'full' | 'minimal';

export type RichTextToolbarOption =
  | RichTextToolbarPreset
  | ReadonlyArray<RichTextCommandId | 'separator'>
  | false;

export interface RichTextEditorHandle {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getHTML: () => string;
  getJSON: () => unknown;
  /** Escape hatch for advanced cases — prefer the methods above. */
  getEditor: () => Editor | null;
}

export interface RichTextEditorProps {
  ref?: Ref<RichTextEditorHandle>;
  /** Controlled HTML value. */
  value?: string;
  /** Initial HTML for uncontrolled mode. */
  defaultValue?: string;
  onChange?: (html: string) => void;
  onBlur?: () => void;
  readOnly?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
  className?: string;
  autoFocus?: boolean;
  /** px, default 160. */
  minHeight?: number;
  /** px, default unset (no max). */
  maxHeight?: number;
  /** Visual error state — flips border to danger and sets aria-invalid. */
  error?: boolean;
  /** 'full' (default), 'minimal', a custom command list, or false to hide. */
  toolbar?: RichTextToolbarOption;
  /** Show the floating selection menu. Default: true. */
  bubbleMenu?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export const FULL_TOOLBAR: ReadonlyArray<RichTextCommandId | 'separator'> = [
  'heading',
  'separator',
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'separator',
  'bulletList',
  'orderedList',
  'separator',
  'blockquote',
  'codeBlock',
  'horizontalRule',
  'separator',
  'link',
  'separator',
  'undo',
  'redo',
];

export const MINIMAL_TOOLBAR: ReadonlyArray<RichTextCommandId | 'separator'> = [
  'bold',
  'italic',
  'underline',
  'separator',
  'bulletList',
  'orderedList',
  'separator',
  'link',
];

export const BUBBLE_MENU_COMMANDS: ReadonlyArray<RichTextCommandId> = [
  'bold',
  'italic',
  'underline',
  'code',
  'link',
];
