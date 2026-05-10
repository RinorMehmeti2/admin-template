import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
import { runAxe } from '@/test-utils/a11y';

function Demo({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <Tabs defaultValue="a" {...(onValueChange ? { onValueChange } : {})}>
      <TabsList>
        <TabsTrigger value="a">A</TabsTrigger>
        <TabsTrigger value="b">B</TabsTrigger>
        <TabsTrigger value="c">C</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Panel A</TabsContent>
      <TabsContent value="b">Panel B</TabsContent>
      <TabsContent value="c">Panel C</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders tablist + tabs + active tabpanel', () => {
    render(<Demo />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel A');
  });

  it('aria-selected reflects active tab', () => {
    render(<Demo />);
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'false');
  });

  it('aria-controls links to the panel id', () => {
    render(<Demo />);
    const tabA = screen.getByRole('tab', { name: 'A' });
    const panelId = tabA.getAttribute('aria-controls');
    expect(screen.getByRole('tabpanel').getAttribute('id')).toBe(panelId);
  });

  it('clicking a tab activates its panel', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel B');
  });

  it('arrow key moves focus + activates', async () => {
    render(<Demo />);
    screen.getByRole('tab', { name: 'A' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'B' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel B');
  });

  it('controlled value', async () => {
    const onValueChange = vi.fn();
    render(
      <Tabs value="a" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">PA</TabsContent>
        <TabsContent value="b">PB</TabsContent>
      </Tabs>,
    );
    await userEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('disabled tab cannot be activated', async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" disabled>
            B
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">PA</TabsContent>
        <TabsContent value="b">PB</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'B' })).toBeDisabled();
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Demo />);
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
