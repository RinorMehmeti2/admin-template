// IMPORTANT: do NOT re-export the eager `RichTextEditor` from this barrel.
// It would put the module on the static import graph and Rollup's
// INEFFECTIVE_DYNAMIC_IMPORT optimization would refuse to split the chunk
// (TipTap + ProseMirror would land back in the main bundle).
//
// Tests and stories that need the eager component import it directly via
// './RichTextEditor'. Application code uses LazyRichTextEditor instead.
export { LazyRichTextEditor, type LazyRichTextEditorProps } from './lazy';
export type {
  RichTextEditorHandle,
  RichTextEditorProps,
  RichTextCommandId,
  RichTextToolbarOption,
  RichTextToolbarPreset,
} from './RichTextEditor.types';
// Constants live in the types file (no TipTap pull-in there) so re-exporting
// them does not contaminate the main bundle.
export { FULL_TOOLBAR, MINIMAL_TOOLBAR, BUBBLE_MENU_COMMANDS } from './RichTextEditor.types';
