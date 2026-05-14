import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { CroissantTestWrapper, PAGE_AXE_OPTIONS } from '../__tests__/test-utils';
import { NavigationTrailPage } from './NavigationTrailPage';

describe('NavigationTrailPage', () => {
  it('renders the breadcrumb tour and tabs gallery', () => {
    render(
      <CroissantTestWrapper>
        <NavigationTrailPage />
      </CroissantTestWrapper>,
    );
    expect(screen.getByRole('heading', { level: 1, name: /Map room/i })).toBeInTheDocument();
    expect(screen.getByText('Tabs gallery')).toBeInTheDocument();
  });

  it('switches tabs', async () => {
    const user = userEvent.setup();
    render(
      <CroissantTestWrapper>
        <NavigationTrailPage />
      </CroissantTestWrapper>,
    );
    const equipmentTabs = screen.getAllByRole('tab', { name: 'Equipment' });
    await user.click(equipmentTabs[0] as HTMLElement);
    expect(equipmentTabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('passes axe on default render', async () => {
    const { container } = render(
      <CroissantTestWrapper>
        <NavigationTrailPage />
      </CroissantTestWrapper>,
    );
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });

  it('passes axe after tab change', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CroissantTestWrapper>
        <NavigationTrailPage />
      </CroissantTestWrapper>,
    );
    const tabs = screen.getAllByRole('tab', { name: 'Notes' });
    await user.click(tabs[0] as HTMLElement);
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });
});
