import { Plus, Search, Settings, Trash2 } from 'lucide-react';
import { IconButton, Separator } from '@/components/primitives';
import { Row, Section } from './Section';

const CODE = `<Row label="Variant">
  <IconButton aria-label="Add" variant="primary">
    <Plus className="h-4 w-4" />
  </IconButton>
  <IconButton aria-label="Settings" variant="secondary">
    <Settings className="h-4 w-4" />
  </IconButton>
  <IconButton aria-label="Search" variant="ghost">
    <Search className="h-4 w-4" />
  </IconButton>
  <IconButton aria-label="More" variant="outline">
    <Settings className="h-4 w-4" />
  </IconButton>
  <IconButton aria-label="Delete" variant="danger">
    <Trash2 className="h-4 w-4" />
  </IconButton>
</Row>
<Separator className="my-1" />
<Row label="Size">
  <IconButton aria-label="sm" size="sm" variant="outline">
    <Plus className="h-3.5 w-3.5" />
  </IconButton>
  <IconButton aria-label="md" size="md" variant="outline">
    <Plus className="h-4 w-4" />
  </IconButton>
  <IconButton aria-label="lg" size="lg" variant="outline">
    <Plus className="h-5 w-5" />
  </IconButton>
</Row>`;

export function IconButtonSection() {
  return (
    <Section title="IconButton" code={CODE}>
      <Row label="Variant">
        <IconButton aria-label="Add" variant="primary">
          <Plus className="h-4 w-4" />
        </IconButton>
        <IconButton aria-label="Settings" variant="secondary">
          <Settings className="h-4 w-4" />
        </IconButton>
        <IconButton aria-label="Search" variant="ghost">
          <Search className="h-4 w-4" />
        </IconButton>
        <IconButton aria-label="More" variant="outline">
          <Settings className="h-4 w-4" />
        </IconButton>
        <IconButton aria-label="Delete" variant="danger">
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </Row>
      <Separator className="my-1" />
      <Row label="Size">
        <IconButton aria-label="sm" size="sm" variant="outline">
          <Plus className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton aria-label="md" size="md" variant="outline">
          <Plus className="h-4 w-4" />
        </IconButton>
        <IconButton aria-label="lg" size="lg" variant="outline">
          <Plus className="h-5 w-5" />
        </IconButton>
      </Row>
    </Section>
  );
}
