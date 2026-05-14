import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { CroissantTestWrapper, PAGE_AXE_OPTIONS } from '../__tests__/test-utils';
import { TimelineActivityPage } from './TimelineActivityPage';

describe('TimelineActivityPage', () => {
  it('renders the hero timeline', () => {
    render(
      <CroissantTestWrapper>
        <TimelineActivityPage />
      </CroissantTestWrapper>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: /A day in the bakery/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Hero timeline')).toBeInTheDocument();
  });

  it('opens an audit detail panel on row click', async () => {
    const user = userEvent.setup();
    render(
      <CroissantTestWrapper>
        <TimelineActivityPage />
      </CroissantTestWrapper>,
    );
    const rows = screen.getAllByRole('row');
    // Header + filter row + data rows. Click the first data row.
    const targetRow = (rows[2] ?? rows[1]) as HTMLElement;
    await user.click(targetRow);
    expect(screen.getByText('Audit detail')).toBeInTheDocument();
  });

  it('passes axe on default render', async () => {
    const { container } = render(
      <CroissantTestWrapper>
        <TimelineActivityPage />
      </CroissantTestWrapper>,
    );
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });

  it('passes axe with audit panel open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CroissantTestWrapper>
        <TimelineActivityPage />
      </CroissantTestWrapper>,
    );
    const rows = screen.getAllByRole('row');
    const targetRow = (rows[2] ?? rows[1]) as HTMLElement;
    await user.click(targetRow);
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });
});
