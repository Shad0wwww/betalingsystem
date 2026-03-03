"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ActionType } from "@prisma/client"

export type AuditLog = {
    id: string
    createdAt: string
    amount: number

}

import { MoreHorizontal, ArrowUpDown, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export const columns: ColumnDef<AuditLog>[] = [
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Dato
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },

    {
        accessorKey: "id",
        header: "Log ID",
        cell: ({ row }) => {
            const id = row.getValue("id") as string

            return (
                <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium border-zinc-500/50 bg-zinc-500/10 text-zinc-400`}
                >
                    {id}
                </span>
            )
        }
    },


    {
        accessorKey: "amount",
        header: "Beløb",
        cell: ({ row }) => {
            const amount = row.getValue("amount") as number

            return (
                <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium border-zinc-500/50 bg-zinc-500/10 text-zinc-400`}
                >
                    {amount.toLocaleString("da-DK")} kr.
                </span>
            )
        }
    },

    {
        id: "actions",
        cell: ({ row }) => {
            const payment = row.original

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
                        className="w-[180px] bg-[#0c0c0e] border-zinc-800 text-zinc-200 shadow-2xl"
                    >
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold py-2">
                            Log Handlinger
                        </DropdownMenuLabel>

                        <div className="h-px bg-zinc-800 mx-1 mb-1" /> {/* En pænere separator end border-b */}

                        <DropdownMenuItem
                            className="cursor-pointer gap-2 focus:bg-zinc-800 focus:text-white transition-colors py-2"
                            onClick={() => navigator.clipboard.writeText(payment.id)}
                        >
                            <Copy className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Kopier Log-ID</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]