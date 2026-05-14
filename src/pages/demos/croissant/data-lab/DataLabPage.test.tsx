import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { CroissantTestWrapper, PAGE_AXE_OPTIONS } from '../__tests__/test-utils';
import { DataLabPage } from './DataLabPage';

describe('DataLabPage', () => {
  it('renders the inspection table', () => {
    render(
      <CroissantTestWrapper>
        <DataLabPage />
      </CroissantTestWrapper>,
    );
    expect(screen.getByRole('heading', { level: 1, name: /Quality control/i })).toBeInTheDocument();
    expect(screen.getByText('Inspection table')).toBeInTheDocument();
  });

  it('opens the batch detail panel on row click', async () => {
    const user = userEvent.setup();
    render(
      <CroissantTestWrapper>
        <DataLabPage />
      </CroissantTestWrapper>,
    );
    const rows = screen.getAllByRole('row');
    const targetRow = (rows[2] ?? rows[1]) as HTMLElement;
    await user.click(targetRow);
    expect(screen.getByText(/Batch detail/i)).toBeInTheDocument();
  });

  it('passes axe on default render', async () => {
    const { container } = render(
      <CroissantTestWrapper>
        <DataLabPage />
      </CroissantTestWrapper>,
    );
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });

  it('passes axe with detail panel open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CroissantTestWrapper>
        <DataLabPage />
      </CroissantTestWrapper>,
    );
    const rows = screen.getAllByRole('row');
    const targetRow = (rows[2] ?? rows[1]) as HTMLElement;
    await user.click(targetRow);
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });
});
