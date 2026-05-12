import { ShowcaseFooter, ShowcaseGrid, ShowcaseHeader } from './components';

export function ShowcasePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <ShowcaseHeader />
      <ShowcaseGrid />
      <ShowcaseFooter />
    </div>
  );
}
