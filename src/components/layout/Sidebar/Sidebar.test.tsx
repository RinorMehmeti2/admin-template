import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sidebar,
  SidebarCollapseToggle,
  SidebarMobileToggle,
  SidebarProvider,
} from './Sidebar';

function mockMatchMedia(matches: boolean) {
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

describe('Sidebar', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockMatchMedia(false); // desktop default
  });

  it('renders desktop sidebar with header + children', () => {
    render(
      <SidebarProvider>
        <Sidebar header={<div data-testid="hdr">Brand</div>}>
          <p>nav items</p>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByTestId('hdr')).toBeInTheDocument();
    expect(screen.getByText('nav items')).toBeInTheDocument();
  });

  it('collapse toggle flips collapsed state and persists to localStorage', async () => {
    render(
      <SidebarProvider>
        <Sidebar>nav</Sidebar>
        <SidebarCollapseToggle />
      </SidebarProvider>,
    );
    const toggle = screen.getByRole('button', { name: /Collapse sidebar/i });
    await userEvent.click(toggle);
    expect(window.localStorage.getItem('sidebar-collapsed')).toBe('true');
    expect(screen.getByRole('button', { name: /Expand sidebar/i })).toBeInTheDocument();
  });

  it('reads initial collapsed state from localStorage', () => {
    window.localStorage.setItem('sidebar-collapsed', 'true');
    render(
      <SidebarProvider>
        <Sidebar>nav</Sidebar>
        <SidebarCollapseToggle />
      </SidebarProvider>,
    );
    expect(screen.getByRole('button', { name: /Expand sidebar/i })).toBeInTheDocument();
  });

  it('mobile mode renders Drawer (closed by default) + mobile toggle', async () => {
    mockMatchMedia(true); // mobile
    render(
      <SidebarProvider>
        <Sidebar>nav</Sidebar>
        <SidebarMobileToggle />
      </SidebarProvider>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('CollapseToggle hidden in mobile mode', () => {
    mockMatchMedia(true);
    const { container } = render(
      <SidebarProvider>
        <SidebarCollapseToggle />
      </SidebarProvider>,
    );
    // Renders nothing
    expect(container.querySelector('button')).toBeNull();
  });
});
