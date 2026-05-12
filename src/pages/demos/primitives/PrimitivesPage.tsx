import {
  AvatarSection,
  BadgeSection,
  ButtonSection,
  IconButtonSection,
  KbdSeparatorSection,
  SpinnerSkeletonSection,
} from './components';

export function PrimitivesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Primitives</h1>
        <p className="mt-1 text-foreground-muted">
          Foundation components — Button, IconButton, Badge, Avatar, Spinner, Skeleton, Kbd, Separator.
        </p>
      </header>

      <ButtonSection />
      <IconButtonSection />
      <BadgeSection />
      <AvatarSection />
      <SpinnerSkeletonSection />
      <KbdSeparatorSection />
    </div>
  );
}
