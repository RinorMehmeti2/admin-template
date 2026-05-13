import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardContent } from '@/components/data-display/Card';
import { DataTable, type ColumnDef } from '@/components/data-display/DataTable';
import { EmptyState } from '@/components/data-display/EmptyState';
import {
  FilterableSearch,
  type ActiveFilter,
  type FilterDef,
} from '@/components/data-display/FilterableSearch';
import { Tabs, TabsList, TabsTrigger } from '@/components/navigation/Tabs';
import { ComponentsUsedFooter, SectionHeader } from '../_shared';

type Category = 'pastry' | 'bread' | 'cake' | 'drink';
type StockStatus = 'in-stock' | 'low' | 'out';

interface InventoryRow {
  sku: string;
  name: string;
  category: Category;
  stock: number;
  price: number;
  updated: string;
}

const ROWS: ReadonlyArray<InventoryRow> = [
  {
    sku: 'CRO-001',
    name: 'Classic butter croissant',
    category: 'pastry',
    stock: 42,
    price: 3.5,
    updated: '2026-05-12',
  },
  {
    sku: 'CRO-002',
    name: 'Almond croissant',
    category: 'pastry',
    stock: 18,
    price: 4.5,
    updated: '2026-05-12',
  },
  {
    sku: 'CRO-003',
    name: 'Pain au chocolat',
    category: 'pastry',
    stock: 31,
    price: 4.0,
    updated: '2026-05-12',
  },
  {
    sku: 'CRO-004',
    name: 'Kouign-amann',
    category: 'pastry',
    stock: 0,
    price: 5.0,
    updated: '2026-05-11',
  },
  {
    sku: 'CRO-005',
    name: 'Cinnamon roll',
    category: 'pastry',
    stock: 8,
    price: 4.25,
    updated: '2026-05-12',
  },
  {
    sku: 'BRD-001',
    name: 'Country sourdough',
    category: 'bread',
    stock: 24,
    price: 8.0,
    updated: '2026-05-12',
  },
  {
    sku: 'BRD-002',
    name: 'Whole wheat loaf',
    category: 'bread',
    stock: 12,
    price: 7.0,
    updated: '2026-05-11',
  },
  {
    sku: 'BRD-003',
    name: 'Baguette',
    category: 'bread',
    stock: 36,
    price: 3.75,
    updated: '2026-05-12',
  },
  {
    sku: 'BRD-004',
    name: 'Rye loaf',
    category: 'bread',
    stock: 4,
    price: 7.5,
    updated: '2026-05-11',
  },
  {
    sku: 'BRD-005',
    name: 'Brioche',
    category: 'bread',
    stock: 0,
    price: 6.0,
    updated: '2026-05-10',
  },
  {
    sku: 'BRD-006',
    name: 'Focaccia',
    category: 'bread',
    stock: 14,
    price: 9.5,
    updated: '2026-05-12',
  },
  {
    sku: 'CAK-001',
    name: 'Vanilla layer cake',
    category: 'cake',
    stock: 6,
    price: 28.0,
    updated: '2026-05-11',
  },
  {
    sku: 'CAK-002',
    name: 'Chocolate ganache',
    category: 'cake',
    stock: 9,
    price: 32.0,
    updated: '2026-05-12',
  },
  {
    sku: 'CAK-003',
    name: 'Lemon tart',
    category: 'cake',
    stock: 11,
    price: 22.0,
    updated: '2026-05-12',
  },
  {
    sku: 'CAK-004',
    name: 'Carrot cake',
    category: 'cake',
    stock: 0,
    price: 30.0,
    updated: '2026-05-10',
  },
  {
    sku: 'CAK-005',
    name: 'Cheesecake',
    category: 'cake',
    stock: 7,
    price: 26.0,
    updated: '2026-05-11',
  },
  {
    sku: 'DRK-001',
    name: 'Espresso',
    category: 'drink',
    stock: 999,
    price: 3.25,
    updated: '2026-05-12',
  },
  {
    sku: 'DRK-002',
    name: 'Cappuccino',
    category: 'drink',
    stock: 999,
    price: 4.5,
    updated: '2026-05-12',
  },
  {
    sku: 'DRK-003',
    name: 'Cold brew',
    category: 'drink',
    stock: 28,
    price: 5.0,
    updated: '2026-05-12',
  },
  {
    sku: 'DRK-004',
    name: 'Hot chocolate',
    category: 'drink',
    stock: 16,
    price: 4.75,
    updated: '2026-05-11',
  },
  {
    sku: 'DRK-005',
    name: 'Lemonade',
    category: 'drink',
    stock: 0,
    price: 4.0,
    updated: '2026-05-10',
  },
  {
    sku: 'CRO-006',
    name: 'Ham & cheese croissant',
    category: 'pastry',
    stock: 22,
    price: 5.25,
    updated: '2026-05-12',
  },
  {
    sku: 'CRO-007',
    name: 'Croissant aux raisins',
    category: 'pastry',
    stock: 9,
    price: 4.25,
    updated: '2026-05-12',
  },
  {
    sku: 'BRD-007',
    name: 'Bagel',
    category: 'bread',
    stock: 30,
    price: 3.0,
    updated: '2026-05-12',
  },
  {
    sku: 'BRD-008',
    name: 'Pretzel',
    category: 'bread',
    stock: 2,
    price: 3.5,
    updated: '2026-05-12',
  },
];

