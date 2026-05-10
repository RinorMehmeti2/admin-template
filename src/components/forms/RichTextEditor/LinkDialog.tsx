import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import type { Editor } from '@tiptap/react';
import { z } from 'zod';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/forms/Input';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/feedback/Dialog';

const urlSchema = z
  .string()
  .trim()
  .min(1, 'URL is required')
  .refine(
    (raw) => {
      // Accept absolute URLs, mailto:, tel:, and relative paths starting with "/".
      if (raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('/')) return true;
      try {
        const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
        new URL(candidate);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Enter a valid URL' },
  );

function normaliseHref(raw: string): string {
  const trimmed = raw.trim();
  if (
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('/') ||
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

interface LinkFormProps {
  editor: Editor;
  initialHref: string;
  onClose: () => void;
}

function LinkForm({ editor, initialHref, onClose }: LinkFormProps) {
  const [url, setUrl] = useState(initialHref);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  // Steal focus to the input once mounted; the parent Dialog has already
  // installed its focus trap by this point.
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = urlSchema.safeParse(url);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a valid URL');
      return;
    }
    const href = normaliseHref(parsed.data);
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href, target: '_blank', rel: 'noopener noreferrer nofollow' })
      .run();
    onClose();
  };

  const handleRemove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  const isEdit = initialHref !== '';

  return (
    <form onSubmit={handleSubmit}>
      <DialogBody className="space-y-3">
        <label htmlFor="rte-link-url" className="block text-sm font-medium">
          URL
        </label>
        <Input
          ref={inputRef}
          id="rte-link-url"
          type="text"
          placeholder="https://example.com"
          value={url}
          variant={error !== null ? 'error' : 'default'}
          aria-describedby={error !== null ? errorId : undefined}
          onChange={(e) => {
            setUrl(e.currentTarget.value);
            if (error !== null) setError(null);
          }}
        />
        {error !== null ? (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : null}
      </DialogBody>
      <DialogFooter>
        {isEdit ? (
          <Button type="button" variant="ghost" onClick={handleRemove}>
            Remove link
          </Button>
        ) : null}
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? 'Update' : 'Add link'}</Button>
      </DialogFooter>
    </form>
  );
}

export interface LinkDialogProps {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkDialog({ editor, open, onOpenChange }: LinkDialogProps) {
  if (editor === null) return null;
  const hrefAttr = editor.getAttributes('link').href;
  const initialHref = typeof hrefAttr === 'string' ? hrefAttr : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{initialHref === '' ? 'Insert link' : 'Edit link'}</DialogTitle>
        </DialogHeader>
        {/* Remount the form whenever the dialog opens so URL state initialises
            from the current selection's existing href without an effect. */}
        {open ? (
          <LinkForm
            key={`${open}-${initialHref}`}
            editor={editor}
            initialHref={initialHref}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
