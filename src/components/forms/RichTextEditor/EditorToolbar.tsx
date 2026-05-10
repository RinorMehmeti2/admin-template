import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { type Editor, useEditorState } from '@tiptap/react';
import {
  Bold,
  ChevronDown,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/primitives/IconButton';
import { Separator } from '@/components/primitives/Separator';
import { Kbd } from '@/components/primitives/Kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { RovingFocusGroup, useRovingFocusItem } from '@/hooks/useRovingFocus';
import { LinkDialog } from './LinkDialog';
import type { RichTextCommandId, RichTextToolbarOption } from './RichTextEditor.types';
import { FULL_TOOLBAR, MINIMAL_TOOLBAR } from './RichTextEditor.types';

const META = navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';

interface ToolbarItemSpec {
  id: RichTextCommandId;
  label: string;
  shortcut?: string;
  icon: ReactNode;
}

const ITEMS: Record<RichTextCommandId, ToolbarItemSpec> = {
  bold: { id: 'bold', label: 'Bold', shortcut: `${META}+B`, icon: <Bold className="h-4 w-4" /> },
  italic: {
    id: 'italic',
    label: 'Italic',
    shortcut: `${META}+I`,
    icon: <Italic className="h-4 w-4" />,
  },
  underline: {
    id: 'underline',
    label: 'Underline',
    shortcut: `${META}+U`,
    icon: <Underline className="h-4 w-4" />,
  },
  strike: {
    id: 'strike',
    label: 'Strikethrough',
    icon: <Strikethrough className="h-4 w-4" />,
  },
  code: {
    id: 'code',
    label: 'Inline code',
    shortcut: `${META}+E`,
    icon: <Code className="h-4 w-4" />,
  },
  paragraph: {
    id: 'paragraph',
    label: 'Paragraph',
    icon: <Pilcrow className="h-4 w-4" />,
  },
  heading: {
    id: 'heading',
    label: 'Heading',
    icon: <Heading1 className="h-4 w-4" />,
  },
  bulletList: {
    id: 'bulletList',
    label: 'Bullet list',
    icon: <List className="h-4 w-4" />,
  },
  orderedList: {
    id: 'orderedList',
    label: 'Numbered list',
    icon: <ListOrdered className="h-4 w-4" />,
  },
  blockquote: {
    id: 'blockquote',
    label: 'Blockquote',
    icon: <Quote className="h-4 w-4" />,
  },
  codeBlock: {
    id: 'codeBlock',
    label: 'Code block',
    icon: <Code2 className="h-4 w-4" />,
  },
  horizontalRule: {
    id: 'horizontalRule',
    label: 'Horizontal rule',
    icon: <Minus className="h-4 w-4" />,
  },
  link: {
    id: 'link',
    label: 'Link',
    shortcut: `${META}+K`,
    icon: <LinkIcon className="h-4 w-4" />,
  },
  unlink: {
    id: 'unlink',
    label: 'Remove link',
    icon: <LinkIcon className="h-4 w-4" />,
  },
  undo: { id: 'undo', label: 'Undo', shortcut: `${META}+Z`, icon: <Undo2 className="h-4 w-4" /> },
  redo: {
    id: 'redo',
    label: 'Redo',
    shortcut: `${META}+Shift+Z`,
    icon: <Redo2 className="h-4 w-4" />,
  },
};

function resolveToolbar(
  toolbar: RichTextToolbarOption,
): ReadonlyArray<RichTextCommandId | 'separator'> {
  if (toolbar === 'minimal') return MINIMAL_TOOLBAR;
  if (toolbar === 'full' || toolbar === undefined) return FULL_TOOLBAR;
  if (Array.isArray(toolbar)) return toolbar;
  return FULL_TOOLBAR;
}

interface ToolbarState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  code: boolean;
  bulletList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  codeBlock: boolean;
  link: boolean;
  paragraph: boolean;
  heading1: boolean;
  heading2: boolean;
  heading3: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

const DEFAULT_STATE: ToolbarState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  code: false,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  codeBlock: false,
  link: false,
  paragraph: true,
  heading1: false,
  heading2: false,
  heading3: false,
  canUndo: false,
  canRedo: false,
};

