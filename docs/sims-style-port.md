# SIMS Style Port — Reference

This doc captures what was done to port the SIMS (`/SIMS/app.tsx`) design into `admin-template` and how to extend the same visual language across the rest of the menus, submenus, and demo pages.

## Goal

The reference design at `/SIMS/app.tsx` was built with **MUI (Material UI) + Tailwind**. The admin-template is a hand-rolled component library — **no MUI, Chakra, Mantine, Radix, Headless UI, shadcn, etc.** (see `CLAUDE.md` "Tech stack" + "Anti-patterns").

We wanted SIMS' **visual style + layout pattern** rendered with admin-template's **own components**. So we:

1. Stripped every MUI import out of the SIMS reference design.
2. Re-implemented all 14 pages and the shell with admin-template primitives — same visual structure, but driven by `Button`, `Card`, `Badge`, `Table`, `Drawer`, `Switch`, `Input`, `Pagination`, `DropdownMenu`, `Alert`, `Progress`, `AreaChart`, `BarChart`, etc.
3. Mapped Material Icons (font glyphs) to **lucide-react** (the one icon set allowed by CLAUDE.md).
4. Used Tailwind utilities + semantic design tokens (`bg-surface`, `text-foreground-muted`, `border-border`, `bg-primary/10`, …) — **no raw hex colors**.

The result lives at `/sims/*` and uses its own shell (`SimsLayout`). It is reachable from the main admin-template sidebar via the new "SIMS" nav group.

## What was built

```
src/pages/sims/
  SimsLayout.tsx          # Own shell: SidebarProvider + SimsSidebar + SimsTopbar + SimsBreadcrumbs + Outlet
  SimsTopbar.tsx          # 64px sticky header: hamburger / collapse, title+subtitle, notifications, locale, theme, avatar menu
  SimsBreadcrumbs.tsx     # Sticky breadcrumb strip below topbar (Home → … chain)
  nav.tsx                 # SIMS_NAV tree (Dashboard + Administration group with 13 leaves) + icon maps
  data.ts                 # All mock data + types (MOCK_USERS, MOCK_ROLES, MOCK_HOLIDAYS, MOCK_LOGS, …)
  index.ts                # Public exports
  components/
    SimsPageHeader.tsx    # SIMS-style page header: title + description + actions row
    SimsStatCard.tsx      # Stat card: icon tile + label + big value + trend pill
  pages/
    DashboardPage.tsx           # 4 stat cards + Recent Activity + Upcoming Holidays
    UsersPage.tsx               # Search + Table + Drawer (edit) + ConfirmDialog (delete) + Pagination
    RolesPage.tsx               # Roles table → Permissions matrix view (module cards + progress rings + chip-toggle ops)
    ModulesPage.tsx             # Master/detail: module list with enable Switch + operations table
    MenuPage.tsx                # Tree rows with reorder arrows + visibility Switch + live preview panel
    HolidaysPage.tsx            # Year/month calendar + holiday list
    EmailConfigPage.tsx         # SMTP form + connection status side card + test connection
    NotificationsPage.tsx       # 4 stat cards + template table with email/sms/inApp switches
    ReportsPage.tsx              # Search + category chips + report cards grid
    StatisticsPage.tsx          # Stat cards + AreaChart (enrollment) + role split bars + BarChart (attendance)
    LogsPage.tsx                # Level chip filter + user search + dense table + pagination
    LookupTablesPage.tsx        # Master/detail: tables list + row table with sort + enable Switch
    ThemeConfigPage.tsx         # Color presets + ColorPicker + radius Slider + density Switch + live preview
    SchemaDriftPage.tsx          # State stat cards (match/mismatch/missing/extra) + drift diff table
```

### Routes (App.tsx)

```ts
{
  path: '/sims',
  element: <SimsLayout />,         // own shell — replaces AppLayout chrome
  children: [
    { index: true, element: <Navigate to="/sims/dashboard" replace /> },
    { path: 'dashboard', element: <SimsDashboardPage /> },
    { path: 'administration', element: <Navigate to="/sims/administration/users" replace /> },
    { path: 'administration/users', element: <SimsUsersPage /> },
    // … 12 more
  ],
}
```

