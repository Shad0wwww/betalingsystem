"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Copy, UserPen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Role } from "@prisma/client"
import { useRouter, useParams } from "next/navigation"

export type User = {
    id: string
    name: string
    email: string
    createdAt: string
    role: Role
    phoneNumber: string | null
    reservedBalance: number
    phoneCountry: string | null
}

const roleColors: Record<Role, string> = {
    ADMIN: "border-blue-500/50 bg-blue-500/10 text-blue-400",
    USER: "border-zinc-700 bg-zinc-800/50 text-zinc-400",
}

function ActionsCell({ user }: { user: User }) {
    const router = useRouter()
    const { lang } = useParams<{ lang: string }>()

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
                    onClick={() => router.push(`/${lang}/admin/dashboard/users/${user.id}`)}
                >
                    <UserPen className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Rediger bruger</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="cursor-pointer gap-2 focus:bg-zinc-800 focus:text-white transition-colors"
                    onClick={() => navigator.clipboard.writeText(user.id)}
                >
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Kopiér bruger-ID</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="cursor-pointer gap-2 focus:bg-zinc-800 focus:text-white transition-colors"
                    onClick={() => navigator.clipboard.writeText(user.phoneNumber || "")}
                >
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Kopiér telefon</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "timestamp",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="px-0 hover:bg-transparent text-zinc-400 hover:text-white font-medium"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Dato
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "name",
        header: "Navn",
        cell: ({ row }) => (
            <span className="font-medium text-white">{row.getValue("name") || <span className="text-zinc-600">—</span>}</span>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <span className="text-zinc-300 truncate max-w-xs block">{row.getValue("email")}</span>
        ),
    },
    {
        accessorKey: "role",
        header: "Rolle",
        cell: ({ row }) => {
            const role = row.getValue("role") as Role
            return (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleColors[role]}`}>
                    {role === Role.ADMIN ? "Admin" : "Bruger"}
                </span>
            )
        },
    },
    {
        accessorKey: "reservedBalance",
        header: "Reserveret",
        cell: ({ row }) => {
            const val = row.getValue("reservedBalance") as number
            return (
                <span className="text-zinc-300 tabular-nums">
                    {val.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                </span>
            )
        },
    },
    {
        accessorKey: "phoneCountry",
        header: "Land",
        cell: ({ row }) => (
            <span className="text-zinc-400">{row.getValue("phoneCountry") ?? "—"}</span>
        ),
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Handlinger</span>,
        cell: ({ row }) => <ActionsCell user={row.original} />,
    },
]
