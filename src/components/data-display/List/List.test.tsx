import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { List, ListItem } from './List';

describe('List', () => {
  it('renders ul with items', () => {
    render(
      <List>
        <ListItem primary="A" />
        <ListItem primary="B" />
      </List>,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('divided variant adds divide class', () => {
    render(
      <List variant="divided" data-testid="list">
        <ListItem primary="A" />
      </List>,
    );
    expect(screen.getByTestId('list')).toHaveClass('divide-y');
  });

  it('renders leading/primary/secondary/trailing slots', () => {
    render(
      <List>
        <ListItem
          leading={<span data-testid="lead">L</span>}
          primary="Primary text"
          secondary="Secondary text"
          trailing={<span data-testid="trail">T</span>}
        />
      </List>,
    );
    expect(screen.getByTestId('lead')).toBeInTheDocument();
    expect(screen.getByText('Primary text')).toBeInTheDocument();
    expect(screen.getByText('Secondary text')).toBeInTheDocument();
    expect(screen.getByTestId('trail')).toBeInTheDocument();
  });
});