### Main-app sidebar link

In `src/components/layout/AppLayout/AppLayout.tsx`, the NAV_TREE got a new entry:

```ts
{
  kind: 'group',
  id: 'sims',
  labelKey: 'nav.group.sims',
  icon: <School className="h-4 w-4" />,
  children: [/* 14 NavLinks pointing to /sims/dashboard, /sims/administration/users, … */],
}
```

i18n keys added to both `en.json` and `es.json` (`nav.group.sims`, `nav.sims.dashboard`, `nav.sims.users`, …).

## MUI → admin-template component map

This is the canonical mapping used while porting. **Re-use this for every other menu/demo when applying SIMS style.**

| MUI                                           | admin-template                                                                                                                    | Import                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `<Button variant="contained">`                | `<Button variant="primary">`                                                                                                      | `@/components/primitives/Button`                                  |
| `<Button variant="outlined">`                 | `<Button variant="outline">`                                                                                                      | `@/components/primitives/Button`                                  |
| `<Button variant="text">`                     | `<Button variant="ghost">` or `variant="link"`                                                                                    | `@/components/primitives/Button`                                  |
| `<IconButton>`                                | `<IconButton aria-label="…">` (label required)                                                                                    | `@/components/primitives/IconButton`                              |
| `<Chip>`                                      | `<Badge variant="primary\|success\|warning\|danger\|info\|neutral" size="sm">`                                                    | `@/components/primitives/Badge`                                   |
| `<Avatar>`                                    | `<Avatar name="…" size="sm\|md\|lg">` (auto initials + deterministic color)                                                       | `@/components/primitives/Avatar`                                  |
| `<Card variant="outlined">`                   | `<Card variant="outlined">`                                                                                                       | `@/components/data-display/Card`                                  |
| `<CardHeader title=… subheader=…>`            | `<CardHeader><CardTitle/><CardDescription/></CardHeader>`                                                                         | `@/components/data-display/Card`                                  |
| `<CardContent>`                               | `<CardContent>`                                                                                                                   | `@/components/data-display/Card`                                  |
| `<Divider>`                                   | `<Separator>` or `<div className="border-t border-border" />`                                                                     | `@/components/primitives/Separator`                               |
| `<TableContainer><Table>…`                    | `<div className="rounded-md border border-border bg-surface"><Table size="default\|dense">…`                                      | `@/components/data-display/Table`                                 |
| `<TableHead>`, `<TableBody>`, `<TableRow>`    | `<TableHeader>`, `<TableBody>`, `<TableRow>`                                                                                      | same                                                              |
| `<TableCell>`, `<TableCell align="right">`    | `<TableCell>`, `<TableCell className="text-right">`                                                                               | same                                                              |
| `<TablePagination>`                           | Custom row: `<Select>` for rows-per-page + `<Pagination>` (`@/components/navigation`)                                             | `@/components/navigation/Pagination`                              |
| `<List dense>` + `<ListItem>`                 | `<ul className="divide-y divide-border">` + `<li className="flex items-center …">`                                                | plain markup                                                      |
| `<TextField>`                                 | `<Label htmlFor>` + `<Input id leftIcon=… inputSize="sm">`                                                                        | `@/components/forms/{Input,Label}`                                |
| `<TextField InputProps={{ startAdornment }}>` | `<Input leftIcon={<Icon className="h-4 w-4" />}>` (also `rightIcon`, `prefix`, `suffix`)                                          | `@/components/forms/Input`                                        |
| `<Select native>` + `<MenuItem>`              | `<Select>` + plain `<option>`                                                                                                     | `@/components/forms/Select`                                       |
| `<Select>` (searchable / async / multi)       | `<Combobox>` + `<ComboboxTrigger>` + `<ComboboxContent>`                                                                          | `@/components/forms/Combobox`                                     |
| `<Switch>`                                    | `<Switch>` (native role=switch)                                                                                                   | `@/components/forms/Switch`                                       |
| `<Checkbox>`                                  | `<Checkbox indeterminate?>`                                                                                                       | `@/components/forms/Checkbox`                                     |
| `<RadioGroup>` + `<Radio>`                    | `<RadioGroup name value onValueChange>` + `<Radio value>`                                                                         | `@/components/forms/{RadioGroup,Radio}`                           |
| `<input type="range">`                        | `<Slider min max step value onValueChange aria-label>`                                                                            | `@/components/forms/Slider`                                       |
| `<input type="color">`                        | `<ColorPicker value onValueChange format="hex">`                                                                                  | `@/components/forms/ColorPicker`                                  |
| `<Dialog>` + `<DialogTitle/Content/Actions>`  | `<Dialog open onOpenChange>` + `<DialogContent><DialogHeader><DialogTitle/></DialogHeader>…`                                      | `@/components/feedback/Dialog`                                    |
| Confirm dialog pattern                        | `<ConfirmDialog open onOpenChange title description onConfirm variant="danger">`                                                  | `@/components/feedback/ConfirmDialog`                             |
| `<Drawer anchor="right">`                     | `<Drawer open onOpenChange side="right">` + `<DrawerContent><DrawerHeader/Body/Footer>…`                                          | `@/components/feedback/Drawer`                                    |
| `<Alert severity>`                            | `<Alert variant="info\|success\|warning\|danger\|neutral" title description icon>`                                                | `@/components/feedback/Alert`                                     |
| `<Snackbar>` / `enqueueSnackbar`              | `useToast()` from `@/context/ToastProvider`; `toast.success(...)`, `.error`, `.warning`, …                                        | `@/context/ToastProvider`                                         |
| `<Tooltip title>`                             | `<Tooltip><TooltipTrigger><…/></TooltipTrigger><TooltipContent side="top">…</TooltipContent>`                                     | `@/components/feedback/Tooltip` (needs `TooltipProvider` at root) |
| `<LinearProgress value>` / `<LinearProgress>` | `<Progress value max>` or `<Progress indeterminate>`                                                                              | `@/components/feedback/Progress`                                  |
| `<Menu anchorEl>` + `<MenuItem>`              | `<DropdownMenu>` + `<DropdownMenuTrigger>` + `<DropdownMenuContent>` + `<DropdownMenuItem onSelect>`                              | `@/components/navigation/DropdownMenu`                            |
| `<Breadcrumbs>`                               | `<Breadcrumbs>` + `<BreadcrumbItem>` + `<BreadcrumbLink to>` / `<BreadcrumbCurrent>`                                              | `@/components/navigation/Breadcrumbs`                             |
| `<Tabs>` + `<Tab>`                            | `<Tabs value onValueChange variant="underline\|pills\|segmented">` + `<TabsList>` + `<TabsTrigger value>` + `<TabsContent value>` | `@/components/navigation/Tabs`                                    |
| `<AppBar>` + `<Toolbar>`                      | Custom `<header className="flex h-16 …">` (see `SimsTopbar.tsx`)                                                                  | plain markup                                                      |
| `<Drawer variant="permanent">` (sidebar)      | `<SidebarProvider>` + `<Sidebar header footer>` + `<NavGroup>` + `<NavLink>`                                                      | `@/components/layout/Sidebar`                                     |
| Recharts (inline `<svg>` charts in SIMS)      | `<AreaChart>`, `<BarChart>`, `<LineChart>` — composed via `<ChartContainer>` if many at once                                      | `@/components/data-display/charts/*`                              |
| Material Icons (font glyphs like `dashboard`) | lucide-react icons (`LayoutDashboard`, `ShieldCheck`, …)                                                                          | `lucide-react`                                                    |

