"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Payment = {
    amount: number
    status: InvoiceStatus
    transaktion: TransactionType
    kvitteringId: string
    dato: string
}

import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InvoiceStatus, TransactionType } from "@prisma/client"

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "dato",
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
        accessorKey: "kvitteringId",
        header: "Kvittering ID",
        cell: ({ row }) => {
            const kvitteringId = row.getValue("kvitteringId") as string
            return (
                <div className="max-w-sm truncate font-medium">{kvitteringId}</div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string

            const statusStyles: Record<string, string> = {
                pending: "border-yellow-500/50 bg-yellow-500/10 text-yellow-500",
                processing: "border-blue-500/50 bg-blue-500/10 text-blue-400", 
                success: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
                failed: "border-red-500/50 bg-red-500/10 text-red-400",
            }

            const currentStyle = statusStyles[status] || "border-zinc-500/50 bg-zinc-500/10 text-zinc-400"

            return (
                <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${currentStyle}`}
                >
                    {/* Gør første bogstav stort, f.eks. "success" -> "Success" */}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            )
        }
    },
    {
        accessorKey: "transaktion",
        header: "Transaktion",
        cell: ({ row }) => {
            const transaktion = row.getValue("transaktion") as string
            const transaktionStyles: Record<string, string> = {
                payment: "border-blue-500/50 bg-blue-500/10 text-blue-400",
                refund: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
            }

            const currentStyle = transaktionStyles[transaktion] || "border-zinc-500/50 bg-zinc-500/10 text-zinc-400"

            return (
                <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${currentStyle}`}
                >
                    {transaktion.charAt(0).toUpperCase() + transaktion.slice(1)}
                </span>
            )
        }
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("da-DK", {
                style: "currency",
                currency: "DKK",
            }).format(amount)

            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const payment = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(payment.kvitteringId)}
                        >
                            Copy kvittering ID
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]