import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FormInput, Home } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { NavGroup } from './NavGroup';
import { NavLink } from './NavLink';
import { SidebarProvider } from './Sidebar';
import { runAxe } from '@/test-utils/a11y';

function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
      onchange: null,
    })),
  });
}

interface RenderOpts {
  path?: string;
  collapsed?: boolean;
}

function renderGroup(
  groupProps: Partial<ComponentProps<typeof NavGroup>> = {},
  opts: RenderOpts = {},
  children?: ReactNode,
) {
  const { path = '/', collapsed = false } = opts;
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SidebarProvider defaultCollapsed={collapsed}>
        <ul>
          <NavGroup
            id="test-group"
            label="Group X"
            icon={<Home data-testid="group-icon" />}
            {...groupProps}
          >
            {children ?? [
              <NavLink key="alpha" to="/alpha" label="Alpha" icon={<FormInput />} />,
              <NavLink key="beta" to="/beta" label="Beta" icon={<FormInput />} />,
            ]}
          </NavGroup>
        </ul>
      </SidebarProvider>
    </MemoryRouter>,
  );
}

describe('NavGroup', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockMatchMedia(false); // desktop default
  });

  it('renders trigger with label + chevron, closed by default', () => {
    renderGroup();
    const trigger = screen.getByRole('button', { name: 'Group X' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('click toggles open and flips aria-expanded', async () => {
    renderGroup();
    const trigger = screen.getByRole('button', { name: 'Group X' });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('hides children when closed', () => {
    renderGroup();
    expect(screen.queryByRole('link', { name: 'Alpha' })).toBeNull();
  });

  it('shows children when open', async () => {
    renderGroup();
    await userEvent.click(screen.getByRole('button', { name: 'Group X' }));
    expect(screen.getByRole('link', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Beta' })).toBeInTheDocument();
  });

  it('auto-expands when descendant matches the current route', () => {
    renderGroup({}, { path: '/alpha' });
    expect(screen.getByRole('button', { name: 'Group X' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('expandOnActiveChild=false skips auto-expand', () => {
    renderGroup({ expandOnActiveChild: false }, { path: '/alpha' });
    expect(screen.getByRole('button', { name: 'Group X' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('collapsed sidebar: trigger has aria-haspopup; click opens flyout with labeled children', async () => {
    renderGroup({}, { collapsed: true });
    const trigger = screen.getByRole('button', { name: 'Group X' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Beta' })).toBeInTheDocument();
  });

  it('collapsed flyout: Escape closes + restores focus to trigger', async () => {
    renderGroup({}, { collapsed: true });
    const trigger = screen.getByRole('button', { name: 'Group X' });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(trigger);
  });

  it('collapsed flyout: outside pointerdown closes', async () => {
    renderGroup({}, { collapsed: true });
    const trigger = screen.getByRole('button', { name: 'Group X' });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapsed mode shows active-bubble when descendant matches route', () => {
    renderGroup({}, { collapsed: true, path: '/alpha' });
    expect(screen.getByTestId('nav-group-active-bubble')).toBeInTheDocument();
  });

  it('inline mode hides active-bubble even when descendant matches', () => {
    renderGroup({}, { path: '/alpha' });
    expect(screen.queryByTestId('nav-group-active-bubble')).toBeNull();
  });

  it('inline mode: no a11y violations (closed)', async () => {
    const { container } = renderGroup();
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('inline mode: no a11y violations (open)', async () => {
    const { container } = renderGroup();
    await userEvent.click(screen.getByRole('button', { name: 'Group X' }));
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('collapsed flyout open: no a11y violations', async () => {
    renderGroup({}, { collapsed: true });
    await userEvent.click(screen.getByRole('button', { name: 'Group X' }));
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});