**Forms**: anything serious belongs inside `<Form form={useForm(...)}>` + `<FormField label error required>` for auto-wired aria + RHF integration (`@/components/forms/{Form,FormField}`). Demo pages can use plain `<Label htmlFor>` + `<Input id>` like SIMS does.

## Visual patterns

These are the patterns SIMS established; reuse verbatim on the other menus when restyling.

### Page shell

Every product page renders inside a content wrapper that caps width and adds the standard padding:

```tsx
<main className="relative flex-1 p-4 sm:p-6 lg:p-8">
  <div className="mx-auto max-w-[1400px]">
    <Outlet />
  </div>
</main>
```

### Page header pattern

```tsx
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';

<SimsPageHeader
  title="Users"
  description="Manage user accounts, roles, and access."
  actions={
    <>
      <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
        Export
      </Button>
      <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
        Add User
      </Button>
    </>
  }
/>;
```

Visual rules: title `text-2xl font-bold tracking-tight`, description `mt-1 text-sm text-foreground-muted`, actions right-aligned, wraps to next line on narrow viewports (`flex-wrap gap-3`).

For pages outside `/sims`, either import `SimsPageHeader` directly or re-create the same shape in-place. If you want it global, the existing `@/components/layout/PageHeader` does roughly the same job; pick one and stick to it per page tree.

