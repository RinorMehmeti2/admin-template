import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/primitives/Badge';
import { INVOICES, formatUsd, statusVariant } from '../data';
import type { InvoiceRow } from '../model';

export function InvoicesTable() {
  const columns = useMemo<ColumnDef<InvoiceRow, unknown>[]>(
    () => [
      { accessorKey: 'id', header: 'Invoice' },
      { accessorKey: 'customer', header: 'Customer' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => formatUsd(row.original.amount),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
        ),
      },
      { accessorKey: 'issued', header: 'Issued' },
    ],
    [],
  );

  return (
    <section className="mt-8">
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Recent invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable<InvoiceRow>
            columns={columns}
            data={INVOICES}
            pageSize={5}
            enableGlobalFilter={false}
            enableColumnVisibility={false}
          />
        </CardContent>
      </Card>
    </section>
  );
}
