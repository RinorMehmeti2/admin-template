import { MemoryRouter } from 'react-router-dom';
import { Home, Settings, Users } from 'lucide-react';
import { Menu, MenuItem } from '@/components/navigation/Menu';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { PageShell } from './PageShell';

export default { title: 'Layout/PageShell', component: PageShell };

export const Default = {
  render: () => (
    <MemoryRouter initialEntries={['/dashboard']}>
      <PageShell
        sidebar={
          <Sidebar header={<span className="font-semibold">Brand</span>}>
            <Menu>
              <MenuItem to="/dashboard" icon={<Home />}>Dashboard</MenuItem>
              <MenuItem to="/users" icon={<Users />}>Users</MenuItem>
              <MenuItem to="/settings" icon={<Settings />}>Settings</MenuItem>
            </Menu>
          </Sidebar>
        }
        topbar={<Topbar left={<span className="font-semibold">Acme</span>} />}
      >
        <div className="p-8">Page content</div>
      </PageShell>
    </MemoryRouter>
  ),
};
