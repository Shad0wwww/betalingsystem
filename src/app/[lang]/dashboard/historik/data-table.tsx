"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable as BaseDataTable } from "@/components/ui/data-table"
import { getAllTransactions } from "@/lib/actions/dashboard"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    dict: any
}

export function DataTable<TData, TValue>({ columns, dict }: DataTableProps<TData, TValue>) {
    return (
        <BaseDataTable
            columns={columns}
            fetchAction={getAllTransactions as (page: number, limit: number) => Promise<{ data: TData[]; total: number }>}
            searchColumn="kvitteringId"
            searchPlaceholder={dict.dashboard.historik.søgPlaceholder}
            emptyMessage={dict.dashboard.historik.ingenKvitteringer}
            dict={dict}
        />
    )
}
