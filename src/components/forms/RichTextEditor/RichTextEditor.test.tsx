import { describe, it, expect, vi } from 'vitest';
import { createRef, useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichTextEditor } from './RichTextEditor';
import type { RichTextEditorHandle } from './RichTextEditor.types';
import { TooltipProvider } from '@/components/feedback/Tooltip';

function renderEditor(props: Parameters<typeof RichTextEditor>[0]) {
  // BubbleMenu uses Floating UI + selection coords that jsdom doesn't model.
  // Per the proposal, bubble-menu visibility is covered by Storybook play tests
  // / Playwright; here we disable it so toolbar-button queries are unambiguous.
  return render(
    <TooltipProvider delayDuration={0}>
      <RichTextEditor bubbleMenu={false} {...props} />
    </TooltipProvider>,
  );
}

function getEditable(): HTMLElement {
  return screen.getByRole('textbox');
}

describe('RichTextEditor', () => {
  it('renders empty with placeholder', () => {
    const ref = createRef<RichTextEditorHandle>();
    renderEditor({ ref, placeholder: 'Write something…' });
    expect(getEditable()).toBeInTheDocument();
    expect(getEditable()).toHaveAttribute('aria-multiline', 'true');
    expect(ref.current?.getHTML()).toBe('<p></p>');
  });

  it('renders with defaultValue HTML', () => {
    const ref = createRef<RichTextEditorHandle>();
    renderEditor({ ref, defaultValue: '<p>Hello <strong>world</strong></p>' });
    expect(ref.current?.getHTML()).toContain('<strong>world</strong>');
    expect(getEditable().textContent).toContain('Hello');
    expect(getEditable().querySelector('strong')?.textContent).toBe('world');
  });

  it('typing fires onChange with HTML containing the typed text', async () => {
    const onChange = vi.fn();
    renderEditor({ onChange });
    const editable = getEditable();
    await userEvent.click(editable);
    await userEvent.type(editable, 'hi');
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall).toContain('hi');
  });

  it.each([
    ['Bold', 'toggleBold', '<strong>x</strong>'],
    ['Italic', 'toggleItalic', '<em>x</em>'],
    ['Underline', 'toggleUnderline', '<u>x</u>'],
    ['Strikethrough', 'toggleStrike', '<s>x</s>'],
    ['Inline code', 'toggleCode', '<code>x</code>'],
  ])('toolbar %s toggles the mark', async (label, _cmd, marker) => {
    const ref = createRef<RichTextEditorHandle>();
    renderEditor({ ref, defaultValue: '<p>x</p>' });
    // Select the entire content so the mark can be applied.
    act(() => {
      ref.current?.getEditor()?.commands.selectAll();
    });
    await userEvent.click(screen.getByRole('button', { name: label }));
    await waitFor(() => {
      expect(ref.current?.getHTML()).toContain(marker);
    });
  });

  it('aria-pressed reflects the active mark at the cursor', async () => {
    const ref = createRef<RichTextEditorHandle>();
    renderEditor({ ref, defaultValue: '<p>x</p>' });
    act(() => {
      ref.current?.getEditor()?.commands.selectAll();
    });
    const boldBtn = screen.getByRole('button', { name: 'Bold' });
    expect(boldBtn).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(boldBtn);
    await waitFor(() => {
      expect(boldBtn).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('bullet list toolbar wraps content in <ul>', async () => {
    const ref = createRef<RichTextEditorHandle>();
    renderEditor({ ref, defaultValue: '<p>item</p>' });
    act(() => {
      ref.current?.getEditor()?.commands.selectAll();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Bullet list' }));
    await waitFor(() => {
      expect(ref.current?.getHTML()).toMatch(/<ul[^>]*>/);
    });
  });

  it('heading dropdown changes block type', async () => {
    const ref = createRef<RichTextEditorHandle>();
    renderEditor({ ref, defaultValue: '<p>title</p>' });
    act(() => {
      ref.current?.getEditor()?.commands.selectAll();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Block type' }));
    await userEvent.click(await screen.findByRole('menuitemradio', { name: /Heading 2/ }));
    await waitFor(() => {
      expect(ref.current?.getHTML()).toMatch(/<h2[^>]*>title<\/h2>/);
    });
  });

  it('link toolbar opens dialog, saves link, then unlink', async () => {
    const ref = createRef<RichTextEditorHandle>();
    renderEditor({ ref, defaultValue: '<p>anchor</p>' });
    act(() => {
      ref.current?.getEditor()?.commands.selectAll();
    });
    // Open dialog from toolbar.
    await userEvent.click(screen.getByRole('button', { name: 'Link' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Type URL and submit.
    const input = screen.getByLabelText('URL') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, 'example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Add link' }));

    await waitFor(() => {
      expect(ref.current?.getHTML()).toMatch(
        /<a [^>]*href="https:\/\/example\.com"[^>]*>anchor<\/a>/,
      );
    });

    // Re-open dialog (now in edit mode) and remove the link.
    act(() => {
      ref.current?.getEditor()?.commands.selectAll();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Link' }));
    await screen.findByRole('dialog');
    await userEvent.click(screen.getByRole('button', { name: 'Remove link' }));

    await waitFor(() => {
      expect(ref.current?.getHTML()).not.toMatch(/<a /);
    });
  });

  it('link dialog rejects invalid URL', async () => {
    renderEditor({ defaultValue: '<p>anchor</p>' });
    await userEvent.click(screen.getByRole('button', { name: 'Link' }));
    const input = screen.getByLabelText('URL') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Add link' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/required|valid/i);
  });

  it('readOnly hides the toolbar and the editor is not editable', () => {
    renderEditor({ defaultValue: '<p>frozen</p>', readOnly: true });
    expect(screen.queryByRole('toolbar', { name: 'Text formatting' })).toBeNull();
    const editable = getEditable();
    expect(editable).toHaveAttribute('contenteditable', 'false');
    expect(editable).toHaveAttribute('aria-readonly', 'true');
  });

  it('toolbar=false hides the toolbar even when editable', () => {
    renderEditor({ defaultValue: '<p>x</p>', toolbar: false });
    expect(screen.queryByRole('toolbar', { name: 'Text formatting' })).toBeNull();
  });

  it('custom toolbar renders only the listed commands', () => {
    renderEditor({ defaultValue: '<p>x</p>', toolbar: ['bold', 'italic'] });
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Bullet list' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Block type' })).toBeNull();
  });

  it('controlled value sync — external value change updates the editor', () => {
    function Controlled() {
      const [value, setValue] = useState('<p>first</p>');
      return (
        <>
          <button type="button" onClick={() => setValue('<p>second</p>')}>
            change
          </button>
          <RichTextEditor value={value} onChange={setValue} />
        </>
      );
    }
    render(
      <TooltipProvider delayDuration={0}>
        <Controlled />
      </TooltipProvider>,
    );
    expect(getEditable().textContent).toContain('first');
    act(() => {
      screen.getByRole('button', { name: 'change' }).click();
    });
    expect(getEditable().textContent).toContain('second');
  });

  it('undo / redo restore content', async () => {
    const ref = createRef<RichTextEditorHandle>();
    renderEditor({ ref, defaultValue: '<p>start</p>' });
    act(() => {
      const editor = ref.current?.getEditor();
      editor?.commands.focus('end');
      editor?.commands.insertContent(' more');
    });
    await waitFor(() => {
      expect(ref.current?.getHTML()).toContain('start more');
    });
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => {
      expect(ref.current?.getHTML()).not.toContain('start more');
    });
    await userEvent.click(screen.getByRole('button', { name: 'Redo' }));
    await waitFor(() => {
      expect(ref.current?.getHTML()).toContain('start more');
    });
  });

  it('imperative ref methods work', () => {
    const ref = createRef<RichTextEditorHandle>();
    renderEditor({ ref, defaultValue: '<p>hello</p>' });
    expect(ref.current?.getHTML()).toContain('hello');
    expect(ref.current?.getJSON()).toBeTruthy();
    expect(ref.current?.getEditor()).not.toBeNull();
    act(() => ref.current?.clear());
    expect(ref.current?.getHTML()).toBe('<p></p>');
  });
});
