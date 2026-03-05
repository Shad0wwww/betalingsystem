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
            fetchUrl="/api/admin/users"
            searchColumn="email"
            searchPlaceholder="Søg efter brugere..."
            emptyMessage="Ingen data at vise."
        />
    )
}
