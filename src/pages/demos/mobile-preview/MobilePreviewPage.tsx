import {
  BottomSheetSection,
  DrawerSection,
  TapTargetsSection,
  ToastSection,
} from './components';

/*
 * /mobile-preview — showcase mobile-native behaviors. Resize the viewport to
 * &lt;768px (or open DevTools device emulation) for the full effect.
 */

export function MobilePreviewPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mobile preview</h1>
        <p className="mt-1 text-foreground-muted">
          Bottom sheets, swipe-to-dismiss, responsive drawer, and bumped tap targets. Resize the
          viewport below the <code className="font-mono text-xs">md</code> breakpoint to see the
          mobile behavior.
        </p>
      </header>

      <BottomSheetSection />
      <DrawerSection />
      <ToastSection />
      <TapTargetsSection />
    </div>
  );
}
