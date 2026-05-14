import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { CroissantTestWrapper, PAGE_AXE_OPTIONS } from '../__tests__/test-utils';
import { CardsAndPeoplePage } from './CardsAndPeoplePage';

describe('CardsAndPeoplePage', () => {
  it('renders the featured baker hero card and crew roster', () => {
    render(
      <CroissantTestWrapper>
        <CardsAndPeoplePage />
      </CroissantTestWrapper>,
    );
    expect(screen.getByRole('heading', { level: 1, name: /Crew chemistry/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Ada Lovelace/).length).toBeGreaterThan(0);
    expect(screen.getByText('Crew roster')).toBeInTheDocument();
  });

  it('passes axe on default render', async () => {
    const { container } = render(
      <CroissantTestWrapper>
        <CardsAndPeoplePage />
      </CroissantTestWrapper>,
    );
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });

  it('passes axe with carousel mounted', async () => {
    const { container } = render(
      <CroissantTestWrapper>
        <CardsAndPeoplePage />
      </CroissantTestWrapper>,
    );
    expect(screen.getByText('What customers say')).toBeInTheDocument();
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });
});
