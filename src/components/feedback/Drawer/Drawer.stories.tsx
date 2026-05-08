import { Button } from '@/components/primitives/Button';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './Drawer';

export default { title: 'Feedback/Drawer', component: Drawer };

export const Sides = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
        <Drawer key={side} side={side}>
          <DrawerTrigger>
            <Button variant="outline">{side}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>From {side}</DrawerTitle>
              <DrawerDescription>Drawer slides in from the {side}.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <p className="text-sm text-foreground-muted">Body content.</p>
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
  ),
};