### Stat card pattern

```tsx
import { SimsStatCard } from '@/pages/sims/components/SimsStatCard';
import { UsersRound } from 'lucide-react';

<SimsStatCard
  Icon={UsersRound}
  label="Total Users"
  value={2287}
  trend="up" // 'up' | 'down' | 'flat'
  trendValue="+4.2%"
/>;
```

Visual rules: outlined card, label `text-xs font-medium text-foreground-muted`, big value `text-3xl font-bold`, trend pill in success/danger/muted tone with `TrendingUp` / `TrendingDown` / `Minus` icons.

### Card composition

```tsx
<Card variant="outlined">
  <CardHeader className="flex flex-row items-start justify-between gap-2">
    <div>
      <CardTitle>Recent Activity</CardTitle>
      <CardDescription>Latest system events</CardDescription>
    </div>
    <Button variant="link" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
      View all
    </Button>
  </CardHeader>
  <CardContent className="p-0">
    <ul className="divide-y divide-border">…</ul>
  </CardContent>
</Card>
```

When the card body is a list/table, use `<CardContent className="p-0">` to let the rows hit the edges; otherwise default padding is fine.

### Data table pattern

```tsx
<div className="rounded-md border border-border bg-surface">
  <Table size="default">           {/* "dense" for log-style pages */}
    <TableHeader>
      <TableRow>
        <TableHead style={{ width: 60 }} />
        <TableHead>Name</TableHead>
        <TableHead className="text-right" style={{ width: 120 }} />
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((r) => (
        <TableRow key={r.id} className="cursor-pointer" onClick={…}>
          <TableCell><Avatar name={r.name} size="sm" /></TableCell>
          <TableCell className="font-semibold">{r.name}</TableCell>
          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
            <div className="inline-flex gap-1">
              <IconButton aria-label="Edit" variant="ghost" size="sm"><Edit className="h-4 w-4" /></IconButton>
              <IconButton aria-label="Delete" variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></IconButton>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  {/* Footer = rows-per-page Select + Pagination */}
  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2 text-sm">
    <div className="flex items-center gap-2 text-foreground-muted">
      <span>Rows per page:</span>
      <Select selectSize="sm" value={rowsPerPage} onChange={…} className="w-20">{…}</Select>
      <span>1–10 of N</span>
    </div>
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
  </div>
</div>
```

### Edit drawer pattern

Right-side drawer, header with title + close button, body with form fields, footer with cancel + primary.

