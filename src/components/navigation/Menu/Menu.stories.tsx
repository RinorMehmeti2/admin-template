import { Box, Home, Layers, Package, Settings } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { Menu, MenuBadge, MenuGroup, MenuItem } from './Menu';

export default { title: 'Navigation/Menu', component: Menu };

export const Default = {
  render: () => (
    <MemoryRouter initialEntries={['/dashboard']}>
      <div className="w-60 rounded-lg border border-border bg-surface p-3">
        <Menu>
          <MenuItem to="/dashboard" icon={<Home />}>Dashboard</MenuItem>
          <MenuGroup label="Catalog" icon={<Box />}>
            <MenuItem to="/products" icon={<Package />}>Products</MenuItem>
            <MenuItem to="/categories" icon={<Layers />} badge={<MenuBadge>12</MenuBadge>}>
              Categories
            </MenuItem>
          </MenuGroup>
          <MenuItem to="/settings" icon={<Settings />}>Settings</MenuItem>
        </Menu>
      </div>
    </MemoryRouter>
  ),
};

export const IconOnly = {
  render: () => (
    <MemoryRouter initialEntries={['/dashboard']}>
      <div className="w-16 rounded-lg border border-border bg-surface p-2">
        <Menu iconOnly>
          <MenuItem to="/dashboard" icon={<Home />}>Dashboard</MenuItem>
          <MenuItem to="/settings" icon={<Settings />}>Settings</MenuItem>
        </Menu>
      </div>
    </MemoryRouter>
  ),
};
