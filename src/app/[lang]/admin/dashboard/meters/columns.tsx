"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MeterStatus, UtilityType } from "@prisma/client"
import { Settings, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Meter = {
    id: number
    deviceId: string
    type: UtilityType
    location: string | null
    status: MeterStatus
}

const statusColors: Record<MeterStatus, string> = {
    ONLINE: "border-green-500/50 bg-green-500/10 text-green-400",
    OFFLINE: "border-zinc-500/50 bg-zinc-500/10 text-zinc-400",
    MAINTENANCE: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
}

const statusLabels: Record<MeterStatus, string> = {
    ONLINE: "Online",
    OFFLINE: "Offline",
    MAINTENANCE: "Vedligeholdelse",
}

const typeLabels: Record<UtilityType, string> = {
    ELECTRICITY: "Elektricitet",
    WATER: "Vand",
}

export function getColumns(onEdit: (meter: Meter) => void): ColumnDef<Meter>[] {
  return [
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
                className="px-0 hover:bg-transparent text-zinc-400 hover:text-white font-medium"
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
            <span className="text-zinc-300">{row.getValue("location") ?? <span className="text-zinc-600">—</span>}</span>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as UtilityType
            return <span className="text-zinc-300">{typeLabels[type]}</span>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as MeterStatus
            return (
                <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}
                >
                    {statusLabels[status]}
                </span>
            )
        },
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Handlinger</span>,
        cell: ({ row }) => {
            const meter = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-zinc-800/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                        >
                            <span className="sr-only">Åben menu</span>
                            <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-44 bg-[#0c0c0e] border-zinc-800 text-zinc-200 shadow-2xl"
                    >
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                            Handlinger
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />

                        <DropdownMenuItem
                            className="cursor-pointer gap-2 focus:bg-zinc-800 focus:text-white transition-colors"
                            onClick={() => onEdit(meter)}
                        >
                            <Settings className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Rediger måler</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
  ]
}