const COMPONENTS = [
  'DataTable',
  'Table',
  'Tabs',
  'FilterableSearch',
  'EmptyState',
  'Badge',
  'Card',
];

function classify(stock: number): StockStatus {
  if (stock === 0) return 'out';
  if (stock < 10) return 'low';
  return 'in-stock';
}

export function DataLabPage() {
  const { t, i18n } = useTranslation();

  const currency = useMemo(
    () => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD' }),
    [i18n.language],
  );
  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        month: 'short',
        day: 'numeric',
      }),
    [i18n.language],
  );

  const [tab, setTab] = useState<'all' | 'low' | 'out'>('all');
  const [activeFilters, setActiveFilters] = useState<ReadonlyArray<ActiveFilter>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(id);
  }, []);

  const filterDefs = useMemo<ReadonlyArray<FilterDef>>(
    () => [
      {
        id: 'category',
        label: t('croissant.dataLab.filter.category'),
        type: 'multi-select',
        options: [
          { value: 'pastry', label: t('croissant.dataLab.category.pastry') },
          { value: 'bread', label: t('croissant.dataLab.category.bread') },
          { value: 'cake', label: t('croissant.dataLab.category.cake') },
          { value: 'drink', label: t('croissant.dataLab.category.drink') },
        ],
      },
    ],
    [t],
  );

  const filteredData = useMemo(() => {
    const categoryFilter = activeFilters.find((f) => f.id === 'category');
    const categories = Array.isArray(categoryFilter?.value) ? new Set(categoryFilter.value) : null;
    return ROWS.filter((r) => {
      if (tab === 'low' && classify(r.stock) !== 'low') return false;
      if (tab === 'out' && classify(r.stock) !== 'out') return false;
      if (categories !== null && categories.size > 0 && !categories.has(r.category)) return false;
      return true;
    });
  }, [tab, activeFilters]);

  const categoryLabel = (c: Category) => t(`croissant.dataLab.category.${c}`);

  const columns = useMemo<ColumnDef<InventoryRow>[]>(
    () => [
      { id: 'sku', header: t('croissant.dataLab.col.sku'), accessorKey: 'sku' },
      { id: 'name', header: t('croissant.dataLab.col.name'), accessorKey: 'name' },
      {
        id: 'category',
        header: t('croissant.dataLab.col.category'),
        accessorKey: 'category',
        cell: ({ row }) => (
          <Badge variant="neutral" size="sm">
            {categoryLabel(row.original.category)}
          </Badge>
        ),
      },
      {
        id: 'stock',
        header: t('croissant.dataLab.col.stock'),
        accessorKey: 'stock',
        cell: ({ row }) => <span className="tabular-nums">{row.original.stock}</span>,
      },
      {
        id: 'price',
        header: t('croissant.dataLab.col.price'),
        accessorKey: 'price',
        cell: ({ row }) => (
          <span className="tabular-nums">{currency.format(row.original.price)}</span>
        ),
      },
      {
        id: 'status',
        header: t('croissant.dataLab.col.status'),
        cell: ({ row }) => {
          const s = classify(row.original.stock);
          if (s === 'in-stock')
            return (
              <Badge variant="success" dot>
                {t('croissant.dataLab.status.inStock')}
              </Badge>
            );
          if (s === 'low')
            return (
              <Badge variant="warning" dot>
                {t('croissant.dataLab.status.low')}
              </Badge>
            );
          return (
            <Badge variant="danger" dot>
              {t('croissant.dataLab.status.out')}
            </Badge>
          );
        },
      },
      {
        id: 'updated',
        header: t('croissant.dataLab.col.updated'),
        accessorKey: 'updated',
        cell: ({ row }) => (
          <span className="text-xs text-foreground-muted">
            {dateFmt.format(new Date(row.original.updated))}
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, currency, dateFmt],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title={t('croissant.dataLab.title')}
        description={t('croissant.dataLab.subtitle')}
      />

      <SectionHeader
        tone="primary"
        eyebrow={loading ? t('croissant.dataLab.loading.title') : 'DataTable'}
        title={t('croissant.dataLab.title')}
        description={loading ? t('croissant.dataLab.loading.desc') : undefined}
      />

      <Card variant="outlined">
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as 'all' | 'low' | 'out')}
              variant="segmented"
            >
              <TabsList>
                <TabsTrigger value="all">{t('croissant.dataLab.tabs.all')}</TabsTrigger>
                <TabsTrigger value="low">{t('croissant.dataLab.tabs.low')}</TabsTrigger>
                <TabsTrigger value="out">{t('croissant.dataLab.tabs.out')}</TabsTrigger>
              </TabsList>
            </Tabs>
            <FilterableSearch
              filters={filterDefs}
              activeFilters={activeFilters}
              onActiveFiltersChange={setActiveFilters}
              placeholder={t('croissant.dataLab.col.name')}
            />
          </div>

          <DataTable<InventoryRow>
            columns={columns}
            data={[...filteredData]}
            isLoading={loading}
            skeletonRows={6}
            enableRowSelection
            enableGlobalFilter={false}
            getRowId={(r) => r.sku}
            pageSize={10}
            emptyState={
              <EmptyState
                icon={<Inbox className="h-6 w-6" />}
                title={t('croissant.dataLab.empty.title')}
                description={t('croissant.dataLab.empty.desc')}
              />
            }
          />
        </CardContent>
      </Card>

      <ComponentsUsedFooter components={COMPONENTS} />
    </div>
  );
}
