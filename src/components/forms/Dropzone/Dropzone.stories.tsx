import { Dropzone } from './Dropzone';
import { FormField } from '@/components/forms/FormField';
import type { DropzoneFile } from './Dropzone.types';

export default { title: 'Forms/Dropzone', component: Dropzone };

function seedFile(
  name: string,
  type: string,
  size: number,
  status: DropzoneFile['status'],
  progress: number,
  errorMessage?: string,
): DropzoneFile {
  return {
    id: `seed-${name}`,
    file: new File([''], name, { type }),
    name,
    size,
    type,
    status,
    progress,
    ...(errorMessage !== undefined ? { errorMessage } : {}),
  };
}

export const Card = {
  render: () => (
    <div className="w-full max-w-xl">
      <Dropzone
        label="Drag & drop files"
        description="Or click to browse"
        hint="Any file, up to 10MB"
      />
    </div>
  ),
};

export const Inline = {
  render: () => (
    <div className="w-full max-w-xl">
      <Dropzone
        variant="inline"
        label="Attach files"
        description="CSV or spreadsheets only"
        hint="Up to 5MB each"
      />
    </div>
  ),
};

export const Compact = {
  render: () => <Dropzone variant="compact" label="Add" accept="image/*" />,
};

export const Avatar = {
  render: () => <Dropzone variant="avatar" label="Profile picture" hint="PNG or JPG" />,
};

export const WithQueuedFiles = {
  render: () => (
    <div className="w-full max-w-xl">
      <Dropzone
        label="Drag & drop files"
        defaultFiles={[
          seedFile('uploading.png', 'image/png', 1024 * 800, 'uploading', 40),
          seedFile('done.pdf', 'application/pdf', 1024 * 240, 'success', 100),
          seedFile('failed.zip', 'application/zip', 1024 * 5000, 'error', 0, 'Network timeout'),
        ]}
      />
    </div>
  ),
};

export const WithValidation = {
  render: () => (
    <div className="w-full max-w-xl">
      <Dropzone
        label="Upload images or PDFs"
        hint="Up to 1MB · 3 files"
        accept="image/*,.pdf"
        maxSize={1024 * 1024}
        maxFiles={3}
      />
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div className="w-full max-w-xl">
      <Dropzone label="Disabled zone" hint="Read-only" disabled />
    </div>
  ),
};

export const Loading = {
  render: () => (
    <div className="w-full max-w-xl">
      <Dropzone label="Busy zone" hint="Submitting" isLoading />
    </div>
  ),
};

export const ErrorState = {
  render: () => (
    <div className="w-full max-w-xl">
      <Dropzone label="Upload" hint="JPG or PNG" errorMessage="Last upload failed — please retry" />
    </div>
  ),
};

export const InsideFormField = {
  render: () => (
    <div className="w-full max-w-xl">
      <FormField label="Attachments" description="PDF or images" error="">
        <Dropzone hint="Up to 5MB" />
      </FormField>
    </div>
  ),
};
