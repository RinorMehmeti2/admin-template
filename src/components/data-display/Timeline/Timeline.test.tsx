import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GitCommit } from 'lucide-react';
import { runAxe } from '@/test-utils/a11y';
import {
  Timeline,
  TimelineItem,
  TimelineMarker,
  TimelineContent,
  TimelineConnector,
} from './Timeline';

const T1 = new Date('2026-03-04T09:15:00Z');
const T2 = new Date('2026-03-04T10:30:00Z');
const T3 = new Date('2026-03-05T11:45:00Z');

describe('Timeline', () => {
  it('renders the root with role=list and orientation=vertical by default', () => {
    render(
      <Timeline aria-label="events">
        <TimelineItem timestamp={T1} title="A" />
      </Timeline>,
    );
    const list = screen.getByRole('list', { name: 'events' });
    expect(list.getAttribute('data-orientation')).toBe('vertical');
  });

  it('renders items as listitems with their title and a <time> element', () => {
    render(
      <Timeline>
        <TimelineItem timestamp={T1} title="Build passed" />
      </Timeline>,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(screen.getByText('Build passed')).toBeInTheDocument();
    const time = items[0]!.querySelector('time');
    expect(time).not.toBeNull();
    expect(time?.getAttribute('datetime')).toBe(T1.toISOString());
  });

  it('renders an icon marker when icon is provided, dot marker when not', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem timestamp={T1} title="With icon" icon={<GitCommit data-testid="ico" />} />
        <TimelineItem timestamp={T2} title="Plain" />
      </Timeline>,
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    // Plain marker → no svg in its row
    const items = container.querySelectorAll('li');
    expect(items[1]!.querySelector('svg')).toBeNull();
  });

  it.each(
    [
      ['default', 'bg-primary'],
      ['success', 'bg-success'],
      ['warning', 'bg-warning'],
      ['danger', 'bg-danger'],
      ['info', 'bg-info'],
      ['muted', 'bg-foreground-muted'],
    ] as const,
  )('variant=%s applies the correct marker color', (variant, signal) => {
    const { container } = render(
      <Timeline>
        <TimelineItem timestamp={T1} title="x" variant={variant} />
      </Timeline>,
    );
    // The dot is the deepest span carrying bg-{variant}
    const html = container.innerHTML;
    expect(html).toContain(signal);
  });

  it('renders actor + action shorthand when title is absent', () => {
    render(
      <Timeline>
        <TimelineItem timestamp={T1} actor="Alice" action="deployed v1.2.3" />
      </Timeline>,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('deployed v1.2.3')).toBeInTheDocument();
  });

  it('renders description and rich children content', () => {
    render(
      <Timeline>
        <TimelineItem timestamp={T1} title="Comment" description="See attached">
          <div data-testid="rich">Rich</div>
        </TimelineItem>
      </Timeline>,
    );
    expect(screen.getByText('See attached')).toBeInTheDocument();
    expect(screen.getByTestId('rich')).toBeInTheDocument();
  });

  it('renders horizontal orientation when orientation="horizontal"', () => {
    render(
      <Timeline orientation="horizontal" aria-label="pipeline">
        <TimelineItem timestamp={T1} title="A" />
        <TimelineItem timestamp={T2} title="B" />
      </Timeline>,
    );
    expect(screen.getByRole('list', { name: 'pipeline' }).getAttribute('data-orientation')).toBe(
      'horizontal',
    );
  });

  it('groups by day when groupBy="day", inserting day headers above each cluster', () => {
    render(
      <Timeline groupBy="day" aria-label="audit">
        <TimelineItem timestamp={T1} title="A" />
        <TimelineItem timestamp={T2} title="B" />
        <TimelineItem timestamp={T3} title="C" />
      </Timeline>,
    );
    // Two distinct dates → two day-header sections
    const headers = screen.getAllByRole('heading', { level: 3 });
    expect(headers).toHaveLength(2);
    // Each header contains a <time> with start-of-day ISO
    for (const h of headers) {
      expect(h.querySelector('time')).not.toBeNull();
    }
    // 3 items + 2 day-header listitems = 5 listitems
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('formats timestamps via a custom formatter when provided', () => {
    render(
      <Timeline formatTimestamp={(d) => `ts:${d.getUTCFullYear()}`}>
        <TimelineItem timestamp={T1} title="A" />
      </Timeline>,
    );
    expect(screen.getByText('ts:2026')).toBeInTheDocument();
  });

  it('respects hideTimestamp by hiding it visually but keeping the accessible <time>', () => {
    render(
      <Timeline>
        <TimelineItem timestamp={T1} title="Quiet" hideTimestamp />
      </Timeline>,
    );
    const time = screen.getByRole('listitem').querySelector('time');
    expect(time).not.toBeNull();
    expect(time!.className).toMatch(/sr-only/);
  });

  it('subcomponents (Marker/Content/Connector) throw outside <Timeline>', () => {
    // Suppress React's error logging — we want clean test output.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TimelineMarker />)).toThrow(/Timeline/);
    expect(() => render(<TimelineContent />)).toThrow(/Timeline/);
    expect(() => render(<TimelineConnector />)).toThrow(/Timeline/);
    spy.mockRestore();
  });

  it('has no a11y violations (vertical, grouped)', async () => {
    const { container } = render(
      <Timeline groupBy="day" aria-label="audit">
        <TimelineItem timestamp={T1} title="A" variant="success" />
        <TimelineItem timestamp={T2} title="B" variant="danger" />
        <TimelineItem timestamp={T3} title="C" variant="info" />
      </Timeline>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
