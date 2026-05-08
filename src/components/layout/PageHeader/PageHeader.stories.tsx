import { Plus } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { Button } from '@/components/primitives/Button';
import {
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  Breadcrumbs,
} from '@/components/navigation';
import { PageHeader } from './PageHeader';

export default { title: 'Layout/PageHeader', component: PageHeader };

export const Default = {
  render: () => (
    <MemoryRouter>
      <PageHeader
        title="Users"
        description="Manage your team members and their permissions."
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbItem><BreadcrumbLink to="/">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbItem><BreadcrumbCurrent>Users</BreadcrumbCurrent></BreadcrumbItem>
          </Breadcrumbs>
        }
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>Invite</Button>}
      />
    </MemoryRouter>
  ),
};
