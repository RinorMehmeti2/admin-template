import { Carousel } from './Carousel';
import { Card, CardContent, CardTitle } from '../Card';

export default { title: 'Data Display/Carousel', component: Carousel };

const tiles = (count: number, hue = 'bg-primary/10') =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i),
    content: (
      <div className={`flex h-48 items-center justify-center rounded-md ${hue} text-foreground`}>
        <span className="text-3xl font-semibold">{i + 1}</span>
      </div>
    ),
  }));

export const Default = {
  render: () => (
    <div className="max-w-2xl">
      <Carousel slides={tiles(5)} aria-label="Numbered slides" />
    </div>
  ),
};

export const MultiPerView = {
  render: () => (
    <div className="max-w-4xl">
      <Carousel
        slides={tiles(8, 'bg-surface-muted')}
        slidesPerView={{ base: 1, sm: 2, md: 3, lg: 4 }}
        aria-label="Multi per view"
      />
    </div>
  ),
};

export const Autoplay = {
  render: () => (
    <div className="max-w-2xl">
      <Carousel slides={tiles(4, 'bg-info/10')} autoplayMs={2500} aria-label="Autoplay" />
    </div>
  ),
};

export const NoLoop = {
  render: () => (
    <div className="max-w-2xl">
      <Carousel slides={tiles(4)} loop={false} aria-label="No loop" />
    </div>
  ),
};

export const ArrowsOutside = {
  render: () => (
    <div className="max-w-2xl">
      <Carousel slides={tiles(4)} arrowPosition="outside" aria-label="Arrows outside" />
    </div>
  ),
};

export const RichContent = {
  render: () => (
    <div className="max-w-3xl">
      <Carousel
        slidesPerView={{ base: 1, md: 2 }}
        aria-label="Feature highlights"
        slides={[1, 2, 3, 4].map((i) => ({
          id: `c${i}`,
          content: (
            <Card variant="outlined" className="h-full p-6">
              <CardTitle className="mb-2">Feature {i}</CardTitle>
              <CardContent className="p-0 text-sm text-foreground-muted">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae
                vestibulum vestibulum.
              </CardContent>
            </Card>
          ),
        }))}
      />
    </div>
  ),
};
