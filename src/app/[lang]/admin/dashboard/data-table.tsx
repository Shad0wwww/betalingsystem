"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable as BaseDataTable } from "@/components/ui/data-table"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({ columns }: DataTableProps<TData, TValue>) {
    return (
        <BaseDataTable
            columns={columns}
            fetchUrl="/api/admin/utils/betalinger"
            searchColumn="id"
            searchPlaceholder="Søg efter log..."
            emptyMessage="Ingen data at vise."
        />
    )
}
