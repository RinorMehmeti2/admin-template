import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCopy,
  Copy,
  Edit2,
  Home,
  ListOrdered,
  MoreHorizontal,
  Scissors,
  ShoppingBag,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Kbd } from '@/components/primitives/Kbd';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardContent } from '@/components/data-display/Card';
import { List, ListItem } from '@/components/data-display/List';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/navigation/Accordion';
import {
  Breadcrumbs,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbCurrent,
} from '@/components/navigation/Breadcrumbs';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/navigation/ContextMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { Menu, MenuGroup, MenuItem } from '@/components/navigation/Menu';
import { Pagination } from '@/components/navigation/Pagination';
import {
  Step,
  StepDescription,
  StepIndicator,
  StepLabel,
  Stepper,
  type StepStatus,
} from '@/components/navigation/Stepper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/navigation/Tabs';
import { ComponentsUsedFooter, SectionHeader } from '../_shared';

const COMPONENTS = [
  'Breadcrumbs',
  'Tabs',
  'DropdownMenu',
  'ContextMenu',
  'Stepper',
  'Pagination',
  'List',
  'Menu',
  'Accordion',
  'Kbd',
  'Button',
  'IconButton',
  'Badge',
  'Card',
];

const STEPS = ['account', 'address', 'payment', 'review'] as const;
type StepKey = (typeof STEPS)[number];

