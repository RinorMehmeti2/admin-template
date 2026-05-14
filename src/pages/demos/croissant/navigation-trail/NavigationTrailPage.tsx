import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Archive,
  ChevronDown,
  ChevronsUpDown,
  ClipboardCopy,
  Copy,
  Croissant,
  Edit2,
  Home,
  MapPin,
  MoreHorizontal,
  Plus,
  Scissors,
  ShoppingBag,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Kbd } from '@/components/primitives/Kbd';
import { Card, CardContent } from '@/components/data-display/Card';
import { Stat } from '@/components/data-display/Stat';
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
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
import { Select } from '@/components/forms/Select';
import { Input } from '@/components/forms/Input';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';

const STEPS = ['account', 'address', 'payment', 'review', 'confirm'] as const;
type StepKey = (typeof STEPS)[number];

export function NavigationTrailPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'recipe' | 'equipment' | 'notes'>('recipe');
  const [page, setPage] = useState(3);
  const [pageInput, setPageInput] = useState('3');
  const [pageSize, setPageSize] = useState(10);
  const [bookmark, setBookmark] = useState<'pinned' | 'starred' | 'archived'>('pinned');
  const [showNotes, setShowNotes] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const stepStatus = (i: number, current: number): StepStatus => {
    if (i < current) return 'complete';
    if (i === current) return 'active';
    return 'idle';
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <SimsPageHeader
        title={t('croissant.nav.scene.title')}
        description={t('croissant.nav.scene.description')}
        actions={
          <>
            <Badge variant="success" size="sm" dot>
              {t('croissant.nav.meta.paths', { n: 4 })}
            </Badge>
            <Badge variant="info" size="sm">
              {t('croissant.nav.meta.layers', { n: 3 })}
            </Badge>
          </>
        }
      />

      <section aria-labelledby="nav-breadcrumbs" className="space-y-4">
        <div>
          <h2 id="nav-breadcrumbs" className="text-lg font-semibold text-foreground">
            {t('croissant.nav.section.breadcrumbs')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.nav.section.breadcrumbsDesc')}
          </p>
        </div>
        <Card variant="outlined">
          <CardContent className="space-y-4">
            <Breadcrumbs>
              <BreadcrumbItem>
                <BreadcrumbLink to="/croissant/bakery-dashboard">
                  {t('croissant.nav.crumbs.bakery')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink to="/croissant/data-lab">
                  {t('croissant.nav.crumbs.menu')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbCurrent>{t('croissant.nav.crumbs.croissants')}</BreadcrumbCurrent>
              </BreadcrumbItem>
            </Breadcrumbs>

            <Breadcrumbs>
              <BreadcrumbItem>
                <BreadcrumbLink to="/croissant/bakery-dashboard">
                  {t('croissant.nav.crumbs.bakery')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button
                      type="button"
                      aria-label={t('croissant.nav.crumbs.collapsed')}
                      className="inline-flex items-center gap-1 rounded-sm px-1 text-foreground-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>{t('croissant.nav.crumbs.menu')}</DropdownMenuItem>
                    <DropdownMenuItem>{t('croissant.nav.crumbs.croissants')}</DropdownMenuItem>
                    <DropdownMenuItem>{t('croissant.nav.crumbs.butter')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink to="/croissant/data-lab">
                  {t('croissant.nav.crumbs.almond')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbCurrent>{t('croissant.nav.crumbs.batch')}</BreadcrumbCurrent>
              </BreadcrumbItem>
            </Breadcrumbs>

            <Breadcrumbs>
              <BreadcrumbItem>
                <BreadcrumbLink to="/croissant/bakery-dashboard">
                  <span className="inline-flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5" />
                    {t('croissant.nav.crumbs.bakery')}
                  </span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink to="/croissant/data-lab">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {t('croissant.nav.crumbs.menu')}
                  </span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbCurrent>
                  <span className="inline-flex items-center gap-1.5 text-success">
                    <Croissant className="h-3.5 w-3.5" />
                    {t('croissant.nav.crumbs.croissants')}
                  </span>
                </BreadcrumbCurrent>
              </BreadcrumbItem>
            </Breadcrumbs>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="nav-tabs" className="space-y-4">
        <div>
          <h2 id="nav-tabs" className="text-lg font-semibold text-foreground">
            {t('croissant.nav.section.tabs')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.nav.section.tabsDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {(['underline', 'pills', 'segmented'] as const).map((variant) => (
            <Card key={variant} variant="outlined">
              <CardContent className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  {variant}
                </p>
                <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} variant={variant}>
                  <TabsList>
                    <TabsTrigger value="recipe">{t('croissant.nav.tabs.recipe')}</TabsTrigger>
                    <TabsTrigger value="equipment">{t('croissant.nav.tabs.equipment')}</TabsTrigger>
                    <TabsTrigger value="notes">{t('croissant.nav.tabs.notes')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value={tab}>
                    <div className="rounded-md bg-surface-muted/30 p-3 text-sm text-foreground-muted">
                      {t(`croissant.nav.tabs.body.${tab}`)}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}

          <Card variant="outlined">
            <CardContent className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                vertical
              </p>
              <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as typeof tab)}
                variant="pills"
                orientation="vertical"
              >
                <TabsList>
                  <TabsTrigger value="recipe">{t('croissant.nav.tabs.recipe')}</TabsTrigger>
                  <TabsTrigger value="equipment">{t('croissant.nav.tabs.equipment')}</TabsTrigger>
                  <TabsTrigger value="notes">{t('croissant.nav.tabs.notes')}</TabsTrigger>
                </TabsList>
                <TabsContent value={tab}>
                  <div className="rounded-md bg-surface-muted/30 p-3 text-sm text-foreground-muted">
                    {t(`croissant.nav.tabs.body.${tab}`)}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="nav-stepper" className="space-y-4">
        <div>
          <h2 id="nav-stepper" className="text-lg font-semibold text-foreground">
            {t('croissant.nav.section.stepper')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.nav.section.stepperDesc')}
          </p>
        </div>
        <Card variant="outlined">
          <CardContent className="space-y-6">
            <Stepper orientation="horizontal">
              {STEPS.map((s, i) => (
                <Step key={s} status={stepStatus(i, 2)} index={i}>
                  <StepIndicator />
                  <span className="flex flex-col">
                    <StepLabel>{t(`croissant.nav.stepper.${s as StepKey}`)}</StepLabel>
                    <StepDescription>{t(`croissant.nav.stepper.${s}Desc`)}</StepDescription>
                  </span>
                </Step>
              ))}
            </Stepper>

            <Stepper orientation="vertical">
              {STEPS.slice(0, 3).map((s, i) => (
                <Step key={`v-${s}`} status={stepStatus(i, 1)} index={i}>
                  <StepIndicator />
                  <span className="flex flex-col">
                    <StepLabel>{t(`croissant.nav.stepper.${s as StepKey}`)}</StepLabel>
                    <StepDescription>{t(`croissant.nav.stepper.${s}Desc`)}</StepDescription>
                  </span>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="nav-pagination" className="space-y-4">
        <div>
          <h2 id="nav-pagination" className="text-lg font-semibold text-foreground">
            {t('croissant.nav.section.pagination')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.nav.section.paginationDesc')}
          </p>
        </div>
        <Card variant="outlined">
          <CardContent className="space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                {t('croissant.nav.pagination.standard')}
              </p>
              <Pagination page={page} totalPages={12} onPageChange={setPage} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                {t('croissant.nav.pagination.compact')}
              </p>
              <Pagination
                page={page}
                totalPages={12}
                onPageChange={setPage}
                siblingCount={0}
                boundaryCount={1}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                {t('croissant.nav.pagination.withInput')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Pagination page={page} totalPages={12} onPageChange={setPage} />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const n = Number.parseInt(pageInput, 10);
                    if (!Number.isNaN(n)) setPage(Math.min(12, Math.max(1, n)));
                  }}
                  className="inline-flex items-center gap-2"
                >
                  <label className="text-xs text-foreground-muted" htmlFor="goto">
                    {t('croissant.nav.pagination.goto')}
                  </label>
                  <Input
                    id="goto"
                    inputSize="sm"
                    className="w-16"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                  />
                  <Button size="sm" type="submit" variant="outline">
                    {t('croissant.nav.pagination.gotoBtn')}
                  </Button>
                </form>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                {t('croissant.nav.pagination.withSize')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Pagination page={page} totalPages={12} onPageChange={setPage} />
                <label className="inline-flex items-center gap-2 text-xs text-foreground-muted">
                  {t('croissant.nav.pagination.pageSize')}
                  <Select
                    selectSize="sm"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="w-20"
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="nav-menu" className="space-y-4">
        <div>
          <h2 id="nav-menu" className="text-lg font-semibold text-foreground">
            {t('croissant.nav.section.menu')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.nav.section.menuDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="outlined">
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                {t('croissant.nav.menu.singleTitle')}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" leftIcon={<MoreHorizontal className="h-4 w-4" />}>
                    {t('croissant.nav.menu.open')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{t('croissant.nav.menu.actions')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Edit2 className="mr-2 h-4 w-4" />
                    {t('croissant.nav.menu.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    {t('croissant.nav.menu.duplicate')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    {t('croissant.nav.menu.archive')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                {t('croissant.nav.menu.subTitle')}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />}>
                    {t('croissant.nav.menu.new')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Croissant className="mr-2 h-4 w-4" />
                    {t('croissant.nav.menu.croissant')}
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ChevronsUpDown className="mr-2 h-4 w-4" />
                      {t('croissant.nav.menu.fromTemplate')}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>{t('croissant.nav.menu.tplClassic')}</DropdownMenuItem>
                      <DropdownMenuItem>{t('croissant.nav.menu.tplAlmond')}</DropdownMenuItem>
                      <DropdownMenuItem>{t('croissant.nav.menu.tplChocolate')}</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {t('croissant.nav.menu.bulk')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                {t('croissant.nav.menu.checkTitle')}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" leftIcon={<ChevronDown className="h-4 w-4" />}>
                    {t('croissant.nav.menu.view')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{t('croissant.nav.menu.show')}</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem checked={showNotes} onCheckedChange={setShowNotes}>
                    {t('croissant.nav.menu.notes')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={showArchived}
                    onCheckedChange={setShowArchived}
                  >
                    {t('croissant.nav.menu.archived')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{t('croissant.nav.menu.bookmark')}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={bookmark}
                    onValueChange={(v) => setBookmark(v as typeof bookmark)}
                  >
                    <DropdownMenuRadioItem value="pinned">
                      {t('croissant.nav.menu.pinned')}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="starred">
                      {t('croissant.nav.menu.starred')}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="archived">
                      {t('croissant.nav.menu.archived')}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                {t('croissant.nav.menu.dangerTitle')}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline">{t('croissant.nav.menu.danger')}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    {t('croissant.nav.menu.share')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-danger hover:bg-danger/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('croissant.nav.menu.delete')}
                    <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="nav-context" className="space-y-4">
        <div>
          <h2 id="nav-context" className="text-lg font-semibold text-foreground">
            {t('croissant.nav.section.context')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.nav.section.contextDesc')}
          </p>
        </div>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="cursor-context-menu rounded-md border-2 border-dashed border-success/40 bg-success/5 px-8 py-12 text-center">
              <Croissant aria-hidden="true" className="mx-auto h-10 w-10 text-success" />
              <p className="mt-2 text-sm font-medium text-foreground">
                {t('croissant.nav.context.batch')}
              </p>
              <p className="text-xs text-foreground-muted">{t('croissant.nav.context.hint')}</p>
              <div className="mt-3 inline-flex items-center gap-2">
                <Stat
                  variant="compact"
                  label={t('croissant.nav.context.batchLabel')}
                  value="B-027"
                  delta={0}
                />
              </div>
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
            <ContextMenuItem className="text-danger">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('croissant.nav.context.delete')}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </section>

      <section aria-labelledby="nav-faq" className="space-y-4">
        <div>
          <h2 id="nav-faq" className="text-lg font-semibold text-foreground">
            {t('croissant.nav.section.faq')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">{t('croissant.nav.section.faqDesc')}</p>
        </div>
        <Card variant="outlined" className="overflow-hidden">
          <Accordion type="single" defaultValue="hours" collapsible variant="default">
            <AccordionItem value="hours">
              <AccordionTrigger>{t('croissant.nav.faq.hours.q')}</AccordionTrigger>
              <AccordionContent>
                <p>{t('croissant.nav.faq.hours.a')}</p>
                <div className="mt-2 inline-flex items-center gap-2">
                  <Badge variant="success" size="sm">
                    {t('croissant.nav.faq.hours.tag')}
                  </Badge>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="custom">
              <AccordionTrigger>{t('croissant.nav.faq.custom.q')}</AccordionTrigger>
              <AccordionContent>
                <p>{t('croissant.nav.faq.custom.a')}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="allergens">
              <AccordionTrigger>{t('croissant.nav.faq.allergens.q')}</AccordionTrigger>
              <AccordionContent>
                <p>{t('croissant.nav.faq.allergens.a')}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="warning" size="sm">
                    {t('croissant.nav.faq.allergens.gluten')}
                  </Badge>
                  <Badge variant="warning" size="sm">
                    {t('croissant.nav.faq.allergens.dairy')}
                  </Badge>
                  <Badge variant="warning" size="sm">
                    {t('croissant.nav.faq.allergens.nuts')}
                  </Badge>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery">
              <AccordionTrigger>{t('croissant.nav.faq.delivery.q')}</AccordionTrigger>
              <AccordionContent>
                <p>{t('croissant.nav.faq.delivery.a')}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shortcuts">
              <AccordionTrigger>{t('croissant.nav.faq.shortcuts.q')}</AccordionTrigger>
              <AccordionContent>
                <p>{t('croissant.nav.faq.shortcuts.a')}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                  <span className="text-xs text-foreground-muted">
                    {t('croissant.nav.faq.shortcuts.palette')}
                  </span>
                  <span className="mx-2 text-foreground-subtle">·</span>
                  <Kbd>Tab</Kbd>
                  <span className="text-xs text-foreground-muted">
                    {t('croissant.nav.faq.shortcuts.tab')}
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="loyalty">
              <AccordionTrigger>{t('croissant.nav.faq.loyalty.q')}</AccordionTrigger>
              <AccordionContent>
                <p>{t('croissant.nav.faq.loyalty.a')}</p>
                <div className="mt-2 inline-flex items-center gap-2 text-xs text-foreground-muted">
                  <Star className={cn('h-3.5 w-3.5 text-warning')} />
                  {t('croissant.nav.faq.loyalty.stars', { n: 12 })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </section>
    </div>
  );
}
