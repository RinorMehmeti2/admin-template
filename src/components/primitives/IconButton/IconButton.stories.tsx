import { Plus, Trash2, Settings, Search } from 'lucide-react';
import { IconButton } from './IconButton';

export default { title: 'Primitives/IconButton', component: IconButton };

export const Variants = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton aria-label="Add" variant="primary">
        <Plus className="h-4 w-4" />
      </IconButton>
      <IconButton aria-label="Settings" variant="secondary">
        <Settings className="h-4 w-4" />
      </IconButton>
      <IconButton aria-label="Search" variant="ghost">
        <Search className="h-4 w-4" />
      </IconButton>
      <IconButton aria-label="Outline" variant="outline">
        <Settings className="h-4 w-4" />
      </IconButton>
      <IconButton aria-label="Delete" variant="danger">
        <Trash2 className="h-4 w-4" />
      </IconButton>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton aria-label="sm" size="sm" variant="outline">
        <Plus className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton aria-label="md" size="md" variant="outline">
        <Plus className="h-4 w-4" />
      </IconButton>
      <IconButton aria-label="lg" size="lg" variant="outline">
        <Plus className="h-5 w-5" />
      </IconButton>
    </div>
  ),
};