export function NavigationTrailPage() {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [page, setPage] = useState(1);

  const stepStatus = (i: number): StepStatus => {
    if (i < stepIndex) return 'complete';
    if (i === stepIndex) return 'active';
    return 'idle';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader title={t('croissant.nav.title')} description={t('croissant.nav.subtitle')} />

      <Breadcrumbs>
        <BreadcrumbItem>
          <BreadcrumbLink to="/croissant/bakery-dashboard">
            {t('croissant.nav.crumbs.bakery')}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink to="/croissant/data-lab">{t('croissant.nav.crumbs.menu')}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbCurrent>{t('croissant.nav.crumbs.croissants')}</BreadcrumbCurrent>
        </BreadcrumbItem>
      </Breadcrumbs>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2" aria-labelledby="tabs-heading">
          <SectionHeader
            tone="primary"
            eyebrow="Tabs"
            title={<span id="tabs-heading">{t('croissant.nav.title')}</span>}
          />

          <Card variant="outlined">
            <CardContent>
              <Tabs defaultValue="dropdowns" variant="pills">
                <TabsList>
                  <TabsTrigger value="dropdowns">{t('croissant.nav.tabs.dropdowns')}</TabsTrigger>
                  <TabsTrigger value="stepper">{t('croissant.nav.tabs.stepper')}</TabsTrigger>
                  <TabsTrigger value="pagination">{t('croissant.nav.tabs.pagination')}</TabsTrigger>
                  <TabsTrigger value="menu">{t('croissant.nav.tabs.menu')}</TabsTrigger>
                </TabsList>

                <TabsContent value="dropdowns" className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="outline" leftIcon={<MoreHorizontal className="h-4 w-4" />}>
                          {t('croissant.nav.dropdown.open')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>{t('croissant.nav.dropdown.label')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit2 className="mr-2 h-4 w-4" />
                          {t('croissant.nav.dropdown.edit')}
                          <DropdownMenuShortcut>E</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          {t('croissant.nav.dropdown.duplicate')}
                          <DropdownMenuShortcut>D</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('croissant.nav.dropdown.delete')}
                          <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Badge variant="info" size="sm">
                      DropdownMenu
                    </Badge>
                  </div>

                  <ContextMenu>
                    <ContextMenuTrigger>
                      <div className="rounded-md border-2 border-dashed border-border bg-surface-muted/40 px-6 py-10 text-center text-sm text-foreground-muted">
                        {t('croissant.nav.context.hint')}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem>
                        <ClipboardCopy className="mr-2 h-4 w-4" />
                        {t('croissant.nav.context.copy')}
                      </ContextMenuItem>
                      <ContextMenuItem>
                        <Scissors className="mr-2 h-4 w-4" />
                        {t('croissant.nav.context.cut')}
                      </ContextMenuItem>
                      <ContextMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        {t('croissant.nav.context.paste')}
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </TabsContent>

                <TabsContent value="stepper" className="space-y-4">
                  <Stepper orientation="horizontal">
                    {STEPS.map((s, i) => (
                      <Step key={s} status={stepStatus(i)} index={i}>
                        <StepIndicator />
                        <span className="flex flex-col">
                          <StepLabel>{t(`croissant.nav.stepper.${s as StepKey}`)}</StepLabel>
                          <StepDescription>{`Step ${i + 1}`}</StepDescription>
                        </span>
                      </Step>
                    ))}
                  </Stepper>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      disabled={stepIndex === 0}
                      onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                    >
                      {t('croissant.nav.stepper.back')}
                    </Button>
                    <Button
                      disabled={stepIndex === STEPS.length - 1}
                      onClick={() => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))}
                    >
                      {t('croissant.nav.stepper.next')}
                    </Button>
                    <Button variant="ghost" onClick={() => setStepIndex(0)}>
                      {t('croissant.nav.stepper.reset')}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="pagination" className="space-y-4">
                  <List variant="divided" className="rounded-md border border-border">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const n = (page - 1) * 5 + i + 1;
                      return (
                        <ListItem
                          key={n}
                          leading={<ListOrdered className="h-4 w-4" />}
                          primary={t('croissant.nav.pagination.item', { n })}
                          secondary={`SKU CRO-${String(n).padStart(3, '0')}`}
                          trailing={
                            <>
                              <IconButton aria-label="Edit" variant="ghost" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </IconButton>
                              <IconButton aria-label="Delete" variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </IconButton>
                            </>
                          }
                        />
                      );
                    })}
                  </List>
                  <Pagination page={page} totalPages={6} onPageChange={setPage} />
                </TabsContent>

                <TabsContent value="menu">
                  <Menu ariaLabel={t('croissant.nav.menu.label')} className="max-w-xs">
                    <MenuItem to="/croissant/bakery-dashboard" icon={<Home className="h-4 w-4" />}>
                      {t('croissant.nav.menu.home')}
                    </MenuItem>
                    <MenuGroup
                      label={t('croissant.nav.menu.menu')}
                      icon={<ShoppingBag className="h-4 w-4" />}
                    >
                      <MenuItem
                        to="/croissant/data-lab"
                        icon={<ShoppingBag className="h-4 w-4" />}
                        badge={
                          <Badge variant="primary" size="sm">
                            12
                          </Badge>
                        }
                      >
                        {t('croissant.nav.menu.orders')}
                      </MenuItem>
                      <MenuItem
                        to="/croissant/cards-and-people"
                        icon={<Users className="h-4 w-4" />}
                      >
                        {t('croissant.nav.menu.customers')}
                      </MenuItem>
                    </MenuGroup>
                    <MenuItem
                      to="/croissant/timeline-and-activity"
                      icon={<UserPlus className="h-4 w-4" />}
                    >
                      {t('croissant.nav.menu.staff')}
                    </MenuItem>
                  </Menu>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <SectionHeader
            tone="info"
            eyebrow="Reference"
            title={t('croissant.nav.shortcuts.title')}
          />
          <Card variant="outlined" className="overflow-hidden">
            <Accordion type="single" defaultValue="tabs" collapsible variant="default">
              <AccordionItem value="tabs">
                <AccordionTrigger>{t('croissant.nav.shortcuts.tabs')}</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">{t('croissant.nav.shortcuts.tabsBody')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Kbd>Tab</Kbd>
                    <Kbd>Shift</Kbd>
                    <Kbd>←</Kbd>
                    <Kbd>→</Kbd>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="menus">
                <AccordionTrigger>{t('croissant.nav.shortcuts.menus')}</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">{t('croissant.nav.shortcuts.menusBody')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd>
                    <Kbd>Enter</Kbd>
                    <Kbd>Esc</Kbd>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="dialogs">
                <AccordionTrigger>{t('croissant.nav.shortcuts.dialogs')}</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">{t('croissant.nav.shortcuts.dialogsBody')}</p>
                  <Kbd>Esc</Kbd>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="palette">
                <AccordionTrigger>{t('croissant.nav.shortcuts.palette')}</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">{t('croissant.nav.shortcuts.paletteBody')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="tables">
                <AccordionTrigger>{t('croissant.nav.shortcuts.tables')}</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">{t('croissant.nav.shortcuts.tablesBody')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Kbd>Click</Kbd>
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </aside>
      </div>

      <ComponentsUsedFooter components={COMPONENTS} />
    </div>
  );
}
