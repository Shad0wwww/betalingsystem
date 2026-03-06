"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MeterStatus, UtilityType } from "@prisma/client"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export type Meter = {
    id: number
    deviceId: string
    type: UtilityType
    location: string | null
    status: MeterStatus
}

const statusColors: Record<MeterStatus, string> = {
    ACTIVE: "border-green-500/50 bg-green-500/10 text-green-400",
    INACTIVE: "border-zinc-500/50 bg-zinc-500/10 text-zinc-400",
    MAINTENANCE: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
}

const statusLabels: Record<MeterStatus, string> = {
    ACTIVE: "Aktiv",
    INACTIVE: "Inaktiv",
    MAINTENANCE: "Vedligeholdelse",
}

const typeLabels: Record<UtilityType, string> = {
    ELECTRICITY: "Elektricitet",
    WATER: "Vand",
}

export const columns: ColumnDef<Meter>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
            <span className="font-mono text-sm text-zinc-400">#{row.getValue("id")}</span>
        ),
    },
    {
        accessorKey: "deviceId",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Device ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="font-mono text-sm">{row.getValue("deviceId")}</span>
        ),
    },
    {
        accessorKey: "location",
        header: "Lokation",
        cell: ({ row }) => (
            <span>{row.getValue("location") ?? "—"}</span>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as UtilityType
            return <span>{typeLabels[type]}</span>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as MeterStatus
            return (
                <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusColors[status]}`}
                >
                    {statusLabels[status]}
                </span>
            )
        },
    },
]
