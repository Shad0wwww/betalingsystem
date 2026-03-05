"use client"

import { ColumnDef } from "@tanstack/react-table"

export type User = {
    id: string
    email: string
    createdAt: string
    role: Role
    phoneNumber: string | null
    reservedBalance: number
    phoneCountry: string | null
}

import { MoreHorizontal, ArrowUpDown, Copy, UserPen } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Role } from "@prisma/client"


export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "timestamp",
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
        accessorKey: "email",
        header: "Bruger",
        cell: ({ row }) => {
            const email = row.getValue("email") as string
            return (
                <div className="max-w-sm truncate font-medium">{email}</div>
            )
        }
    },
    {
        accessorKey: "role",
        header: "Rolle",
        cell: ({ row }) => {
            const role = row.getValue("role") as Role
            return (
                <div className="max-w-sm truncate text-white font-medium">{role}</div>
            )
        }
    },
    {
        accessorKey: "reservedBalance",
        header: "Reserveret Beløb",
        cell: ({ row }) => {
            const reservedBalance = row.getValue("reservedBalance") as number
            return (
                <div className="max-w-sm truncate font-medium">{reservedBalance}</div>
            )
        }   
            
        
    },
    {
        accessorKey: "phoneCountry",
        header: "Land",
        cell: ({ row }) => {
            const phoneCountry = row.getValue("phoneCountry") as string
            return (
                <div className="max-w-sm truncate font-medium">{phoneCountry}</div>
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
                            Handlinger
                        </DropdownMenuLabel>

                        <div className="h-px bg-zinc-800 mx-1 mb-1" /> {/* En pænere separator end border-b */}

                        <DropdownMenuItem
                            className="cursor-pointer gap-2 focus:bg-zinc-800 focus:text-white transition-colors py-2"
                            onClick={() => navigator.clipboard.writeText(payment.id)}
                        >
                            <Copy className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Bruger-ID</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="cursor-pointer gap-2 focus:bg-zinc-800 focus:text-white transition-colors py-2"
                            onClick={() => alert("Denne funktion er ikke implementeret endnu.")}
                        >
                            <UserPen className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Rediger Bruger</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="cursor-pointer gap-2 focus:bg-zinc-800 focus:text-white transition-colors py-2"
                            onClick={() => navigator.clipboard.writeText(payment.phoneNumber || "")}
                        >
                            <Copy className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Telefonnummer</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]