interface ToolbarBtnProps {
  index: number;
  pressed: boolean;
  disabled?: boolean | undefined;
  label: string;
  shortcut?: string | undefined;
  icon: ReactNode;
  onClick: () => void;
}

function ToolbarBtn({ index, pressed, disabled, label, shortcut, icon, onClick }: ToolbarBtnProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { tabIndex, onKeyDown, onFocus } = useRovingFocusItem(index, ref);
  return (
    <Tooltip>
      <TooltipTrigger>
        <IconButton
          ref={ref}
          aria-label={label}
          aria-pressed={pressed}
          variant="ghost"
          size="sm"
          tabIndex={tabIndex}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          disabled={disabled}
          onClick={onClick}
          className={cn('h-8 w-8', pressed && 'bg-surface-muted text-foreground')}
        >
          {icon}
        </IconButton>
      </TooltipTrigger>
      <TooltipContent>
        <span className="flex items-center gap-1">
          {label}
          {shortcut !== undefined ? <Kbd>{shortcut}</Kbd> : null}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

interface HeadingPickerProps {
  index: number;
  editor: Editor;
  state: ToolbarState;
}

function HeadingPicker({ index, editor, state }: HeadingPickerProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { tabIndex, onKeyDown, onFocus } = useRovingFocusItem(index, ref);
  const current = state.heading1
    ? 'h1'
    : state.heading2
      ? 'h2'
      : state.heading3
        ? 'h3'
        : 'p';
  const labelMap = { p: 'Paragraph', h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3' } as const;

  const setBlock = (next: 'p' | 'h1' | 'h2' | 'h3') => {
    if (next === 'p') editor.chain().focus().setParagraph().run();
    else if (next === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
    else if (next === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
    else editor.chain().focus().toggleHeading({ level: 3 }).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          ref={ref}
          type="button"
          aria-label="Block type"
          tabIndex={tabIndex}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="flex items-center gap-1">
            {current === 'p' ? <Pilcrow className="h-4 w-4" /> : null}
            {current === 'h1' ? <Heading1 className="h-4 w-4" /> : null}
            {current === 'h2' ? <Heading2 className="h-4 w-4" /> : null}
            {current === 'h3' ? <Heading3 className="h-4 w-4" /> : null}
            <span className="hidden sm:inline">{labelMap[current]}</span>
          </span>
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(v) => setBlock(v as 'p' | 'h1' | 'h2' | 'h3')}
        >
          <DropdownMenuRadioItem value="p" closeOnSelect>
            <Pilcrow className="h-4 w-4" /> Paragraph
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="h1" closeOnSelect>
            <Heading1 className="h-4 w-4" /> Heading 1
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="h2" closeOnSelect>
            <Heading2 className="h-4 w-4" /> Heading 2
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="h3" closeOnSelect>
            <Heading3 className="h-4 w-4" /> Heading 3
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface EditorToolbarProps {
  editor: Editor | null;
  toolbar?: RichTextToolbarOption;
  className?: string;
  /** Open the link dialog. Bubble menu can also call this. */
  onOpenLinkDialog?: () => void;
}

export function EditorToolbar({
  editor,
  toolbar = 'full',
  className,
  onOpenLinkDialog,
}: EditorToolbarProps) {
  const items = resolveToolbar(toolbar);
  const [internalLinkOpen, setInternalLinkOpen] = useState(false);

  const state =
    useEditorState<ToolbarState | null>({
      editor,
      selector: ({ editor: ed }): ToolbarState | null => {
        if (ed === null) return null;
        return {
          bold: ed.isActive('bold'),
          italic: ed.isActive('italic'),
          underline: ed.isActive('underline'),
          strike: ed.isActive('strike'),
          code: ed.isActive('code'),
          bulletList: ed.isActive('bulletList'),
          orderedList: ed.isActive('orderedList'),
          blockquote: ed.isActive('blockquote'),
          codeBlock: ed.isActive('codeBlock'),
          link: ed.isActive('link'),
          paragraph: ed.isActive('paragraph'),
          heading1: ed.isActive('heading', { level: 1 }),
          heading2: ed.isActive('heading', { level: 2 }),
          heading3: ed.isActive('heading', { level: 3 }),
          canUndo: ed.can().chain().focus().undo().run(),
          canRedo: ed.can().chain().focus().redo().run(),
        };
      },
    }) ?? DEFAULT_STATE;

  if (editor === null) return null;

  const openLink = (): void => {
    if (onOpenLinkDialog !== undefined) onOpenLinkDialog();
    else setInternalLinkOpen(true);
  };

  const dispatch = (id: RichTextCommandId): void => {
    const c = editor.chain().focus();
    switch (id) {
      case 'bold':
        c.toggleBold().run();
        break;
      case 'italic':
        c.toggleItalic().run();
        break;
      case 'underline':
        c.toggleUnderline().run();
        break;
      case 'strike':
        c.toggleStrike().run();
        break;
      case 'code':
        c.toggleCode().run();
        break;
      case 'bulletList':
        c.toggleBulletList().run();
        break;
      case 'orderedList':
        c.toggleOrderedList().run();
        break;
      case 'blockquote':
        c.toggleBlockquote().run();
        break;
      case 'codeBlock':
        c.toggleCodeBlock().run();
        break;
      case 'horizontalRule':
        c.setHorizontalRule().run();
        break;
      case 'undo':
        c.undo().run();
        break;
      case 'redo':
        c.redo().run();
        break;
      case 'link':
        openLink();
        break;
      case 'unlink':
        c.extendMarkRange('link').unsetLink().run();
        break;
      case 'paragraph':
        c.setParagraph().run();
        break;
      case 'heading':
        c.toggleHeading({ level: 2 }).run();
        break;
    }
  };

  const isPressed = (id: RichTextCommandId): boolean => {
    switch (id) {
      case 'bold':
        return state.bold;
      case 'italic':
        return state.italic;
      case 'underline':
        return state.underline;
      case 'strike':
        return state.strike;
      case 'code':
        return state.code;
      case 'bulletList':
        return state.bulletList;
      case 'orderedList':
        return state.orderedList;
      case 'blockquote':
        return state.blockquote;
      case 'codeBlock':
        return state.codeBlock;
      case 'link':
        return state.link;
      default:
        return false;
    }
  };

  const isDisabled = (id: RichTextCommandId): boolean => {
    if (id === 'undo') return !state.canUndo;
    if (id === 'redo') return !state.canRedo;
    if (id === 'unlink') return !state.link;
    return false;
  };

  // Tab leaves the toolbar (per WAI-ARIA toolbar pattern).
  const onToolbarKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      // Allow default — focus moves out of toolbar to the editor (or wherever
      // the next tab stop is).
    }
  };

  let rovingIndex = 0;

  return (
    <>
      <div
        role="toolbar"
        aria-label="Text formatting"
        onKeyDown={onToolbarKeyDown}
        className={cn(
          'flex flex-wrap items-center gap-0.5 border-b border-border bg-surface px-1.5 py-1',
          className,
        )}
      >
        <RovingFocusGroup orientation="horizontal" loop>
          {items.map((entry, i) => {
            if (entry === 'separator') {
              return (
                <Separator
                  key={`sep-${i}`}
                  orientation="vertical"
                  className="mx-1 h-5"
                  decorative
                />
              );
            }
            if (entry === 'heading') {
              const idx = rovingIndex++;
              return <HeadingPicker key={entry} index={idx} editor={editor} state={state} />;
            }
            const spec = ITEMS[entry];
            const idx = rovingIndex++;
            return (
              <ToolbarBtn
                key={entry}
                index={idx}
                pressed={isPressed(entry)}
                disabled={isDisabled(entry)}
                label={spec.label}
                shortcut={spec.shortcut}
                icon={spec.icon}
                onClick={() => dispatch(entry)}
              />
            );
          })}
        </RovingFocusGroup>
      </div>
      {onOpenLinkDialog === undefined ? (
        <LinkDialog editor={editor} open={internalLinkOpen} onOpenChange={setInternalLinkOpen} />
      ) : null}
    </>
  );
}
