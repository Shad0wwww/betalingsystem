"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable as BaseDataTable } from "@/components/ui/data-table"
import { getAllTransactions } from "@/lib/actions/dashboard"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({ columns }: DataTableProps<TData, TValue>) {
    return (
        <BaseDataTable
            columns={columns}
            fetchAction={getAllTransactions as (page: number, limit: number) => Promise<{ data: TData[]; total: number }>}
            searchColumn="kvitteringId"
            searchPlaceholder="Søg efter kvitteringer..."
            emptyMessage="Ingen kvitteringer fundet."
        />
    )
}
