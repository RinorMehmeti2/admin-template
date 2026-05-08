import { Home, Settings, Users } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { Menu, MenuItem } from '@/components/navigation/Menu';
import { Sidebar, SidebarProvider } from './Sidebar';

export default { title: 'Layout/Sidebar', component: Sidebar };

export const Default = {
  render: () => (
    <MemoryRouter initialEntries={['/dashboard']}>
      <SidebarProvider>
        <div className="flex h-[400px]">
          <Sidebar header={<span className="font-semibold">Brand</span>}>
            <Menu>
              <MenuItem to="/dashboard" icon={<Home />}>Dashboard</MenuItem>
              <MenuItem to="/users" icon={<Users />}>Users</MenuItem>
              <MenuItem to="/settings" icon={<Settings />}>Settings</MenuItem>
            </Menu>
          </Sidebar>
          <div className="flex-1 bg-background p-6">Content area</div>
        </div>
      </SidebarProvider>
    </MemoryRouter>
  ),
};
