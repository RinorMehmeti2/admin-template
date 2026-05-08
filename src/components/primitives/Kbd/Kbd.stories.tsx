import { Kbd } from './Kbd';

export default { title: 'Primitives/Kbd', component: Kbd };

export const Single = { render: () => <Kbd>Enter</Kbd> };

export const Combination = {
  render: () => (
    <span className="text-sm text-foreground-muted">
      Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open the command palette.
    </span>
  ),
};
