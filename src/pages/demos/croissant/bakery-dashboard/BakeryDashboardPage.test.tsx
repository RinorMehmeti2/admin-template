import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { CroissantTestWrapper, PAGE_AXE_OPTIONS } from '../__tests__/test-utils';
import { BakeryDashboardPage } from './BakeryDashboardPage';

describe('BakeryDashboardPage', () => {
  it('renders the scene header and key sections', () => {
    render(
      <CroissantTestWrapper>
        <BakeryDashboardPage />
      </CroissantTestWrapper>,
    );
    expect(screen.getByRole('heading', { level: 1, name: /Morning rush/i })).toBeInTheDocument();
    expect(screen.getByText('Pulse bar')).toBeInTheDocument();
    expect(screen.getByText('Oven board')).toBeInTheDocument();
  });

  it('switches the revenue chart range', async () => {
    const user = userEvent.setup();
    render(
      <CroissantTestWrapper>
        <BakeryDashboardPage />
      </CroissantTestWrapper>,
    );
    const dayBtn = screen.getByRole('button', { name: 'Day' });
    await user.click(dayBtn);
    expect(dayBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('passes axe', async () => {
    const { container } = render(
      <CroissantTestWrapper>
        <BakeryDashboardPage />
      </CroissantTestWrapper>,
    );
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });

  it('passes axe after interaction', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CroissantTestWrapper>
        <BakeryDashboardPage />
      </CroissantTestWrapper>,
    );
    await user.click(screen.getByRole('button', { name: 'Day' }));
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });
});
