import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/feedback';
import { Button } from '@/components/primitives/Button';
import { Section } from './Section';

const CODE = `<div className="flex flex-wrap gap-2">
  {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
    <Drawer key={side} side={side}>
      <DrawerTrigger>
        <Button variant="outline">From {side}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>From the {side}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-sm text-foreground-muted">
            Drawer content. Esc / overlay / close button all dismiss.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ))}
</div>`;

export function DrawerSection() {
  return (
    <Section title="Drawer" code={CODE}>
      <div className="flex flex-wrap gap-2">
        {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
          <Drawer key={side} side={side}>
            <DrawerTrigger>
              <Button variant="outline">From {side}</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>From the {side}</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <p className="text-sm text-foreground-muted">
                  Drawer content. Esc / overlay / close button all dismiss.
                </p>
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button>Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ))}
      </div>
    </Section>
  );
}
