import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useState } from 'react';
import {
  act,
  createEvent,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { Dropzone } from './Dropzone';
import type { DropzoneFile, DropzoneRejection } from './Dropzone.types';

function makeFile(name: string, type = 'text/plain', size = 32): File {
  const f = new File([new Array(size).fill('x').join('')], name, { type });
  return f;
}

function getRoot(name = 'Upload'): HTMLElement {
  return screen.getByRole('button', { name });
}

function getHiddenInput(): HTMLInputElement {
  const input = document.querySelector('input[type="file"]');
  if (input === null) throw new Error('hidden file input not found');
  return input as HTMLInputElement;
}

function fireDrop(target: Element, files: ReadonlyArray<File>) {
  const dropEvent = createEvent.drop(target);
  Object.defineProperty(dropEvent, 'dataTransfer', {
    value: { files, types: ['Files'] },
  });
  fireEvent(target, dropEvent);
}

beforeEach(() => {
  if (typeof URL.createObjectURL === 'undefined') {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: () => 'blob:fake',
    });
  }
  if (typeof URL.revokeObjectURL === 'undefined') {
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: () => undefined,
    });
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Dropzone', () => {
  it('renders default card variant with browse indicator + headline', () => {
    render(<Dropzone label="Upload" description="Drop files here" hint="PDF only" />);
    expect(getRoot('Upload')).toBeInTheDocument();
    expect(screen.getByText('Drop files here')).toBeInTheDocument();
    expect(screen.getByText('PDF only')).toBeInTheDocument();
    expect(screen.getByText('Browse files')).toBeInTheDocument();
  });

  it.each(['card', 'inline', 'compact', 'avatar'] as const)(
    'renders variant=%s with role=button root',
    (variant) => {
      render(<Dropzone variant={variant} label="Upload" />);
      const matches = screen.getAllByRole('button', { name: 'Upload' });
      const root = matches[0];
      expect(root).toBeDefined();
      expect(root!.tagName.toLowerCase()).toBe('div');
    },
  );

  it('click on root triggers hidden input.click()', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(<Dropzone label="Upload" />);
    await user.click(getRoot('Upload'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('Enter and Space on root trigger hidden input.click()', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(<Dropzone label="Upload" />);
    const root = getRoot('Upload');
    root.focus();
    fireEvent.keyDown(root, { key: 'Enter' });
    expect(clickSpy).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(root, { key: ' ' });
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('onFilesChange fires with normalized DropzoneFile[] from native input', async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    render(<Dropzone label="Upload" onFilesChange={onFilesChange} />);
    const file = makeFile('hello.txt');
    await user.upload(getHiddenInput(), file);
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    const arg = onFilesChange.mock.calls[0]?.[0] as ReadonlyArray<DropzoneFile>;
    expect(arg).toHaveLength(1);
    expect(arg[0]?.name).toBe('hello.txt');
    expect(arg[0]?.status).toBe('queued');
    expect(arg[0]?.progress).toBe(0);
    expect(typeof arg[0]?.id).toBe('string');
  });

  it('accept filter rejects mismatched mime (drop bypasses native input filter)', () => {
    const onFilesChange = vi.fn();
    const onFilesRejected = vi.fn();
    render(
      <Dropzone
        label="Upload"
        accept="image/*"
        onFilesChange={onFilesChange}
        onFilesRejected={onFilesRejected}
      />,
    );
    const ok = makeFile('a.png', 'image/png');
    const bad = makeFile('b.txt', 'text/plain');
    fireDrop(getRoot('Upload'), [ok, bad]);
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    const accepted = onFilesChange.mock.calls[0]?.[0] as ReadonlyArray<DropzoneFile>;
    expect(accepted).toHaveLength(1);
    expect(accepted[0]?.name).toBe('a.png');
    expect(onFilesRejected).toHaveBeenCalledTimes(1);
    const rejected = onFilesRejected.mock.calls[0]?.[0] as ReadonlyArray<DropzoneRejection>;
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.reason).toBe('type');
  });

  it('maxSize rejects oversized files', async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    const onFilesRejected = vi.fn();
    render(
      <Dropzone
        label="Upload"
        maxSize={50}
        onFilesChange={onFilesChange}
        onFilesRejected={onFilesRejected}
      />,
    );
    const small = makeFile('small.txt', 'text/plain', 10);
    const big = makeFile('big.txt', 'text/plain', 200);
    await user.upload(getHiddenInput(), [small, big]);
    const rejected = onFilesRejected.mock.calls[0]?.[0] as ReadonlyArray<DropzoneRejection>;
    expect(rejected[0]?.reason).toBe('size');
    const accepted = onFilesChange.mock.calls[0]?.[0] as ReadonlyArray<DropzoneFile>;
    expect(accepted).toHaveLength(1);
    expect(accepted[0]?.name).toBe('small.txt');
  });

  it('maxFiles rejects overflow', async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    const onFilesRejected = vi.fn();
    render(
      <Dropzone
        label="Upload"
        maxFiles={2}
        onFilesChange={onFilesChange}
        onFilesRejected={onFilesRejected}
      />,
    );
    const files = [
      makeFile('a.txt'),
      makeFile('b.txt'),
      makeFile('c.txt'),
    ];
    await user.upload(getHiddenInput(), files);
    const accepted = onFilesChange.mock.calls[0]?.[0] as ReadonlyArray<DropzoneFile>;
    expect(accepted).toHaveLength(2);
    const rejected = onFilesRejected.mock.calls[0]?.[0] as ReadonlyArray<DropzoneRejection>;
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.reason).toBe('count');
  });

  it('multiple=false accepts only the first file', async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    render(<Dropzone label="Upload" multiple={false} onFilesChange={onFilesChange} />);
    const a = makeFile('a.txt');
    const b = makeFile('b.txt');
    await user.upload(getHiddenInput(), [a, b]);
    const accepted = onFilesChange.mock.calls[0]?.[0] as ReadonlyArray<DropzoneFile>;
    expect(accepted).toHaveLength(1);
    expect(accepted[0]?.name).toBe('a.txt');
  });

  it('remove button removes file and calls onFilesChange', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [files, setFiles] = useState<ReadonlyArray<DropzoneFile>>([]);
      return (
        <Dropzone
          label="Upload"
          files={files}
          onFilesChange={(f) => setFiles(f)}
        />
      );
    }
    render(<Harness />);
    await user.upload(getHiddenInput(), [makeFile('a.txt'), makeFile('b.txt')]);
    expect(screen.getByText('a.txt')).toBeInTheDocument();
    expect(screen.getByText('b.txt')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove a.txt' }));
    expect(screen.queryByText('a.txt')).toBeNull();
    expect(screen.getByText('b.txt')).toBeInTheDocument();
  });

  it('disabled prevents clicks, drops, and disables remove', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    const onFilesChange = vi.fn();
    const seeded: DropzoneFile[] = [
      {
        id: 'seed-1',
        file: makeFile('seed.txt'),
        name: 'seed.txt',
        size: 10,
        type: 'text/plain',
        status: 'queued',
        progress: 0,
      },
    ];
    render(
      <Dropzone
        label="Upload"
        disabled
        defaultFiles={seeded}
        onFilesChange={onFilesChange}
      />,
    );
    await user.click(getRoot('Upload'));
    expect(clickSpy).not.toHaveBeenCalled();
    fireDrop(getRoot('Upload'), [makeFile('drop.txt')]);
    expect(onFilesChange).not.toHaveBeenCalled();
    const remove = screen.getByRole('button', { name: 'Remove seed.txt' });
    expect(remove).toBeDisabled();
  });

  it('errorMessage renders role=alert and applies danger styling', () => {
    render(<Dropzone label="Upload" errorMessage="File too big" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('File too big');
    const root = getRoot('Upload');
    expect(root).toHaveAttribute('aria-invalid', 'true');
    expect(root).toHaveAttribute('data-error', 'true');
  });

  it('drag-over flips data-drag-active; dragleave restores it', () => {
    render(<Dropzone label="Upload" />);
    const root = getRoot('Upload');
    expect(root).not.toHaveAttribute('data-drag-active');
    fireEvent.dragEnter(root);
    fireEvent.dragOver(root);
    expect(root).toHaveAttribute('data-drag-active', 'true');
    fireEvent.dragLeave(root);
    expect(root).not.toHaveAttribute('data-drag-active');
  });

  it('drop with DataTransfer fires onFilesChange', () => {
    const onFilesChange = vi.fn();
    render(<Dropzone label="Upload" onFilesChange={onFilesChange} />);
    fireDrop(getRoot('Upload'), [makeFile('drop.txt')]);
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    const accepted = onFilesChange.mock.calls[0]?.[0] as ReadonlyArray<DropzoneFile>;
    expect(accepted[0]?.name).toBe('drop.txt');
  });

  it('createObjectURL is invoked for images; revokeObjectURL on remove + unmount', async () => {
    const user = userEvent.setup();
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    function Harness() {
      const [files, setFiles] = useState<ReadonlyArray<DropzoneFile>>([]);
      return (
        <Dropzone
          label="Upload"
          files={files}
          onFilesChange={(f) => setFiles(f)}
        />
      );
    }
    const { unmount } = render(<Harness />);
    await user.upload(getHiddenInput(), [
      makeFile('pic1.png', 'image/png'),
      makeFile('pic2.png', 'image/png'),
    ]);
    expect(create).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole('button', { name: 'Remove pic1.png' }));
    expect(revoke).toHaveBeenCalledWith('blob:fake');
    const beforeUnmount = revoke.mock.calls.length;
    act(() => {
      unmount();
    });
    expect(revoke.mock.calls.length).toBeGreaterThan(beforeUnmount);
  });

  it('avatar variant forces multiple=false even when prop says true', async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    render(
      <Dropzone
        label="Avatar"
        variant="avatar"
        multiple
        onFilesChange={onFilesChange}
      />,
    );
    await user.upload(getHiddenInput(), [makeFile('a.png', 'image/png'), makeFile('b.png', 'image/png')]);
    const accepted = onFilesChange.mock.calls[0]?.[0] as ReadonlyArray<DropzoneFile>;
    expect(accepted).toHaveLength(1);
    expect(accepted[0]?.name).toBe('a.png');
    expect(getHiddenInput()).not.toHaveAttribute('multiple');
  });

  it('has no a11y violations (empty + populated)', async () => {
    const { container, rerender } = render(<Dropzone label="Upload" hint="PDF or images" />);
    expect(await runAxe(container)).toHaveNoViolations();

    const populated: DropzoneFile[] = [
      {
        id: 'q-1',
        file: makeFile('q.txt'),
        name: 'q.txt',
        size: 10,
        type: 'text/plain',
        status: 'queued',
        progress: 0,
      },
      {
        id: 'e-1',
        file: makeFile('e.txt'),
        name: 'e.txt',
        size: 10,
        type: 'text/plain',
        status: 'error',
        progress: 0,
        errorMessage: 'network',
      },
    ];
    rerender(<Dropzone label="Upload" hint="PDF or images" files={populated} onFilesChange={() => undefined} />);
    expect(await runAxe(container)).toHaveNoViolations();
    expect(within(container).getByText('q.txt')).toBeInTheDocument();
    expect(within(container).getByText('e.txt')).toBeInTheDocument();
  });
});