```tsx
<Drawer
  open={drawer !== null}
  onOpenChange={(o) => (!o ? setDrawer(null) : undefined)}
  side="right"
>
  <DrawerContent>
    <DrawerHeader className="flex items-center justify-between">
      <DrawerTitle>{editing ? 'Edit User' : 'Add User'}</DrawerTitle>
      <IconButton aria-label="Close" variant="ghost" size="sm" onClick={() => setDrawer(null)}>
        <X className="h-4 w-4" />
      </IconButton>
    </DrawerHeader>
    <DrawerBody className="space-y-4">…</DrawerBody>
    <DrawerFooter className="flex justify-end gap-2">
      <Button variant="ghost" onClick={() => setDrawer(null)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={save}>
        Save changes
      </Button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

### Confirm delete pattern

```tsx
<ConfirmDialog
  open={confirmDel !== null}
  onOpenChange={(o) => (!o ? setConfirmDel(null) : undefined)}
  title="Delete user?"
  description={`This permanently removes ${confirmDel?.name}. This action cannot be undone.`}
  confirmLabel="Delete"
  variant="danger"
  onConfirm={remove}
/>
```

### Filter strip pattern

```tsx
<div className="mb-4 flex flex-wrap items-center gap-3">
  <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search…" inputSize="sm" className="w-80" />
  <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>Filters</Button>
  {/* category chips */}
  <div className="flex gap-1">
    {CATS.map((c) => (
      <button type="button" onClick={…} className={cn(
        'rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active
          ? 'bg-primary text-primary-foreground'
          : 'border border-border bg-surface text-foreground-muted hover:bg-surface-muted',
      )}>{c}</button>
    ))}
  </div>
  <div className="ml-auto"><Badge variant="primary">{count} items</Badge></div>
</div>
```

When chips have semantic tone (logs `Info`/`Warning`/`Error`), swap `bg-primary` for `bg-info`/`bg-warning`/`bg-danger`.

### Icon tile pattern (replaces MUI rounded Avatar with icon)

```tsx
<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
  <Icon className="h-5 w-5" />
</div>
```

Sizes used: `h-7 w-7` (small), `h-8 w-8` (avatar slot), `h-10 w-10` (card header avatar), `h-11 w-11` (stat / report avatar). Background `bg-primary/10`, foreground `text-primary`. For disabled state swap to `bg-surface-muted` + `text-foreground-subtle`.

### Progress ring (perms matrix)

See `RolesPage.tsx` for the inline `<svg>` ring — copy verbatim, change color via `className="text-success"` / `text-primary"` on the foreground `<circle>`.

### Master/detail (Modules, Lookup Tables)

`grid-cols-1 lg:grid-cols-[340px_1fr]` on parent, left card = list with `<button>` rows that highlight `bg-primary/5` when active, right card = detail.

## Icon mapping (Material → lucide-react)

When porting, replace Material Icons font names with these lucide imports:

