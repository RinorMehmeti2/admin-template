import { useEffect, useRef } from 'react';
import { type Editor, useEditorState } from '@tiptap/react';
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu';
import { Bold, Code, Italic, Link as LinkIcon, Underline } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/primitives/IconButton';

interface BubbleState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  code: boolean;
  link: boolean;
  inCodeBlock: boolean;
}

const DEFAULT_BUBBLE_STATE: BubbleState = {
  bold: false,
  italic: false,
  underline: false,
  code: false,
  link: false,
  inCodeBlock: false,
};

export interface RichTextBubbleMenuProps {
  editor: Editor | null;
  onOpenLinkDialog: () => void;
}

export function RichTextBubbleMenu({ editor, onOpenLinkDialog }: RichTextBubbleMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  const state =
    useEditorState<BubbleState | null>({
      editor,
      selector: ({ editor: ed }): BubbleState | null => {
        if (ed === null) return null;
        return {
          bold: ed.isActive('bold'),
          italic: ed.isActive('italic'),
          underline: ed.isActive('underline'),
          code: ed.isActive('code'),
          link: ed.isActive('link'),
          inCodeBlock: ed.isActive('codeBlock'),
        };
      },
    }) ?? DEFAULT_BUBBLE_STATE;

  useEffect(() => {
    if (editor === null) return;
    const el = ref.current;
    if (el === null) return;

    const plugin = BubbleMenuPlugin({
      pluginKey: 'rteBubbleMenu',
      editor,
      element: el,
      shouldShow: ({ editor: ed, from, to }) => {
        if (!ed.isEditable) return false;
        if (from === to) return false;
        // Hide inside code blocks — code shouldn't get inline formatting.
        if (ed.isActive('codeBlock')) return false;
        return true;
      },
    });

    editor.registerPlugin(plugin);
    return () => {
      editor.unregisterPlugin('rteBubbleMenu');
    };
  }, [editor]);

  // The plugin manages display via inline styles. Start hidden so the empty
  // toolbar doesn't flash before the first selection.
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label="Selection formatting"
      className={cn(
        'z-[60] flex items-center gap-0.5 rounded-md border border-border bg-surface-elevated p-1 shadow-md',
      )}
      style={{ display: editor === null ? 'none' : undefined }}
    >
      <IconButton
        aria-label="Bold"
        aria-pressed={state.bold}
        variant="ghost"
        size="sm"
        className={cn('h-8 w-8', state.bold && 'bg-surface-muted')}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </IconButton>
      <IconButton
        aria-label="Italic"
        aria-pressed={state.italic}
        variant="ghost"
        size="sm"
        className={cn('h-8 w-8', state.italic && 'bg-surface-muted')}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </IconButton>
      <IconButton
        aria-label="Underline"
        aria-pressed={state.underline}
        variant="ghost"
        size="sm"
        className={cn('h-8 w-8', state.underline && 'bg-surface-muted')}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" />
      </IconButton>
      <IconButton
        aria-label="Inline code"
        aria-pressed={state.code}
        variant="ghost"
        size="sm"
        className={cn('h-8 w-8', state.code && 'bg-surface-muted')}
        onClick={() => editor?.chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </IconButton>
      <IconButton
        aria-label="Link"
        aria-pressed={state.link}
        variant="ghost"
        size="sm"
        className={cn('h-8 w-8', state.link && 'bg-surface-muted')}
        onClick={onOpenLinkDialog}
      >
        <LinkIcon className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
