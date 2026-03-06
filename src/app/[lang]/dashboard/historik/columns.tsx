"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Payment = {
    amount: number
    status: string
    transaktion: string
    kvitteringId: string
    dato: string
}

import { MoreHorizontal, ArrowUpDown, ReceiptText, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-800/50 focus-visible:ring-0">
                            <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px] bg-[#0c0c0e] border-zinc-800 text-zinc-200">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500 py-2">
                            Betalingsdetaljer
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                            className="gap-2 cursor-pointer focus:bg-zinc-800 focus:text-white"
                            onClick={() => navigator.clipboard.writeText(payment.kvitteringId)}
                        >
                            <Copy className="h-3.5 w-3.5 text-zinc-500" />
                            Kopier ID
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-zinc-800 focus:text-white">
                            <ReceiptText className="h-3.5 w-3.5 text-zinc-500" />
                            Se kvittering
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]