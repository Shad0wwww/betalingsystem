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
            fetchUrl="/api/transaktioner/all"
            searchColumn="kvitteringId"
            searchPlaceholder="Søg efter kvitteringer..."
            emptyMessage="Ingen kvitteringer fundet."
        />
    )
}
