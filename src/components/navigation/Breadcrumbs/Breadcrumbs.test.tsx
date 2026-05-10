import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BreadcrumbCurrent, BreadcrumbItem, BreadcrumbLink, Breadcrumbs } from './Breadcrumbs';
import { runAxe } from '@/test-utils/a11y';

function Demo() {
  return (
    <MemoryRouter>
      <Breadcrumbs>
        <BreadcrumbItem>
          <BreadcrumbLink to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink to="/users">Users</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbCurrent>Edit</BreadcrumbCurrent>
        </BreadcrumbItem>
      </Breadcrumbs>
    </MemoryRouter>
  );
}

describe('Breadcrumbs', () => {
  it('renders nav with aria-label="Breadcrumb"', () => {
    render(<Demo />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders all items inside an <ol>', () => {
    const { container } = render(<Demo />);
    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    // 3 items + 2 auto-injected separators = 5 <li>
    expect(ol?.children.length).toBe(5);
  });

  it('auto-injects separators between items, not after the last', () => {
    const { container } = render(<Demo />);
    const lis = container.querySelectorAll('li');
    // separator <li>s are aria-hidden=true
    const seps = container.querySelectorAll('li[aria-hidden="true"]');
    expect(seps.length).toBe(2);
    // last <li> is NOT a separator
    expect(lis[lis.length - 1]?.getAttribute('aria-hidden')).not.toBe('true');
  });

  it('current item gets aria-current=page', () => {
    render(<Demo />);
    expect(screen.getByText('Edit')).toHaveAttribute('aria-current', 'page');
  });

  it('links use react-router NavLink with correct href', () => {
    render(<Demo />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/users');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Demo />);
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
