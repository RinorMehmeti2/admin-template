import { useEffect } from 'react';
import { Home, Plus, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import {
  CommandPalette,
  CommandRegistryProvider,
  useCommandRegistry,
  useRegisterCommands,
} from './';

function DemoCommands() {
  useRegisterCommands(
    [
      {
        id: 'nav-home',
        label: 'Go to Home',
        group: 'Navigation',
        keywords: ['dashboard'],
        icon: <Home className="h-4 w-4" />,
        perform: () => window.alert('navigate home'),
      },
      {
        id: 'nav-settings',
        label: 'Open settings',
        group: 'Navigation',
        icon: <Settings className="h-4 w-4" />,
        perform: () => window.alert('settings'),
      },
      {
        id: 'create',
        label: 'Create new project',
        group: 'Actions',
        icon: <Plus className="h-4 w-4" />,
        shortcut: ['⌘', 'N'],
        perform: () => window.alert('create'),
      },
      {
        id: 'magic',
        label: 'Run AI summary',
        group: 'Actions',
        icon: <Sparkles className="h-4 w-4" />,
        perform: () => window.alert('magic'),
      },
    ],
    [],
  );
  return null;
}

function OpenButton() {
  const { openPalette } = useCommandRegistry();
  return <Button onClick={openPalette}>Open palette (⌘K)</Button>;
}

function HotkeyBinding() {
  const { togglePalette } = useCommandRegistry();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePalette();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [togglePalette]);
  return null;
}

export default { title: 'Overlays/CommandPalette', component: CommandPalette };

export const Default = {
  render: () => (
    <CommandRegistryProvider>
      <DemoCommands />
      <HotkeyBinding />
      <OpenButton />
      <CommandPalette />
    </CommandRegistryProvider>
  ),
};
