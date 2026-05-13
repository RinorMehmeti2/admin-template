import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';

function renderBasic(defaultValue?: string | null) {
  return render(
    <Accordion defaultValue={defaultValue ?? null}>
      <AccordionItem value="a">
        <AccordionTrigger>Section A</AccordionTrigger>
        <AccordionContent>Body A</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Section B</AccordionTrigger>
        <AccordionContent>Body B</AccordionContent>
      </AccordionItem>
      <AccordionItem value="c" disabled>
        <AccordionTrigger>Section C</AccordionTrigger>
        <AccordionContent>Body C</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

describe('Accordion', () => {
  it('renders triggers with aria-expanded false by default', () => {
    renderBasic();
    expect(screen.getByRole('button', { name: 'Section A' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('clicking trigger opens content; clicking again closes', async () => {
    renderBasic();
    const trigger = screen.getByRole('button', { name: 'Section A' });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Body A')).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('single mode: opening one closes the other', async () => {
    renderBasic();
    const a = screen.getByRole('button', { name: 'Section A' });
    const b = screen.getByRole('button', { name: 'Section B' });
    await userEvent.click(a);
    await userEvent.click(b);
    expect(a).toHaveAttribute('aria-expanded', 'false');
    expect(b).toHaveAttribute('aria-expanded', 'true');
  });

  it('multiple mode: both can be open', async () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="a">
          <AccordionTrigger>A</AccordionTrigger>
          <AccordionContent>Body A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>B</AccordionTrigger>
          <AccordionContent>Body B</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'A' }));
    await userEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(screen.getByText('Body A')).toBeInTheDocument();
    expect(screen.getByText('Body B')).toBeInTheDocument();
  });

  it('disabled item is not toggleable', async () => {
    renderBasic();
    const c = screen.getByRole('button', { name: 'Section C' });
    expect(c).toBeDisabled();
    await userEvent.click(c);
    expect(c).toHaveAttribute('aria-expanded', 'false');
  });

  it('ArrowDown moves focus to next enabled trigger; skips disabled', async () => {
    renderBasic();
    const a = screen.getByRole('button', { name: 'Section A' });
    a.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Section B' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    // Disabled C is filtered, wraps to A.
    expect(a).toHaveFocus();
  });

  it('Home/End jump to first/last enabled', async () => {
    renderBasic();
    const b = screen.getByRole('button', { name: 'Section B' });
    b.focus();
    await userEvent.keyboard('{End}');
    // Last *enabled* — B is last since C is disabled.
    expect(b).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Section A' })).toHaveFocus();
  });

  it('controlled value drives state', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Accordion value="a" onValueChange={onChange}>
        <AccordionItem value="a">
          <AccordionTrigger>A</AccordionTrigger>
          <AccordionContent>Body A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>B</AccordionTrigger>
          <AccordionContent>Body B</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText('Body A')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(onChange).toHaveBeenLastCalledWith('b');
    rerender(
      <Accordion value="b" onValueChange={onChange}>
        <AccordionItem value="a">
          <AccordionTrigger>A</AccordionTrigger>
          <AccordionContent>Body A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>B</AccordionTrigger>
          <AccordionContent>Body B</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText('Body B')).toBeInTheDocument();
  });

  it('content has region role + labelled by trigger', async () => {
    renderBasic();
    await userEvent.click(screen.getByRole('button', { name: 'Section A' }));
    const region = screen.getByRole('region', { name: 'Section A' });
    expect(region).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = renderBasic('a');
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
