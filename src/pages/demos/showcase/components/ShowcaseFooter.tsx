import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Kbd } from '@/components/primitives/Kbd';

export function ShowcaseFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-border pt-6 text-sm text-foreground-muted">
      <span>Press <Kbd>⌘</Kbd>+<Kbd>K</Kbd> anywhere to open the command palette.</span>
      <Link
        to="/primitives"
        className="inline-flex items-center gap-1 text-primary hover:underline"
      >
        Start exploring
        <ArrowRight className="h-4 w-4" />
      </Link>
    </footer>
  );
}
