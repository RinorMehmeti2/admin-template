/*
 * Storybook 8 is not installed yet (see SETUP.md). This file is written in
 * untyped CSF so it does not require @storybook/* type imports. When
 * Storybook is added, swap the meta + story consts to typed `Meta`/`StoryObj`.
 */
import { Portal } from './Portal';

export default {
  title: 'Overlays/Portal',
  component: Portal,
};

export const Default = {
  render: () => (
    <div className="relative h-48 w-full rounded-md border border-border bg-surface p-4">
      <p className="text-foreground-muted text-sm">
        The badge below is rendered into <code>document.body</code> via Portal.
      </p>
      <Portal>
        <div className="fixed right-4 top-4 z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-md">
          Portaled to body
        </div>
      </Portal>
    </div>
  ),
};

export const CustomContainer = {
  render: () => {
    const targetId = 'portal-stories-custom-target';
    if (typeof document !== 'undefined' && document.getElementById(targetId) === null) {
      const el = document.createElement('div');
      el.id = targetId;
      document.body.appendChild(el);
    }
    const target =
      typeof document !== 'undefined' ? document.getElementById(targetId) : null;
    return (
      <div>
        <p>Portaled into a manually-created &lt;div id="{targetId}"&gt;.</p>
        {target !== null && (
          <Portal container={target}>
            <span className="rounded bg-success px-2 py-1 text-xs text-success-foreground">
              In custom container
            </span>
          </Portal>
        )}
      </div>
    );
  },
};