| Material                   | lucide                            |
| -------------------------- | --------------------------------- |
| `dashboard`                | `LayoutDashboard`                 |
| `admin_panel_settings`     | `Shield`                          |
| `group`                    | `UsersRound`                      |
| `verified_user`            | `ShieldCheck`                     |
| `view_module`              | `LayoutGrid`                      |
| `menu_open` / `menu`       | `Menu`                            |
| `event` / `calendar`       | `Calendar` / `CalendarDays`       |
| `mail`                     | `Mail`                            |
| `notifications`            | `Bell`                            |
| `description`              | `FileText`                        |
| `bar_chart`                | `BarChart3`                       |
| `receipt_long`             | `ScrollText`                      |
| `table_chart`              | `Table2`                          |
| `palette`                  | `Palette`                         |
| `compare_arrows`           | `GitCompare`                      |
| `search`                   | `Search`                          |
| `search_off`               | `SearchX`                         |
| `add`                      | `Plus`                            |
| `edit`                     | `Edit`                            |
| `delete`                   | `Trash2`                          |
| `close`                    | `X`                               |
| `check`                    | `Check`                           |
| `check_circle`             | `CheckCircle2` / `CircleCheck`    |
| `error`                    | `XCircle` / `CircleAlert`         |
| `info`                     | `Info`                            |
| `warning`                  | `AlertCircle` / `AlertTriangle`   |
| `chevron_left/right`       | `ChevronLeft/Right`               |
| `expand_more/less`         | `ChevronDown/Up`                  |
| `arrow_back`               | `ArrowLeft`                       |
| `arrow_upward/downward`    | `ArrowUp/Down`                    |
| `refresh`                  | `RefreshCw`                       |
| `restore`                  | `RotateCcw`                       |
| `save`                     | `Save`                            |
| `science`                  | `FlaskConical`                    |
| `send`                     | `Send`                            |
| `file_download`            | `Download`                        |
| `file_upload`              | `Upload` / `UploadCloud`          |
| `filter_list`              | `Filter`                          |
| `lock`                     | `Lock`                            |
| `lock_reset`               | `KeyRound`                        |
| `logout`                   | `LogOut`                          |
| `login`                    | `LogIn`                           |
| `person`                   | `User`                            |
| `person_add`               | `UserPlus`                        |
| `settings`                 | `Settings`                        |
| `tune`                     | `SlidersHorizontal`               |
| `schedule`                 | `CalendarClock`                   |
| `trending_up/down/flat`    | `TrendingUp/Down/Minus`           |
| `more_vert`                | `MoreVertical` / `MoreHorizontal` |
| `drag_indicator`           | `GripVertical`                    |
| `language`                 | `Languages`                       |
| `dark_mode` / `light_mode` | `Moon` / `Sun`                    |
| `school`                   | `School` / `GraduationCap`        |
| `class`                    | `ListChecks`                      |
| `badge`                    | `Badge` (lucide) / `IdCard`       |
| `fact_check`               | `ClipboardCheck`                  |
| `home`                     | `Home`                            |
| `construction`             | `Hammer`                          |
| `select_all`               | `CheckCircle2`                    |
| `remove_done`              | `X`                               |
| `change_circle`            | `CircleAlert`                     |
| `remove_circle`            | `CircleMinus`                     |
| `add_circle`               | `CirclePlus`                      |
| `campaign`                 | `Megaphone`                       |
| `sms`                      | `MessageSquare`                   |
| `insights`                 | `LineChart`                       |
| `payments`                 | `Wallet`                          |

Always use the **filled variant naming where lucide has one** (e.g. `CircleCheck` not `Check` if you want the disc), and always size icons with `className="h-4 w-4"` (or `h-3.5 w-3.5` for inside badges/chips, `h-5 w-5` for icon tiles).

## Token / color rules

Never raw hex. Use semantic tokens (see `src/styles/tokens.css` + `CLAUDE.md` § "Design tokens"):

