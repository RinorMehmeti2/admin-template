import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { CroissantTestWrapper, PAGE_AXE_OPTIONS } from '../__tests__/test-utils';
import { FormsBakeryPage } from './FormsBakeryPage';

describe('FormsBakeryPage', () => {
  it('renders the quick order form', () => {
    render(
      <CroissantTestWrapper>
        <FormsBakeryPage />
      </CroissantTestWrapper>,
    );
    expect(screen.getByRole('heading', { level: 1, name: /Order desk/i })).toBeInTheDocument();
    expect(screen.getAllByText('Line items').length).toBeGreaterThan(0);
  });

  it('opens the preferences drawer', async () => {
    const user = userEvent.setup();
    render(
      <CroissantTestWrapper>
        <FormsBakeryPage />
      </CroissantTestWrapper>,
    );
    await user.click(screen.getByRole('button', { name: /Bakery preferences/i }));
    expect(screen.getByText('Closed on Sundays')).toBeInTheDocument();
  });

  it('passes axe on default render', async () => {
    const { container } = render(
      <CroissantTestWrapper>
        <FormsBakeryPage />
      </CroissantTestWrapper>,
    );
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });

  it('passes axe with drawer open', async () => {
    const user = userEvent.setup();
    render(
      <CroissantTestWrapper>
        <FormsBakeryPage />
      </CroissantTestWrapper>,
    );
    await user.click(screen.getByRole('button', { name: /Bakery preferences/i }));
    await expect(runAxe(document.body, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });
});
