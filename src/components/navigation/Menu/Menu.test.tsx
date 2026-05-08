import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Menu, MenuGroup, MenuItem } from './Menu';

function Demo({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <MemoryRouter initialEntries={['/dashboard']}>
      <Menu iconOnly={iconOnly}>
        <MenuItem to="/dashboard">Dashboard</MenuItem>
        <MenuGroup label="Catalog">
          <MenuItem to="/products">Products</MenuItem>
          <MenuItem to="/categories">Categories</MenuItem>
        </MenuGroup>
        <MenuItem to="/settings">Settings</MenuItem>
      </Menu>
    </MemoryRouter>
  );
}

describe('Menu', () => {
  it('renders nav with aria-label', () => {
    render(<Demo />);
    expect(screen.getByRole('navigation', { name: 'Sidebar' })).toBeInTheDocument();
  });

  it('renders top-level items as links', () => {
    render(<Demo />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('group is expanded by default; toggling collapses it', async () => {
    render(<Demo />);
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: /Catalog/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('group toggles via Enter / Space', async () => {
    render(<Demo />);
    const trigger = screen.getByRole('button', { name: /Catalog/i });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('iconOnly hides labels on items and collapses groups', () => {
    render(<Demo iconOnly />);
    // text labels are not rendered
    expect(screen.queryByText('Dashboard')).toBeNull();
    expect(screen.queryByText('Settings')).toBeNull();
    // group children are not rendered in iconOnly mode
    expect(screen.queryByRole('link', { name: 'Products' })).toBeNull();
  });
});
