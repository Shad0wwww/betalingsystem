"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UtilityType } from "@prisma/client"
import { ArrowUpDown, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export type ActiveSession = {
    id: number
    userId: string
    userName: string
    userEmail: string
    boatName: string
    boatModel: string
    meterDeviceId: string
    meterLocation: string | null
    type: UtilityType
    startValue: number
    startTime: string
}

const typeColors: Record<UtilityType, string> = {
    ELECTRICITY: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
    WATER: "border-blue-500/50 bg-blue-500/10 text-blue-400",
}

const typeLabels: Record<UtilityType, string> = {
    ELECTRICITY: "Elektricitet",
    WATER: "Vand",
}

function ElapsedTime({ startTime }: { startTime: string }) {
    const [elapsed, setElapsed] = React.useState("")

    React.useEffect(() => {
        const update = () => {
            const diffMs = Date.now() - new Date(startTime).getTime()
            const totalSec = Math.floor(diffMs / 1000)
            const h = Math.floor(totalSec / 3600)
            const m = Math.floor((totalSec % 3600) / 60)
            const s = totalSec % 60
            setElapsed(
                h > 0
                    ? `${h}t ${String(m).padStart(2, "0")}m`
                    : `${m}m ${String(s).padStart(2, "0")}s`
            )
        }
        update()
        const id = setInterval(update, 1000)
        return () => clearInterval(id)
    }, [startTime])

    return <span className="font-mono text-sm tabular-nums text-zinc-300">{elapsed}</span>
}

import React from "react"

function SessionIdCell({ sessionId }: { sessionId: number }) {
    const router = useRouter()
    const { lang } = useParams<{ lang: string }>()

    return (
        <button
            onClick={() => router.push(`/${lang}/admin/dashboard/sessions/${sessionId}`)}
            className="font-mono text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
            #{sessionId}
        </button>
    )
}

function BoatNameCell({ session }: { session: ActiveSession }) {
    const router = useRouter()
    const { lang } = useParams<{ lang: string }>()

    return (
        <button
            onClick={() => router.push(`/${lang}/admin/dashboard/sessions/${session.id}`)}
            className="text-left hover:opacity-80 transition-opacity"
        >
            <p className="text-white font-medium text-sm hover:text-blue-400">{session.boatName}</p>
            <p className="text-zinc-500 text-xs">{session.boatModel}</p>
        </button>
    )
}

function ActionsCell({
    session,
    onStopSession,
    onWarnUser,
    onViewDetails,
}: {
    session: ActiveSession
    onStopSession: (session: ActiveSession) => void
    onWarnUser: (session: ActiveSession) => void
    onViewDetails: (session: ActiveSession) => void
}) {
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
            <DropdownMenuContent align="end" className="w-48 bg-[#0c0c0e] border-zinc-800 text-zinc-200 shadow-2xl">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                    Handlinger
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                    className="cursor-pointer gap-2 focus:bg-zinc-800 focus:text-white transition-colors"
                    onClick={() => router.push(`/${lang}/admin/dashboard/users/${session.userId}`)}
                >
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Gå til bruger</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer gap-2 focus:bg-zinc-800 focus:text-white transition-colors"
                    onClick={() => navigator.clipboard.writeText(String(session.id))}
                >
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Kopiér session-ID</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                    className="cursor-pointer gap-2 focus:bg-yellow-600/20 focus:text-yellow-400 transition-colors text-yellow-400"
                    onClick={() => onWarnUser(session)}
                >
                    <span>⚠️</span>
                    <span>Send advarsel</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer gap-2 focus:bg-red-600/20 focus:text-red-400 transition-colors text-red-400"
                    onClick={() => onStopSession(session)}
                >
                    <span>⏹️</span>
                    <span>Stop session</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                    className="cursor-pointer gap-2 focus:bg-zinc-800 focus:text-white transition-colors"
                    onClick={() => onViewDetails(session)}
                >
                    <span>🔍</span>
                    <span>Se detaljer</span>
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const columns: (onStopSession: (session: ActiveSession) => void, onWarnUser: (session: ActiveSession) => void, onViewDetails: (session: ActiveSession) => void) => ColumnDef<ActiveSession>[] = (onStopSession, onWarnUser, onViewDetails) => [
    {
        accessorKey: "id",
        header: "Session",
        cell: ({ row }) => <SessionIdCell sessionId={row.getValue("id") as number} />,
    },
    {
        accessorKey: "boatName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="px-0 hover:bg-transparent text-zinc-400 hover:text-white font-medium"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Båd
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <BoatNameCell session={row.original} />,
    },
    {
        accessorKey: "userName",
        header: "Bruger",
        cell: ({ row }) => (
            <div>
                <p className="text-zinc-200 text-sm">{row.getValue("userName")}</p>
                <p className="text-zinc-500 text-xs">{row.original.userEmail}</p>
            </div>
        ),
    },
    {
        accessorKey: "meterDeviceId",
        header: "Måler",
        cell: ({ row }) => (
            <div>
                <p className="font-mono text-sm text-zinc-200">{row.getValue("meterDeviceId")}</p>
                {row.original.meterLocation && (
                    <p className="text-zinc-500 text-xs">{row.original.meterLocation}</p>
                )}
            </div>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as UtilityType
            return (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeColors[type]}`}>
                    {typeLabels[type]}
                </span>
            )
        },
    },
    {
        accessorKey: "startTime",
        header: "Varighed",
        cell: ({ row }) => <ElapsedTime startTime={row.getValue("startTime")} />,
    },
    {
        accessorKey: "startValue",
        header: "Startmåling",
        cell: ({ row }) => (
            <span className="font-mono text-sm text-zinc-400 tabular-nums">
                {(row.getValue("startValue") as number).toFixed(2)}
            </span>
        ),
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Handlinger</span>,
        cell: ({ row }) => <ActionsCell session={row.original} onStopSession={onStopSession} onWarnUser={onWarnUser} onViewDetails={onViewDetails}       />,
    },
]
