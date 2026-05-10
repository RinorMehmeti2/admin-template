import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { cn } from '@/lib/cn';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';
import { EditorToolbar } from './EditorToolbar';
import { RichTextBubbleMenu } from './RichTextBubbleMenu';
import { LinkDialog } from './LinkDialog';
import type { RichTextEditorHandle, RichTextEditorProps } from './RichTextEditor.types';

const wrapperStyles = cva(
  'rounded-md border bg-surface text-sm transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background',
  {
    variants: {
      error: {
        true: 'border-danger focus-within:ring-danger',
        false: 'border-border focus-within:ring-ring',
      },
    },
    defaultVariants: { error: false },
  },
);

interface CSSVarStyle extends CSSProperties {
  ['--rte-min']?: string;
  ['--rte-max']?: string;
}

type WrapperVariants = VariantProps<typeof wrapperStyles>;

export function RichTextEditor({
  ref,
  value,
  defaultValue,
  onChange,
  onBlur,
  readOnly = false,
  placeholder,
  name: _name,
  id,
  className,
  autoFocus,
  minHeight = 160,
  maxHeight,
  error,
  toolbar = 'full',
  bubbleMenu = true,
  ...ariaProps
}: RichTextEditorProps) {
  const aria = useFieldAriaProps(
    {
      id,
      'aria-describedby': ariaProps['aria-describedby'],
      'aria-labelledby': ariaProps['aria-labelledby'],
    },
    error === true,
  );
  const isError = (error ?? aria.hasError) === true;
  const errorVariant: WrapperVariants['error'] = isError ? true : false;

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Default link config; we'll re-configure to keep clicks inert.
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
        },
        codeBlock: { HTMLAttributes: { spellcheck: 'false' } },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? '',
        showOnlyWhenEditable: true,
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
      }),
    ],
    content: value ?? defaultValue ?? '',
    editable: !readOnly,
    autofocus: autoFocus === true ? 'end' : false,
    // React 19 StrictMode mounts → unmounts → remounts, which destroys the
    // ProseMirror schema mid-flight. Defer the first render so useEditor
    // settles on a single live editor instance before any consumer calls
    // getHTML() / setContent(). Required since React 19; harmless before.
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      if (ed.isDestroyed) return;
      onChange?.(ed.getHTML());
    },
    onBlur: () => {
      onBlur?.();
    },
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-readonly': readOnly ? 'true' : 'false',
        ...(aria.id !== undefined ? { id: aria.id } : {}),
        ...(aria['aria-describedby'] !== undefined
          ? { 'aria-describedby': aria['aria-describedby'] }
          : {}),
        ...(aria['aria-labelledby'] !== undefined
          ? { 'aria-labelledby': aria['aria-labelledby'] }
          : {}),
        ...(ariaProps['aria-label'] !== undefined ? { 'aria-label': ariaProps['aria-label'] } : {}),
        ...(isError ? { 'aria-invalid': 'true' } : {}),
        ...(placeholder !== undefined ? { 'aria-placeholder': placeholder } : {}),
        class: cn(
          'rte-content min-h-[var(--rte-min)] max-h-[var(--rte-max,none)] overflow-auto px-3 py-2 outline-none text-foreground',
        ),
      },
    },
  });

  // Keep editable in sync with readOnly.
  useEffect(() => {
    if (editor === null || editor.isDestroyed) return;
    if (editor.isEditable === !readOnly) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  // Controlled value sync — only when external value differs from current HTML.
  useEffect(() => {
    if (editor === null || editor.isDestroyed) return;
    if (value === undefined) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  // Imperative handle.
  useImperativeHandle<RichTextEditorHandle, RichTextEditorHandle>(
    ref,
    () => ({
      focus: () => editor?.commands.focus(),
      blur: () => editor?.commands.blur(),
      clear: () => editor?.commands.clearContent(true),
      getHTML: () => (editor !== null && !editor.isDestroyed ? editor.getHTML() : ''),
      getJSON: () => (editor !== null && !editor.isDestroyed ? editor.getJSON() : null),
      getEditor: () => editor,
    }),
    [editor],
  );

  const openLinkDialog = useCallback(() => setLinkDialogOpen(true), []);

  const containerStyle = useMemo<CSSVarStyle>(() => {
    const style: CSSVarStyle = { '--rte-min': `${minHeight}px` };
    if (maxHeight !== undefined) style['--rte-max'] = `${maxHeight}px`;
    return style;
  }, [minHeight, maxHeight]);

  return (
    <div
      className={cn(
        wrapperStyles({ error: errorVariant }),
        readOnly && 'bg-surface-muted',
        className,
      )}
      style={containerStyle}
      data-readonly={readOnly}
    >
      {!readOnly && toolbar !== false ? (
        <EditorToolbar editor={editor} toolbar={toolbar} onOpenLinkDialog={openLinkDialog} />
      ) : null}
      <EditorContent editor={editor} />
      {bubbleMenu && !readOnly ? (
        <RichTextBubbleMenu editor={editor} onOpenLinkDialog={openLinkDialog} />
      ) : null}
      <LinkDialog editor={editor} open={linkDialogOpen} onOpenChange={setLinkDialogOpen} />
    </div>
  );
}
