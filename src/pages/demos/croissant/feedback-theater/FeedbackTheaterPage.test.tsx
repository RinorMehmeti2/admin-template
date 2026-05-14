import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { CroissantTestWrapper, PAGE_AXE_OPTIONS } from '../__tests__/test-utils';
import { FeedbackTheaterPage } from './FeedbackTheaterPage';

describe('FeedbackTheaterPage', () => {
  it('renders the scene', () => {
    render(
      <CroissantTestWrapper>
        <FeedbackTheaterPage />
      </CroissantTestWrapper>,
    );
    expect(screen.getByRole('heading', { level: 1, name: /Stage lights/i })).toBeInTheDocument();
    expect(screen.getByText('Toast theater')).toBeInTheDocument();
  });

  it('dismisses an alert and removes it from the list', async () => {
    const user = userEvent.setup();
    render(
      <CroissantTestWrapper>
        <FeedbackTheaterPage />
      </CroissantTestWrapper>,
    );
    const buttons = screen.getAllByLabelText('Dismiss');
    const before = buttons.length;
    expect(before).toBeGreaterThan(0);
    await user.click(buttons[0] as HTMLElement);
    await waitFor(
      () => {
        expect(screen.getAllByLabelText('Dismiss').length).toBe(before - 1);
      },
      { timeout: 1500 },
    );
  });

  it('passes axe on default render', async () => {
    const { container } = render(
      <CroissantTestWrapper>
        <FeedbackTheaterPage />
      </CroissantTestWrapper>,
    );
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });

  it('passes axe with progress lab section visible', async () => {
    const { container } = render(
      <CroissantTestWrapper>
        <FeedbackTheaterPage />
      </CroissantTestWrapper>,
    );
    expect(screen.getByText('Progress lab')).toBeInTheDocument();
    await expect(runAxe(container, PAGE_AXE_OPTIONS)).resolves.toHaveNoViolations();
  });
});
