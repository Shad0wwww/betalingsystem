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
            fetchUrl="/api/modbus/meter/list"
            searchColumn="deviceId"
            searchPlaceholder="Søg efter device ID..."
            emptyMessage="Ingen målere at vise."
            refreshKey={refreshKey}
        />
    )
}