- Backgrounds: `bg-background`, `bg-surface`, `bg-surface-muted`
- Foregrounds: `text-foreground`, `text-foreground-muted`, `text-foreground-subtle`
- Borders: `border-border`, `border-border-strong`
- Accents (each + `-foreground` pair): `bg-primary`, `bg-success`, `bg-warning`, `bg-danger`, `bg-info`, `bg-secondary`
- Tinted accent surfaces: `bg-primary/10`, `bg-primary/5`, `bg-danger/10`, …
- Focus ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`

Light + dark mode are covered by the tokens — **no `dark:` variants needed on these pages**. Charts use `color="primary"`/`"success"`/etc. — token-aware via `ChartContainer`.

## Rules from CLAUDE.md to keep

The following are non-negotiable while restyling other menus/demos:

- **No new UI library deps** (MUI, Chakra, Mantine, Radix, Headless UI, shadcn, React Aria). The whole point of this port is to stay off them.
- **lucide-react only icon set.** No `react-icons`, no `material-icons` font, no custom SVG inline unless it's a data-viz primitive.
- **Tailwind utilities only** — no CSS modules, no `styled-components`, no inline `style={{}}` except for dynamic numeric values (progress widths, chart sizes, dynamic `borderRadius` in the theme preview).
- **Named exports only.** `React.forwardRef` is banned (React 19) — accept `ref` as a regular prop.
- **No raw hex / hardcoded spacing.** Use tokens + Tailwind scale.
- **A11y:** every interactive element gets a visible focus ring (`focus-visible:ring-2 …`), keyboard-navigable, aria-labelled (`IconButton` requires `aria-label`).
- **Strict TS** (`noUncheckedIndexedAccess` is on): array access returns `T | undefined`. Coalesce (`?? fallback`) or destructure-with-default; **do not** use `!` or `as unknown as` to dodge it.
- **Hardcoded English strings on pages** are technically against CLAUDE.md ("hardcoded English literals — use `t('feature.sub.key')`"). The SIMS pages cheat on this (same as `/croissant` demos). If you're restyling **production** menus, do it via `useTranslation()` + add keys to every locale JSON.

## How to apply this to other menus / submenus / demo pages

Two paths depending on intent:

### Path A — keep the existing AppLayout shell, restyle page bodies only

The other demos (`/showcase`, `/forms`, `/tables`, `/croissant`, …) all render inside `<AppLayout>`. To make them feel like SIMS without rebuilding the shell:

1. Replace the page's local header markup with `<SimsPageHeader>` (or the existing `@/components/layout/PageHeader` if you want the project-standard one — pick one per page tree and stay consistent).
2. Wrap content sections in `<Card variant="outlined">` with `<CardHeader><CardTitle/><CardDescription/></CardHeader>` + `<CardContent>` (use `className="p-0"` on the content when wrapping a list/table).
3. Swap any MUI-derived class strings (`MuiCard-root`, `MuiBadge-*`, `text-emerald-500`, `bg-blue-50`, …) for token utilities (`bg-primary/10`, `text-foreground-muted`, `border-border`).
4. For data displays, replace ad-hoc tables with the `<Table>` primitive (or `<DataTable>` if you need sort/filter/select state). Pair with the SIMS pagination footer pattern.
5. For lists, use `<ul className="divide-y divide-border">` with `<li className="flex items-center gap-3 px-4 py-2.5">…`.
6. For stats / KPIs, use `<SimsStatCard>` (4-column grid on `lg`, 2-column on `sm`).
7. For filter strips, copy the "filter strip pattern" above — `Input` with `leftIcon={<Search />}` + chip buttons + right-aligned count `Badge`.
8. Map any Material Icons used in the file via the icon table above.
9. Cap content width with `max-w-[1400px] mx-auto` if it isn't already.

### Path B — give the menu its own SIMS-style shell (rare, only for truly separate products)

Mirror what `/sims` did:

1. Create `src/pages/<feature>/<Feature>Layout.tsx` modelled on `SimsLayout.tsx`.
2. Create a `<Feature>Topbar.tsx` and `<Feature>Breadcrumbs.tsx` if you want them branded.
3. Define a `nav.tsx` with the feature's `NAV_TREE` of links + groups.
4. Route via `{ path: '/<feature>', element: <FeatureLayout />, children: [...] }` in `App.tsx`.
5. Add a top-level entry/group to `AppLayout.tsx` so it's reachable from the main sidebar.

### Suggested prompt for the next Claude Code session

Use something like:

> Apply the SIMS visual style (see `docs/sims-style-port.md`) to all pages under `<menu/folder>`. Follow the **MUI → admin-template component map**, **visual patterns** (page shell, page header, stat card, card composition, data table pattern, filter strip), **icon mapping**, and **token/color rules** from that doc. Keep the existing `AppLayout` shell — restyle page bodies only (Path A). Replace any raw hex / MUI-flavoured class strings with semantic tokens. Strict TS is on (`noUncheckedIndexedAccess`); coalesce array access with `?? fallback`. Verify with `pnpm typecheck` and a Playwright route-render smoke test like `e2e/sims-smoke.spec.ts`.

Point Claude at one menu/submenu at a time — the surface is wide enough that doing the whole repo in one shot will blow the context window.

## Verification recipe

For every batch of restyled pages:

1. `pnpm typecheck` — must be clean.
2. Add (or reuse) a route-render smoke spec — see `e2e/sims-smoke.spec.ts` for the template. It walks each route, watches for `console.error` and `pageerror`, asserts `main` is visible. Fastest end-to-end signal that nothing is mis-imported.
3. Spot-check in the browser: open the page, toggle dark mode, resize to mobile. Tokens cover both modes — no per-component `dark:` variant should be needed.
