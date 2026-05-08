import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/forms/Input';
import { IconButton } from '@/components/primitives/IconButton';
import { Topbar } from './Topbar';

export default { title: 'Layout/Topbar', component: Topbar };

export const Default = {
  render: () => (
    <Topbar
      left={<span className="font-semibold">Brand</span>}
      center={
        <Input
          placeholder="Search"
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-md"
        />
      }
      right={
        <IconButton aria-label="Notifications" variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </IconButton>
      }
    />
  ),
};
