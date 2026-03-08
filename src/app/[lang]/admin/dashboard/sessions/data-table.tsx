"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable as BaseDataTable } from "@/components/ui/data-table"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    refreshKey?: number
}

export function DataTable<TData, TValue>({ columns, refreshKey }: DataTableProps<TData, TValue>) {
    return (
        <BaseDataTable
            columns={columns}
            fetchUrl="/api/admin/sessions/active"
            emptyMessage="Ingen aktive sessioner."
            refreshKey={refreshKey}
        />
    )
}
